import { Briefcase, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const experiences = [
  {
    title: "Senior Backend Integration Engineer",
    company: "North American Retailer",
    period: "Jul 2024 - Jan 2026",
    location: "Remote",
    description: "Engaged in Workday implementation, developing backend integrations for automated user provisioning and identity lifecycle processes within a microservices ecosystem.",
    technologies: ["Java", "Spring Boot", "Node.js", "TypeScript", "RabbitMQ", "Docker", "Podman", "GitLab CI/CD", "Datadog", "JUnit", "Jest"],
    highlights: [
      "Designed and implemented integrations using Java (Spring Boot) and Node.js (TypeScript) microservices",
      "Implemented event-driven architectures with RabbitMQ ensuring scalability and reliable message processing",
      "Built CI/CD pipelines with GitLab including automated testing and security scanning",
      "Implemented observability and monitoring with Datadog improving system visibility and incident response",
      "Contributed to vulnerability management using GitLab Duo for CVE identification and remediation",
    ],
  },
  {
    title: "Senior Backend Integration Engineer",
    company: "State-owned IT Company",
    period: "Aug 2020 - May 2024",
    location: "Remote",
    description: "Integration Specialist focusing on development and modernization of backend microservices, Oracle SOA Suite, OSB, and Oracle Database. Led migration to Oracle Integration Cloud (OIC) enabling hybrid, service-oriented architecture.",
    technologies: ["Java", "Node.js", "Oracle SOA Suite", "OSB", "Oracle Database", "OIC", "JMS", "RabbitMQ", "Angular", "TypeScript"],
    highlights: [
      "Modernized backend microservices using Java and Node.js with event-driven patterns",
      "Implemented asynchronous integrations using JMS and RabbitMQ for high-performance processing",
      "Led migration of services to Oracle Integration Cloud enabling hybrid architecture",
      "Developed SOAP and REST integration patterns with XML, JSON, WSDL, and XSD",
      "Created front-end interfaces using Angular TypeScript for end-to-end integration",
    ],
  },
  {
    title: "SOA Integration Developer",
    company: "Tata Consultancy Services",
    period: "Apr 2016 - Aug 2020",
    location: "Greater São Paulo Area - Remote",
    description: "Integration Team Lead in technology modernization project for major retail company. Established development standards, processes, and best practices within the integration domain.",
    technologies: ["Oracle SOA Suite", "OSB", "ODI", "Java Spring Boot", "Git", "CI/CD"],
    highlights: [
      "Led technical solutions built on Oracle SOA Suite, OSB, and Oracle Data Integrator",
      "Directed migration of legacy integrations to Java Spring Boot microservices architecture",
      "Established development standards and best practices for integration domain",
      "Implemented continuous integration, version control, and automated deployment practices",
    ],
  },
  {
    title: "Oracle | Java Developer",
    company: "Softtek",
    period: "Apr 2014 - Feb 2016",
    location: "São Paulo, BR - On-site",
    description: "Projects for corporate clients with hands-on experience in Oracle Database, ODI, SOA Suite, and Java ADF. Focus on performance optimization and enterprise standards compliance.",
    technologies: ["Oracle Database", "Oracle ODI", "Oracle SOA Suite", "Java ADF", "SVN"],
    highlights: [
      "Performed requirements gathering, analysis, and source code management",
      "Optimized integrations and database components through query tuning and process improvements",
      "Contributed throughout entire development lifecycle from technical design to production delivery",
    ],
  },
  {
    title: "Oracle | Java Developer",
    company: "Thomson Reuters Brasil",
    period: "Sep 2009 - Feb 2014",
    location: "São Paulo, BR - On-site",
    description: "Specialized in system integration for corporate clients, connecting Oracle EBS (versions 11 and 12) and SAP ECC with middleware technologies.",
    technologies: ["Oracle ODI", "Oracle SOA Suite", "Oracle Database", "Java", "Apache Camel", "SAP ECC"],
    highlights: [
      "Developed integrations using Oracle ODI, SOA Suite, and Database for Oracle EBS",
      "Built SAP integrations using Java and Apache Camel messaging",
      "Managed version control and deployment of patches for ERP and fiscal software updates",
      "Provided client support ensuring system stability and compliance",
    ],
  },
  {
    title: "Oracle | Java Developer",
    company: "Resource IT Solutions",
    period: "Oct 2007 - Sep 2009",
    location: "São Paulo, BR - On-site",
    description: "Oracle SOA Suite Developer (versions 10 and 11) on projects for Oracle Consulting, serving major clients including Vale do Rio Doce, Claro, MRS Logística, and RedeCard.",
    technologies: ["Oracle SOA Suite 10/11", "SOAP", "XML", "Java ADF", "Oracle Database", "SVN"],
    highlights: [
      "Developed and integrated service-oriented solutions using SOAP and XML technologies",
      "Created and maintained service contracts for enterprise clients",
      "Built enterprise applications with Java ADF and Oracle Database",
      "Focused on system integration, performance optimization, and application reliability",
    ],
  },
  {
    title: "Oracle Developer",
    company: "Fundação Getulio Vargas",
    period: "Apr 2003 - Aug 2007",
    location: "São Paulo, BR - On-site",
    description: "Extensive experience with Oracle Developer (Forms, Reports, and PL/SQL), database development, and advanced use of packages, procedures, and triggers.",
    technologies: ["Oracle Developer", "Forms", "Reports", "PL/SQL", "Oracle Database", "EBS 11", "SVN"],
    highlights: [
      "Developed and maintained billing applications integrating EBS 11 with academic systems",
      "Skilled in user profile administration, data security, and schema management",
      "Managed privilege control and grants for database security",
      "Conducted requirements gathering, specifications, and effort estimations for projects",
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
