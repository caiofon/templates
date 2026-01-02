import { Server, MessageSquare, Container, GitBranch, Eye, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const skills = [
  {
    icon: Server,
    title: "Microservices",
    description: "Java & Node.js architectures with RESTful and event-driven patterns",
    color: "text-primary",
  },
  {
    icon: MessageSquare,
    title: "RabbitMQ",
    description: "Asynchronous messaging, queues, exchanges, and dead letter handling",
    color: "text-terminal-yellow",
  },
  {
    icon: Container,
    title: "Docker",
    description: "Containerization, Docker Compose, and cloud-native deployments",
    color: "text-terminal-cyan",
  },
  {
    icon: GitBranch,
    title: "CI/CD",
    description: "GitLab pipelines, automated testing, and deployment automation",
    color: "text-terminal-orange",
  },
  {
    icon: Eye,
    title: "Observability",
    description: "Datadog monitoring, APM, logging, and distributed tracing",
    color: "text-terminal-purple",
  },
  {
    icon: Shield,
    title: "Security",
    description: "CVE remediation, vulnerability management, and secure coding",
    color: "text-accent",
  },
];

const SkillsSection = () => {
  return (
    <section id="skills" className="py-20 px-4">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Expertise
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Specialized skills in backend integration and enterprise-grade solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
