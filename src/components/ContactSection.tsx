import { Linkedin, Mail, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 px-4">
      <div className="container max-w-4xl">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 font-mono text-sm text-muted-foreground">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-primary">~</span>
            <span>$ echo $CONTACT_INFO</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="gradient-text">Let's Connect</span>
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto">
            Interested in discussing backend architecture, integration challenges, 
            or potential collaboration opportunities?
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
            >
              <a 
                href="https://www.linkedin.com/in/caio-fonseca" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Linkedin className="w-5 h-5 mr-2" />
                Connect on LinkedIn
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border hover:border-primary hover:bg-primary/10 font-mono"
            >
              <a href="mailto:contact@example.com">
                <Mail className="w-5 h-5 mr-2" />
                Send Email
              </a>
            </Button>
          </div>

          {/* Terminal-style footer */}
          <div className="pt-12 font-mono text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-lg border border-border">
              <span className="text-accent">✓</span>
              <span>Open to new opportunities</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
