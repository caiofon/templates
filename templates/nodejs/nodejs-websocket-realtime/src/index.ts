import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { authMiddleware } from './middleware/auth';
import { setupEventHandlers } from './handlers';
import { logger } from './utils/logger';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  // Socket.io server
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  // Redis adapter for horizontal scaling
  if (process.env.REDIS_URL) {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Redis adapter connected');
  }

  // Authentication middleware
  io.use(authMiddleware);

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id} (User: ${socket.data.user?.id})`);

    // Setup event handlers
    setupEventHandlers(io, socket);

    // Heartbeat
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      connections: io.engine.clientsCount,
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    logger.info(`🚀 WebSocket server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
