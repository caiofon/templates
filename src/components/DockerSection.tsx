import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeBlock from "./CodeBlock";

const dockerComposeFullCode = `version: '3.8'

services:
  # ============================================
  # Java Microservice
  # ============================================
  order-service:
    build:
      context: ./order-service
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/orders
      - SPRING_DATASOURCE_USERNAME=\${DB_USER:-app}
      - SPRING_DATASOURCE_PASSWORD=\${DB_PASS:-secret}
      - SPRING_RABBITMQ_HOST=rabbitmq
      - SPRING_RABBITMQ_PORT=5672
      - DD_AGENT_HOST=datadog
      - DD_SERVICE=order-service
      - DD_ENV=development
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - backend
    labels:
      - "com.datadoghq.ad.logs=[{\\"source\\": \\"java\\", \\"service\\": \\"order-service\\"}]"

  # ============================================
  # Node.js Microservice
  # ============================================
  notification-service:
    build:
      context: ./notification-service
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
      - POSTGRES_URL=postgresql://\${DB_USER:-app}:\${DB_PASS:-secret}@postgres:5432/notifications
      - DD_AGENT_HOST=datadog
      - DD_SERVICE=notification-service
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - backend

  # ============================================
  # Oracle Database 19c
  # ============================================
  oracle-db:
    image: container-registry.oracle.com/database/enterprise:19.3.0.0
    ports:
      - "1521:1521"
      - "5500:5500"
    environment:
      - ORACLE_SID=ORCLCDB
      - ORACLE_PDB=ORCLPDB1
      - ORACLE_PWD=\${ORACLE_PASSWORD:-Oracle123}
      - ORACLE_CHARACTERSET=AL32UTF8
      - ENABLE_ARCHIVELOG=false
    volumes:
      - oracle-data:/opt/oracle/oradata
      - ./oracle-init:/opt/oracle/scripts/startup
    networks:
      - backend
    healthcheck:
      test: ["CMD", "sqlplus", "-L", "sys/\${ORACLE_PASSWORD:-Oracle123}@//localhost:1521/ORCLPDB1 as sysdba", "@healthcheck.sql"]
      interval: 30s
      timeout: 10s
      retries: 10
      start_period: 300s

  # ============================================
  # PostgreSQL
  # ============================================
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=\${DB_USER:-app}
      - POSTGRES_PASSWORD=\${DB_PASS:-secret}
      - POSTGRES_MULTIPLE_DATABASES=orders,notifications,audit
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./postgres-init:/docker-entrypoint-initdb.d
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER:-app}"]
      interval: 5s
      timeout: 3s
      retries: 5

  # ============================================
  # RabbitMQ
  # ============================================
  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=guest
      - RABBITMQ_DEFAULT_PASS=guest
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
      - ./rabbitmq/definitions.json:/etc/rabbitmq/definitions.json
      - ./rabbitmq/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf
    networks:
      - backend
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============================================
  # Datadog Agent
  # ============================================
  datadog:
    image: datadog/agent:latest
    ports:
      - "8126:8126"
    environment:
      - DD_API_KEY=\${DD_API_KEY}
      - DD_APM_ENABLED=true
      - DD_APM_NON_LOCAL_TRAFFIC=true
      - DD_LOGS_ENABLED=true
      - DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true
      - DD_CONTAINER_EXCLUDE="name:datadog-agent"
      - DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /proc/:/host/proc/:ro
      - /sys/fs/cgroup/:/host/sys/fs/cgroup:ro
    networks:
      - backend

  # ============================================
  # GitLab Runner (for CI/CD)
  # ============================================
  gitlab-runner:
    image: gitlab/gitlab-runner:latest
    volumes:
      - ./gitlab-runner/config:/etc/gitlab-runner
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - backend

volumes:
  postgres-data:
  oracle-data:
  rabbitmq-data:

networks:
  backend:
    driver: bridge`;

