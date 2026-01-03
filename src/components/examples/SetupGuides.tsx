import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";

const jdeveloperSetup = `# Oracle JDeveloper 12c Setup Guide
# ================================

# 1. Download e Instalação
# - Download: oracle.com/tools/downloads/jdeveloper-12c-downloads.html
# - Extrair para: C:\\Oracle\\Middleware\\jdeveloper (Windows) ou /opt/oracle/jdeveloper (Linux)

# 2. Configuração de JDK
# Editar: JDEV_HOME/jdeveloper/ide/bin/ide.conf
AddVMOption -Xms512m
AddVMOption -Xmx4096m
AddVMOption -XX:MaxPermSize=512m
SetJavaHome C:/Java/jdk1.8.0_202

# 3. Configuração de Proxy (se necessário)
# Editar: JDEV_HOME/jdeveloper/ide/bin/ide.conf
AddVMOption -Dhttp.proxyHost=proxy.company.com
AddVMOption -Dhttp.proxyPort=8080
AddVMOption -Dhttps.proxyHost=proxy.company.com
AddVMOption -Dhttps.proxyPort=8080

# 4. Configurar Connection para WebLogic
# Application Server Navigator > New Application Server
# - Name: WLS_DEV
# - Connection Type: WebLogic 12.x
# - Username: weblogic
# - Password: *****
# - WebLogic Hostname: localhost
# - Port: 7001
# - WLS Domain: /opt/oracle/domains/base_domain

# 5. Configurar Connection para Oracle Database
# Database Navigator > New Connection
# - Connection Name: DEV_DB
# - Username: app_user
# - Password: *****
# - Connection Type: Basic
# - Hostname: localhost
# - Port: 1521
# - Service Name: ORCLPDB

# 6. Configurar SOA Extension
# Help > Check for Updates > Official Oracle Extensions
# Selecionar:
# - SOA Composite Editor
# - Oracle Service Bus
# - Oracle BPM Suite

# 7. Template de Composite SOA
<?xml version="1.0" encoding="UTF-8"?>
<composite name="OrderProcessingComposite"
           revision="1.0"
           label="2024-01-15_10-30-00"
           xmlns="http://xmlns.oracle.com/sca/1.0">
    
    <import namespace="http://xmlns.oracle.com/OrderProcessing"
            location="OrderProcessing.wsdl"
            importType="wsdl"/>
    
    <service name="OrderService" ui:wsdlLocation="OrderProcessing.wsdl">
        <interface.wsdl interface="http://xmlns.oracle.com/OrderProcessing#wsdl.interface(OrderPortType)"/>
        <binding.ws port="http://xmlns.oracle.com/OrderProcessing#wsdl.endpoint(OrderService/OrderPort)"/>
    </service>
    
    <component name="OrderBPELProcess">
        <implementation.bpel src="OrderBPELProcess.bpel"/>
    </component>
    
    <wire>
        <source.uri>OrderService</source.uri>
        <target.uri>OrderBPELProcess/orderprocess_client</target.uri>
    </wire>
</composite>

# 8. Atalhos Importantes JDeveloper
# Ctrl+Shift+I    - Fix Imports
# Ctrl+Alt+L      - Format Code
# Ctrl+Shift+F    - Find in Files
# Alt+Enter       - Quick Fix
# Ctrl+Space      - Code Completion
# Ctrl+Click      - Go to Declaration
# F5              - Debug
# Shift+F5        - Stop Debug
# Ctrl+Shift+B    - Toggle Breakpoint`;

