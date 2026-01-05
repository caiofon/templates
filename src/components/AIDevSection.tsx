import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CodeBlock from "./CodeBlock";
import { Bot, Code, GitBranch, Shield, Zap, Users, Terminal, Lightbulb, CheckCircle, XCircle } from "lucide-react";

const copilotFeatures = [
  {
    icon: Code,
    title: "Escrita de código em tempo real",
    description: "Autocompleta funções inteiras, sugere algoritmos e traduz comentários em código",
    example: `// valida JWT e retorna usuário
function validateJwtAndGetUser(token: string): User {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return {
    id: decoded.sub,
    email: decoded.email,
    roles: decoded.roles
  };
}`
  },
  {
    icon: Users,
    title: "Pair Programming com Chat",
    description: "Pergunte 'por que esse código está lento?', peça refatoração ou converta entre linguagens",
    example: `// Prompt: "Refatore isso para Clean Architecture"

// Antes: Controller com lógica de negócio
@PostMapping("/users")
public User createUser(@RequestBody UserDTO dto) {
  // validação, persistência, notificação tudo junto
}

// Depois: Separação de responsabilidades
@PostMapping("/users")
public UserResponse createUser(@RequestBody CreateUserRequest request) {
  CreateUserCommand command = mapper.toCommand(request);
  User user = createUserUseCase.execute(command);
  return mapper.toResponse(user);
}`
  },
  {
    icon: CheckCircle,
    title: "Geração automática de testes",
    description: "Unitários, integração e mock de dependências",
    example: `// Prompt: "Crie testes Jest cobrindo casos de erro"

describe('UserService', () => {
  it('should throw when user not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    
    await expect(service.getUser('invalid-id'))
      .rejects.toThrow(UserNotFoundException);
  });

  it('should throw when email already exists', async () => {
    mockRepo.findByEmail.mockResolvedValue(existingUser);
    
    await expect(service.create(duplicateEmailDto))
      .rejects.toThrow(EmailAlreadyExistsException);
  });
});`
  },
  {
    icon: Lightbulb,
    title: "Aprendizado de novas stacks",
    description: "React, Spring, Nest, Python, Go, Rust... ótimo para quem troca muito de tecnologia",
    example: `// Prompt: "Como fazer cache com Redis no NestJS?"

@Injectable()
export class CacheService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}`
  }
];

const gitlabDuoFeatures = [
  {
    icon: GitBranch,
    title: "Criar Issues e Épicos com IA",
    description: "Descrição técnica automática, critérios de aceite e tasks derivadas",
    example: `# Issue gerada pelo Duo

## Título: Implementar autenticação JWT

## Descrição
Implementar sistema de autenticação usando JSON Web Tokens 
para proteger endpoints da API REST.

## Critérios de Aceite
- [ ] Endpoint POST /auth/login retorna access_token e refresh_token
- [ ] Tokens expiram em 15min (access) e 7d (refresh)
- [ ] Middleware valida token em rotas protegidas
- [ ] Refresh token rotation implementado

## Tasks
1. Configurar dependências (jsonwebtoken, bcrypt)
2. Criar AuthService com métodos login/refresh
3. Implementar JwtGuard
4. Adicionar testes de integração`
  },
  {
    icon: Users,
    title: "Planejamento técnico assistido",
    description: "Quebrar features grandes, sugerir arquitetura e identificar riscos técnicos",
    example: `# Duo: Análise de Feature "Migração de Monolito"

## Sugestão de Arquitetura
- Strangler Fig Pattern recomendado
- Começar por módulos com menos dependências
- API Gateway para roteamento gradual

## Riscos Identificados
⚠️ Alto: Transações distribuídas no checkout
⚠️ Médio: Sincronização de sessões
⚠️ Baixo: Cache invalidation

## Fases Sugeridas
1. Auth Service (2 sprints)
2. User Service (1 sprint)
3. Product Catalog (2 sprints)
4. Order Service (3 sprints)`
  },
  {
    icon: Code,
    title: "Explicação de Merge Requests",
    description: "Resume MR automaticamente, explica impacto e ajuda reviewers",
    example: `# Duo: Resumo do MR !1234

## O que mudou
- Refatoração do UserRepository para usar QueryBuilder
- Adição de índices compostos para otimização
- Nova camada de cache com Redis

## Impacto
✅ Performance: Queries 40% mais rápidas
⚠️ Risco: Invalidação de cache pode causar stale data
📝 Sugestão: Adicionar TTL de 5min no cache de listagem

## Arquivos críticos
- src/repositories/UserRepository.ts (alto impacto)
- src/config/redis.ts (novo arquivo)`
  },
  {
    icon: Shield,
    title: "Segurança e DevSecOps",
    description: "Detecta padrões inseguros e sugere correções",
    example: `# Duo: Análise de Segurança

## Vulnerabilidades Detectadas

🔴 CRÍTICO: SQL Injection em UserController.ts:45
   query("SELECT * FROM users WHERE id = " + userId)
   
   ✅ Correção sugerida:
   query("SELECT * FROM users WHERE id = $1", [userId])

🟡 MÉDIO: Secrets hardcoded em config.ts:12
   const API_KEY = "sk-1234567890"
   
   ✅ Correção sugerida:
   const API_KEY = process.env.API_KEY

🟢 INFO: Dependency com CVE conhecida
   lodash@4.17.20 → atualizar para 4.17.21`
  },
  {
    icon: Terminal,
    title: "Ajuda com CI/CD",
    description: "Explica pipelines quebrados e sugere correções",
    example: `# Duo: Análise de Pipeline Falhando

## Erro Identificado
Job 'test' falhou no stage 'test' com exit code 1

## Causa Raiz
Variável CI_DATABASE_URL não definida no ambiente de CI.
Testes de integração tentando conectar em localhost.

## Correção Sugerida
# .gitlab-ci.yml
test:
  variables:
    DATABASE_URL: postgres://test:test@postgres:5432/test
  services:
    - postgres:15-alpine
  script:
    - npm run test:integration`
  }
];