const javaDockerfileCode = `# ============================================
# Java Spring Boot Microservice Dockerfile
# Multi-stage build for optimized production image
# ============================================

# Stage 1: Build
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Install Maven
RUN apk add --no-cache maven

# Copy pom.xml for dependency caching
COPY pom.xml ./

# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src src

# Build application
RUN mvn clean package -DskipTests -B

# Extract layers for better caching
RUN java -Djarmode=layertools -jar target/*.jar extract

# ============================================
# Stage 2: Production
# ============================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Security: Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install required tools
RUN apk add --no-cache curl

# Copy application layers (in order of change frequency)
COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./

# Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

# JVM configuration for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport \\
               -XX:MaxRAMPercentage=75.0 \\
               -XX:InitialRAMPercentage=50.0 \\
               -XX:+UseG1GC \\
               -XX:+UseStringDeduplication \\
               -Djava.security.egd=file:/dev/./urandom"

# Datadog APM
ENV DD_PROFILING_ENABLED=true
ENV DD_LOGS_INJECTION=true
ENV DD_TRACE_SAMPLE_RATE=1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \\
  CMD curl -f http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java \$JAVA_OPTS org.springframework.boot.loader.JarLauncher"]`;

const nodeDockerfileCode = `# ============================================
# Node.js Microservice Dockerfile
# Multi-stage build with security best practices
# ============================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev)
RUN npm ci

# ============================================
# Stage 2: Build
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# ============================================
# Stage 3: Production
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Security: non-root user
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Install only runtime dependencies
RUN apk add --no-cache curl dumb-init

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

USER nodejs

# Node.js production settings
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Datadog APM
ENV DD_TRACE_ENABLED=true
ENV DD_PROFILING_ENABLED=true
ENV DD_LOGS_INJECTION=true

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]`;

const gitlabCICode = `# ============================================
# GitLab CI/CD Pipeline
# Complete pipeline for microservices deployment
# ============================================

stages:
  - test
  - security
  - build
  - deploy

variables:
  DOCKER_REGISTRY: registry.gitlab.com/\$CI_PROJECT_PATH
  DOCKER_TLS_CERTDIR: "/certs"
  MAVEN_OPTS: "-Dmaven.repo.local=.m2/repository"

# ============================================
# Testing Stage
# ============================================
.test-template: &test-template
  stage: test
  before_script:
    - echo "Running tests..."

test-java:
  <<: *test-template
  image: eclipse-temurin:17-jdk-alpine
  cache:
    paths:
      - .m2/repository
  script:
    - cd order-service
    - mvn test jacoco:report -B
  coverage: '/Total.*?([0-9]{1,3})%/'
  artifacts:
    reports:
      junit: order-service/target/surefire-reports/*.xml
      coverage_report:
        coverage_format: cobertura
        path: order-service/target/site/jacoco/jacoco.xml

test-nodejs:
  <<: *test-template
  image: node:20-alpine
  script:
    - cd notification-service
    - npm ci
    - npm run test:coverage
  coverage: '/All files.*?([0-9]{1,3})%/'
  artifacts:
    reports:
      junit: notification-service/junit.xml
      coverage_report:
        coverage_format: cobertura
        path: notification-service/coverage/cobertura-coverage.xml

# ============================================
# Security Stage
# ============================================
security-scan:
  stage: security
  image: 
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy fs --exit-code 1 --severity HIGH,CRITICAL .
  allow_failure: false

dependency-check:
  stage: security
  image: owasp/dependency-check:latest
  script:
    - /usr/share/dependency-check/bin/dependency-check.sh 
      --project "\$CI_PROJECT_NAME"
      --scan .
      --format HTML
      --out dependency-check-report
  artifacts:
    paths:
      - dependency-check-report/

sast:
  stage: security
  include:
    - template: Security/SAST.gitlab-ci.yml

# ============================================
# Build Stage
# ============================================
.build-template: &build-template
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  before_script:
    - docker login -u \$CI_REGISTRY_USER -p \$CI_REGISTRY_PASSWORD \$CI_REGISTRY

build-java:
  <<: *build-template
  script:
    - docker build 
      --cache-from \$DOCKER_REGISTRY/order-service:latest
      --tag \$DOCKER_REGISTRY/order-service:\$CI_COMMIT_SHA
      --tag \$DOCKER_REGISTRY/order-service:latest
      ./order-service
    - docker push \$DOCKER_REGISTRY/order-service:\$CI_COMMIT_SHA
    - docker push \$DOCKER_REGISTRY/order-service:latest
  only:
    changes:
      - order-service/**/*

build-nodejs:
  <<: *build-template
  script:
    - docker build 
      --cache-from \$DOCKER_REGISTRY/notification-service:latest
      --tag \$DOCKER_REGISTRY/notification-service:\$CI_COMMIT_SHA
      --tag \$DOCKER_REGISTRY/notification-service:latest
      ./notification-service
    - docker push \$DOCKER_REGISTRY/notification-service:\$CI_COMMIT_SHA
    - docker push \$DOCKER_REGISTRY/notification-service:latest
  only:
    changes:
      - notification-service/**/*

# ============================================
# Deploy Stage
# ============================================
deploy-staging:
  stage: deploy
  image: bitnami/kubectl:latest
  environment:
    name: staging
    url: https://staging.example.com
  script:
    - kubectl set image deployment/order-service 
      order-service=\$DOCKER_REGISTRY/order-service:\$CI_COMMIT_SHA
      -n staging
    - kubectl set image deployment/notification-service 
      notification-service=\$DOCKER_REGISTRY/notification-service:\$CI_COMMIT_SHA
      -n staging
    - kubectl rollout status deployment/order-service -n staging
    - kubectl rollout status deployment/notification-service -n staging
  only:
    - develop

deploy-production:
  stage: deploy
  image: bitnami/kubectl:latest
  environment:
    name: production
    url: https://api.example.com
  script:
    - kubectl set image deployment/order-service 
      order-service=\$DOCKER_REGISTRY/order-service:\$CI_COMMIT_SHA
      -n production
    - kubectl set image deployment/notification-service 
      notification-service=\$DOCKER_REGISTRY/notification-service:\$CI_COMMIT_SHA
      -n production
    - kubectl rollout status deployment/order-service -n production
    - kubectl rollout status deployment/notification-service -n production
  only:
    - main
  when: manual`;