const sqlDeveloperSetup = `# Oracle SQL Developer Setup Guide
# =================================

# 1. Download e Instalação
# - Download: oracle.com/tools/downloads/sqldev-downloads.html
# - Extrair para local desejado (não requer instalação)
# - Executar: sqldeveloper.exe (Windows) ou sqldeveloper.sh (Linux)

# 2. Configuração de JDK
# Primeira execução pergunta localização do JDK
# Ou editar: sqldeveloper/ide/bin/ide.conf
SetJavaHome /opt/java/jdk-11

# 3. Criar Nova Conexão
# Connections > New Connection
-- Connection Name: DEV_PRODUCTION
-- Username: app_schema
-- Password: ********
-- Connection Type: Basic
-- Hostname: db-prod.company.com
-- Port: 1521
-- Service name: PRODDB.company.com

# 4. Organizar Conexões por Ambiente
# Criar pastas para organização:
# - DEV
# - QA
# - STAGING  
# - PRODUCTION

# 5. Configurar Code Templates
# Tools > Preferences > Database > SQL Editor Code Templates

# Template: sel (SELECT básico)
SELECT *
FROM \${table_name}
WHERE 1=1
\${cursor}

# Template: selj (SELECT com JOIN)
SELECT 
    a.*,
    b.*
FROM \${table1} a
INNER JOIN \${table2} b ON a.id = b.id
WHERE 1=1
\${cursor}

# Template: ins (INSERT)
INSERT INTO \${table_name} (
    \${columns}
)
VALUES (
    \${values}
);

# Template: upd (UPDATE)
UPDATE \${table_name}
SET \${column} = \${value}
WHERE id = \${id};

# Template: pkg (Package skeleton)
CREATE OR REPLACE PACKAGE \${package_name} AS
    -- Types
    
    -- Constants
    
    -- Procedures
    PROCEDURE \${procedure_name}(
        p_param IN VARCHAR2
    );
    
END \${package_name};
/

CREATE OR REPLACE PACKAGE BODY \${package_name} AS

    PROCEDURE \${procedure_name}(
        p_param IN VARCHAR2
    ) IS
    BEGIN
        \${cursor}
    END \${procedure_name};

END \${package_name};
/

# 6. Snippets SQL Úteis

-- Verificar objetos inválidos
SELECT owner, object_name, object_type, status
FROM dba_objects
WHERE status = 'INVALID'
ORDER BY owner, object_type, object_name;

-- Recompilar objetos inválidos
EXEC DBMS_UTILITY.compile_schema('SCHEMA_NAME');

-- Ver sessões ativas
SELECT s.sid, s.serial#, s.username, s.program, s.machine,
       s.status, s.logon_time, s.sql_id
FROM v$session s
WHERE s.type = 'USER'
  AND s.status = 'ACTIVE'
ORDER BY s.logon_time DESC;

-- Kill session
ALTER SYSTEM KILL SESSION 'sid,serial#' IMMEDIATE;

-- Ver locks
SELECT l.session_id, l.oracle_username, l.os_user_name,
       o.object_name, o.object_type, l.locked_mode
FROM v$locked_object l
JOIN dba_objects o ON l.object_id = o.object_id;

# 7. Atalhos SQL Developer
# F5              - Run Script
# Ctrl+Enter      - Run Statement
# F6              - Explain Plan
# Ctrl+Shift+D    - Describe Object
# Ctrl+.          - Auto Complete
# Ctrl+/          - Comment/Uncomment
# Ctrl+F7         - Format SQL
# F4              - Open Declaration`;

