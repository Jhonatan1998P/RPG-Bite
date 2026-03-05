import { MessageModel, UserModel, RoomModel } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

export const handleConnection = (socket, io) => {
  const userId = socket.handshake.auth.token;

  if (!userId) {
    console.error('Connection rejected: No user token provided');
    return socket.disconnect();
  }

  const username = socket.handshake.auth.username || `Guest_${userId.substring(0, 4)}`;
  const avatar = socket.handshake.auth.avatar || null;

  // Persist user and update last seen
  UserModel.upsertUser(userId, username, avatar);

  console.log(`User connected: ${username} (${userId}) on socket ${socket.id}`);
  socket.join('global'); // Everyone joins global

  // Attach user info to socket
  socket.user = { id: userId, username, avatar };

  // Notify others that a user joined
  socket.to('global').emit('user_joined', socket.user);

  // Send current active users in global
  const activeSockets = io.sockets.adapter.rooms.get('global');
  if (activeSockets) {
    const activeUsers = Array.from(activeSockets).map(socketId => {
      const s = io.sockets.sockets.get(socketId);
      return s ? s.user : null;
    }).filter(Boolean);
    socket.emit('active_users', activeUsers);
  }

  // --- Handlers ---

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${username} (${socket.id})`);
    UserModel.updateLastSeen(userId);
    io.to('global').emit('user_left', { id: userId });
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    RoomModel.createRoom(roomId, `Room ${roomId}`);
    console.log(`${username} joined room: ${roomId}`);
    socket.to(roomId).emit('user_joined_room', { user: socket.user, room: roomId });
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`${username} left room: ${roomId}`);
    socket.to(roomId).emit('user_left_room', { user: socket.user, room: roomId });
  });

  socket.on('send_message', (data, callback) => {
    try {
      const { content, type = 'text', roomId = null, recipientId = null } = data;
      const messageId = uuidv4();

      const savedMsg = MessageModel.saveMessage(messageId, socket.user.id, content, roomId, recipientId, type);

      if (recipientId) {
        // Private message
        // Find recipient's socket and send directly
        const sockets = Array.from(io.sockets.sockets.values());
        const recipientSocket = sockets.find(s => s.user.id === recipientId);

        if (recipientSocket) {
          io.to(recipientSocket.id).emit('receive_message', savedMsg);
        }
        // Echo back to sender so they see it in UI
        socket.emit('receive_message', savedMsg);

      } else if (roomId) {
        // Room message
        io.to(roomId).emit('receive_message', savedMsg);
      } else {
        // Global message
        io.to('global').emit('receive_message', savedMsg);
      }

      if (callback) callback({ status: 'success', messageId });
    } catch (error) {
      console.error('Error sending message:', error);
      if (callback) callback({ status: 'error', error: error.message });
    }
  });

  socket.on('fetch_messages', (data, callback) => {
    try {
      const { roomId = null, recipientId = null, limit = 50 } = data;
      let messages = [];

      if (recipientId) {
        messages = MessageModel.getPrivateMessages(socket.user.id, recipientId, limit);
      } else if (roomId) {
        messages = MessageModel.getRoomMessages(roomId, limit);
      } else {
        messages = MessageModel.getGlobalMessages(limit);
      }

      if (callback) callback({ status: 'success', messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (callback) callback({ status: 'error', error: error.message });
    }
  });

  // Game specific synchronization via Socket.io instead of Trystero
  socket.on('game_action', (data) => {
    // Broadcast generic game actions to room or globally
    const { type, payload, roomId } = data;
    const broadcastData = { type, payload, senderId: socket.user.id };

    if (roomId) {
      socket.to(roomId).emit('game_action', broadcastData);
    } else {
      socket.to('global').emit('game_action', broadcastData);
    }
  });
};
