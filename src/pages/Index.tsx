import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SkillsSection from "@/components/SkillsSection";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import BestPracticesSection from "@/components/BestPracticesSection";
import DatabaseSection from "@/components/DatabaseSection";
import DockerSection from "@/components/DockerSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <SkillsSection />
        <ExperienceTimeline />
        <BestPracticesSection />
        <DatabaseSection />
        <DockerSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground font-mono">
              <span className="text-primary">$</span> Built with passion for clean code and enterprise integration
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
              <span>Java</span>
              <span className="text-primary">•</span>
              <span>Node.js</span>
              <span className="text-primary">•</span>
              <span>Oracle SOA</span>
              <span className="text-primary">•</span>
              <span>Docker</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
