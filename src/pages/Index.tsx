import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SkillsSection from "@/components/SkillsSection";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import BestPracticesSection from "@/components/BestPracticesSection";
import SOASection from "@/components/SOASection";
import DatabaseSection from "@/components/DatabaseSection";
import RabbitMQSection from "@/components/RabbitMQSection";
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
        <SOASection />
        <DatabaseSection />
        <RabbitMQSection />
        <DockerSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container max-w-6xl text-center">
          <p className="text-sm text-muted-foreground font-mono">
            <span className="text-primary">$</span> Built with passion for clean code and enterprise integration
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
