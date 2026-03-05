import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { Player } from '@/types';
import { eventBus, EventTypes } from '@/services/eventBus';

// Constants
const SERVER_URL = 'http://localhost:5000'; // Adjust for production

export interface PlayerPresence {
  id: string;
  name: string;
  level: number;
  lastSeen: number;
}

export interface MultiplayerAction {
  type: string;
  payload: any;
  playerId?: string;
  timestamp?: number;
}

export interface MultiplayerContextType {
  isInitialized: boolean;
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
  joinRoomById: (roomId: string) => boolean;
  leave: () => void;
  reconnect: () => boolean;
  currentRoomId: string | null;
  socket: Socket | null;
}

const MultiplayerContext = createContext<MultiplayerContextType | null>(null);

export const useMultiplayerContext = () => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};

interface MultiplayerProviderProps {
  children: ReactNode;
}

export const MultiplayerProvider: React.FC<MultiplayerProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [peers, setPeers] = useState<string[]>([]);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  const [remotePlayers, setRemotePlayers] = useState<PlayerPresence[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  const playersRef = useRef<Map<string, PlayerPresence>>(new Map());
  const actionsCallbackRef = useRef<((action: MultiplayerAction) => void) | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Load or generate local player ID for auth
  useEffect(() => {
    let storedId = localStorage.getItem('shadowbound_user_id');
    if (!storedId) {
      storedId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('shadowbound_user_id', storedId);
    }
    setLocalPlayerId(storedId);
    setIsInitialized(true);
  }, []);

  const connectSocket = useCallback((roomId?: string) => {
    if (socketRef.current?.connected) return true;
    if (!localPlayerId) return false;

    setIsConnecting(true);

    // Pass user info in handshake
    const socket = io(SERVER_URL, {
      auth: {
        token: localPlayerId,
        username: `Player_${localPlayerId.substring(4, 8)}`,
      }
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);

      if (roomId) {
        socket.emit('join_room', roomId);
        setCurrentRoomId(roomId);
      }

      eventBus.emit(EventTypes.SHOW_TOAST, {
        message: roomId ? '¡Conectado a la sala!' : '¡Conectado al servidor global!',
        type: 'success',
        duration: 3000
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setPeers([]);
      setRemotePlayers([]);
      playersRef.current.clear();
      eventBus.emit(EventTypes.SHOW_TOAST, {
        message: 'Desconectado del servidor',
        type: 'error',
        duration: 3000
      });
    });

    // Handle generic presence updates via Active Users
    socket.on('active_users', (users) => {
      const activePeers: string[] = [];
      const newPlayersMap = new Map<string, PlayerPresence>();

      users.forEach((u: any) => {
        if (u.id !== localPlayerId) {
          activePeers.push(u.id);
          newPlayersMap.set(u.id, {
            id: u.id,
            name: u.username,
            level: 1, // Default or parsed from generic payload
            lastSeen: Date.now()
          });
        }
      });

      setPeers(activePeers);
      playersRef.current = newPlayersMap;
      setRemotePlayers(Array.from(newPlayersMap.values()));
    });

    socket.on('user_joined', (user) => {
      if (user.id !== localPlayerId) {
        setPeers(prev => [...prev.filter(id => id !== user.id), user.id]);
        playersRef.current.set(user.id, {
          id: user.id,
          name: user.username,
          level: 1,
          lastSeen: Date.now()
        });
        setRemotePlayers(Array.from(playersRef.current.values()));
      }
    });

    socket.on('user_left', (data) => {
      setPeers(prev => prev.filter(id => id !== data.id));
      playersRef.current.delete(data.id);
      setRemotePlayers(Array.from(playersRef.current.values()));
    });

    // Handle Game Actions
    socket.on('game_action', (data) => {
      // Expecting { type, payload, senderId }
      const action: MultiplayerAction = {
        type: data.type,
        payload: data.payload,
        playerId: data.senderId,
        timestamp: Date.now()
      };

      if (action.type === 'PRESENCE_UPDATE') {
        const playerData = action.payload as PlayerPresence;
        playersRef.current.set(data.senderId, { ...playerData, id: data.senderId });
        setRemotePlayers(Array.from(playersRef.current.values()));
      } else if (action.type === 'GIFT_GOLD') {
        const giftData = action.payload as { amount: number };
        if (giftData && giftData.amount > 0) {
          eventBus.emit(EventTypes.SHOW_TOAST, {
            message: `¡Recibiste ${giftData.amount} oro de un jugador!`,
            type: 'success',
            duration: 5000
          });
          eventBus.emit(EventTypes.RECEIVE_GOLD, { amount: giftData.amount });
        }
      } else {
        if (actionsCallbackRef.current) {
          actionsCallbackRef.current(action);
        }
      }
    });

    socketRef.current = socket;
    setSocketInstance(socket);
    return true;
  }, [localPlayerId]);

  // Connect globally by default once ID is loaded
  useEffect(() => {
    if (localPlayerId && !socketRef.current) {
      connectSocket();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [localPlayerId, connectSocket]);

  const createRoom = useCallback((): string => {
    const roomId = `sb_${Math.random().toString(36).substr(2, 6)}`;
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_room', roomId);
      setCurrentRoomId(roomId);
      eventBus.emit(EventTypes.SHOW_TOAST, { message: 'Sala creada', type: 'success' });
    }
    return roomId;
  }, []);

  const joinRoomById = useCallback((roomId: string): boolean => {
    if (!roomId) return false;
    if (socketRef.current?.connected) {
      if (currentRoomId) socketRef.current.emit('leave_room', currentRoomId);
      socketRef.current.emit('join_room', roomId);
      setCurrentRoomId(roomId);
      return true;
    }
    return false;
  }, [currentRoomId]);

  const leave = useCallback(() => {
    if (socketRef.current?.connected && currentRoomId) {
      socketRef.current.emit('leave_room', currentRoomId);
      setCurrentRoomId(null);
      eventBus.emit(EventTypes.SHOW_TOAST, { message: 'Saliste de la sala', type: 'info' });
    }
  }, [currentRoomId]);

  const reconnect = useCallback((): boolean => {
    if (currentRoomId) {
      return joinRoomById(currentRoomId);
    }
    return connectSocket();
  }, [currentRoomId, joinRoomById, connectSocket]);

  const syncPlayer = useCallback((player: Player) => {
    if (!localPlayerId || !socketRef.current?.connected) return;

    const presence: PlayerPresence = {
      id: localPlayerId,
      name: player.name,
      level: player.level,
      lastSeen: Date.now(),
    };

    socketRef.current.emit('game_action', {
      type: 'PRESENCE_UPDATE',
      payload: presence,
      roomId: currentRoomId
    });
  }, [localPlayerId, currentRoomId]);

  const broadcastAction = useCallback((action: MultiplayerAction) => {
    if (!socketRef.current?.connected) return;

    socketRef.current.emit('game_action', {
      type: action.type,
      payload: action.payload,
      roomId: currentRoomId
    });
  }, [currentRoomId]);

  const sendToPeer = useCallback((peerId: string, action: MultiplayerAction) => {
    // Socket.io standard broadcast pattern used here as fallback
    // In a strict p2p equivalent we would route via server recipient ID
    broadcastAction(action);
  }, [broadcastAction]);

  const onRemoteAction = useCallback((callback: (action: MultiplayerAction) => void) => {
    actionsCallbackRef.current = callback;
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
        socket: socketInstance,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = (): MultiplayerContextType => {
  return useMultiplayerContext();
};
