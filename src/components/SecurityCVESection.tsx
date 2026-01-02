import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle, Search } from "lucide-react";
import CodeBlock from "./CodeBlock";

const cveProcessCode = `# ============================================
# CVE Remediation Workflow
# Automated vulnerability detection and patching
# ============================================

## 1. Dependency Scanning with OWASP

# Maven - OWASP Dependency Check
./mvnw org.owasp:dependency-check-maven:check

# Gradle
./gradlew dependencyCheckAnalyze

# Node.js - npm audit
npm audit --json > audit-report.json
npm audit fix --force  # Auto-fix when possible

## 2. Container Image Scanning with Trivy

# Scan local image
trivy image --severity HIGH,CRITICAL order-service:latest

# Scan with SBOM generation
trivy image --format spdx-json --output sbom.json order-service:latest

# Scan in CI/CD (fail on critical)
trivy image --exit-code 1 --severity CRITICAL order-service:latest

## 3. GitLab Security Dashboard Integration

# .gitlab-ci.yml
dependency_scanning:
  stage: security
  variables:
    DS_JAVA_VERSION: 17
  include:
    - template: Security/Dependency-Scanning.gitlab-ci.yml

container_scanning:
  stage: security
  include:
    - template: Security/Container-Scanning.gitlab-ci.yml`;

const snykConfigCode = `# ============================================
# Snyk Configuration for Enterprise Security
# ============================================

# .snyk policy file
version: v1.25.0
ignore:
  # Temporary ignore with expiration (CVE requires app restart)
  SNYK-JAVA-ORGAPACHELOGGINGLOG4J-2314720:
    - '*':
        reason: 'Mitigation applied via JVM flag. Upgrade scheduled for Q1.'
        expires: '2024-03-01T00:00:00.000Z'
        created: '2024-01-15T10:00:00.000Z'

patch: {}

# ============================================
# Snyk CLI Commands
# ============================================

# Test for vulnerabilities
snyk test --severity-threshold=high

# Monitor project (continuous scanning)
snyk monitor --org=enterprise-team

# Test container image
snyk container test order-service:latest --severity-threshold=high

# Generate SBOM
snyk sbom --format=cyclonedx1.4+json > sbom.json

# Fix vulnerabilities automatically
snyk fix --dry-run  # Preview changes
snyk fix            # Apply fixes

# ============================================
# Gradle Integration
# ============================================

plugins {
    id "io.snyk.gradle.plugin.snykplugin" version "0.5.1"
}

snyk {
    severity = 'high'
    api = System.getenv("SNYK_TOKEN")
    autoDownload = true
    autoUpdate = true
}

# Run: ./gradlew snyk-test`;

const dependencyManagementCode = `// ============================================
// Java - Dependency Management with BOM
// Centralized version control for security
// ============================================

// build.gradle.kts
plugins {
    id("org.springframework.boot") version "3.2.1"
    id("io.spring.dependency-management") version "1.1.4"
    id("org.owasp.dependencycheck") version "9.0.7"
}

dependencyManagement {
    imports {
        // Spring Boot BOM - tested compatible versions
        mavenBom("org.springframework.boot:spring-boot-dependencies:3.2.1")
        
        // Spring Cloud BOM
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:2023.0.0")
    }
    
    dependencies {
        // Override vulnerable transitive dependencies
        dependency("org.yaml:snakeyaml:2.2")
        dependency("com.fasterxml.jackson.core:jackson-databind:2.16.1")
        dependency("org.apache.tomcat.embed:tomcat-embed-core:10.1.17")
    }
}

// OWASP Dependency Check configuration
dependencyCheck {
    failBuildOnCVSS = 7.0f  // Fail on HIGH severity
    suppressionFile = "owasp-suppressions.xml"
    analyzers {
        retirejs { enabled = false }
        nodeAudit { enabled = true }
    }
    nvd {
        apiKey = System.getenv("NVD_API_KEY")
    }
}

// ============================================
// Node.js - Package.json with fixed versions
// ============================================

{
  "name": "notification-service",
  "version": "1.0.0",
  "engines": {
    "node": ">=20.0.0"
  },
  "overrides": {
    // Force secure versions of transitive deps
    "semver": "7.5.4",
    "tough-cookie": "4.1.3",
    "word-wrap": "1.2.5"
  },
  "scripts": {
    "audit": "npm audit --audit-level=high",
    "audit:fix": "npm audit fix",
    "snyk": "snyk test --severity-threshold=high",
    "security:check": "npm run audit && npm run snyk"
  }
}`;

