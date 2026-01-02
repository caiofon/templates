import { Briefcase, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const experiences = [
  {
    title: "Senior Backend Integration Engineer",
    company: "Enterprise Global Company",
    period: "2021 - Present",
    location: "Remote",
    description: "Design and delivery of scalable, secure, and event-driven integration solutions. Leadership in microservices architecture with Java and Node.js.",
    technologies: ["Java", "Node.js", "RabbitMQ", "Docker", "GitLab CI/CD", "Datadog"],
    highlights: [
      "Reduced integration latency by 40% with async messaging patterns",
      "Led CVE remediation across 50+ microservices",
      "Implemented observability stack with Datadog APM",
    ],
  },
  {
    title: "Integration Architect",
    company: "Enterprise Solutions",
    period: "2018 - 2021",
    location: "São Paulo, BR",
    description: "Oracle SOA Suite 12c implementation and enterprise integration patterns. BPM process automation and OSB service orchestration.",
    technologies: ["Oracle SOA Suite 12c", "OSB", "BPM", "Oracle DB", "PL/SQL"],
    highlights: [
      "Designed 100+ integration services with Oracle Service Bus",
      "Automated business processes with Oracle BPM",
      "Optimized PL/SQL procedures reducing execution time by 60%",
    ],
  },
  {
    title: "Senior Software Developer",
    company: "Tech Enterprise",
    period: "2015 - 2018",
    location: "São Paulo, BR",
    description: "Full-stack development with focus on backend services and database optimization. Oracle and PostgreSQL expertise.",
    technologies: ["Java", "Oracle DB", "PostgreSQL", "PL/SQL", "Spring Boot"],
    highlights: [
      "Developed core banking integration layer",
      "Managed Oracle and PostgreSQL database clusters",
      "Created complex PL/SQL packages for data processing",
    ],
  },
  {
    title: "Software Developer",
    company: "Startup Tech",
    period: "2012 - 2015",
    location: "São Paulo, BR",
    description: "Backend development and database administration. First experiences with enterprise integration patterns.",
    technologies: ["Java", "Oracle DB", "PL/SQL", "Web Services"],
    highlights: [
      "Built RESTful APIs for mobile applications",
      "Database design and performance tuning",
      "Integration with third-party payment systems",
    ],
  },
];

const ExperienceTimeline = () => {
  return (
    <section id="experience" className="py-20 px-4">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Professional Experience
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Over a decade of experience building enterprise integration solutions.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-px top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <div
                key={exp.title + exp.company}
                className={`relative flex flex-col md:flex-row gap-8 ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10" />

                {/* Content */}
                <div className={`md:w-1/2 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"} pl-8 md:pl-0`}>
                  <Card className="bg-card border-border card-hover">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-primary font-mono">
                          {exp.title}
                        </h3>
                        <p className="text-lg text-foreground">{exp.company}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {exp.period}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {exp.location}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {exp.description}
                      </p>

                      <div className="space-y-2">
                        <p className="text-xs font-mono text-primary uppercase tracking-wider">
                          Key Achievements
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {exp.highlights.map((highlight, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-accent mt-1">▹</span>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-secondary text-xs font-mono rounded text-secondary-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Empty space for timeline layout */}
                <div className="hidden md:block md:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceTimeline;
