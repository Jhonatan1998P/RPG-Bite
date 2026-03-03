import React, { useState, useEffect } from 'react';
import { Users, Copy, LogIn, PlusCircle, X, Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { useMultiplayer } from '../../hooks/useMultiplayer';
import { eventBus, EventTypes } from '../../services/eventBus';

interface MultiplayerMenuProps {
  onClose: () => void;
}

export const MultiplayerMenu: React.FC<MultiplayerMenuProps> = ({ onClose }) => {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    isConnected,
    isConnecting,
    peers,
    remotePlayers,
    createRoom,
    joinRoomById,
    leave,
    reconnect,
    currentRoomId,
  } = useMultiplayer();

  const handleCreateRoom = () => {
    const roomId = createRoom();
    if (roomId) {
      setCreatedRoomId(roomId);
    }
  };

  const handleReconnect = () => {
    reconnect();
  };

  const handleJoinRoom = () => {
    if (roomIdInput.trim()) {
      joinRoomById(roomIdInput.trim());
      setRoomIdInput('');
    }
  };

  const handleCopyRoomId = () => {
    if (createdRoomId) {
      navigator.clipboard.writeText(createdRoomId);
      setCopied(true);
      eventBus.emit(EventTypes.SHOW_TOAST, { 
        message: 'Código copiado al portapapeles', 
        type: 'success',
        duration: 2000 
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeave = () => {
    leave();
    setCreatedRoomId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && roomIdInput.trim()) {
      handleJoinRoom();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-gold-500/30 rounded-lg p-4 md:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-gold-500" />
            <h2 className="text-lg md:text-xl font-serif text-gold-400">Multijugador</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isConnecting && !isConnected && (
          <div className="flex items-center justify-center gap-2 py-8 text-gold-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Conectando...</span>
          </div>
        )}

        {!isConnected && !isConnecting && (
          <div className="space-y-4">
            {/* Botón de reconectar si hay una sala previa */}
            {currentRoomId && (
              <button
                onClick={handleReconnect}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Reconectar a sala anterior
              </button>
            )}

            {currentRoomId && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-slate-500">o</span>
                </div>
              </div>
            )}

            <button
              onClick={handleCreateRoom}
              className="w-full flex items-center justify-center gap-2 bg-gold-600 hover:bg-gold-500 text-black font-bold py-3 rounded transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Crear Sala
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-500">o unirse</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Código de sala..."
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500 focus:border-gold-500 focus:outline-none text-sm md:text-base"
              />
              <button
                onClick={handleJoinRoom}
                disabled={!roomIdInput.trim()}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
              >
                <LogIn className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Comparte el código con amigos para jugar juntos
            </p>
          </div>
        )}

        {isConnected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800/50 rounded p-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-green-400 text-sm">Conectado</span>
              </div>
              <span className="text-slate-400 text-sm">
                {peers.length} {peers.length === 1 ? 'jugador' : 'jugadores'}
              </span>
            </div>

            {/* Mostrar roomId actual (creada o unida) */}
            {(createdRoomId || currentRoomId) && (
              <div className="bg-slate-800/50 rounded p-3">
                <p className="text-sm text-slate-400 mb-2">
                  {createdRoomId ? 'Código de tu sala:' : 'Sala actual:'}
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-slate-900 px-3 py-2 rounded text-gold-400 font-mono text-xs md:text-sm break-all">
                    {createdRoomId || currentRoomId}
                  </code>
                  {(createdRoomId || currentRoomId) && (
                    <button
                      onClick={() => {
                        const roomId = createdRoomId || currentRoomId;
                        if (roomId) {
                          navigator.clipboard.writeText(roomId);
                          eventBus.emit(EventTypes.SHOW_TOAST, {
                            message: 'Código copiado al portapapeles',
                            type: 'success',
                            duration: 2000
                          });
                        }
                      }}
                      className="bg-slate-700 hover:bg-slate-600 p-2 rounded transition-colors shrink-0"
                      aria-label="Copiar código"
                    >
                      {copied ? (
                        <span className="text-green-400 text-xs whitespace-nowrap">Copiado</span>
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {remotePlayers.length > 0 ? (
              <div>
                <h3 className="text-sm text-slate-400 mb-2">Jugadores en sala:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {remotePlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-slate-800/30 rounded p-2"
                    >
                      <span className="text-white text-sm">{player.name}</span>
                      <span className="text-slate-500 text-xs">Nv. {player.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/30 rounded p-4 text-center">
                <p className="text-slate-500 text-sm">
                  Esperando jugadores...
                </p>
                <p className="text-slate-600 text-xs mt-1">
                  Comparte el código para invitar amigos
                </p>
              </div>
            )}

            <button
              onClick={handleLeave}
              className="w-full flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-900 text-red-400 border border-red-800 py-2 rounded transition-colors text-sm"
            >
              <WifiOff className="w-4 h-4" />
              Salir de la sala
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