const datadogConfigCode = `# ============================================
# Datadog APM & Observability Configuration
# ============================================

# Java APM Configuration (application.yml)
---
# Spring Boot Actuator for health checks
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
      probes:
        enabled: true
  health:
    livenessState:
      enabled: true
    readinessState:
      enabled: true

# Datadog tracing
dd:
  trace:
    enabled: true
    sample:
      rate: 1.0
  profiling:
    enabled: true
  logs:
    injection: true
  service:
    mapping: 
      postgresql: orders-db
      rabbitmq: orders-messaging

# Logging with trace correlation
logging:
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} [dd.trace_id=%X{dd.trace_id} dd.span_id=%X{dd.span_id}] - %msg%n"
  level:
    root: INFO
    com.enterprise.orders: DEBUG
    org.springframework.web: INFO
    org.hibernate.SQL: DEBUG

---
# Node.js Datadog Configuration (datadog.config.ts)
import tracer from 'dd-trace';

tracer.init({
  service: 'notification-service',
  env: process.env.NODE_ENV || 'development',
  version: process.env.APP_VERSION || '1.0.0',
  
  // APM Configuration
  runtimeMetrics: true,
  profiling: true,
  logInjection: true,
  
  // Sampling
  sampleRate: 1,
  
  // Service mapping for downstream services
  serviceMapping: {
    'pg': 'notifications-db',
    'amqplib': 'notifications-messaging',
  },
  
  // Tags
  tags: {
    team: 'backend-integration',
    component: 'notification-service',
  },
});

// Custom spans for business metrics
export function traceBusinessOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  return tracer.trace(operationName, async (span) => {
    try {
      const result = await operation();
      span?.setTag('status', 'success');
      return result;
    } catch (error) {
      span?.setTag('status', 'error');
      span?.setTag('error.message', (error as Error).message);
      throw error;
    }
  });
}

---
# Datadog Dashboard JSON (monitors.json)
{
  "monitors": [
    {
      "name": "High Error Rate - Order Service",
      "type": "metric alert",
      "query": "sum(last_5m):sum:trace.servlet.request.errors{service:order-service}.as_count() / sum:trace.servlet.request.hits{service:order-service}.as_count() > 0.05",
      "message": "Error rate above 5% for order-service. @slack-backend-alerts @pagerduty",
      "tags": ["service:order-service", "team:backend"],
      "options": {
        "thresholds": {
          "critical": 0.05,
          "warning": 0.02
        },
        "notify_no_data": false,
        "renotify_interval": 60
      }
    },
    {
      "name": "High Latency - Order Processing",
      "type": "metric alert", 
      "query": "avg(last_5m):avg:trace.servlet.request{service:order-service,resource_name:POST_/api/orders} > 2000",
      "message": "Order creation latency above 2s. @slack-backend-alerts",
      "tags": ["service:order-service", "team:backend"]
    },
    {
      "name": "RabbitMQ Queue Depth",
      "type": "metric alert",
      "query": "avg(last_10m):avg:rabbitmq.queue.messages{queue:orders.queue} > 10000",
      "message": "Orders queue depth above 10k messages. Consumer may be slow. @slack-backend-alerts",
      "tags": ["service:rabbitmq", "team:backend"]
    }
  ]
}`;

