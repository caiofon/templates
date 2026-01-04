import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

interface Message {
  room: string;
  content: string;
  timestamp?: Date;
}

export function setupEventHandlers(io: Server, socket: Socket) {
  const user = socket.data.user;

  // Join room
  socket.on('join:room', async (roomId: string) => {
    try {
      await socket.join(roomId);
      
      // Notify room members
      socket.to(roomId).emit('user:joined', {
        userId: user.id,
        username: user.name,
        roomId,
      });

      // Send room info to user
      const members = await io.in(roomId).fetchSockets();
      socket.emit('room:joined', {
        roomId,
        members: members.map((s) => s.data.user),
      });

      logger.info(`User ${user.id} joined room ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave room
  socket.on('leave:room', async (roomId: string) => {
    try {
      await socket.leave(roomId);
      
      socket.to(roomId).emit('user:left', {
        userId: user.id,
        username: user.name,
        roomId,
      });

      logger.info(`User ${user.id} left room ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to leave room' });
    }
  });

  // Send message
  socket.on('message:send', (message: Message) => {
    try {
      const fullMessage = {
        id: generateId(),
        ...message,
        sender: {
          id: user.id,
          name: user.name,
        },
        timestamp: new Date(),
      };

      // Broadcast to room
      io.to(message.room).emit('message:receive', fullMessage);

      logger.debug(`Message sent to room ${message.room}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicators
  socket.on('typing:start', (roomId: string) => {
    socket.to(roomId).emit('typing:update', {
      userId: user.id,
      username: user.name,
      isTyping: true,
    });
  });

  socket.on('typing:stop', (roomId: string) => {
    socket.to(roomId).emit('typing:update', {
      userId: user.id,
      username: user.name,
      isTyping: false,
    });
  });

  // Private message
  socket.on('message:private', async (data: { userId: string; content: string }) => {
    const targetSockets = await io.in(`user:${data.userId}`).fetchSockets();
    
    if (targetSockets.length > 0) {
      const message = {
        id: generateId(),
        content: data.content,
        sender: {
          id: user.id,
          name: user.name,
        },
        timestamp: new Date(),
      };

      targetSockets.forEach((s) => {
        s.emit('message:private', message);
      });
      
      socket.emit('message:private:sent', message);
    } else {
      socket.emit('error', { message: 'User not online' });
    }
  });
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