const gitDuoCode = `# ============================================
# AI-Assisted Development with GitHub Copilot / GitLab Duo
# Improving code quality and security
# ============================================

## GitLab Duo Enterprise Features

### 1. Code Suggestions
# Duo provides context-aware suggestions as you type
# Understands project patterns and coding standards

### 2. Vulnerability Explanation
# Ask Duo to explain CVE impacts and remediation steps
# Example prompt: "Explain CVE-2023-44487 and how to fix it"

### 3. Code Review Assistance
# Duo analyzes MRs for security issues
# Suggests improvements for best practices

## VS Code Settings for Copilot/Duo

{
  "github.copilot.enable": {
    "*": true,
    "yaml": true,
    "dockerfile": true,
    "java": true,
    "typescript": true
  },
  "github.copilot.advanced": {
    "inlineSuggestCount": 3,
    "length": 500
  },
  // Security: Exclude sensitive files
  "github.copilot.excludeFiles": [
    "**/secrets/**",
    "**/.env*",
    "**/credentials/**"
  ]
}

## AI-Assisted Security Patterns

### Prompt Engineering for Secure Code:

# Bad: Generic request
"Create a login function"

# Good: Security-focused request
"Create a login function with:
- Input validation using zod
- Rate limiting (5 attempts/minute)
- Secure password comparison with bcrypt
- Audit logging for failed attempts
- No sensitive data in error messages"

### Using AI for CVE Analysis:

# Prompt for Duo/Copilot Chat:
"Analyze this dependency for known vulnerabilities:
com.fasterxml.jackson.core:jackson-databind:2.13.0

Provide:
1. List of CVEs affecting this version
2. Recommended safe version
3. Breaking changes to consider
4. Migration steps"

## GitLab Duo Security Scanning

# .gitlab-ci.yml
duo_security_review:
  stage: review
  script:
    - echo "Duo analyzes MR for security issues"
  rules:
    - if: \$CI_PIPELINE_SOURCE == "merge_request_event"`;

const cveTrackingCode = `// ============================================
// CVE Tracking and Remediation Dashboard
// Spring Boot Actuator + Custom Metrics
// ============================================

@RestController
@RequestMapping("/api/security")
public class SecurityMetricsController {

    private final VulnerabilityService vulnerabilityService;
    private final MeterRegistry meterRegistry;

    @GetMapping("/vulnerabilities")
    public ResponseEntity<VulnerabilityReport> getVulnerabilities() {
        VulnerabilityReport report = vulnerabilityService.scanDependencies();
        
        // Update Prometheus metrics for Datadog
        meterRegistry.gauge("security.vulnerabilities.critical", 
            report.getCriticalCount());
        meterRegistry.gauge("security.vulnerabilities.high", 
            report.getHighCount());
        meterRegistry.gauge("security.vulnerabilities.medium", 
            report.getMediumCount());
        
        return ResponseEntity.ok(report);
    }

    @PostMapping("/cve/{cveId}/remediate")
    public ResponseEntity<RemediationResult> remediate(
            @PathVariable String cveId,
            @RequestBody RemediationRequest request) {
        
        // Validate CVE ID format
        if (!cveId.matches("CVE-\\\\d{4}-\\\\d{4,7}")) {
            throw new InvalidCveIdException(cveId);
        }
        
        RemediationResult result = vulnerabilityService.remediate(cveId, request);
        
        // Audit log
        auditLogger.log(AuditEvent.builder()
            .action("CVE_REMEDIATION")
            .cveId(cveId)
            .status(result.getStatus())
            .user(SecurityContextHolder.getContext().getAuthentication().getName())
            .build());
        
        return ResponseEntity.ok(result);
    }
}

// ============================================
// Automated Dependency Update with Renovate
// ============================================

// renovate.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:base",
    "security:openssf-scorecard",
    ":dependencyDashboard"
  ],
  "vulnerabilityAlerts": {
    "enabled": true,
    "labels": ["security", "priority:high"]
  },
  "packageRules": [
    {
      "matchPackagePatterns": ["*"],
      "matchUpdateTypes": ["patch"],
      "automerge": true,
      "automergeType": "pr"
    },
    {
      "matchPackagePatterns": ["org.springframework.*"],
      "groupName": "Spring Framework",
      "automerge": false
    },
    {
      "matchPackageNames": ["log4j", "jackson-databind"],
      "labels": ["security-critical"],
      "prPriority": 10
    }
  ],
  "schedule": ["before 6am on Monday"]
}`;