const DockerSection = () => {
  return (
    <section id="docker" className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Docker & DevOps
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Complete development environment with Docker Compose, CI/CD pipelines, and observability.
          </p>
        </div>

        {/* Key features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Java + Node.js", desc: "Microservices" },
            { label: "Oracle + PostgreSQL", desc: "Databases" },
            { label: "RabbitMQ", desc: "Messaging" },
            { label: "Maven", desc: "Build Tool" },
            { label: "GitLab CI/CD", desc: "Pipelines" },
            { label: "Datadog", desc: "Observability" },
            { label: "Multi-stage", desc: "Optimized builds" },
            { label: "Security", desc: "Non-root users" },
          ].map((item) => (
            <div key={item.label} className="p-4 bg-card rounded-lg border border-border">
              <p className="text-sm font-mono text-primary">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto">
            <TabsTrigger 
              value="compose" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Docker Compose
            </TabsTrigger>
            <TabsTrigger 
              value="java-docker" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Java Dockerfile
            </TabsTrigger>
            <TabsTrigger 
              value="node-docker" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Node.js Dockerfile
            </TabsTrigger>
            <TabsTrigger 
              value="gitlab" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              GitLab CI/CD
            </TabsTrigger>
            <TabsTrigger 
              value="datadog" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Datadog Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Complete Development Stack
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Java & Node.js microservices with health checks</li>
                <li>Oracle Database 19c and PostgreSQL 15</li>
                <li>RabbitMQ with management UI</li>
                <li>Datadog agent for APM and logs</li>
              </ul>
            </div>
            <CodeBlock 
              code={dockerComposeFullCode} 
              language="yaml" 
              filename="docker-compose.yml" 
            />
          </TabsContent>

          <TabsContent value="java-docker" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Optimized Java Dockerfile (Maven)
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Multi-stage build with layer extraction</li>
                <li>Maven for dependency management</li>
                <li>Container-aware JVM settings</li>
                <li>Datadog APM integration</li>
                <li>Non-root security</li>
              </ul>
            </div>
            <CodeBlock 
              code={javaDockerfileCode} 
              language="dockerfile" 
              filename="order-service/Dockerfile" 
            />
          </TabsContent>

          <TabsContent value="node-docker" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Production Node.js Dockerfile
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Multi-stage with dependency optimization</li>
                <li>dumb-init for signal handling</li>
                <li>Production pruning</li>
                <li>TypeScript build step</li>
              </ul>
            </div>
            <CodeBlock 
              code={nodeDockerfileCode} 
              language="dockerfile" 
              filename="notification-service/Dockerfile" 
            />
          </TabsContent>

          <TabsContent value="gitlab" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                GitLab CI/CD Pipeline
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Parallel testing for Java (Maven) and Node.js</li>
                <li>Security scanning (Trivy, OWASP, SAST)</li>
                <li>Docker build with caching</li>
                <li>Kubernetes deployment with rollout status</li>
              </ul>
            </div>
            <CodeBlock 
              code={gitlabCICode} 
              language="yaml" 
              filename=".gitlab-ci.yml" 
            />
          </TabsContent>

          <TabsContent value="datadog" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Observability Configuration
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>APM with distributed tracing</li>
                <li>Log injection with trace correlation</li>
                <li>Custom business metrics</li>
                <li>Alert monitors configuration</li>
              </ul>
            </div>
            <CodeBlock 
              code={datadogConfigCode} 
              language="yaml" 
              filename="observability-config.yml" 
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DockerSection;
