# Node.js WebSocket Realtime

Real-time WebSocket server with Socket.io and Redis pub/sub for horizontal scaling.

## Features

- ✅ WebSocket connection management
- ✅ Redis pub/sub for multi-instance scaling
- ✅ Room-based broadcasting
- ✅ Authentication middleware
- ✅ Connection heartbeat and reconnection
- ✅ Event-driven architecture

## Quick Start

```bash
# Start Redis
docker-compose up -d redis

# Run server
npm run dev
```

## Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join:room` | Client → Server | Join a room |
| `leave:room` | Client → Server | Leave a room |
| `message:send` | Client → Server | Send message |
| `message:receive` | Server → Client | Receive message |
