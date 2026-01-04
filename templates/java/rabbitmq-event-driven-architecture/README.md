# RabbitMQ Event-Driven Architecture

Event-driven architecture implementation with RabbitMQ, featuring DLQ, retry patterns, and idempotent consumers.

## Features

- ✅ Publisher confirms and consumer acknowledgments
- ✅ Dead letter queues with exponential backoff
- ✅ Idempotent message processing
- ✅ Message serialization with Jackson
- ✅ Retry policies and circuit breaker
- ✅ Docker Compose with RabbitMQ Management

## Quick Start

```bash
# Start RabbitMQ
docker-compose up -d

# Run application
mvn spring-boot:run
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Publisher  │────▶│   Exchange  │────▶│    Queue    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐            ▼
                    │     DLQ     │◀────┌─────────────┐
                    └─────────────┘     │  Consumer   │
                                        └─────────────┘
```

## RabbitMQ Management

- URL: http://localhost:15672
- User: guest
- Password: guest
