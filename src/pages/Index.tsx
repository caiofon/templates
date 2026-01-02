import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SkillsSection from "@/components/SkillsSection";
import BestPracticesSection from "@/components/BestPracticesSection";
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
        <BestPracticesSection />
        <RabbitMQSection />
        <DockerSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container max-w-6xl text-center">
          <p className="text-sm text-muted-foreground font-mono">
            <span className="text-primary">$</span> Built with passion for clean code
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