const heidiSqlSetup = `# HeidiSQL Setup Guide (MySQL/MariaDB/PostgreSQL)
# ===============================================

# 1. Download e Instalação
# - Download: heidisql.com/download.php
# - Instalar versão portable ou installer

# 2. Criar Nova Sessão MySQL
# Session Manager > New
-- Session name: DEV_MySQL
-- Network type: MySQL (TCP/IP)
-- Hostname: localhost
-- User: root
-- Password: ********
-- Port: 3306
-- Databases: myapp_dev

# 3. Criar Sessão PostgreSQL
# Session Manager > New
-- Network type: PostgreSQL (TCP/IP)
-- Hostname: localhost
-- User: postgres
-- Password: ********
-- Port: 5432
-- Databases: myapp_dev

# 4. Configurações Recomendadas
# Tools > Preferences

-- Editor:
-- Font: Consolas, 11pt
-- Tab width: 4
-- Insert spaces instead of tabs: Yes

-- SQL:
-- Max query results: 1000
-- Query timeout: 60

-- Export:
-- CSV separator: ;
-- Line terminator: \\r\\n
-- Include column names: Yes

# 5. Snippets MySQL Úteis

-- Verificar tamanho de tabelas
SELECT 
    table_name,
    ROUND(data_length / 1024 / 1024, 2) AS 'Data (MB)',
    ROUND(index_length / 1024 / 1024, 2) AS 'Index (MB)',
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'Total (MB)',
    table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema = DATABASE()
ORDER BY (data_length + index_length) DESC;

-- Ver processos ativos
SHOW FULL PROCESSLIST;

-- Kill processo
KILL process_id;

-- Verificar variáveis importantes
SHOW VARIABLES LIKE 'max_connections';
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW VARIABLES LIKE 'query_cache%';

-- Status do servidor
SHOW GLOBAL STATUS LIKE 'Threads%';
SHOW GLOBAL STATUS LIKE 'Connections';

# 6. Snippets PostgreSQL Úteis

-- Tamanho de tabelas
SELECT 
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS data_size,
    pg_size_pretty(pg_indexes_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Conexões ativas
SELECT pid, usename, application_name, client_addr, 
       state, query_start, query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start DESC;

-- Cancelar query
SELECT pg_cancel_backend(pid);

-- Terminar conexão
SELECT pg_terminate_backend(pid);

# 7. Atalhos HeidiSQL
# F9              - Execute SQL
# Ctrl+Shift+F9   - Execute selected
# Ctrl+W          - Close tab
# Ctrl+T          - New query tab
# F5              - Refresh
# Ctrl+D          - Show table data
# Ctrl+Alt+E      - Export data
# Ctrl+I          - Import file`;

const sts4Setup = `# Spring Tool Suite 4 (STS) Setup Guide
# =====================================

# 1. Download e Instalação
# - Download: spring.io/tools
# - Extrair para: C:\\dev\\sts-4 (Windows) ou /opt/sts-4 (Linux)
# - Executar: SpringToolSuite4.exe ou SpringToolSuite4

# 2. Configuração de JVM
# Editar: sts-4.x.x.RELEASE/SpringToolSuite4.ini

-startup
plugins/org.eclipse.equinox.launcher_1.6.400.jar
--launcher.library
plugins/org.eclipse.equinox.launcher.win32.win32.x86_64_1.2.700.jar
-product
org.springframework.boot.ide.branding.sts4
-showsplash
-vmargs
-Dosgi.requiredJavaVersion=17
-Xms1024m
-Xmx4096m
-XX:+UseG1GC
-XX:+UseStringDeduplication
-Dosgi.checkConfiguration=true

# 3. Plugins Essenciais
# Help > Eclipse Marketplace

# Instalar:
# - Lombok (pesquisar "Lombok")
# - SonarLint
# - Docker Tooling
# - YAML Editor
# - Spring Initializr Java Support

# 4. Configurar Maven
# Window > Preferences > Maven
-- Installations: Adicionar Maven 3.9.x local
-- User Settings: /home/user/.m2/settings.xml

# 5. settings.xml para Maven
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0">
    <localRepository>/home/user/.m2/repository</localRepository>
    
    <mirrors>
        <mirror>
            <id>nexus</id>
            <mirrorOf>*</mirrorOf>
            <url>https://nexus.company.com/repository/maven-public/</url>
        </mirror>
    </mirrors>
    
    <profiles>
        <profile>
            <id>dev</id>
            <properties>
                <env>dev</env>
            </properties>
        </profile>
    </profiles>
    
    <activeProfiles>
        <activeProfile>dev</activeProfile>
    </activeProfiles>
</settings>

# 6. Configurar Code Style
# Window > Preferences > Java > Code Style > Formatter
# Import: google-java-format ou spring-java-format

# 7. Templates de Código
# Window > Preferences > Java > Editor > Templates

# Template: slog (SLF4J logger)
private static final Logger log = LoggerFactory.getLogger(\${enclosing_type}.class);

# Template: test (JUnit test method)
@Test
@DisplayName("\${cursor}")
void should\${name}() {
    // Given
    
    // When
    
    // Then
}

# Template: pojo (Simple POJO)
public class \${name} {
    
    private \${type} \${field};
    
    public \${type} get\${Field}() {
        return \${field};
    }
    
    public void set\${Field}(\${type} \${field}) {
        this.\${field} = \${field};
    }
}

# 8. application.yml Template para Spring Boot
spring:
  application:
    name: \${app.name:my-service}
  profiles:
    active: \${SPRING_PROFILES_ACTIVE:dev}
  
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/\${DB_NAME:mydb}
    username: \${DB_USER:postgres}
    password: \${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      idle-timeout: 300000
      pool-name: HikariPool-MyService
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        use_sql_comments: true
  
  rabbitmq:
    host: \${RABBITMQ_HOST:localhost}
    port: 5672
    username: \${RABBITMQ_USER:guest}
    password: \${RABBITMQ_PASS:guest}

logging:
  level:
    root: INFO
    com.company: DEBUG
    org.springframework.web: INFO
    org.hibernate.SQL: DEBUG

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always

# 9. Atalhos STS 4 / Eclipse
# Ctrl+Shift+R    - Open Resource
# Ctrl+Shift+T    - Open Type
# Ctrl+O          - Quick Outline
# Ctrl+Space      - Content Assist
# Ctrl+1          - Quick Fix
# Ctrl+Shift+O    - Organize Imports
# Ctrl+Shift+F    - Format Code
# Alt+Shift+R     - Rename
# F3              - Open Declaration
# Ctrl+Alt+H      - Call Hierarchy
# Ctrl+Shift+G    - Find References
# Ctrl+H          - Search
# Alt+Left/Right  - Navigate Back/Forward`;