const SecurityCVESection = () => {
  return (
    <section id="security" className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Security & CVE Management
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Vulnerability detection, remediation workflows, and AI-assisted security with GitLab Duo.
          </p>
        </div>

        {/* Security overview cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              OWASP, Snyk, Trivy scanning in CI/CD pipelines
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-terminal-yellow" />
                Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              CVSS scoring, impact analysis, prioritization
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                Remediation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Automated patching with Renovate/Dependabot
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover border-primary/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Shield className="w-4 h-4 text-terminal-purple" />
                GitLab Duo AI
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              AI-assisted code review and vulnerability explanation
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="workflow" className="w-full">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto">
            <TabsTrigger 
              value="workflow" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              CVE Workflow
            </TabsTrigger>
            <TabsTrigger 
              value="snyk" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Snyk Config
            </TabsTrigger>
            <TabsTrigger 
              value="deps" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Dependency Mgmt
            </TabsTrigger>
            <TabsTrigger 
              value="gitduo" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              GitLab Duo AI
            </TabsTrigger>
            <TabsTrigger 
              value="tracking" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              CVE Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                CVE Detection & Remediation Pipeline
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>OWASP Dependency Check for Maven/Gradle</li>
                <li>npm audit for Node.js dependencies</li>
                <li>Trivy for container image scanning</li>
                <li>GitLab Security Dashboard integration</li>
              </ul>
            </div>
            <CodeBlock 
              code={cveProcessCode} 
              language="bash" 
              filename="cve-workflow.sh" 
            />
          </TabsContent>

          <TabsContent value="snyk" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Snyk Enterprise Configuration
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Policy-based vulnerability management</li>
                <li>Temporary ignores with expiration</li>
                <li>Container and SBOM scanning</li>
                <li>Gradle plugin integration</li>
              </ul>
            </div>
            <CodeBlock 
              code={snykConfigCode} 
              language="yaml" 
              filename=".snyk" 
            />
          </TabsContent>

          <TabsContent value="deps" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Centralized Dependency Management
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>BOM (Bill of Materials) for version control</li>
                <li>Override vulnerable transitive dependencies</li>
                <li>OWASP check with CVSS threshold</li>
                <li>npm overrides for Node.js</li>
              </ul>
            </div>
            <CodeBlock 
              code={dependencyManagementCode} 
              language="kotlin" 
              filename="build.gradle.kts" 
            />
          </TabsContent>

          <TabsContent value="gitduo" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                AI-Assisted Development with GitLab Duo
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Context-aware code suggestions</li>
                <li>CVE explanation and remediation guidance</li>
                <li>Security-focused prompt engineering</li>
                <li>Automated MR security review</li>
              </ul>
            </div>
            <CodeBlock 
              code={gitDuoCode} 
              language="yaml" 
              filename="ai-security-config.md" 
            />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                CVE Tracking & Automated Updates
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Custom security metrics endpoint</li>
                <li>Prometheus/Datadog integration</li>
                <li>Renovate for automated dependency updates</li>
                <li>Priority-based automerge rules</li>
              </ul>
            </div>
            <CodeBlock 
              code={cveTrackingCode} 
              language="java" 
              filename="SecurityMetricsController.java" 
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default SecurityCVESection;
