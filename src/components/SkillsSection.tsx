import { Server, MessageSquare, Container, GitBranch, Eye, Shield, Database, Workflow, Sparkles, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const skills = [
  {
    icon: Server,
    title: "Microservices",
    description: "Java Spring Boot & Node.js with RESTful and event-driven architectures",
    color: "text-primary",
  },
  {
    icon: Workflow,
    title: "Oracle SOA Suite",
    description: "OSB, BPM, BPEL orchestration, and enterprise integration patterns",
    color: "text-terminal-orange",
  },
  {
    icon: Database,
    title: "Databases",
    description: "Oracle, PostgreSQL, PL/SQL packages, and performance tuning",
    color: "text-terminal-yellow",
  },
  {
    icon: MessageSquare,
    title: "RabbitMQ",
    description: "Async messaging, exchanges, dead letter queues, and retry patterns",
    color: "text-terminal-cyan",
  },
  {
    icon: Container,
    title: "Docker & K8s",
    description: "Containerization, Docker Compose, and cloud-native deployments",
    color: "text-primary",
  },
  {
    icon: GitBranch,
    title: "CI/CD",
    description: "GitLab pipelines, automated testing, and deployment automation",
    color: "text-terminal-purple",
  },
  {
    icon: Eye,
    title: "Observability",
    description: "Datadog APM, distributed tracing, logging, and monitoring",
    color: "text-terminal-orange",
  },
  {
    icon: Shield,
    title: "Security & CVE",
    description: "Vulnerability management, OWASP, Snyk, and secure coding practices",
    color: "text-accent",
  },
  {
    icon: FlaskConical,
    title: "Testing",
    description: "JUnit, Jest, Testcontainers, integration and E2E testing",
    color: "text-terminal-yellow",
  },
  {
    icon: Sparkles,
    title: "AI Tools",
    description: "GitLab Duo, GitHub Copilot for enhanced development productivity",
    color: "text-terminal-purple",
  },
];

const SkillsSection = () => {
  return (
    <section id="skills" className="py-20 px-4">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Skills & Expertise
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Comprehensive expertise in backend integration, enterprise architecture, and DevOps practices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {skills.map((skill, index) => (
            <Card
              key={skill.title}
              className="card-hover bg-card border-border"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-secondary ${skill.color}`}>
                    <skill.icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-mono">{skill.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{skill.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
