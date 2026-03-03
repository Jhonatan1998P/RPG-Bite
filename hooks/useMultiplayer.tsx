import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { joinRoom, selfId, Room } from 'trystero/torrent';
import { Player } from '../types';
import { eventBus, EventTypes } from '../services/eventBus';

const APP_ID = 'shadowbound-game-v1';

export interface MultiplayerAction {
  type: string;
  payload: unknown;
  playerId: string;
  timestamp: number;
  playerName?: string;
  playerLevel?: number;
}

export interface PlayerPresence {
  id: string;
  name: string;
  level: number;
  lastSeen: number;
}

export interface UseMultiplayerReturn {
  isConnected: boolean;
  isConnecting: boolean;
  peers: string[];
  localPlayerId: string | null;
  remotePlayers: PlayerPresence[];
  syncPlayer: (player: Player) => void;
  broadcastAction: (action: MultiplayerAction) => void;
  sendToPeer: (peerId: string, action: MultiplayerAction) => void;
  onRemoteAction: (callback: (action: MultiplayerAction) => void) => void;
  createRoom: () => string;
  joinRoomById: (roomId: string) => void;
  leave: () => void;
  reconnect: () => boolean;
  currentRoomId: string | null;
}

interface MultiplayerContextType extends UseMultiplayerReturn {
  isInitialized: boolean;
}

const MultiplayerContext = createContext<MultiplayerContextType | null>(null);

export const useMultiplayerContext = (): MultiplayerContextType => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayerContext must be used within MultiplayerProvider');
  }
  return context;
};

export interface MultiplayerProviderProps {
  children: ReactNode;
}

// Cleanup timeouts para evitar memory leaks
interface PendingTimeouts {
  presenceTimeout: ReturnType<typeof setTimeout> | null;
  uiTimeout: ReturnType<typeof setTimeout> | null;
  broadcastTimeout: ReturnType<typeof setTimeout> | null;
}

