import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { joinRoom, selfId } from 'trystero/torrent';
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
  onRemoteAction: (callback: (action: MultiplayerAction) => void) => void;
  createRoom: () => string;
  joinRoomById: (roomId: string) => void;
  leave: () => void;
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

export const MultiplayerProvider: React.FC<MultiplayerProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [peers, setPeers] = useState<string[]>([]);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  const [remotePlayers, setRemotePlayers] = useState<PlayerPresence[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  const roomRef = useRef<ReturnType<typeof joinRoom> | null>(null);
  const sendActionRef = useRef<any>(null);
  const getActionRef = useRef<any>(null);
  const actionsCallbackRef = useRef<((action: MultiplayerAction) => void) | null>(null);
  const playersRef = useRef<Map<string, any>>(new Map());
  const isInitializedRef = useRef(false);

  const generatePlayerId = () => {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const broadcastPresence = useCallback(() => {
    if (!sendActionRef.current || !localPlayerId) return;
    
    const playerData = playersRef.current.get(localPlayerId);
    if (playerData) {
      sendActionRef.current({
        type: 'PRESENCE_UPDATE',
        payload: playerData,
        playerId: localPlayerId,
        timestamp: Date.now(),
      });
    }
  }, [localPlayerId]);

  const initRoom = useCallback((roomId: string) => {
    // Cleanup previous room
    if (roomRef.current) {
      roomRef.current = null;
    }

    setIsConnecting(true);
    setConnectionError(null);
    setPeers([]);
    setRemotePlayers([]);
    playersRef.current.clear();

    const playerId = selfId || generatePlayerId();
    setLocalPlayerId(playerId);

    try {
      eventBus.emit(EventTypes.SHOW_TOAST, { 
        message: 'Conectando... (esto puede tomar unos segundos)', 
        type: 'info',
        duration: 5000 
      });

      const room = joinRoom({ appId: APP_ID }, roomId);
      roomRef.current = room;

      const [sendAction, getAction] = room.makeAction('gameAction');
      sendActionRef.current = sendAction as typeof sendActionRef.current;
      getActionRef.current = getAction as typeof getActionRef.current;

      // Listen for peer joins
      room.onPeerJoin((peerId: string) => {
        setPeers(prev => [...new Set([...prev, peerId])]);
        eventBus.emit(EventTypes.SHOW_TOAST, { 
          message: 'Un jugador se ha unido a la sala', 
          type: 'info',
          duration: 3000 
        });
        // Request presence from new peer
        sendAction({
          type: 'REQUEST_PRESENCE',
          payload: null,
          playerId: playerId,
          timestamp: Date.now(),
        }, peerId);
      });

      // Listen for peer leaves
      room.onPeerLeave((peerId: string) => {
        setPeers(prev => prev.filter(p => p !== peerId));
        playersRef.current.delete(peerId);
        setRemotePlayers(Array.from(playersRef.current.values()).filter((p: any) => p.id !== playerId));
        eventBus.emit(EventTypes.SHOW_TOAST, { 
          message: 'Un jugador ha abandonado la sala', 
          type: 'info',
          duration: 3000 
        });
      });

      // Listen for actions
      getAction((action: any, peerId: string) => {
        if (action.playerId === playerId) return;

        switch (action.type) {
          case 'PRESENCE_UPDATE':
            const playerData = action.payload as any;
            playersRef.current.set(peerId, { ...playerData, id: peerId });
            setRemotePlayers(Array.from(playersRef.current.values()).filter((p: any) => p.id !== playerId));
            break;
          case 'REQUEST_PRESENCE':
            broadcastPresence();
            break;
          case 'GIFT_GOLD':
            const giftData = action.payload as { amount: number; toPlayerId: string };
            if (giftData.toPlayerId === playerId) {
              // We received gold!
              eventBus.emit(EventTypes.SHOW_TOAST, { 
                message: `¡Recibiste ${giftData.amount} oro de un jugador!`, 
                type: 'success',
                duration: 5000 
              });
            }
            break;
          default:
            if (actionsCallbackRef.current) {
              actionsCallbackRef.current(action);
            }
        }
      });

      setIsConnected(true);
      setIsConnecting(false);
      setCurrentRoomId(roomId);
      
      eventBus.emit(EventTypes.SHOW_TOAST, { 
        message: '¡Conectado! Jugadores en la sala: ' + peers.length, 
        type: 'success',
        duration: 4000 
      });

    } catch (error) {
      console.error('Error connecting to room:', error);
      setIsConnecting(false);
      setConnectionError('Error de conexión. Intenta de nuevo.');
      eventBus.emit(EventTypes.SHOW_TOAST, { 
        message: 'Error al conectar. Intenta de nuevo.', 
        type: 'error',
        duration: 4000 
      });
    }

  }, [broadcastPresence]);

  const createRoom = useCallback(() => {
    const roomId = `sb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    initRoom(roomId);
    return roomId;
  }, [initRoom]);

  const joinRoomById = useCallback((roomId: string) => {
    initRoom(roomId);
  }, [initRoom]);

  const syncPlayer = useCallback((player: Player) => {
    if (!localPlayerId) return;

    const playerData: PlayerPresence = {
      id: localPlayerId,
      name: player.name,
      level: player.level,
      lastSeen: Date.now(),
    };
    
    playersRef.current.set(localPlayerId, playerData);
    broadcastPresence();
  }, [localPlayerId, broadcastPresence]);

  const broadcastAction = useCallback((action: MultiplayerAction) => {
    if (!sendActionRef.current || !localPlayerId) return;

    const actionWithPlayer = {
      ...action,
      playerId: localPlayerId,
      timestamp: Date.now(),
    };
    
    sendActionRef.current(actionWithPlayer);
  }, [localPlayerId]);

  const onRemoteAction = useCallback((callback: (action: MultiplayerAction) => void) => {
    actionsCallbackRef.current = callback;
  }, []);

  const leave = useCallback(() => {
    if (roomRef.current) {
      roomRef.current = null;
    }
    sendActionRef.current = null;
    getActionRef.current = null;
    playersRef.current.clear();

    setIsConnected(false);
    setIsConnecting(false);
    setPeers([]);
    setRemotePlayers([]);
    setCurrentRoomId(null);
    
    eventBus.emit(EventTypes.SHOW_TOAST, { 
      message: 'Has abandonado la sala', 
      type: 'info',
      duration: 3000 
    });
  }, []);

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
        onRemoteAction,
        createRoom,
        joinRoomById,
        leave,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = (): MultiplayerContextType => {
  return useMultiplayerContext();
};
