import { useState, useEffect } from "react";
import { Menu, X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#github-projects", label: "Projects" },
  { href: "#best-practices", label: "Code & SOLID" },
  { href: "#database", label: "Database" },
  { href: "#tools", label: "Tools" },
  { href: "#docker", label: "DevOps" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const sections = navLinks.map(link => link.href.substring(1));
      for (const sectionId of sections.reverse()) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg" : "bg-background/80 backdrop-blur-md border-b border-border"
    }`}>
      <div className="container max-w-6xl px-4">
        <div className="flex items-center justify-between h-14">
          <a href="#" className="flex items-center gap-2 font-mono text-lg font-bold group">
            <Terminal className="w-5 h-5 text-primary group-hover:animate-pulse" />
            <span className="text-primary">CF</span>
            <span className="text-muted-foreground">/dev</span>
          </a>

          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1.5 font-mono text-xs rounded-md transition-colors ${
                  activeSection === link.href.substring(1)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                }`}
              >
                {link.label}
              </a>
            ))}
            <Button size="sm" className="ml-3 font-mono text-xs h-7" asChild>
              <a href="#contact">Contact</a>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {isOpen && (
          <div className="md:hidden py-3 border-t border-border">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 font-mono text-sm rounded-md ${
                    activeSection === link.href.substring(1)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <Button size="sm" className="mt-2 font-mono" asChild>
                <a href="#contact" onClick={() => setIsOpen(false)}>Contact</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