const vscodeSetup = `# Visual Studio Code Setup para Java e Node.js
# =============================================

# 1. Download e Instalação
# - Download: code.visualstudio.com
# - Instalar extensões via linha de comando ou Marketplace

# 2. Extensões Essenciais para Java

# Instalar via terminal:
code --install-extension vscjava.vscode-java-pack
code --install-extension vmware.vscode-spring-boot
code --install-extension vscjava.vscode-spring-initializr
code --install-extension vscjava.vscode-spring-boot-dashboard
code --install-extension redhat.vscode-yaml
code --install-extension GabrielBB.vscode-lombok

# Extensões Java incluídas no pack:
# - Language Support for Java (Red Hat)
# - Debugger for Java
# - Test Runner for Java
# - Maven for Java
# - Project Manager for Java
# - IntelliCode

# 3. Extensões Essenciais para Node.js/TypeScript

code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension prisma.prisma
code --install-extension bradlc.vscode-tailwindcss
code --install-extension christian-kohler.npm-intellisense
code --install-extension christian-kohler.path-intellisense
code --install-extension formulahendry.auto-rename-tag
code --install-extension ms-azuretools.vscode-docker
code --install-extension eamodio.gitlens

# 4. Extensões Gerais

code --install-extension editorconfig.editorconfig
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension streetsidesoftware.code-spell-checker-portuguese-brazilian
code --install-extension gruntfuggly.todo-tree
code --install-extension usernamehw.errorlens
code --install-extension oderwat.indent-rainbow

# 5. settings.json Recomendado
{
  // Editor
  "editor.fontSize": 14,
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  "editor.fontLigatures": true,
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.rulers": [80, 120],
  "editor.minimap.enabled": false,
  "editor.wordWrap": "on",
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,

  // Files
  "files.autoSave": "onFocusChange",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  
  // Terminal
  "terminal.integrated.fontSize": 13,
  "terminal.integrated.defaultProfile.windows": "Git Bash",
  
  // Java
  "java.configuration.runtimes": [
    {
      "name": "JavaSE-17",
      "path": "/opt/java/jdk-17",
      "default": true
    },
    {
      "name": "JavaSE-11",
      "path": "/opt/java/jdk-11"
    },
    {
      "name": "JavaSE-1.8",
      "path": "/opt/java/jdk-8"
    }
  ],
  "java.format.settings.url": "https://raw.githubusercontent.com/google/styleguide/gh-pages/eclipse-java-google-style.xml",
  "java.saveActions.organizeImports": true,
  "java.completion.importOrder": [
    "java",
    "javax",
    "org",
    "com"
  ],
  
  // TypeScript/JavaScript
  "typescript.preferences.importModuleSpecifier": "relative",
  "javascript.preferences.importModuleSpecifier": "relative",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // ESLint
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  
  // Prettier
  "prettier.singleQuote": true,
  "prettier.trailingComma": "es5",
  "prettier.semi": true,
  
  // Git
  "git.enableSmartCommit": true,
  "git.confirmSync": false,
  "gitlens.codeLens.enabled": false,
  
  // Docker
  "docker.containers.label": "ContainerName",
  
  // Spell Check
  "cSpell.language": "en,pt,pt_BR"
}

# 6. launch.json para Debug Java (Spring Boot)
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Spring Boot App",
      "request": "launch",
      "mainClass": "com.company.Application",
      "projectName": "my-service",
      "args": "--spring.profiles.active=dev",
      "vmArgs": "-Xmx512m -Dspring.output.ansi.enabled=always",
      "env": {
        "DB_HOST": "localhost",
        "DB_NAME": "mydb"
      }
    },
    {
      "type": "java",
      "name": "Debug Tests",
      "request": "launch",
      "mainClass": "",
      "projectName": "my-service"
    }
  ]
}

# 7. launch.json para Debug Node.js
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "\${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["\${workspaceFolder}/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development",
        "PORT": "3000"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Jest Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test:debug"],
      "port": 9229
    }
  ]
}

# 8. Atalhos VSCode Importantes
# Ctrl+P          - Quick Open (arquivos)
# Ctrl+Shift+P    - Command Palette
# Ctrl+\`          - Toggle Terminal
# Ctrl+B          - Toggle Sidebar
# Ctrl+Shift+E    - Explorer
# Ctrl+Shift+F    - Search in Files
# Ctrl+Shift+G    - Source Control
# F12             - Go to Definition
# Alt+F12         - Peek Definition
# Shift+F12       - Find All References
# F2              - Rename Symbol
# Ctrl+.          - Quick Fix
# Ctrl+Space      - Trigger Suggest
# Ctrl+Shift+\\    - Jump to Bracket
# Alt+Up/Down     - Move Line
# Ctrl+D          - Select Next Match
# Ctrl+/          - Toggle Comment`;

