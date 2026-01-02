import { useState, useEffect } from "react";
import { Menu, X, Terminal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "#skills", label: "Skills & Expertise" },
      { href: "#experience", label: "Experience" },
    ],
  },
  {
    label: "Development",
    items: [
      { href: "#best-practices", label: "Best Practices" },
      { href: "#testing", label: "Testing" },
    ],
  },
  {
    label: "Integration",
    items: [
      { href: "#soa", label: "Oracle SOA" },
      { href: "#rabbitmq", label: "RabbitMQ" },
    ],
  },
  {
    label: "Data",
    items: [
      { href: "#database", label: "Database & PL/SQL" },
    ],
  },
  {
    label: "DevOps",
    items: [
      { href: "#security", label: "Security & CVE" },
      { href: "#docker", label: "Docker & CI/CD" },
    ],
  },
];

const flatNavLinks = navSections.flatMap(section => section.items);

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      // Detect active section
      const sections = flatNavLinks.map(link => link.href.substring(1));
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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 font-mono text-lg font-bold group">
            <Terminal className="w-5 h-5 text-primary group-hover:animate-pulse" />
            <span className="text-primary">CF</span>
            <span className="text-muted-foreground">/dev</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navSections.map((section) => (
              <DropdownMenu key={section.label}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="font-mono text-sm text-muted-foreground hover:text-primary hover:bg-secondary/50 gap-1"
                  >
                    {section.label}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border-border">
                  <DropdownMenuLabel className="font-mono text-xs text-muted-foreground">
                    {section.label}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {section.items.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <a
                        href={item.href}
                        className={`font-mono text-sm cursor-pointer ${
                          activeSection === item.href.substring(1) 
                            ? "text-primary" 
                            : "text-foreground"
                        }`}
                      >
                        <span className="text-primary mr-2">#</span>
                        {item.label}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
            
            <Button
              asChild
              size="sm"
              className="ml-4 bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
            >
              <a href="#contact">Contact</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              {navSections.map((section) => (
                <div key={section.label} className="space-y-2">
                  <p className="px-4 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    {section.label}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-4 py-2 text-sm font-mono rounded-lg transition-colors ${
                          activeSection === item.href.substring(1)
                            ? "text-primary bg-secondary/50"
                            : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="text-primary mr-2">#</span>
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="px-4 pt-4 border-t border-border">
                <Button
                  asChild
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
                  onClick={() => setIsOpen(false)}
                >
                  <a href="#contact">Contact Me</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
