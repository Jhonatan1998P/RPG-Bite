import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSocket } from './sockets/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = setupSocket(server);

const PORT = process.env.PORT || 5000;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