const categories = [
  {
    id: "jdeveloper",
    title: "Oracle JDeveloper 12c",
    badge: "Oracle",
    examples: [
      { title: "Setup Completo", code: jdeveloperSetup, filename: "jdeveloper-setup.md" },
    ]
  },
  {
    id: "sqldeveloper",
    title: "Oracle SQL Developer",
    badge: "Oracle",
    examples: [
      { title: "Setup e Templates", code: sqlDeveloperSetup, filename: "sqldeveloper-setup.md" },
    ]
  },
  {
    id: "heidisql",
    title: "HeidiSQL (MySQL/PostgreSQL)",
    badge: "Database",
    examples: [
      { title: "Setup e Snippets", code: heidiSqlSetup, filename: "heidisql-setup.md" },
    ]
  },
  {
    id: "sts4",
    title: "Spring Tool Suite 4",
    badge: "Java",
    examples: [
      { title: "Setup Completo", code: sts4Setup, filename: "sts4-setup.md" },
    ]
  },
  {
    id: "vscode",
    title: "Visual Studio Code",
    badge: "Universal",
    examples: [
      { title: "Setup Java & Node.js", code: vscodeSetup, filename: "vscode-setup.md" },
    ]
  },
];

const SetupGuides = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border-border">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-[hsl(var(--terminal-purple))]/10 text-[hsl(var(--terminal-purple))] border-[hsl(var(--terminal-purple))]/30">
                  {category.badge}
                </Badge>
                <span className="font-mono text-sm">{category.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {category.examples.map((example, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{example.title}</h4>
                  <CodeBlock 
                    code={example.code} 
                    language="bash" 
                    filename={example.filename}
                    collapsible
                    defaultExpanded={idx === 0}
                  />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default SetupGuides;
