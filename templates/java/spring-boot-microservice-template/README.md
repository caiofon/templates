# Spring Boot Microservice Template

Production-ready microservice template with Spring Boot 3, Docker, and CI/CD.

## Features

- ✅ Spring Boot 3.2 with Java 17
- ✅ Controller-Service-Repository pattern
- ✅ Global exception handling
- ✅ OpenAPI/Swagger documentation
- ✅ Health checks and Actuator endpoints
- ✅ Multi-stage Dockerfile
- ✅ GitLab CI/CD pipeline
- ✅ Testcontainers for integration tests

## Quick Start

```bash
# Build
mvn clean package

# Run
mvn spring-boot:run

# Run with Docker
docker build -t microservice-template .
docker run -p 8080:8080 microservice-template
```

## Project Structure

```
src/
├── main/
│   ├── java/com/example/microservice/
│   │   ├── MicroserviceApplication.java
│   │   ├── config/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   ├── dto/
│   │   └── exception/
│   └── resources/
│       └── application.yml
└── test/
    └── java/com/example/microservice/
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/users | List all users |
| GET | /api/v1/users/{id} | Get user by ID |
| POST | /api/v1/users | Create new user |
| PUT | /api/v1/users/{id} | Update user |
| DELETE | /api/v1/users/{id} | Delete user |

## Configuration

```yaml
# application.yml
server:
  port: 8080
spring:
  application:
    name: microservice-template
```

## License

MIT
