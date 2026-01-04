import { Github, ExternalLink, Star, GitFork } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Project {
  name: string;
  description: string;
  technologies: string[];
  features: string[];
  repoUrl: string;
}

const javaProjects: Project[] = [
  {
    name: "spring-boot-microservice-template",
    description: "Production-ready microservice template with Spring Boot 3, featuring RESTful APIs, Docker containerization, and GitLab CI/CD pipeline.",
    technologies: ["Java 17", "Spring Boot 3", "Maven", "Docker", "GitLab CI"],
    features: [
      "Controller-Service-Repository pattern",
      "Global exception handling",
      "OpenAPI/Swagger documentation",
      "Health checks and actuator endpoints",
      "Multi-stage Dockerfile",
      "Unit and integration tests with Testcontainers"
    ],
    repoUrl: "https://github.com/caiofon/caiofon-portfolio/tree/main/templates/java/spring-boot-microservice-template"
  },
  {
    name: "rabbitmq-event-driven-architecture",
    description: "Event-driven architecture implementation with RabbitMQ, featuring dead letter queues, retry patterns, and idempotent consumers.",
    technologies: ["Java 17", "Spring AMQP", "RabbitMQ", "Docker Compose"],
    features: [
      "Publisher confirms and consumer acknowledgments",
      "Dead letter queues with exponential backoff",
      "Idempotent message processing",
      "Message serialization with Jackson",
      "Retry policies and circuit breaker",
      "Monitoring with RabbitMQ Management"
    ],
    repoUrl: "https://github.com/caiofon/caiofon-portfolio/tree/main/templates/java/rabbitmq-event-driven-architecture"
  },
  {
    name: "spring-batch-etl-processor",
    description: "ETL batch processing solution with Spring Batch, featuring scheduled jobs, chunk processing, and comprehensive monitoring.",
    technologies: ["Java 17", "Spring Batch", "Spring Scheduler", "PostgreSQL"],
    features: [
      "Chunk-oriented processing",
      "Job scheduling with cron expressions",
      "Skip and retry policies",
      "Job execution listeners",
      "Database partitioning for large datasets",
      "Batch metrics and monitoring"
    ],
    repoUrl: "https://github.com/caiofon/caiofon-portfolio/tree/main/templates/java/spring-batch-etl-processor"
  }
];

const nodeProjects: Project[] = [
  {
    name: "nestjs-rest-api-template",
    description: "NestJS REST API template with Prisma ORM, JWT authentication, role-based access control, and Swagger documentation.",
    technologies: ["Node.js 20", "NestJS", "Prisma", "PostgreSQL", "Docker"],
    features: [
      "Modular architecture with dependency injection",
      "JWT authentication with refresh tokens",
      "Role-based access control (RBAC)",
      "Request validation with class-validator",
      "Swagger/OpenAPI documentation",
      "E2E testing with Jest and Supertest"
    ],
    repoUrl: "https://github.com/caiofon/caiofon-portfolio/tree/main/templates/nodejs/nestjs-rest-api-template"
  },
  {
    name: "express-graphql-server",
    description: "GraphQL API server with Express and Apollo, featuring schema-first design, dataloaders, and subscription support.",
    technologies: ["Node.js 20", "Express", "Apollo Server", "GraphQL", "TypeScript"],
    features: [
      "Schema-first GraphQL design",
      "Dataloaders for N+1 query prevention",
      "Real-time subscriptions",
      "Custom directives and scalars",
      "Query complexity analysis",
      "GraphQL Playground integration"
    ],
    repoUrl: "https://github.com/caiofon/caiofon-portfolio/tree/main/templates/nodejs/express-graphql-server"
  },
  {
    name: "nodejs-websocket-realtime",
    description: "Real-time WebSocket server with Socket.io, featuring Redis pub/sub for horizontal scaling and room management.",
    technologies: ["Node.js 20", "Socket.io", "Redis", "TypeScript", "Docker"],
    features: [
      "WebSocket connection management",
      "Redis pub/sub for multi-instance scaling",
      "Room-based broadcasting",
      "Authentication middleware",
      "Connection heartbeat and reconnection",
      "Event-driven architecture"
    ],
    repoUrl: "https://github.com/caiofon/caiofon-portfolio/tree/main/templates/nodejs/nodejs-websocket-realtime"
  }
];

