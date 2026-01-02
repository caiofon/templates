import CodeBlock from "./CodeBlock";

const dockerfileCode = `# Multi-stage build for optimized image
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY gradle gradle
COPY build.gradle settings.gradle gradlew ./
COPY src src

# Build with layer caching
RUN ./gradlew build -x test --no-daemon

# Production image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Security: non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy artifact
COPY --from=builder /app/build/libs/*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`;

const dockerComposeCode = `version: '3.8'

services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - RABBITMQ_HOST=rabbitmq
      - DB_HOST=postgres
    depends_on:
      rabbitmq:
        condition: service_healthy
      postgres:
        condition: service_healthy
    networks:
      - backend

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: orders
      POSTGRES_USER: \${DB_USER:-app}
      POSTGRES_PASSWORD: \${DB_PASS:-secret}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: pg_isready -U \${DB_USER:-app}
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - backend

volumes:
  postgres_data:

networks:
  backend:
    driver: bridge`;

const DockerSection = () => {
  return (
    <section id="docker" className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Docker Examples
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Production-ready containerization patterns for microservices deployment.
          </p>
        </div>

        {/* Key practices */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Multi-stage builds", desc: "Smaller images" },
            { label: "Non-root user", desc: "Security hardening" },
            { label: "Health checks", desc: "Orchestration ready" },
            { label: "Service deps", desc: "Proper startup order" },
          ].map((item) => (
            <div key={item.label} className="p-4 bg-card rounded-lg border border-border">
              <p className="text-sm font-mono text-primary">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary font-mono">
              Optimized Dockerfile
            </h3>
            <CodeBlock 
              code={dockerfileCode} 
              language="dockerfile" 
              filename="Dockerfile" 
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary font-mono">
              Docker Compose Stack
            </h3>
            <CodeBlock 
              code={dockerComposeCode} 
              language="yaml" 
              filename="docker-compose.yml" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DockerSection;