const comparisonData = [
  { dimension: "Escrita de código", copilot: 5, duo: 3 },
  { dimension: "Autocomplete", copilot: 5, duo: 3 },
  { dimension: "Testes", copilot: 4, duo: 3 },
  { dimension: "Planejamento", copilot: 0, duo: 4 },
  { dimension: "Issues / Epics", copilot: 0, duo: 5 },
  { dimension: "Code Review", copilot: 3, duo: 4 },
  { dimension: "CI/CD", copilot: 0, duo: 4 },
  { dimension: "Segurança", copilot: 2, duo: 4 },
  { dimension: "Contexto do time", copilot: 0, duo: 5 },
];

const renderStars = (count: number) => {
  if (count === 0) return <XCircle className="w-4 h-4 text-muted-foreground" />;
  return (
    <span className="text-primary">
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
};

const installationGuides = {
  copilot: `# ════════════════════════════════════════════════════════════════
# INSTALAÇÃO DO GITHUB COPILOT
# ════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────
# PRÉ-REQUISITOS
# ─────────────────────────────────────────────────────────────────
# 1. Conta GitHub com Copilot ativo (Individual, Business ou Enterprise)
# 2. VS Code, JetBrains IDE, Neovim ou Xcode

# ─────────────────────────────────────────────────────────────────
# VS CODE
# ─────────────────────────────────────────────────────────────────

# Opção 1: Via Extensions Marketplace
# 1. Abrir VS Code
# 2. Ctrl+Shift+X (Extensions)
# 3. Buscar "GitHub Copilot"
# 4. Instalar extensão oficial da GitHub
# 5. Instalar também "GitHub Copilot Chat" para chat

# Opção 2: Via Command Line
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat

# Após instalação:
# 1. Ctrl+Shift+P → "GitHub Copilot: Sign In"
# 2. Autorizar no navegador
# 3. Pronto! Sugestões aparecem automaticamente

# ─────────────────────────────────────────────────────────────────
# JETBRAINS (IntelliJ, WebStorm, PyCharm, etc.)
# ─────────────────────────────────────────────────────────────────

# 1. File → Settings → Plugins
# 2. Marketplace → Buscar "GitHub Copilot"
# 3. Install → Restart IDE
# 4. Tools → GitHub Copilot → Login to GitHub

# ─────────────────────────────────────────────────────────────────
# NEOVIM
# ─────────────────────────────────────────────────────────────────

# Usando vim-plug:
# Adicionar ao init.vim ou init.lua:
Plug 'github/copilot.vim'

# Após :PlugInstall, executar:
:Copilot setup
:Copilot enable

# ─────────────────────────────────────────────────────────────────
# VERIFICAR INSTALAÇÃO
# ─────────────────────────────────────────────────────────────────

# VS Code: ícone do Copilot na barra de status (canto inferior)
# JetBrains: Tools → GitHub Copilot → Status
# Neovim: :Copilot status`,

  duo: `# ════════════════════════════════════════════════════════════════
# INSTALAÇÃO DO GITLAB DUO
# ════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────
# PRÉ-REQUISITOS
# ─────────────────────────────────────────────────────────────────
# 1. GitLab Premium ou Ultimate (SaaS ou Self-Managed 16.8+)
# 2. Duo Pro ou Duo Enterprise license
# 3. Duo habilitado pelo admin do grupo/instância

# ─────────────────────────────────────────────────────────────────
# HABILITAR DUO (ADMIN)
# ─────────────────────────────────────────────────────────────────

# GitLab SaaS:
# 1. Settings → General → Permissions and group features
# 2. Expandir "GitLab Duo features"
# 3. Ativar as features desejadas

# Self-Managed:
# 1. Admin Area → Settings → General
# 2. GitLab Duo features → Configure
# 3. Habilitar Code Suggestions e outras features

# ─────────────────────────────────────────────────────────────────
# VS CODE - GITLAB WORKFLOW EXTENSION
# ─────────────────────────────────────────────────────────────────

# Instalar extensão
code --install-extension GitLab.gitlab-workflow

# Configurar:
# 1. Ctrl+Shift+P → "GitLab: Add Account"
# 2. Inserir URL do GitLab (gitlab.com ou self-hosted)
# 3. Gerar Personal Access Token com scopes:
#    - api
#    - read_user
#    - read_repository
# 4. Colar o token

# Habilitar Code Suggestions:
# 1. Ctrl+Shift+P → "Preferences: Open Settings (JSON)"
# 2. Adicionar:
{
  "gitlab.duo.enabledWithoutGitlabProject": true,
  "gitlab.aiAssistedCodeSuggestions.enabled": true
}

# ─────────────────────────────────────────────────────────────────
# JETBRAINS - GITLAB DUO PLUGIN
# ─────────────────────────────────────────────────────────────────

# 1. File → Settings → Plugins
# 2. Marketplace → "GitLab Duo"
# 3. Install → Restart IDE
# 4. Settings → Tools → GitLab Duo
# 5. Add GitLab Account (URL + Token)

# ─────────────────────────────────────────────────────────────────
# NEOVIM
# ─────────────────────────────────────────────────────────────────

# Usando lazy.nvim:
{
  "git@gitlab.com:gitlab-org/editor-extensions/gitlab.vim.git",
  event = { "BufReadPre", "BufNewFile" },
  config = function()
    require("gitlab").setup()
  end,
}

# Configurar token:
# :GitLabSetToken <seu-token>

# ─────────────────────────────────────────────────────────────────
# DUO CHAT NA WEB
# ─────────────────────────────────────────────────────────────────

# Acesso direto no GitLab:
# 1. Abrir qualquer projeto no GitLab
# 2. Ícone "Duo Chat" no canto inferior direito
# 3. Ou usar "/" em issues/MRs para comandos Duo

# Comandos disponíveis em issues:
/duo generate_description   # Gerar descrição
/duo suggest_reviewers      # Sugerir revisores`
};

const copilotCommands = `# ════════════════════════════════════════════════════════════════
# ATALHOS E COMANDOS - GITHUB COPILOT
# ════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────
# VS CODE - ATALHOS PRINCIPAIS
# ─────────────────────────────────────────────────────────────────

Tab                    # Aceitar sugestão completa
Esc                    # Rejeitar sugestão
Alt + ]                # Próxima sugestão
Alt + [                # Sugestão anterior
Ctrl + Enter           # Abrir painel com 10 sugestões
Alt + \\               # Trigger sugestão manualmente (se pausado)
Ctrl + Shift + I       # Abrir Copilot Chat (inline)
Ctrl + Alt + I         # Abrir Copilot Chat (painel lateral)

# ─────────────────────────────────────────────────────────────────
# COPILOT CHAT - COMANDOS SLASH
# ─────────────────────────────────────────────────────────────────

/explain               # Explicar código selecionado
/fix                   # Sugerir correção para erro
/tests                 # Gerar testes para código selecionado
/doc                   # Gerar documentação/JSDoc
/optimize              # Sugerir otimizações
/clear                 # Limpar histórico do chat
/help                  # Ver todos os comandos

# ─────────────────────────────────────────────────────────────────
# COPILOT CHAT - VARIÁVEIS DE CONTEXTO
# ─────────────────────────────────────────────────────────────────

@workspace             # Contexto do workspace inteiro
@vscode                # Perguntas sobre VS Code
@terminal              # Contexto do terminal
#file:nome.ts          # Referenciar arquivo específico
#sym:NomeClasse        # Referenciar símbolo (classe/função)

# Exemplos de uso:
# "Explique @workspace como funciona a autenticação"
# "/tests para #file:UserService.ts"
# "Refatore #sym:validateUser para async"

# ─────────────────────────────────────────────────────────────────
# JETBRAINS - ATALHOS
# ─────────────────────────────────────────────────────────────────

Tab                    # Aceitar sugestão
Escape                 # Rejeitar
Alt + ]                # Próxima sugestão
Alt + [                # Anterior
Alt + \\               # Trigger manual
Ctrl + Shift + C       # Abrir Copilot Chat (Windows/Linux)
Cmd + Shift + C        # Abrir Copilot Chat (macOS)

# ─────────────────────────────────────────────────────────────────
# CONFIGURAÇÕES ÚTEIS (settings.json)
# ─────────────────────────────────────────────────────────────────

{
  // Habilitar/desabilitar por linguagem
  "github.copilot.enable": {
    "*": true,
    "markdown": false,
    "yaml": false
  },
  
  // Modo inline suggestions
  "github.copilot.inlineSuggest.enable": true,
  
  // Tamanho máximo do prompt
  "github.copilot.advanced": {
    "length": 2500
  }
}

# ─────────────────────────────────────────────────────────────────
# DICAS DE PRODUTIVIDADE
# ─────────────────────────────────────────────────────────────────

# 1. Comentários são prompts
// Função que valida email com regex
// retorna true se válido, false caso contrário

# 2. Nomes descritivos ativam melhores sugestões
function calculateMonthlyInterestWithCompoundRate(

# 3. Escrever a assinatura ajuda
interface CreateUserDTO {
  email: string;
  password: string;
  // Copilot vai sugerir mais campos relevantes

# 4. Dar exemplos no comentário
// Exemplo: formatDate("2024-01-15") → "15 de Janeiro de 2024"`;

const duoCommands = `# ════════════════════════════════════════════════════════════════
# COMANDOS E ATALHOS - GITLAB DUO
# ════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────
# DUO CHAT - COMANDOS SLASH (Web UI)
# ─────────────────────────────────────────────────────────────────

/explain               # Explicar código ou conceito
/refactor              # Sugerir refatoração
/tests                 # Gerar testes unitários
/fix                   # Corrigir bug ou erro
/clear                 # Limpar histórico do chat
/reset                 # Resetar contexto

# ─────────────────────────────────────────────────────────────────
# QUICK ACTIONS EM ISSUES
# ─────────────────────────────────────────────────────────────────

/duo generate_description    # Gerar descrição detalhada
/duo summarize               # Resumir discussão longa
/duo suggest_labels          # Sugerir labels
/duo break_down              # Quebrar em sub-tasks

# ─────────────────────────────────────────────────────────────────
# QUICK ACTIONS EM MERGE REQUESTS
# ─────────────────────────────────────────────────────────────────

/duo summarize               # Resumir mudanças do MR
/duo review                  # Solicitar review do Duo
/duo suggest_reviewers       # Sugerir revisores humanos

# ─────────────────────────────────────────────────────────────────
# CODE SUGGESTIONS - VS CODE
# ─────────────────────────────────────────────────────────────────

Tab                    # Aceitar sugestão
Escape                 # Rejeitar
Alt + ]                # Próxima sugestão
Alt + [                # Anterior

# Chat inline:
Ctrl + Shift + P → "GitLab Duo Chat: Open Chat"

# ─────────────────────────────────────────────────────────────────
# ANÁLISE DE VULNERABILIDADES
# ─────────────────────────────────────────────────────────────────

# No painel de Security do MR:
# Duo automaticamente sugere correções para:
# - SAST findings
# - Dependency scanning
# - Secret detection

# Clicar em "Explain this vulnerability" para detalhes
# Clicar em "How to fix" para correção sugerida

# ─────────────────────────────────────────────────────────────────
# CI/CD - AJUDA COM PIPELINES
# ─────────────────────────────────────────────────────────────────

# No pipeline falhando:
# 1. Clicar no job com erro
# 2. Ícone "Troubleshoot with Duo" aparece
# 3. Duo analisa logs e sugere correção

# No Duo Chat, perguntar:
"Por que o job 'test' está falhando?"
"Como adicionar cache ao meu pipeline?"
"Gere um .gitlab-ci.yml para Node.js com testes e deploy"

# ─────────────────────────────────────────────────────────────────
# ROOT CAUSE ANALYSIS
# ─────────────────────────────────────────────────────────────────

# Em um pipeline falhando:
# 1. Ir para CI/CD → Pipelines
# 2. Clicar no pipeline com falha
# 3. Botão "Root cause analysis" (Beta)
# 4. Duo analisa todo o contexto e sugere causa

# ─────────────────────────────────────────────────────────────────
# CONFIGURAÇÕES ÚTEIS
# ─────────────────────────────────────────────────────────────────

# VS Code settings.json:
{
  "gitlab.duo.enabledWithoutGitlabProject": true,
  "gitlab.aiAssistedCodeSuggestions.enabled": true,
  "gitlab.duoChat.enabled": true
}

# Verificar status:
# Ctrl+Shift+P → "GitLab: Show Extension Logs"

# ─────────────────────────────────────────────────────────────────
# API - AUTOMAÇÃO
# ─────────────────────────────────────────────────────────────────

# Duo também pode ser acessado via API para automação:
curl --header "PRIVATE-TOKEN: <token>" \\
     --header "Content-Type: application/json" \\
     --data '{"content": "Explique esse código", "resource_id": "gid://..."}' \\
     "https://gitlab.com/api/v4/ai/chat"`;

const AIDevSection = () => {
  return (
    <section id="ai-dev" className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> AI para Desenvolvedores
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            GitHub Copilot e GitLab Duo: duas abordagens complementares para acelerar o desenvolvimento.
          </p>
        </div>

        {/* Mental Model */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <Bot className="w-5 h-5 text-primary" />
              Visão Rápida (Mental Model)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-500">GitHub Copilot</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>IA dentro do código</strong> — Foco no editor, autocomplete, pair programming, geração de testes.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-orange-500">GitLab Duo</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>IA no ciclo inteiro (SDLC)</strong> — Planejamento, issues, code review, CI/CD, segurança.
                </p>
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground italic">
              Eles não competem exatamente — se complementam, dependendo do fluxo.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="copilot" className="w-full">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger 
              value="copilot" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              GitHub Copilot
            </TabsTrigger>
            <TabsTrigger 
              value="duo" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              GitLab Duo
            </TabsTrigger>
            <TabsTrigger 
              value="comparison" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Comparação
            </TabsTrigger>
            <TabsTrigger 
              value="workflow" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Workflow Combinado
            </TabsTrigger>
            <TabsTrigger 
              value="install" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Instalação
            </TabsTrigger>
            <TabsTrigger 
              value="commands" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Comandos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="copilot">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="border-purple-500 text-purple-500">
                  Contexto Local
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Entende: arquivo atual, projeto aberto, imports e padrões do repositório
                </span>
              </div>
              
              <Accordion type="single" collapsible className="space-y-2">
                {copilotFeatures.map((feature, index) => (
                  <AccordionItem key={index} value={`copilot-${index}`} className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <feature.icon className="w-5 h-5 text-purple-500" />
                        <span className="font-mono">{feature.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <CodeBlock code={feature.example} language="typescript" filename="exemplo.ts" />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Card className="mt-6 border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="pt-4">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    <strong>⚠️ Limite importante:</strong> Copilot não entende issues, épicos, pipelines ou regras de negócio fora do código.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="duo">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="border-orange-500 text-orange-500">
                  Contexto Organizacional
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Entende: repositório, issues, epics, MRs, pipelines, padrões do time
                </span>
              </div>
              
              <Accordion type="single" collapsible className="space-y-2">
                {gitlabDuoFeatures.map((feature, index) => (
                  <AccordionItem key={index} value={`duo-${index}`} className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <feature.icon className="w-5 h-5 text-orange-500" />
                        <span className="font-mono">{feature.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <CodeBlock code={feature.example} language="markdown" filename="duo-output.md" />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Card className="mt-6 border-green-500/30 bg-green-500/5">
                <CardContent className="pt-4">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    <strong>💡 Diferencial:</strong> Muito útil para times, não só dev solo. Forte para enterprise com DevSecOps.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle className="font-mono text-lg">Comparação Direta (sem marketing)</CardTitle>
                <CardDescription>Avaliação prática de cada ferramenta por dimensão</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-mono">Dimensão</th>
                        <th className="text-center py-3 px-2">
                          <Badge className="bg-purple-500">Copilot</Badge>
                        </th>
                        <th className="text-center py-3 px-2">
                          <Badge className="bg-orange-500">GitLab Duo</Badge>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((row, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-3 px-2 font-medium">{row.dimension}</td>
                          <td className="py-3 px-2 text-center">{renderStars(row.copilot)}</td>
                          <td className="py-3 px-2 text-center">{renderStars(row.duo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Fluxo Realista de DEV Moderno
                  </CardTitle>
                  <CardDescription>Como usar os dois juntos (cenário ideal)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { step: "1. Planejamento", duo: "Cria issue + critérios", copilot: "-" },
                      { step: "2. Implementação", duo: "-", copilot: "Escreve código no editor" },
                      { step: "3. Testes", duo: "Valida impacto", copilot: "Gera testes" },
                      { step: "4. Review", duo: "Resume MR, sugere melhorias", copilot: "-" },
                      { step: "5. CI/CD", duo: "Ajuda a corrigir pipeline", copilot: "-" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                        <span className="font-mono font-bold text-primary w-36">{item.step}</span>
                        <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-orange-500 text-orange-500 text-xs">Duo</Badge>
                            <span className="text-muted-foreground">{item.duo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-purple-500 text-purple-500 text-xs">Copilot</Badge>
                            <span className="text-muted-foreground">{item.copilot}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground text-center">
                    👉 <strong>Resultado:</strong> menos atrito, mais foco em lógica e produto.
                  </p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="font-mono text-sm">✔️ Use Copilot se você:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Programa muito sozinho</li>
                      <li>• Quer escrever código mais rápido</li>
                      <li>• Vive no editor (VS Code / JetBrains)</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-orange-500/30">
                  <CardHeader>
                    <CardTitle className="font-mono text-sm">✔️ Use GitLab Duo se você:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Trabalha em time</li>
                      <li>• Usa GitLab como hub</li>
                      <li>• Precisa de IA em planejamento, review e pipeline</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-center font-mono">
                    🧠 <strong>Insight final:</strong> Copilot acelera <span className="text-primary">código</span>. GitLab Duo acelera o <span className="text-primary">sistema inteiro</span>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="install">
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="copilot-install" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-500">GitHub Copilot</Badge>
                    <span className="font-mono">Guia de Instalação</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CodeBlock code={installationGuides.copilot} language="bash" filename="copilot-install.sh" />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="duo-install" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-orange-500">GitLab Duo</Badge>
                    <span className="font-mono">Guia de Instalação</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CodeBlock code={installationGuides.duo} language="bash" filename="duo-install.sh" />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="commands">
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="copilot-cmd" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-500">GitHub Copilot</Badge>
                    <span className="font-mono">Atalhos e Comandos</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CodeBlock code={copilotCommands} language="bash" filename="copilot-commands.sh" />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="duo-cmd" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-orange-500">GitLab Duo</Badge>
                    <span className="font-mono">Comandos e Quick Actions</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CodeBlock code={duoCommands} language="bash" filename="duo-commands.sh" />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default AIDevSection;
