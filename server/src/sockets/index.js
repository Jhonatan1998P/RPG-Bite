import { Server } from 'socket.io';
import { handleConnection } from '../controllers/socketController.js';

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    handleConnection(socket, io);
  });

  return io;
};
