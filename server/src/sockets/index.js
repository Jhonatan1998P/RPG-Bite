import { Server } from 'socket.io';
import { handleConnection } from '../controllers/socketController.js';

export const setupSocket = (server) => {
  const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*';
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    handleConnection(socket, io);
  });

  return io;
};