export const MultiplayerProvider: React.FC<MultiplayerProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [peers, setPeers] = useState<string[]>([]);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  const [remotePlayers, setRemotePlayers] = useState<PlayerPresence[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  // Refs para acceso en callbacks asíncronos
  const roomRef = useRef<Room | null>(null);
  const sendActionRef = useRef<ReturnType<Room['makeAction']>[0] | null>(null);
  const getActionRef = useRef<ReturnType<Room['makeAction']>[1] | null>(null);
  const actionsCallbackRef = useRef<((action: MultiplayerAction) => void) | null>(null);
  const playersRef = useRef<Map<string, PlayerPresence>>(new Map());
  const isInitializedRef = useRef(false);
  
  // Refs para estado que cambia frecuentemente
  const localPlayerIdRef = useRef<string | null>(null);
  const currentRoomIdRef = useRef<string | null>(null);
  const isConnectedRef = useRef(false);
  
  // Timeouts pendientes para cleanup
  const pendingTimeoutsRef = useRef<PendingTimeouts>({
    presenceTimeout: null,
    uiTimeout: null,
    broadcastTimeout: null,
  });

  // Cleanup de timeouts
  const clearAllTimeouts = useCallback(() => {
    const timeouts = pendingTimeoutsRef.current;
    if (timeouts.presenceTimeout) clearTimeout(timeouts.presenceTimeout);
    if (timeouts.uiTimeout) clearTimeout(timeouts.uiTimeout);
    if (timeouts.broadcastTimeout) clearTimeout(timeouts.broadcastTimeout);
    pendingTimeoutsRef.current = { presenceTimeout: null, uiTimeout: null, broadcastTimeout: null };
  }, []);

  const generatePlayerId = useCallback(() => {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Limpieza completa de la sala
  const cleanupRoom = useCallback(() => {
    clearAllTimeouts();
    
    if (roomRef.current) {
      try {
        roomRef.current.leave();
      } catch (e) {
        console.warn('Error leaving room:', e);
      }
      roomRef.current = null;
    }
    
    sendActionRef.current = null;
    getActionRef.current = null;
    playersRef.current.clear();
    
    // Limpiar listeners de React
    setIsConnected(false);
    setIsConnecting(false);
    setPeers([]);
    setRemotePlayers([]);
  }, [clearAllTimeouts]);

  const broadcastPresence = useCallback((usePlayerId?: string) => {
    const idToUse = usePlayerId || localPlayerIdRef.current;
    if (!sendActionRef.current || !idToUse || !isConnectedRef.current) return;

    const playerData = playersRef.current.get(idToUse);
    if (playerData) {
      try {
        sendActionRef.current({
          type: 'PRESENCE_UPDATE',
          payload: playerData,
          playerId: idToUse,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.warn('Error broadcasting presence:', e);
      }
    }
  }, []);

  // Función centralizada para actualizar remotePlayers (excluyendo self)
  const updateRemotePlayers = useCallback(() => {
    const currentId = localPlayerIdRef.current;
    const allPlayers = Array.from(playersRef.current.values());
    const filtered = currentId 
      ? allPlayers.filter(p => p.id !== currentId)
      : allPlayers;
    setRemotePlayers(filtered);
  }, []);

  const initRoom = useCallback((roomId: string): boolean => {
    // Prevenir múltiples inicializaciones simultáneas
    if (isConnecting || (isConnected && currentRoomIdRef.current === roomId)) {
      console.warn('Already connecting or connected to this room');
      return false;
    }

    // Cleanup de sala anterior si existe
    if (roomRef.current) {
      cleanupRoom();
    }

    setIsConnecting(true);
    setConnectionError(null);
    setPeers([]);
    setRemotePlayers([]);
    playersRef.current.clear();

    // Generar nuevo ID de jugador SIEMPRE
    const playerId = generatePlayerId();
    setLocalPlayerId(playerId);
    localPlayerIdRef.current = playerId;
    currentRoomIdRef.current = roomId;

    let room: Room | null = null;

    try {
      eventBus.emit(EventTypes.SHOW_TOAST, {
        message: 'Conectando... (esto puede tomar unos segundos)',
        type: 'info',
        duration: 5000
      });

      room = joinRoom({ appId: APP_ID }, roomId);
      roomRef.current = room;

      const [sendAction, getAction] = room.makeAction('gameAction');
      sendActionRef.current = sendAction;
      getActionRef.current = getAction;

      // Listener: peer joins
      const handlePeerJoin = (peerId: string) => {
        setPeers(prev => {
          if (prev.includes(peerId)) return prev;
          return [...prev, peerId];
        });
        
        eventBus.emit(EventTypes.SHOW_TOAST, {
          message: 'Un jugador se ha unido a la sala',
          type: 'info',
          duration: 3000
        });

        // Request presence del nuevo peer
        try {
          sendAction({
            type: 'REQUEST_PRESENCE',
            payload: null,
            playerId: playerId,
            timestamp: Date.now(),
          }, peerId);

          // Broadcast nuestra presencia al nuevo peer
          broadcastPresence(playerId);
        } catch (e) {
          console.warn('Error handling peer join:', e);
        }

        // Actualizar UI con delay
        pendingTimeoutsRef.current.presenceTimeout = setTimeout(() => {
          updateRemotePlayers();
        }, 500);
      };

      // Listener: peer leaves
      const handlePeerLeave = (peerId: string) => {
        setPeers(prev => prev.filter(p => p !== peerId));
        playersRef.current.delete(peerId);
        updateRemotePlayers();
        
        eventBus.emit(EventTypes.SHOW_TOAST, {
          message: 'Un jugador ha abandonado la sala',
          type: 'info',
          duration: 3000
        });
      };

      // Listener: acciones recibidas
      const handleAction = (action: any, peerId: string) => {
        // Ignorar nuestras propias acciones
        if (action.playerId === playerId) return;

        try {
          switch (action.type) {
            case 'PRESENCE_UPDATE': {
              const playerData = action.payload as PlayerPresence;
              playersRef.current.set(peerId, { ...playerData, id: peerId });
              updateRemotePlayers();
              break;
            }
            case 'REQUEST_PRESENCE':
              broadcastPresence(playerId);
              break;
            case 'GIFT_GOLD': {
              const giftData = action.payload as { amount: number };
              if (giftData && giftData.amount > 0) {
                eventBus.emit(EventTypes.SHOW_TOAST, {
                  message: `¡Recibiste ${giftData.amount} oro de un jugador!`,
                  type: 'success',
                  duration: 5000
                });
                eventBus.emit(EventTypes.RECEIVE_GOLD, { amount: giftData.amount });
              }
              break;
            }
            default:
              if (actionsCallbackRef.current) {
                actionsCallbackRef.current(action);
              }
          }
        } catch (e) {
          console.warn('Error handling action:', e);
        }
      };

      // Registrar listeners
      room.onPeerJoin(handlePeerJoin);
      room.onPeerLeave(handlePeerLeave);
      getAction(handleAction);

      // Marcar como conectado
      setIsConnected(true);
      setIsConnecting(false);
      setCurrentRoomId(roomId);
      isConnectedRef.current = true;

      // Broadcast presence inicial a todos los peers
      pendingTimeoutsRef.current.broadcastTimeout = setTimeout(() => {
        if (isConnectedRef.current && sendActionRef.current) {
          broadcastPresence(playerId);
          sendActionRef.current({
            type: 'REQUEST_PRESENCE',
            payload: null,
            playerId: playerId,
            timestamp: Date.now(),
          });
        }
      }, 1000);

      // Actualizar UI inicial
      pendingTimeoutsRef.current.uiTimeout = setTimeout(() => {
        updateRemotePlayers();
      }, 2000);

      eventBus.emit(EventTypes.SHOW_TOAST, {
        message: '¡Conectado! Buscando jugadores en la sala...',
        type: 'success',
        duration: 4000
      });

      return true;

    } catch (error) {
      console.error('Error connecting to room:', error);
      
      // Cleanup en caso de error
      if (room) {
        try {
          room.leave();
        } catch (e) {
          // Ignorar
        }
      }
      roomRef.current = null;
      sendActionRef.current = null;
      getActionRef.current = null;
      
      setIsConnecting(false);
      setIsConnected(false);
      setConnectionError('Error de conexión. Intenta de nuevo.');
      isConnectedRef.current = false;
      
      eventBus.emit(EventTypes.SHOW_TOAST, {
        message: 'Error al conectar. Intenta de nuevo.',
        type: 'error',
        duration: 4000
      });
      
      return false;
    }
  }, [isConnecting, cleanupRoom, generatePlayerId, broadcastPresence, updateRemotePlayers]);

  const createRoom = useCallback((): string => {
    const roomId = `sb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const success = initRoom(roomId);
    return success ? roomId : '';
  }, [initRoom]);

  const joinRoomById = useCallback((roomId: string): boolean => {
    if (!roomId || roomId.trim() === '') {
      eventBus.emit(EventTypes.SHOW_TOAST, {
        message: 'Código de sala inválido',
        type: 'error',
        duration: 3000
      });
      return false;
    }
    return initRoom(roomId.trim());
  }, [initRoom]);

  const reconnect = useCallback((): boolean => {
    if (!currentRoomIdRef.current) {
      eventBus.emit(EventTypes.SHOW_TOAST, {
        message: 'No hay sala para reconectar',
        type: 'info',
        duration: 3000
      });
      return false;
    }
    
    if (isConnectedRef.current) {
      eventBus.emit(EventTypes.SHOW_TOAST, {
        message: 'Ya estás conectado a una sala',
        type: 'info',
        duration: 3000
      });
      return false;
    }

    eventBus.emit(EventTypes.SHOW_TOAST, {
      message: 'Reconectando a la sala...',
      type: 'info',
      duration: 3000
    });
    
    return initRoom(currentRoomIdRef.current);
  }, [initRoom]);

  const syncPlayer = useCallback((player: Player) => {
    const currentId = localPlayerIdRef.current;
    if (!currentId || !isConnectedRef.current) return;

    const playerData: PlayerPresence = {
      id: currentId,
      name: player.name,
      level: player.level,
      lastSeen: Date.now(),
    };

    playersRef.current.set(currentId, playerData);
    broadcastPresence();
  }, [broadcastPresence]);

  const broadcastAction = useCallback((action: MultiplayerAction) => {
    if (!sendActionRef.current || !localPlayerIdRef.current || !isConnectedRef.current) return;

    const actionWithPlayer = {
      ...action,
      playerId: localPlayerIdRef.current,
      timestamp: Date.now(),
    };

    try {
      sendActionRef.current(actionWithPlayer);
    } catch (e) {
      console.warn('Error broadcasting action:', e);
    }
  }, []);

  const sendToPeer = useCallback((peerId: string, action: MultiplayerAction) => {
    if (!sendActionRef.current || !localPlayerIdRef.current || !isConnectedRef.current) return;

    const actionWithPlayer = {
      ...action,
      playerId: localPlayerIdRef.current,
      timestamp: Date.now(),
    };

    try {
      sendActionRef.current(actionWithPlayer, peerId);
    } catch (e) {
      console.warn('Error sending to peer:', e);
    }
  }, []);

  const onRemoteAction = useCallback((callback: (action: MultiplayerAction) => void) => {
    actionsCallbackRef.current = callback;
  }, []);

  const leave = useCallback(() => {
    cleanupRoom();
    
    // Resetear todos los estados
    setCurrentRoomId(null);
    setLocalPlayerId(null);
    currentRoomIdRef.current = null;
    localPlayerIdRef.current = null;
    isConnectedRef.current = false;
    setConnectionError(null);

    eventBus.emit(EventTypes.SHOW_TOAST, {
      message: 'Has abandonado la sala',
      type: 'info',
      duration: 3000
    });
  }, [cleanupRoom]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      cleanupRoom();
      isConnectedRef.current = false;
      localPlayerIdRef.current = null;
      currentRoomIdRef.current = null;
    };
  }, [cleanupRoom]);

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      setIsInitialized(true);
    }
  }, []);

  return (
    <MultiplayerContext.Provider
      value={{
        isInitialized,
        isConnected,
        isConnecting,
        peers,
        localPlayerId,
        remotePlayers,
        syncPlayer,
        broadcastAction,
        sendToPeer,
        onRemoteAction,
        createRoom,
        joinRoomById,
        leave,
        reconnect,
        currentRoomId,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = (): MultiplayerContextType => {
  return useMultiplayerContext();
};
