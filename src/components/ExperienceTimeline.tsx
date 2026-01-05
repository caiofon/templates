import { Briefcase, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const experiences = [
  {
    title: "Senior Backend Integration Engineer",
    company: "Prodesp",
    period: "Aug 2020 – Jan 2026",
    location: "Remote",
    description: "Actively involved in the development and ongoing support of mission-critical operational systems supporting the processes of the São Paulo State Board of Trade (JUCESP), ensuring compliance with regulatory and operational requirements.",
    technologies: ["Java", "Spring Boot", "Node.js", "TypeScript", "RabbitMQ", "Docker", "Podman", "GitLab CI/CD", "Datadog", "JUnit", "Jest"],
    highlights: [
      "Designed and implemented integrations within a microservices ecosystem using Java (Spring Boot) and Node.js (TypeScript)",
      "Implemented asynchronous, event-driven architectures using RabbitMQ ensuring scalability and reliable message processing",
      "Developed and containerized services using Docker and Podman",
      "Built and maintained CI/CD pipelines with GitLab including automated build, test, security scanning, and deployment stages",
      "Implemented observability and monitoring with Datadog improving system visibility and incident response",
      "Contributed to vulnerability management using GitLab Duo for CVE identification and remediation",
    ],
  },
  {
    title: "SOA Integration Developer",
    company: "Tata Consultancy Services",
    period: "Apr 2016 – Aug 2020",
    location: "Greater São Paulo Area - Remote",
    description: "Collaborated with cross-functional and international teams to ensure secure, compliant, and scalable identity provisioning workflows in enterprise integration projects.",
    technologies: ["Oracle SOA Suite", "OSB", "ODI", "Java Spring Boot", "Git", "CI/CD"],
    highlights: [
      "Collaborated with cross-functional and international teams on identity provisioning workflows",
      "Led technical solutions built on Oracle SOA Suite, OSB, and Oracle Data Integrator",
      "Directed migration of legacy integrations to Java Spring Boot microservices architecture",
      "Established development standards and best practices for the integration domain",
    ],
  },
  {
    title: "Oracle | Java Developer",
    company: "Softtek",
    period: "Apr 2014 – Feb 2016",
    location: "São Paulo, BR - On-site",
    description: "Worked on projects for corporate clients with strong hands-on experience in Oracle Database, Oracle ODI, Oracle SOA Suite, and Java ADF. Key focus on performance optimization and enterprise standards compliance.",
    technologies: ["Oracle Database", "Oracle ODI", "Oracle SOA Suite", "Java ADF", "SVN"],
    highlights: [
      "Responsible for requirements gathering and analysis, source code management, and change management",
      "Ensured code quality, traceability, and compliance with enterprise standards",
      "Key focus on performance optimization of integrations and database components including query tuning",
      "Contributed throughout entire development lifecycle from technical design to production delivery",
    ],
  },
  {
    title: "Oracle | Java Developer",
    company: "Thomson Reuters Brazil",
    period: "Sep 2009 – Feb 2014",
    location: "São Paulo, BR - On-site",
    description: "Specialized in system integration for corporate clients at a fiscal software company, focusing on solutions connecting Oracle EBS (versions 11 and 12) and SAP ECC.",
    technologies: ["Oracle ODI", "Oracle SOA Suite", "Oracle Database", "Java 1.6", "Apache Camel", "SAP ECC"],
    highlights: [
      "Developed integrations using Oracle ODI, SOA Suite, and Database for Oracle EBS",
      "Built SAP integrations using Java 1.6 and Apache Camel messaging",
      "Managed version control and deployment of patches for ERP and fiscal software updates",
      "Provided client support ensuring system stability, compliance, and seamless data exchange",
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
            Over two decades of experience building enterprise integration solutions.
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