const reactProjects: Project[] = [
  {
    name: "react-admin-dashboard",
    description: "Modern admin dashboard with React and TypeScript, featuring data visualization, responsive design, and dark mode support.",
    technologies: ["React 18", "TypeScript", "TailwindCSS", "Recharts", "Vite"],
    features: [
      "Responsive sidebar navigation",
      "Interactive charts and graphs",
      "Data tables with sorting and filtering",
      "Dark/light theme toggle",
      "Form validation with React Hook Form",
      "Lazy loading and code splitting"
    ],
    repoUrl: "https://github.com/caiofon/caiofon-portfolio/tree/main/templates/react/react-admin-dashboard"
  },
  {
    name: "react-ecommerce-storefront",
    description: "E-commerce storefront with shopping cart, checkout flow, and payment integration using Stripe.",
    technologies: ["React 18", "TypeScript", "Redux Toolkit", "Stripe", "TailwindCSS"],
    features: [
      "Product catalog with filtering",
      "Shopping cart with persistence",
      "Multi-step checkout process",
      "Stripe payment integration",
      "Order history and tracking",
      "Responsive mobile-first design"
    ],
    repoUrl: "https://github.com/caiofon/caiofon-portfolio/tree/main/templates/react/react-ecommerce-storefront"
  },
  {
    name: "react-auth-boilerplate",
    description: "Authentication boilerplate with JWT, refresh tokens, protected routes, and social login integration.",
    technologies: ["React 18", "TypeScript", "React Router", "Axios", "Zustand"],
    features: [
      "JWT authentication flow",
      "Automatic token refresh",
      "Protected route components",
      "Social login (Google, GitHub)",
      "Remember me functionality",
      "Password reset flow"
    ],
    repoUrl: "https://github.com/caiofon/caiofon-portfolio/tree/main/templates/react/react-auth-boilerplate"
  }
];

const angularProjects: Project[] = [
  {
    name: "angular-admin-panel",
    description: "Enterprise admin panel with Angular Material, NgRx state management, and lazy-loaded feature modules.",
    technologies: ["Angular 17", "TypeScript", "Angular Material", "NgRx", "RxJS"],
    features: [
      "Lazy-loaded feature modules",
      "NgRx store with effects",
      "Angular Material components",
      "Role-based route guards",
      "Reactive forms with validation",
      "Internationalization (i18n)"
    ],
    repoUrl: "https://github.com/caiofon/caiofon-portfolio/tree/main/templates/angular/angular-admin-panel"
  },
  {
    name: "angular-landing-page",
    description: "High-performance landing page with Angular, featuring animations, SEO optimization, and server-side rendering.",
    technologies: ["Angular 17", "TypeScript", "Angular Universal", "SCSS"],
    features: [
      "Server-side rendering (SSR)",
      "SEO meta tags management",
      "Scroll-triggered animations",
      "Responsive image optimization",
      "Contact form with validation",
      "Performance-optimized bundle"
    ],
    repoUrl: "https://github.com/caiofon/caiofon-portfolio/tree/main/templates/angular/angular-landing-page"
  },
  {
    name: "angular-crud-generator",
    description: "Dynamic CRUD application generator with Angular, featuring auto-generated forms, tables, and API integration.",
    technologies: ["Angular 17", "TypeScript", "PrimeNG", "JSON Schema"],
    features: [
      "Schema-driven form generation",
      "Dynamic table with CRUD operations",
      "Generic API service layer",
      "Validation rules from schema",
      "Export to CSV/Excel",
      "Pagination and sorting"
    ],
    repoUrl: "https://github.com/caiofon/caiofon-portfolio/tree/main/templates/angular/angular-crud-generator"
  }
];

const ProjectCard = ({ project }: { project: Project }) => (
  <Card className="bg-card border-border h-full flex flex-col">
    <CardHeader>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-mono text-primary truncate">
            {project.name}
          </CardTitle>
          <CardDescription className="mt-2 line-clamp-2">
            {project.description}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          asChild
        >
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </CardHeader>
    <CardContent className="flex-1 flex flex-col">
      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.technologies.map((tech) => (
          <Badge key={tech} variant="secondary" className="text-xs font-mono">
            {tech}
          </Badge>
        ))}
      </div>
      <ul className="space-y-1 text-sm text-muted-foreground flex-1">
        {project.features.slice(0, 4).map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        variant="ghost"
        className="w-full mt-4 font-mono text-sm"
        asChild
      >
        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="w-4 h-4 mr-2" />
          View Repository
        </a>
      </Button>
    </CardContent>
  </Card>
);

const GitHubProjectsSection = () => {
  return (
    <section id="github-projects" className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> GitHub Projects
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Open-source project templates and production-ready boilerplates across different technologies.
          </p>
        </div>

        <Tabs defaultValue="java" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="java" className="font-mono">Java</TabsTrigger>
            <TabsTrigger value="nodejs" className="font-mono">Node.js</TabsTrigger>
            <TabsTrigger value="react" className="font-mono">React</TabsTrigger>
            <TabsTrigger value="angular" className="font-mono">Angular</TabsTrigger>
          </TabsList>

          <TabsContent value="java">
            <div className="grid md:grid-cols-3 gap-6">
              {javaProjects.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nodejs">
            <div className="grid md:grid-cols-3 gap-6">
              {nodeProjects.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="react">
            <div className="grid md:grid-cols-3 gap-6">
              {reactProjects.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="angular">
            <div className="grid md:grid-cols-3 gap-6">
              {angularProjects.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            className="font-mono"
            asChild
          >
            <a href="https://github.com/caiofon" target="_blank" rel="noopener noreferrer">
              <Github className="w-5 h-5 mr-2" />
              View All Repositories
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GitHubProjectsSection;
