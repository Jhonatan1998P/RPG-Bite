import React, { useState, useEffect, useRef } from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { Send, Users, Shield, Hash, MessageSquare, X } from 'lucide-react';
import { eventBus, EventTypes } from '../services/eventBus';

interface Message {
  id: string;
  user_id: string;
  username: string;
  avatar: string | null;
  content: string;
  created_at: string;
  room_id: string | null;
  recipient_id: string | null;
}

export const ChatSystem: React.FC = () => {
  const { isConnected, socket, localPlayerId, currentRoomId } = useMultiplayer();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'room' | 'private'>('global');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [privateRecipientId, setPrivateRecipientId] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Fetch initial messages when switching tabs
    const fetchMessages = () => {
      if (activeTab === 'private' && !privateRecipientId) {
        setMessages([]);
        return;
      }

      const query = activeTab === 'room' && currentRoomId
        ? { roomId: currentRoomId }
        : activeTab === 'private' ? { recipientId: privateRecipientId }
        : {};

      socket.emit('fetch_messages', query, (res: any) => {
        if (res.status === 'success') {
          setMessages(res.messages);
          scrollToBottom();
        }
      });
    };

    fetchMessages();

    // Listen for new messages
    const handleReceiveMessage = (msg: Message) => {
      // Filter logic based on active tab
      const isForCurrentTab =
        (activeTab === 'global' && !msg.room_id && !msg.recipient_id) ||
        (activeTab === 'room' && msg.room_id === currentRoomId) ||
        (activeTab === 'private' && msg.recipient_id);

      if (isForCurrentTab) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      }

      if (!isOpen || !isForCurrentTab) {
        setUnreadCount(prev => prev + 1);
        eventBus.emit(EventTypes.SHOW_TOAST, {
          message: `Nuevo mensaje de ${msg.username}`,
          type: 'info'
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, isConnected, activeTab, currentRoomId, isOpen]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;
    if (activeTab === 'private' && !privateRecipientId) {
      eventBus.emit(EventTypes.SHOW_TOAST, { message: 'Ingresa el ID del destinatario', type: 'error' });
      return;
    }

    // Mention parsing logic (simple: @username)
    let finalContent = inputMessage;

    const messageData = {
      content: finalContent,
      roomId: activeTab === 'room' ? currentRoomId : null,
      recipientId: activeTab === 'private' ? privateRecipientId : null
    };

    socket.emit('send_message', messageData, (res: any) => {
      if (res.status === 'success') {
        setInputMessage('');
      } else {
        eventBus.emit(EventTypes.SHOW_TOAST, { message: 'Error enviando mensaje', type: 'error' });
      }
    });
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  if (!isConnected) return null;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 p-4 bg-obsidian border border-slate-700 rounded-full shadow-lg hover:border-gold-500 transition-all z-40 group"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-slate-300 group-hover:text-gold-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-80 md:w-96 h-[32rem] bg-obsidian/95 border border-slate-700/50 rounded-lg shadow-2xl flex flex-col overflow-hidden z-50 backdrop-blur-md">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/50">
            <h3 className="font-serif font-bold text-gold-400 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comunicaciones
              {isConnected && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-2" />}
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-700/50">
            <button
              onClick={() => setActiveTab('global')}
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'global' ? 'bg-slate-800/80 text-gold-400 border-b-2 border-gold-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" /> Global
            </button>
            <button
              onClick={() => setActiveTab('room')}
              disabled={!currentRoomId}
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                !currentRoomId ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                activeTab === 'room' ? 'bg-slate-800/80 text-magic-400 border-b-2 border-magic-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Hash className="w-4 h-4" /> Salas
            </button>
            <button
              onClick={() => setActiveTab('private')}
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'private' ? 'bg-slate-800/80 text-blood-400 border-b-2 border-blood-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Shield className="w-4 h-4" /> Privado
            </button>
          </div>

          {activeTab === 'private' && (
            <div className="p-2 border-b border-slate-700/50 bg-slate-900/50">
              <input
                type="text"
                placeholder="ID del destinatario"
                value={privateRecipientId}
                onChange={(e) => setPrivateRecipientId(e.target.value)}
                className="w-full bg-void border border-slate-700/50 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blood-500/50"
              />
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-void/30">
            {activeTab === 'private' && !privateRecipientId ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm text-center px-4">
                Ingresa un ID de destinatario para ver y enviar mensajes privados.
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm text-center px-4">
                Aún no hay mensajes en este canal. ¡Sé el primero en saludar!
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.user_id === localPlayerId;
                // Simple highlight for mentions
                const highlightedContent = msg.content.split(' ').map((word, idx) => {
                  if (word.startsWith('@')) {
                    return <span key={idx} className="text-magic-400 font-bold">{word} </span>;
                  }
                  return word + ' ';
                });

                return (
                  <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      {msg.username}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-md ${
                        isMe
                          ? 'bg-slate-700/80 text-slate-100 border border-slate-600/50'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/50'
                      }`}
                    >
                      <p className="break-words">{highlightedContent}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/80 border-t border-slate-700/50">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="w-full bg-void border border-slate-700/50 rounded-lg pl-3 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-slate-600"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="absolute right-2 p-1.5 text-slate-400 hover:text-gold-400 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors rounded-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
