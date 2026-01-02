import { Linkedin, Github, Mail, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-4xl relative z-10">
        <div className="space-y-6 animate-fade-in">
          {/* Terminal prompt */}
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-primary">~</span>
            <span>$ whoami</span>
          </div>

          {/* Name and title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="gradient-text">Caio Fonseca</span>
            </h1>
            <h2 className="text-xl md:text-2xl text-muted-foreground font-mono">
              <span className="text-primary">&gt;</span> Senior Backend Integration Engineer
            </h2>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Designing and delivering <span className="text-primary">scalable</span>, 
            <span className="text-accent"> secure</span>, and 
            <span className="text-terminal-yellow"> event-driven</span> integration solutions 
            in enterprise and global environments.
          </p>

          {/* Tech stack highlights */}
          <div className="flex flex-wrap gap-2 pt-4">
            {["Java", "Node.js", "RabbitMQ", "Docker", "GitLab CI/CD", "Datadog"].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-secondary rounded-full text-sm font-mono text-secondary-foreground border border-border"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-6">
            <Button
              asChild
              className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
            >
              <a href="https://www.linkedin.com/in/caio-fonseca" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </a>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-border hover:border-primary hover:bg-primary/10 font-mono"
            >
              <a href="#contact">
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
