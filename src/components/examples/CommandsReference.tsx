import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";

const mavenCommands = `# ==================== MAVEN - DICIONÁRIO DE COMANDOS ====================
# Ferramenta de build e gerenciamento de dependências para Java
# Instalação: https://maven.apache.org/download.cgi

# ==================== CICLO DE VIDA ====================

mvn clean                     # Limpar diretório target/
mvn compile                   # Compilar código fonte
mvn test                      # Executar testes unitários
mvn package                   # Criar JAR/WAR
mvn install                   # Instalar no repositório local (.m2)
mvn deploy                    # Deploy para repositório remoto
mvn verify                    # Executar testes de integração

# Combinações comuns
mvn clean install             # Limpar e instalar
mvn clean install -DskipTests # Pular testes
mvn clean package -Pprod      # Build com profile de produção
mvn clean verify              # Build completo com testes de integração

# ==================== EXECUÇÃO E DEBUG ====================

# Spring Boot
mvn spring-boot:run                              # Executar aplicação
mvn spring-boot:run -Dspring-boot.run.profiles=dev  # Com profile
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"

# Exec Plugin
mvn exec:java -Dexec.mainClass="com.example.Main"
mvn exec:java -Dexec.mainClass="com.example.Main" -Dexec.args="arg1 arg2"

# ==================== DEPENDÊNCIAS ====================

mvn dependency:tree                    # Árvore de dependências
mvn dependency:tree -Dincludes=org.springframework  # Filtrar por grupo
mvn dependency:tree -Dverbose          # Detalhado com conflitos
mvn dependency:analyze                 # Analisar dependências não utilizadas
mvn dependency:resolve                 # Resolver e baixar dependências
mvn dependency:purge-local-repository  # Limpar cache local
mvn dependency:copy-dependencies -DoutputDirectory=./libs  # Copiar JARs

# Atualização de versões
mvn versions:display-dependency-updates  # Mostrar atualizações disponíveis
mvn versions:display-plugin-updates      # Atualizações de plugins
mvn versions:use-latest-releases         # Atualizar para últimas releases
mvn versions:set -DnewVersion=2.0.0      # Definir nova versão do projeto
mvn versions:commit                       # Confirmar mudanças de versão
mvn versions:revert                       # Reverter mudanças de versão

# ==================== TESTES ====================

mvn test                                  # Executar todos os testes
mvn test -Dtest=UserServiceTest           # Teste específico
mvn test -Dtest=UserServiceTest#testCreate  # Método específico
mvn test -Dtest="*ServiceTest"            # Pattern matching
mvn test -DfailIfNoTests=false            # Não falhar se sem testes
mvn test -Dmaven.test.failure.ignore=true # Ignorar falhas

# Surefire (testes unitários)
mvn surefire:test
mvn surefire-report:report                # Gerar relatório HTML

# Failsafe (testes de integração)
mvn failsafe:integration-test
mvn failsafe:verify

# Cobertura com JaCoCo
mvn jacoco:prepare-agent test jacoco:report
mvn jacoco:check                          # Verificar threshold

# ==================== PROFILES ====================

mvn clean install -Pdev                   # Ativar profile 'dev'
mvn clean install -Pprod,oracle           # Múltiplos profiles
mvn clean install -P!dev                  # Desativar profile
mvn help:active-profiles                  # Ver profiles ativos
mvn help:all-profiles                     # Listar todos os profiles

# ==================== PLUGINS COMUNS ====================

# Compiler
mvn compiler:compile -Dmaven.compiler.source=17 -Dmaven.compiler.target=17

# JAR
mvn jar:jar
mvn jar:test-jar                          # JAR com classes de teste

# WAR
mvn war:war
mvn war:exploded                          # Gerar WAR expandido

# Source e Javadoc
mvn source:jar                            # JAR com código fonte
mvn javadoc:javadoc                       # Gerar Javadoc
mvn javadoc:jar                           # JAR com Javadoc

# Assembly (criar distribuição)
mvn assembly:single

# Shade (uber JAR com dependências)
mvn shade:shade

# ==================== ANÁLISE DE CÓDIGO ====================

# SonarQube
mvn sonar:sonar -Dsonar.host.url=http://localhost:9000

# Checkstyle
mvn checkstyle:check
mvn checkstyle:checkstyle                 # Gerar relatório

# SpotBugs (FindBugs)
mvn spotbugs:check
mvn spotbugs:gui                          # Interface gráfica

# PMD
mvn pmd:check
mvn pmd:pmd

# OWASP Dependency Check
mvn dependency-check:check
mvn dependency-check:aggregate            # Multi-module

# ==================== MULTI-MODULE ====================

mvn clean install -pl module1,module2     # Módulos específicos
mvn clean install -pl module1 -am         # Com dependências (also-make)
mvn clean install -pl module1 -amd        # Com dependentes (also-make-dependents)
mvn clean install -rf :module2            # Retomar de módulo

# ==================== RELEASE ====================

mvn release:prepare                       # Preparar release
mvn release:perform                       # Executar release
mvn release:rollback                      # Reverter release
mvn release:clean                         # Limpar arquivos de release

# ==================== CONFIGURAÇÕES ====================

# Offline mode
mvn clean install -o                      # Modo offline

# Verbose/Debug
mvn clean install -X                      # Debug output
mvn clean install -e                      # Stack traces

# Threads paralelas
mvn clean install -T 4                    # 4 threads
mvn clean install -T 1C                   # 1 thread por CPU core

# Batch mode (CI/CD)
mvn clean install -B                      # Sem input interativo

# ==================== ARCHETYPE (CRIAR PROJETOS) ====================

# Projeto simples
mvn archetype:generate -DgroupId=com.example -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false

# Spring Boot
mvn archetype:generate -DarchetypeGroupId=org.springframework.boot -DarchetypeArtifactId=spring-boot-archetype

# Listar archetypes disponíveis
mvn archetype:generate -Dfilter=spring

# ==================== HELP ====================

mvn help:describe -Dplugin=compiler       # Ajuda de plugin
mvn help:effective-pom                    # POM efetivo
mvn help:effective-settings               # Settings efetivo
mvn help:system                           # Propriedades do sistema`;

const npmCommands = `# ==================== NPM - DICIONÁRIO DE COMANDOS ====================
# Node Package Manager - Gerenciador de pacotes JavaScript/Node.js
# Instalação: vem junto com Node.js

# ==================== INICIALIZAÇÃO ====================

npm init                          # Criar package.json interativo
npm init -y                       # Criar package.json com defaults
npm init @scope/pkg               # Usar initializer de escopo

# ==================== INSTALAÇÃO DE PACOTES ====================

npm install                       # Instalar todas as dependências
npm install --production          # Apenas dependências de produção
npm i                             # Alias para install

# Dependências de produção
npm install express               # Última versão
npm install express@4.18.2        # Versão específica
npm install express@^4.0.0        # Range de versão
npm install express@latest        # Última release
npm install express@next          # Próxima versão (beta)

# Dependências de desenvolvimento
npm install -D jest               # devDependencies
npm install --save-dev typescript # Mesmo que -D
npm install -D @types/node @types/express  # Múltiplos pacotes

# Global
npm install -g typescript         # Instalação global
npm install -g @nestjs/cli

# Outras flags
npm install --save-exact lodash   # Versão exata (sem ^)
npm install --legacy-peer-deps    # Ignorar conflitos de peer deps
npm install --force               # Forçar instalação

# De repositório Git
npm install github:user/repo
npm install git+https://github.com/user/repo.git
npm install git+ssh://git@github.com:user/repo.git#branch

# De arquivo local
npm install ../my-package
npm install ./packages/shared

# ==================== REMOÇÃO ====================

npm uninstall express             # Remover pacote
npm remove express                # Alias
npm un express                    # Alias
npm uninstall -g typescript       # Remover global

# ==================== ATUALIZAÇÃO ====================

npm update                        # Atualizar todos os pacotes
npm update express                # Atualizar pacote específico
npm outdated                      # Listar pacotes desatualizados
npm outdated -g                   # Globais desatualizados

# npm-check-updates (instalar separado)
npx npm-check-updates             # Verificar atualizações
npx npm-check-updates -u          # Atualizar package.json
npx npm-check-updates -i          # Modo interativo

# ==================== INFORMAÇÕES ====================

npm list                          # Árvore de dependências
npm list --depth=0                # Apenas nível 0
npm list --depth=1                # Até nível 1
npm list -g --depth=0             # Globais instalados

npm info express                  # Detalhes do pacote
npm view express versions         # Todas as versões
npm view express dependencies     # Dependências do pacote
npm search express                # Buscar pacotes

npm explain lodash                # Por que pacote está instalado
npm why lodash                    # Alias

# ==================== SCRIPTS ====================

npm run dev                       # Executar script 'dev'
npm run build                     # Executar script 'build'
npm run test                      # ou npm test
npm start                         # Executar script 'start'
npm run lint                      # Executar script 'lint'

# Com argumentos
npm run dev -- --port 3001        # Passar argumentos
npm run test -- --watch           # Watch mode

# Scripts pré/pós (automáticos)
# "prebuild": "npm run clean"     # Executa antes de 'build'
# "postbuild": "npm run deploy"   # Executa depois de 'build'

# ==================== AUDITORIA E SEGURANÇA ====================

npm audit                         # Verificar vulnerabilidades
npm audit fix                     # Corrigir automaticamente
npm audit fix --force             # Forçar correção (breaking changes)
npm audit --json                  # Saída em JSON
npm audit --production            # Apenas produção

# ==================== CACHE ====================

npm cache clean --force           # Limpar cache
npm cache verify                  # Verificar integridade
npm cache ls                      # Listar cache

# ==================== CONFIGURAÇÃO ====================

npm config list                   # Ver configurações
npm config set registry https://registry.npmjs.org/
npm config set save-exact true    # Sempre salvar versão exata
npm config get prefix             # Diretório de instalação global

# .npmrc (configuração por projeto)
# registry=https://registry.npmjs.org/
# save-exact=true
# @myorg:registry=https://npm.myorg.com/

# ==================== PUBLICAÇÃO ====================

npm login                         # Login no npm registry
npm whoami                        # Verificar usuário logado
npm publish                       # Publicar pacote
npm publish --access public       # Publicar pacote público
npm publish --tag beta            # Publicar com tag
npm version patch                 # Incrementar patch version
npm version minor                 # Incrementar minor version
npm version major                 # Incrementar major version
npm deprecate pkg@1.0.0 "Use 2.0" # Deprecar versão

# ==================== LINK (DESENVOLVIMENTO LOCAL) ====================

npm link                          # Criar link global do pacote atual
npm link my-package               # Usar pacote linkado
npm unlink my-package             # Remover link

# ==================== WORKSPACES (MONOREPO) ====================

# package.json raiz
# "workspaces": ["packages/*"]

npm install -w packages/api       # Instalar em workspace específico
npm run build -w packages/api     # Executar script em workspace
npm run build --workspaces        # Executar em todos workspaces

# ==================== NPX ====================

npx create-react-app my-app       # Executar sem instalar global
npx -p @angular/cli ng new my-app # Especificar pacote
npx cowsay "Hello"                # Executar pacote temporário
npx --yes pkg                     # Sem confirmação

# ==================== CI/CD ====================

npm ci                            # Clean install (usa package-lock.json)
npm ci --production               # Apenas produção
npm prune                         # Remover pacotes não listados
npm prune --production            # Remover devDependencies

# ==================== DEBUG ====================

npm ls                            # Listar pacotes
npm doctor                        # Verificar ambiente
npm explain package               # Explicar dependência
npm rebuild                       # Rebuild native modules`;

const gitCommands = `# ==================== GIT - DICIONÁRIO DE COMANDOS ====================
# Sistema de controle de versão distribuído
# Documentação: https://git-scm.com/docs

# ==================== CONFIGURAÇÃO INICIAL ====================

git config --global user.name "Seu Nome"
git config --global user.email "email@example.com"
git config --global core.editor "code --wait"
git config --global init.defaultBranch main
git config --global core.autocrlf input      # Linux/Mac
git config --global core.autocrlf true       # Windows
git config --global pull.rebase true         # Rebase no pull
git config --global fetch.prune true         # Limpar refs remotas
git config --list                            # Ver configurações
git config --list --show-origin              # Com origem

# ==================== INICIANDO REPOSITÓRIO ====================

git init                                     # Inicializar repositório
git clone https://url.git                    # Clonar repositório
git clone --depth 1 url                      # Clone raso (apenas último commit)
git clone --branch develop url               # Clonar branch específica
git clone --recurse-submodules url           # Com submodules

# ==================== STAGING E COMMITS ====================

git status                                   # Status atual
git status -s                                # Status resumido
git add arquivo.txt                          # Adicionar arquivo
git add .                                    # Adicionar tudo
git add -p                                   # Adicionar interativamente
git add -A                                   # Adicionar tudo (incluindo deletados)

git reset HEAD arquivo.txt                   # Remover do staging
git restore --staged arquivo.txt             # Mesmo (Git 2.23+)

git commit -m "mensagem"                     # Commit
git commit -am "mensagem"                    # Add + Commit
git commit --amend                           # Editar último commit
git commit --amend --no-edit                 # Adicionar ao último commit
git commit --allow-empty -m "Empty commit"   # Commit vazio (trigger CI)
git commit -S -m "msg"                       # Commit assinado (GPG)

# ==================== BRANCHES ====================

git branch                                   # Listar branches locais
git branch -a                                # Listar todas
git branch -v                                # Com último commit
git branch feature/nova                      # Criar branch
git branch -d feature/velha                  # Deletar (merged)
git branch -D feature/velha                  # Forçar delete
git branch -m novo-nome                      # Renomear branch atual
git branch -m antigo novo                    # Renomear qualquer branch
git branch --contains abc123                 # Branches que contém commit

git checkout branch                          # Mudar para branch
git checkout -b feature/nova                 # Criar e mudar
git checkout -b feature origin/feature       # Tracking branch
git switch branch                            # Mudar (Git 2.23+)
git switch -c feature/nova                   # Criar e mudar
git switch -                                 # Voltar à branch anterior

# ==================== MERGE E REBASE ====================

git merge feature/branch                     # Merge branch
git merge --no-ff feature/branch             # Com commit de merge
git merge --squash feature/branch            # Squash merge
git merge --abort                            # Cancelar merge

git rebase main                              # Rebase na main
git rebase -i HEAD~3                         # Rebase interativo
git rebase --onto main feature bugfix        # Rebase onto
git rebase --abort                           # Cancelar rebase
git rebase --continue                        # Continuar após conflito

git cherry-pick abc123                       # Aplicar commit específico
git cherry-pick abc123 def456                # Múltiplos commits
git cherry-pick --no-commit abc123           # Sem commit automático

# ==================== REMOTE ====================

git remote -v                                # Ver remotes
git remote add origin url                    # Adicionar remote
git remote rename origin upstream            # Renomear remote
git remote remove origin                     # Remover remote
git remote set-url origin new-url            # Alterar URL

git fetch                                    # Baixar alterações
git fetch --all                              # De todos remotes
git fetch --prune                            # Limpar refs deletadas
git pull                                     # Fetch + Merge
git pull --rebase                            # Fetch + Rebase
git pull origin main                         # De branch específica

git push                                     # Enviar para remoto
git push -u origin branch                    # Push e setar upstream
git push --force-with-lease                  # Force push seguro
git push --force                             # Force push (CUIDADO!)
git push origin --delete branch              # Deletar branch remota
git push --tags                              # Enviar todas tags

# ==================== HISTÓRICO ====================

git log                                      # Ver histórico
git log --oneline                            # Resumido
git log --graph --oneline --all              # Gráfico de branches
git log -n 5                                 # Últimos 5 commits
git log -p arquivo.txt                       # Histórico de arquivo
git log --author="Nome"                      # Por autor
git log --since="2024-01-01"                 # Desde data
git log --grep="fix"                         # Buscar na mensagem
git log --follow arquivo.txt                 # Seguir renames
git log main..feature                        # Commits em feature não em main

git show abc123                              # Ver commit específico
git show HEAD~2                              # 2 commits atrás
git blame arquivo.txt                        # Quem alterou cada linha
git shortlog -sn                             # Ranking de commits por autor

git diff                                     # Diferenças não staged
git diff --staged                            # Diferenças staged
git diff branch1..branch2                    # Entre branches
git diff abc123..def456                      # Entre commits
git diff --stat                              # Resumo de mudanças

# ==================== DESFAZENDO ALTERAÇÕES ====================

git checkout -- arquivo.txt                  # Descartar alterações
git restore arquivo.txt                      # Mesmo (Git 2.23+)
git restore --source=HEAD~2 arquivo.txt      # Restaurar de commit anterior

git reset --soft HEAD~1                      # Desfazer commit, manter staged
git reset --mixed HEAD~1                     # Desfazer commit, manter working
git reset --hard HEAD~1                      # Desfazer commit, perder tudo!
git reset --hard origin/main                 # Reset para estado remoto

git revert abc123                            # Criar commit que reverte
git revert abc123..def456                    # Reverter range
git revert -m 1 merge-commit                 # Reverter merge

git clean -n                                 # Preview de limpeza
git clean -fd                                # Remover untracked files/dirs
git clean -fdx                               # Incluindo ignorados

# ==================== STASH ====================

git stash                                    # Guardar alterações
git stash save "mensagem"                    # Com mensagem
git stash push -m "msg" arquivo.txt          # Arquivo específico
git stash list                               # Listar stashes
git stash show stash@{0}                     # Ver conteúdo
git stash show -p stash@{0}                  # Ver diff
git stash pop                                # Aplicar e remover
git stash apply stash@{0}                    # Aplicar sem remover
git stash drop stash@{0}                     # Remover stash
git stash clear                              # Limpar todos
git stash branch nova-branch stash@{0}       # Criar branch de stash

# ==================== TAGS ====================

git tag                                      # Listar tags
git tag v1.0.0                               # Tag leve
git tag -a v1.0.0 -m "Version 1.0.0"         # Tag anotada
git tag -a v1.0.0 abc123                     # Tag em commit específico
git push origin v1.0.0                       # Push de tag
git push origin --tags                       # Push de todas tags
git tag -d v1.0.0                            # Deletar local
git push origin --delete v1.0.0              # Deletar remota

# ==================== WORKTREE ====================

git worktree add ../feature feature-branch   # Adicionar worktree
git worktree list                            # Listar worktrees
git worktree remove ../feature               # Remover worktree

# ==================== BISECT (ENCONTRAR BUG) ====================

git bisect start                             # Iniciar bisect
git bisect bad                               # Marcar como ruim
git bisect good abc123                       # Marcar como bom
git bisect reset                             # Finalizar bisect

# ==================== SUBMODULES ====================

git submodule add https://url.git path       # Adicionar submodule
git submodule update --init                  # Inicializar
git submodule update --init --recursive      # Recursivo
git submodule update --remote                # Atualizar para remoto`;

const conventionalCommits = `# ==================== CONVENTIONAL COMMITS ====================
# Padrão de mensagens de commit semânticas
# https://www.conventionalcommits.org/

# FORMATO: <tipo>[escopo opcional]: <descrição>
#          [corpo opcional]
#          [rodapé(s) opcional(is)]

# ==================== TIPOS PRINCIPAIS ====================

# feat: Nova funcionalidade para o usuário
feat: add user authentication with JWT
feat(auth): implement OAuth2 login with Google
feat(api): add pagination to list endpoints
feat(ui): add dark mode toggle button

# fix: Correção de bug que afeta o usuário
fix: resolve login redirect loop
fix(cart): correct total calculation with discounts
fix(api): handle null values in user response
fix(db): prevent duplicate key constraint violation

# docs: Mudanças apenas em documentação
docs: update README with installation steps
docs(api): add OpenAPI specification
docs: fix typos in contributing guide
docs(readme): add deployment instructions

# style: Formatação, ponto-e-vírgula, etc (não afeta código)
style: format code with prettier
style(css): fix indentation in main.css
style: remove trailing whitespaces
style: apply eslint auto-fixes

# refactor: Refatoração que não adiciona feature nem corrige bug
refactor: extract validation logic to separate module
refactor(auth): simplify token refresh mechanism
refactor: rename variables for clarity
refactor(service): split UserService into smaller services

# perf: Mudança que melhora performance
perf: optimize database queries with indexes
perf(images): implement lazy loading
perf: cache API responses
perf(query): add database connection pooling

# test: Adicionar ou corrigir testes
test: add unit tests for UserService
test(e2e): add login flow tests
test: increase coverage for utils module
test(integration): add API integration tests

# build: Mudanças no sistema de build ou dependências
build: upgrade to Node 20
build(deps): update react to v18
build: configure webpack for production
build(maven): update Spring Boot to 3.2

# ci: Mudanças em scripts/configuração de CI
ci: add GitHub Actions workflow
ci: configure automatic deployments
ci(docker): optimize multi-stage build
ci(gitlab): add security scanning stage

# chore: Tarefas de manutenção, configs, etc
chore: update .gitignore
chore: configure husky pre-commit hooks
chore(deps): update dev dependencies
chore: clean up unused imports

# revert: Reverte um commit anterior
revert: revert "feat: add experimental feature"
revert: undo changes from commit abc123

# ==================== ESCOPOS COMUNS ====================

# Por domínio/módulo
feat(user): ...
feat(order): ...
feat(payment): ...
feat(auth): ...

# Por camada
feat(api): ...
feat(ui): ...
feat(db): ...
feat(service): ...

# Por tecnologia
build(docker): ...
build(maven): ...
ci(github): ...
ci(gitlab): ...

# ==================== BREAKING CHANGES ====================

# Usando ! após o tipo
feat!: remove deprecated API endpoints
feat(api)!: change response format

# Usando BREAKING CHANGE no rodapé
feat(api): change user response structure

BREAKING CHANGE: The 'user' object now returns 'fullName' 
instead of separate 'firstName' and 'lastName' fields.
Migration: Clients should update to use 'fullName' field.

# ==================== EXEMPLOS COMPLETOS ====================

# Commit simples
feat(user): add ability to update profile picture

# Com corpo
fix(cart): prevent negative quantities

The cart was allowing negative quantities which caused
incorrect total calculations. Added validation to ensure
quantity is always >= 0.

# Com rodapé
feat(api): implement rate limiting

Add rate limiting to API endpoints to prevent abuse.
Configuration: 100 requests per minute per IP.

Closes #123
Reviewed-by: John Doe

# Com múltiplos rodapés
fix(security): sanitize user input in search

Refs: #456, #789
Co-authored-by: Jane Doe <jane@example.com>

# ==================== SEMVER E CONVENTIONAL COMMITS ====================

# PATCH (0.0.X) - fix, docs, style, refactor, perf, test, chore
# MINOR (0.X.0) - feat
# MAJOR (X.0.0) - BREAKING CHANGE ou tipo!

# ==================== FERRAMENTAS ====================

# Commitizen - CLI interativo para commits
# npm install -g commitizen cz-conventional-changelog
# git cz

# Commitlint - Validar mensagens de commit
# npm install -D @commitlint/cli @commitlint/config-conventional

# Husky - Git hooks
# npm install -D husky
# npx husky add .husky/commit-msg 'npx commitlint --edit $1'

# Standard Version - Versionamento automático
# npm install -D standard-version
# npx standard-version

# Semantic Release - CI/CD automático
# npm install -D semantic-release`;

const svnCommands = `# ==================== SUBVERSION (SVN) - DICIONÁRIO DE COMANDOS ====================
# Sistema de controle de versão centralizado
# Documentação: https://subversion.apache.org/docs/

# ==================== ESTRUTURA DO REPOSITÓRIO ====================

# Convenção padrão de diretórios:
# /trunk       - Linha principal de desenvolvimento
# /branches    - Branches de feature, release, etc.
# /tags        - Versões marcadas (imutáveis)

# ==================== CHECKOUT E UPDATE ====================

svn checkout URL path                  # Checkout do repositório
svn checkout URL/trunk path            # Checkout do trunk
svn co URL path                        # Alias
svn checkout --depth empty URL path    # Checkout vazio (sparse)
svn checkout --depth files URL path    # Apenas arquivos do diretório
svn checkout -r 123 URL path           # Revisão específica

svn update                             # Atualizar working copy
svn update -r 123                      # Atualizar para revisão
svn up                                 # Alias
svn update --set-depth infinity        # Expandir sparse checkout

# ==================== STATUS E INFORMAÇÕES ====================

svn status                             # Status dos arquivos
svn status -u                          # Com info do servidor
svn st                                 # Alias

# Símbolos de status:
# A - Added (adicionado)
# C - Conflicted (conflito)
# D - Deleted (deletado)
# M - Modified (modificado)
# R - Replaced (substituído)
# ? - Unversioned (não versionado)
# ! - Missing (falta)
# ~ - Obstructed (tipo diferente)

svn info                               # Info do working copy
svn info URL                           # Info de URL remota
svn info -r 123                        # Info em revisão específica

# ==================== MODIFICAÇÕES ====================

svn add arquivo.txt                    # Adicionar arquivo
svn add pasta/                         # Adicionar pasta
svn add * --force                      # Adicionar tudo recursivamente
svn add --non-recursive pasta/         # Apenas o diretório

svn delete arquivo.txt                 # Marcar para remoção
svn del arquivo.txt                    # Alias
svn rm arquivo.txt                     # Alias
svn delete --keep-local arquivo.txt    # Remover do SVN, manter local

svn move antigo.txt novo.txt           # Renomear/mover
svn mv antigo.txt novo.txt             # Alias
svn rename antigo.txt novo.txt         # Alias

svn copy arquivo.txt copia.txt         # Copiar
svn cp arquivo.txt copia.txt           # Alias

svn mkdir nova-pasta                   # Criar diretório

# ==================== REVERTER ALTERAÇÕES ====================

svn revert arquivo.txt                 # Desfazer alterações locais
svn revert -R pasta/                   # Revert recursivo
svn revert .                           # Revert do diretório atual

# ==================== COMMIT ====================

svn commit -m "mensagem"               # Commit
svn ci -m "mensagem"                   # Alias
svn commit -F mensagem.txt             # Commit com arquivo de mensagem
svn commit -m "msg" arquivo.txt        # Commit específico
svn commit --depth empty -m "msg"      # Commit apenas do diretório

# ==================== DIFF E LOG ====================

svn diff                               # Ver diferenças locais
svn diff arquivo.txt                   # Diff de arquivo específico
svn diff -r 100                        # Comparar com revisão
svn diff -r 100:HEAD                   # Diff entre revisões
svn diff -r 100:150 arquivo.txt        # Range específico
svn diff --summarize -r 100:HEAD       # Apenas nomes dos arquivos

svn log                                # Histórico
svn log -v                             # Detalhado com arquivos
svn log -l 10                          # Últimas 10 revisões
svn log -r 100:200                     # Range de revisões
svn log -r {2024-01-01}:{2024-12-31}   # Por data
svn log arquivo.txt                    # Histórico de arquivo
svn log --stop-on-copy arquivo.txt     # Parar ao encontrar copy

svn blame arquivo.txt                  # Quem alterou cada linha
svn annotate arquivo.txt               # Alias
svn praise arquivo.txt                 # Alias

svn cat -r 100 arquivo.txt             # Ver conteúdo em revisão

# ==================== BRANCHES E TAGS ====================

# Criar branch (cópia servidor-servidor)
svn copy URL/trunk URL/branches/feature-x -m "Create feature branch"

# Criar tag
svn copy URL/trunk URL/tags/v1.0.0 -m "Tag version 1.0.0"

# Switch de branch
svn switch URL/branches/feature-x
svn switch --relocate OLD_URL NEW_URL  # Mudar URL do repositório

# Merge de branch
svn merge URL/branches/feature-x                    # Merge completo
svn merge -r 100:150 URL/branches/feature-x         # Range específico
svn merge -c 123 URL/trunk                          # Commit específico
svn merge --reintegrate URL/branches/feature-x      # Reintegrar branch

# Verificar merge info
svn mergeinfo URL/branches/feature-x
svn mergeinfo --show-revs eligible URL/branches/feature-x

# ==================== RESOLUÇÃO DE CONFLITOS ====================

svn resolve --accept working arquivo.txt      # Aceitar versão local
svn resolve --accept theirs-full arquivo.txt  # Aceitar versão servidor
svn resolve --accept mine-full arquivo.txt    # Aceitar minha versão
svn resolve --accept base arquivo.txt         # Versão base
svn resolved arquivo.txt                      # Marcar resolvido (antigo)

# ==================== PROPRIEDADES ====================

svn propset svn:ignore "*.log" .              # Ignorar arquivos
svn propset svn:ignore "target
node_modules
*.log" .                                       # Múltiplos patterns

svn propedit svn:ignore .                     # Editar com editor
svn propget svn:ignore .                      # Ver propriedade
svn proplist -v arquivo.txt                   # Listar propriedades

svn propset svn:keywords "Id Author Date Rev" arquivo.txt
# $Id$, $Author$, $Date$, $Rev$

svn propset svn:eol-style native arquivo.txt  # Line endings

svn propset svn:executable ON script.sh       # Tornar executável
svn propdel svn:executable script.sh          # Remover propriedade

# ==================== EXPORTAR E IMPORTAR ====================

svn export URL path                    # Export sem .svn
svn export . path                      # Export do working copy
svn import path URL -m "Import inicial"  # Importar para repositório

# ==================== LIMPEZA E MANUTENÇÃO ====================

svn cleanup                            # Limpar locks
svn cleanup --remove-unversioned       # Remover não versionados
svn cleanup --remove-ignored           # Remover ignorados

# ==================== LISTAR CONTEÚDO REMOTO ====================

svn list URL                           # Listar conteúdo
svn ls URL                             # Alias
svn list -R URL                        # Recursivo
svn list URL@123                       # Em revisão específica

# ==================== LOCKS ====================

svn lock arquivo.txt                   # Bloquear arquivo
svn lock -m "motivo" arquivo.txt       # Com mensagem
svn unlock arquivo.txt                 # Desbloquear
svn unlock --force arquivo.txt         # Forçar desbloqueio

# ==================== COMPARAÇÃO SVN vs GIT ====================

# SVN             | GIT
# ================|================
# svn checkout    | git clone
# svn update      | git pull
# svn commit      | git commit + push
# svn revert      | git checkout -- / restore
# svn diff        | git diff
# svn log         | git log
# svn blame       | git blame
# svn copy        | git branch / tag
# svn merge       | git merge
# svn switch      | git checkout / switch

# Diferenças importantes:
# - SVN: commit envia direto para servidor
# - Git: commit local, push para servidor
# - SVN: revisões numéricas sequenciais (r123)
# - Git: hashes SHA únicos
# - SVN: centralizado (requer conexão)
# - Git: distribuído (trabalha offline)`;

const linuxCommands = `# ==================== LINUX - DICIONÁRIO DE COMANDOS ====================
# Comandos essenciais para desenvolvedores
# Funciona em: Ubuntu, Debian, CentOS, RHEL, etc.

# ==================== NAVEGAÇÃO ====================

pwd                              # Diretório atual
cd /path/to/dir                  # Ir para diretório
cd ~                             # Ir para home
cd -                             # Voltar ao diretório anterior
cd ..                            # Subir um nível
cd ../..                         # Subir dois níveis
pushd /path                      # Empilhar e ir para diretório
popd                             # Voltar ao diretório empilhado

# ==================== LISTAGEM DE ARQUIVOS ====================

ls                               # Listar arquivos
ls -la                           # Detalhado com ocultos
ls -lh                           # Tamanhos legíveis (KB, MB)
ls -lt                           # Ordenar por data (recentes primeiro)
ls -ltr                          # Ordenar por data (antigos primeiro)
ls -lS                           # Ordenar por tamanho
ls -R                            # Recursivo
ls -d */                         # Apenas diretórios
tree -L 2                        # Árvore (2 níveis)
tree -L 2 -d                     # Árvore apenas diretórios

# ==================== MANIPULAÇÃO DE ARQUIVOS ====================

cp arquivo.txt destino/          # Copiar arquivo
cp -r pasta/ destino/            # Copiar pasta
cp -i arquivo.txt destino/       # Confirmar sobrescrita
cp -u arquivo.txt destino/       # Copiar apenas se mais novo

mv arquivo.txt novo_nome.txt     # Renomear
mv arquivo.txt destino/          # Mover
mv -i arquivo.txt destino/       # Confirmar sobrescrita

rm arquivo.txt                   # Remover arquivo
rm -r pasta/                     # Remover pasta
rm -rf pasta/                    # Forçar remoção (CUIDADO!)
rm -i arquivo.txt                # Confirmar remoção

mkdir pasta                      # Criar diretório
mkdir -p path/to/new/dir         # Criar recursivamente
rmdir pasta                      # Remover diretório vazio

touch arquivo.txt                # Criar arquivo vazio
touch -t 202401011200 arquivo    # Definir data/hora

ln -s /path/to/original link     # Criar link simbólico
ln /path/to/original hardlink    # Criar hard link

# ==================== VISUALIZAÇÃO DE ARQUIVOS ====================

cat arquivo.txt                  # Ver todo conteúdo
cat -n arquivo.txt               # Com números de linha
head arquivo.txt                 # Primeiras 10 linhas
head -n 20 arquivo.txt           # Primeiras 20 linhas
tail arquivo.txt                 # Últimas 10 linhas
tail -n 20 arquivo.txt           # Últimas 20 linhas
tail -f log.txt                  # Seguir arquivo (logs)
tail -F log.txt                  # Seguir com rotação
less arquivo.txt                 # Visualizar paginado
more arquivo.txt                 # Visualizar página a página

# ==================== BUSCA ====================

find . -name "*.java"            # Buscar por nome
find . -name "*.java" -type f    # Apenas arquivos
find . -name "*.java" -type d    # Apenas diretórios
find . -mtime -7                 # Modificados últimos 7 dias
find . -mtime +30                # Modificados há mais de 30 dias
find . -size +100M               # Maiores que 100MB
find . -size -1k                 # Menores que 1KB
find . -name "*.log" -delete     # Buscar e deletar
find . -name "*.sh" -exec chmod +x {} \\;  # Executar comando

grep "texto" arquivo.txt         # Buscar texto
grep -r "texto" .                # Recursivamente
grep -rn "TODO" --include="*.java"  # Com número da linha
grep -i "texto" arquivo.txt      # Case insensitive
grep -v "texto" arquivo.txt      # Inverter (não contém)
grep -c "texto" arquivo.txt      # Contar ocorrências
grep -l "texto" *.txt            # Listar arquivos que contém
grep -E "regex" arquivo.txt      # Extended regex

locate arquivo.txt               # Busca rápida (índice)
updatedb                         # Atualizar índice do locate
which java                       # Localizar executável
whereis java                     # Localizar binário, fonte, manual

# ==================== PROCESSOS ====================

ps                               # Processos do terminal
ps aux                           # Todos os processos
ps aux | grep java               # Filtrar processos
ps -ef                           # Formato alternativo
ps -eo pid,ppid,cmd,%cpu,%mem    # Campos específicos
pstree                           # Árvore de processos

top                              # Monitor (q sai)
htop                             # Monitor melhorado
watch -n 1 'ps aux | head -10'   # Executar a cada 1 segundo

kill PID                         # Encerrar processo (SIGTERM)
kill -9 PID                      # Forçar encerramento (SIGKILL)
kill -15 PID                     # Término gracioso
pkill -f "java.*MyApp"           # Matar por padrão
killall java                     # Matar por nome
nohup comando &                  # Executar em background
jobs                             # Listar jobs
fg %1                            # Trazer para foreground
bg %1                            # Enviar para background

# ==================== SISTEMA ====================

df -h                            # Uso de disco
df -i                            # Uso de inodes
du -sh pasta/                    # Tamanho de pasta
du -sh * | sort -h               # Tamanho ordenado
du -h --max-depth=1              # Tamanho por subdiretório
free -h                          # Memória RAM
uptime                           # Tempo ligado e carga
uname -a                         # Info do sistema
lsb_release -a                   # Versão da distro
hostname                         # Nome do host
cat /proc/cpuinfo                # Info CPU
cat /proc/meminfo                # Info memória
lscpu                            # Info CPU resumido
lsblk                            # Dispositivos de bloco

# ==================== REDE ====================

curl http://api.example.com      # GET request
curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' URL
curl -o arquivo.zip URL          # Download com nome
curl -O URL                      # Download mantendo nome
curl -I URL                      # Apenas headers
curl -s URL | jq '.'             # Parsear JSON
curl -u user:pass URL            # Autenticação básica

wget URL                         # Download
wget -O nome.zip URL             # Download com nome
wget -c URL                      # Continuar download
wget -r -l 2 URL                 # Download recursivo

ping host.com                    # Testar conectividade
ping -c 4 host.com               # 4 pacotes
traceroute host.com              # Traçar rota
nslookup domain.com              # Resolver DNS
dig domain.com                   # DNS detalhado
host domain.com                  # DNS simples

netstat -tlnp                    # Portas em uso (TCP)
netstat -ulnp                    # Portas UDP
ss -tlnp                         # Alternativa moderna
lsof -i :8080                    # Quem usa porta 8080
nc -zv host 80                   # Testar porta
ip addr                          # Endereços IP
ip route                         # Tabela de roteamento
ifconfig                         # Info de interface (deprecated)

# ==================== PERMISSÕES ====================

chmod 755 script.sh              # rwxr-xr-x
chmod +x script.sh               # Adicionar execução
chmod -x script.sh               # Remover execução
chmod -R 644 pasta/              # Recursivo
chmod u+x,g+r,o-w arquivo        # Específico

# Permissões numéricas:
# 4 = read (r)
# 2 = write (w)
# 1 = execute (x)
# 755 = rwxr-xr-x (owner: all, group/others: read+execute)
# 644 = rw-r--r-- (owner: read+write, others: read only)

chown user:group arquivo         # Mudar dono
chown -R user:group pasta/       # Recursivo
chgrp grupo arquivo              # Mudar grupo

# ==================== COMPRESSÃO ====================

tar -czvf arquivo.tar.gz pasta/  # Criar tar.gz
tar -xzvf arquivo.tar.gz         # Extrair tar.gz
tar -xzvf arquivo.tar.gz -C /destino/  # Extrair em diretório
tar -cjvf arquivo.tar.bz2 pasta/ # Criar tar.bz2
tar -xjvf arquivo.tar.bz2        # Extrair tar.bz2
tar -tf arquivo.tar.gz           # Listar conteúdo

gzip arquivo.txt                 # Compactar (.gz)
gunzip arquivo.txt.gz            # Descompactar
zcat arquivo.txt.gz              # Ver sem descompactar

zip -r arquivo.zip pasta/        # Criar ZIP
unzip arquivo.zip                # Extrair ZIP
unzip -l arquivo.zip             # Listar conteúdo

# ==================== TEXTO E PIPES ====================

sort arquivo.txt                 # Ordenar linhas
sort -r arquivo.txt              # Ordem reversa
sort -n arquivo.txt              # Numérico
sort -u arquivo.txt              # Unique
uniq arquivo.txt                 # Remover duplicatas consecutivas
wc arquivo.txt                   # Contar linhas, palavras, bytes
wc -l arquivo.txt                # Apenas linhas
cut -d',' -f1,3 arquivo.csv      # Cortar colunas
cut -c1-10 arquivo.txt           # Cortar caracteres

awk '{print $1}' arquivo         # Primeira coluna
awk -F',' '{print $2}' arquivo   # Delimitador específico
awk '{sum+=$1} END {print sum}'  # Somar valores

sed 's/antigo/novo/g' arquivo    # Substituir texto
sed -i 's/antigo/novo/g' arquivo # Substituir no arquivo
sed -n '10,20p' arquivo          # Linhas 10 a 20
sed '/pattern/d' arquivo         # Deletar linhas

# Redireção
comando > arquivo.txt            # Sobrescrever
comando >> arquivo.txt           # Append
comando 2>&1                     # Stderr para stdout
comando > /dev/null 2>&1         # Descartar tudo
comando 2> erro.txt              # Apenas erros

# Pipes
cat arquivo | sort | uniq        # Encadear
command1 | tee arquivo | command2  # Tee: salvar e continuar

# ==================== SSH E TRANSFERÊNCIA ====================

ssh user@host                    # Conectar
ssh -p 2222 user@host            # Porta específica
ssh -i ~/.ssh/key.pem user@host  # Com chave privada
ssh user@host 'comando'          # Executar comando remoto

scp arquivo.txt user@host:/path/ # Copiar para remoto
scp user@host:/path/arquivo.txt . # Copiar de remoto
scp -r pasta/ user@host:/path/   # Copiar pasta

rsync -avz pasta/ user@host:/path/  # Sincronizar
rsync -avz --delete pasta/ user@host:/path/  # Com delete

# ==================== VARIÁVEIS DE AMBIENTE ====================

echo \$PATH                       # Ver PATH
export VAR=value                 # Definir variável
env                              # Listar variáveis
printenv                         # Listar variáveis
source ~/.bashrc                 # Recarregar bashrc`;

const dockerCommands = `# ==================== DOCKER - DICIONÁRIO DE COMANDOS ====================
# Plataforma de containerização
# Documentação: https://docs.docker.com/

# ==================== INFORMAÇÕES E VERSÃO ====================

docker version                   # Versão do Docker
docker info                      # Informações do sistema
docker system df                 # Uso de disco
docker system events             # Eventos em tempo real

# ==================== IMAGENS ====================

docker images                    # Listar imagens
docker images -a                 # Incluindo intermediárias
docker image ls                  # Alias
docker images -q                 # Apenas IDs

docker pull nginx                # Baixar imagem
docker pull nginx:1.25           # Versão específica
docker pull --platform linux/amd64 nginx  # Plataforma específica

docker build -t myapp:1.0 .      # Build de imagem
docker build -t myapp:1.0 -f Dockerfile.dev .  # Dockerfile específico
docker build --no-cache -t myapp:1.0 .  # Sem cache
docker build --build-arg VERSION=1.0 -t myapp .  # Build args
docker build --target production -t myapp .  # Multi-stage target

docker push myregistry/myapp:1.0 # Push para registry
docker tag myapp:1.0 myregistry/myapp:1.0  # Tag para registry
docker login                     # Login no Docker Hub
docker login myregistry.com      # Login em registry privado

docker rmi nginx                 # Remover imagem
docker rmi -f nginx              # Forçar remoção
docker image prune               # Remover não utilizadas
docker image prune -a            # Remover todas não utilizadas

docker save -o myapp.tar myapp:1.0  # Exportar imagem
docker load -i myapp.tar         # Importar imagem

docker history myapp:1.0         # Histórico de camadas
docker inspect nginx             # Detalhes da imagem

# ==================== CONTAINERS ====================

docker run nginx                 # Executar container
docker run -d nginx              # Background (detached)
docker run -it ubuntu bash       # Interativo com terminal
docker run --name mycontainer nginx  # Nome personalizado
docker run -p 8080:80 nginx      # Mapear porta (host:container)
docker run -P nginx              # Mapear portas expostas automaticamente
docker run -v /host:/container nginx  # Montar volume
docker run -v myvolume:/data nginx  # Volume nomeado
docker run --rm nginx            # Remover ao parar
docker run -e VAR=value nginx    # Variável de ambiente
docker run --env-file .env nginx # Arquivo de variáveis
docker run --network mynetwork nginx  # Usar rede específica
docker run --restart always nginx  # Política de restart
docker run --memory 512m --cpus 0.5 nginx  # Limitar recursos
docker run --user 1000:1000 nginx  # Usuário específico
docker run --read-only nginx     # Filesystem read-only
docker run --privileged nginx    # Modo privilegiado

docker ps                        # Containers em execução
docker ps -a                     # Todos os containers
docker ps -q                     # Apenas IDs
docker ps --format "table {{.Names}}\\t{{.Status}}"  # Formato customizado

docker start container           # Iniciar container
docker stop container            # Parar container (SIGTERM)
docker stop -t 30 container      # Timeout de 30s
docker kill container            # Matar container (SIGKILL)
docker restart container         # Reiniciar
docker pause container           # Pausar
docker unpause container         # Despausar

docker rm container              # Remover container
docker rm -f container           # Forçar remoção
docker rm -v container           # Remover com volumes anônimos
docker container prune           # Remover parados

docker logs container            # Ver logs
docker logs -f container         # Seguir logs (tail -f)
docker logs --tail 100 container # Últimas 100 linhas
docker logs --since 1h container # Última hora
docker logs -t container         # Com timestamps

docker exec -it container bash   # Executar comando
docker exec container ls         # Comando não-interativo
docker exec -u root container bash  # Como root

docker attach container          # Anexar ao processo principal
docker top container             # Processos do container
docker stats                     # Estatísticas em tempo real
docker stats --no-stream         # Estatísticas uma vez

docker cp container:/path/file . # Copiar do container
docker cp file container:/path/  # Copiar para container

docker inspect container         # Detalhes do container
docker inspect --format '{{.NetworkSettings.IPAddress}}' container

docker diff container            # Mudanças no filesystem
docker commit container newimage:tag  # Criar imagem de container
docker export container > container.tar  # Exportar filesystem
docker import container.tar      # Importar como imagem

docker rename oldname newname    # Renomear container
docker update --memory 1g container  # Atualizar recursos

# ==================== VOLUMES ====================

docker volume ls                 # Listar volumes
docker volume create myvolume    # Criar volume
docker volume inspect myvolume   # Detalhes do volume
docker volume rm myvolume        # Remover volume
docker volume prune              # Remover não utilizados

# ==================== NETWORKS ====================

docker network ls                # Listar redes
docker network create mynetwork  # Criar rede (bridge)
docker network create --driver overlay mynetwork  # Overlay (Swarm)
docker network inspect mynetwork # Detalhes da rede
docker network rm mynetwork      # Remover rede
docker network prune             # Remover não utilizadas

docker network connect mynetwork container  # Conectar container
docker network disconnect mynetwork container  # Desconectar

# ==================== DOCKER COMPOSE ====================

docker compose up                # Subir serviços
docker compose up -d             # Background
docker compose up --build        # Rebuild imagens
docker compose up service1       # Serviço específico
docker compose up --scale web=3  # Múltiplas instâncias

docker compose down              # Parar e remover
docker compose down -v           # Com volumes
docker compose down --rmi all    # Com imagens

docker compose ps                # Status dos serviços
docker compose logs              # Ver logs
docker compose logs -f service   # Seguir logs de serviço

docker compose exec service bash # Executar comando
docker compose run service cmd   # Rodar comando em novo container

docker compose build             # Build imagens
docker compose pull              # Pull imagens

docker compose config            # Validar e mostrar config
docker compose --env-file .env.prod up  # Arquivo de ambiente

# ==================== LIMPEZA ====================

docker system prune              # Limpar tudo não utilizado
docker system prune -a           # Incluindo imagens
docker system prune --volumes    # Incluindo volumes

docker image prune               # Limpar imagens dangling
docker container prune           # Limpar containers parados
docker volume prune              # Limpar volumes órfãos
docker network prune             # Limpar redes não utilizadas

# ==================== MULTI-STAGE BUILD ====================

# Exemplo de Dockerfile multi-stage:
# FROM maven:3.9-eclipse-temurin-17 AS builder
# WORKDIR /app
# COPY pom.xml .
# RUN mvn dependency:go-offline
# COPY src ./src
# RUN mvn package -DskipTests
#
# FROM eclipse-temurin:17-jre-alpine
# COPY --from=builder /app/target/*.jar app.jar
# EXPOSE 8080
# ENTRYPOINT ["java", "-jar", "app.jar"]

# ==================== HEALTH CHECK ====================

# docker run --health-cmd="curl -f http://localhost:8080/health" \\
#            --health-interval=30s \\
#            --health-timeout=10s \\
#            --health-retries=3 \\
#            myapp

# ==================== BUILDKIT ====================

DOCKER_BUILDKIT=1 docker build . # Usar BuildKit
docker buildx build --platform linux/amd64,linux/arm64 -t myapp .

# ==================== TROUBLESHOOTING ====================

docker logs container 2>&1 | less    # Paginar logs
docker inspect --format='{{json .State}}' container | jq
docker events --filter 'container=name'  # Eventos específicos`;

const weblogicCommands = `# ==================== WEBLOGIC - DICIONÁRIO DE COMANDOS ====================
# Oracle WebLogic Server - Application Server Enterprise
# Documentação: https://docs.oracle.com/en/middleware/standalone/weblogic-server/

# ==================== ESTRUTURA DE DIRETÓRIOS ====================

# $ORACLE_HOME         - Instalação do WebLogic (ex: /u01/oracle/wls14)
# $MW_HOME             - Middleware Home (pode ser igual ao ORACLE_HOME)
# $WL_HOME             - WebLogic Home ($ORACLE_HOME/wlserver)
# $DOMAIN_HOME         - Domínio (ex: /u01/oracle/domains/mydomain)
# $DOMAIN_HOME/servers - Diretórios dos servidores
# $DOMAIN_HOME/config  - Configurações do domínio
# $DOMAIN_HOME/logs    - Logs do domínio

# ==================== VARIÁVEIS DE AMBIENTE ====================

# Configurar ambiente
. $DOMAIN_HOME/bin/setDomainEnv.sh
. $WL_HOME/server/bin/setWLSEnv.sh

# Variáveis importantes:
# JAVA_HOME=/u01/java/jdk17
# ORACLE_HOME=/u01/oracle/wls14
# WL_HOME=$ORACLE_HOME/wlserver
# DOMAIN_HOME=/u01/oracle/domains/mydomain

# ==================== INICIALIZAÇÃO DO ADMIN SERVER ====================

# Iniciar Admin Server (foreground)
cd $DOMAIN_HOME
./startWebLogic.sh

# Iniciar Admin Server (background)
nohup ./startWebLogic.sh > /dev/null 2>&1 &

# Iniciar com script mais robusto
nohup $DOMAIN_HOME/bin/startWebLogic.sh > $DOMAIN_HOME/logs/AdminServer.out 2>&1 &

# Parar Admin Server
$DOMAIN_HOME/bin/stopWebLogic.sh

# Com credenciais
$DOMAIN_HOME/bin/stopWebLogic.sh weblogic password123 t3://localhost:7001

# ==================== INICIALIZAÇÃO DE MANAGED SERVERS ====================

# Iniciar Managed Server
cd $DOMAIN_HOME/bin
./startManagedWebLogic.sh ManagedServer1 http://admin-host:7001

# Iniciar em background
nohup ./startManagedWebLogic.sh ManagedServer1 t3://admin-host:7001 > /dev/null 2>&1 &

# Parar Managed Server
./stopManagedWebLogic.sh ManagedServer1 t3://admin-host:7001 weblogic password123

# ==================== NODE MANAGER ====================

# Iniciar Node Manager
cd $WL_HOME/server/bin
./startNodeManager.sh

# Ou usando o domínio
cd $DOMAIN_HOME/bin
./startNodeManager.sh

# Parar Node Manager
./stopNodeManager.sh

# Configuração: $DOMAIN_HOME/nodemanager/nodemanager.properties
# ListenAddress=localhost
# ListenPort=5556
# SecureListener=true

# ==================== WLST (WebLogic Scripting Tool) ====================

# Iniciar WLST interativo
$WL_HOME/common/bin/wlst.sh

# Executar script WLST
$WL_HOME/common/bin/wlst.sh myscript.py

# WLST - Conectar ao servidor
# wlst> connect('weblogic', 'password', 't3://localhost:7001')

# WLST - Comandos básicos
# wlst> serverConfig()           # Ir para árvore de configuração
# wlst> serverRuntime()          # Ir para árvore de runtime
# wlst> domainRuntime()          # Ir para runtime do domínio
# wlst> edit()                   # Modo de edição
# wlst> startEdit()              # Iniciar sessão de edição
# wlst> save()                   # Salvar alterações
# wlst> activate()               # Ativar alterações
# wlst> cancelEdit()             # Cancelar edição
# wlst> undo()                   # Desfazer alteração

# WLST - Navegação
# wlst> ls()                     # Listar conteúdo atual
# wlst> cd('Servers')            # Navegar
# wlst> cd('ManagedServer1')     # Entrar no servidor
# wlst> pwd()                    # Diretório atual
# wlst> get('ListenPort')        # Obter atributo
# wlst> set('ListenPort', 8001)  # Definir atributo

# WLST - Gerenciamento de servidores
# wlst> start('ManagedServer1', 'Server')
# wlst> shutdown('ManagedServer1', 'Server')
# wlst> suspend('ManagedServer1', 'Server')
# wlst> resume('ManagedServer1', 'Server')
# wlst> state('ManagedServer1', 'Server')

# WLST - Deploy/Undeploy
# wlst> deploy('myapp', '/path/to/myapp.ear', targets='ManagedServer1')
# wlst> undeploy('myapp')
# wlst> redeploy('myapp')
# wlst> startApplication('myapp')
# wlst> stopApplication('myapp')

# ==================== DEPLOY VIA LINHA DE COMANDO ====================

# weblogic.Deployer
java weblogic.Deployer -adminurl t3://localhost:7001 \\
  -username weblogic -password password \\
  -deploy -name myapp -source /path/to/myapp.ear \\
  -targets ManagedServer1

# Undeploy
java weblogic.Deployer -adminurl t3://localhost:7001 \\
  -username weblogic -password password \\
  -undeploy -name myapp

# Redeploy
java weblogic.Deployer -adminurl t3://localhost:7001 \\
  -username weblogic -password password \\
  -redeploy -name myapp -source /path/to/myapp.ear

# Status
java weblogic.Deployer -adminurl t3://localhost:7001 \\
  -username weblogic -password password \\
  -listapps

# ==================== LOGS ====================

# Logs principais
tail -f $DOMAIN_HOME/servers/AdminServer/logs/AdminServer.log
tail -f $DOMAIN_HOME/servers/ManagedServer1/logs/ManagedServer1.log

# Logs de acesso HTTP
tail -f $DOMAIN_HOME/servers/AdminServer/logs/access.log

# Logs do domínio
tail -f $DOMAIN_HOME/servers/AdminServer/logs/mydomain.log

# Logs do Node Manager
tail -f $DOMAIN_HOME/nodemanager/nodemanager.log

# Rotação de logs (via WLST)
# serverConfig()
# cd('/Servers/AdminServer/Log/AdminServer')
# set('RotationType', 'byTime')
# set('FileTimeSpan', 24)
# set('NumberOfFilesLimited', true)
# set('FileCount', 10)

# ==================== MONITORAMENTO ====================

# Thread Dump
kill -3 <PID_DO_SERVIDOR>

# Ou via WLST
# threadDump('ManagedServer1', 'Server')

# Heap Dump
jmap -dump:format=b,file=heap.hprof <PID>

# Verificar processos WebLogic
ps -ef | grep weblogic
ps -ef | grep java | grep -i wlserver

# Verificar portas
netstat -tlnp | grep 7001
lsof -i :7001

# ==================== CRIAÇÃO DE DOMÍNIO ====================

# Via Template
$WL_HOME/common/bin/wlst.sh

# WLST Script para criar domínio:
# readTemplate('$WL_HOME/common/templates/wls/wls.jar')
# cd('/Security/base_domain/User/weblogic')
# cmo.setPassword('password123')
# setOption('ServerStartMode', 'prod')
# writeDomain('/u01/oracle/domains/mydomain')
# closeTemplate()

# Via GUI (gráfico)
$WL_HOME/common/bin/config.sh

# ==================== DATA SOURCES (WLST) ====================

# Criar DataSource
# edit()
# startEdit()
# cd('/')
# cmo.createJDBCSystemResource('MyDataSource')
# cd('/JDBCSystemResources/MyDataSource/JDBCResource/MyDataSource')
# cmo.setName('MyDataSource')
# cd('/JDBCSystemResources/MyDataSource/JDBCResource/MyDataSource/JDBCDriverParams/MyDataSource')
# cmo.setUrl('jdbc:oracle:thin:@localhost:1521:XE')
# cmo.setDriverName('oracle.jdbc.OracleDriver')
# cmo.setPassword('password')
# cd('Properties/MyDataSource')
# cmo.createProperty('user')
# cd('Properties/MyDataSource/Properties/user')
# cmo.setValue('myuser')
# save()
# activate()

# ==================== JMS CONFIGURATION ====================

# Listar JMS Servers (WLST)
# domainRuntime()
# cd('/ServerRuntimes/ManagedServer1/JMSRuntime/ManagedServer1.jms')
# ls()

# Monitorar filas
# cd('JMSServers/MyJMSServer/Destinations/MyQueue')
# cmo.getMessagesCurrentCount()
# cmo.getMessagesPendingCount()

# ==================== PACK/UNPACK DOMAIN ====================

# Empacotar domínio (para distribuição)
$WL_HOME/common/bin/pack.sh \\
  -domain=$DOMAIN_HOME \\
  -template=/tmp/mydomain.jar \\
  -template_name="My Domain" \\
  -managed=true

# Desempacotar em outro servidor
$WL_HOME/common/bin/unpack.sh \\
  -domain=/u01/oracle/domains/mydomain \\
  -template=/tmp/mydomain.jar

# ==================== SEGURANÇA ====================

# Criar boot.properties (evitar digitar senha)
mkdir -p $DOMAIN_HOME/servers/AdminServer/security
echo "username=weblogic" > $DOMAIN_HOME/servers/AdminServer/security/boot.properties
echo "password=password123" >> $DOMAIN_HOME/servers/AdminServer/security/boot.properties
chmod 600 $DOMAIN_HOME/servers/AdminServer/security/boot.properties

# Alterar senha via WLST
# connect('weblogic', 'oldpass', 't3://localhost:7001')
# cd('/SecurityConfiguration/mydomain/Realms/myrealm/AuthenticationProviders/DefaultAuthenticator')
# cmo.changeUserPassword('weblogic', 'oldpass', 'newpass')

# ==================== PATCHES E ATUALIZAÇÕES ====================

# OPatch - Listar patches aplicados
$ORACLE_HOME/OPatch/opatch lspatches

# Aplicar patch
cd <PATCH_DIR>
$ORACLE_HOME/OPatch/opatch apply

# Rollback patch
$ORACLE_HOME/OPatch/opatch rollback -id <PATCH_ID>

# ==================== TROUBLESHOOTING ====================

# Verificar versão
java weblogic.version

# Testar conexão T3
java weblogic.Admin -url t3://localhost:7001 -username weblogic -password pass PING

# Verificar estado do servidor
java weblogic.Admin -url t3://localhost:7001 -username weblogic -password pass GETSTATE

# Verificar configuração
$WL_HOME/common/bin/wlst.sh
# connect('weblogic', 'password', 't3://localhost:7001')
# state('AdminServer')

# Forçar shutdown (stuck threads)
java weblogic.Admin -url t3://localhost:7001 \\
  -username weblogic -password password \\
  FORCESHUTDOWN ManagedServer1`;

const categories = [
  {
    id: "maven",
    title: "Maven",
    badge: "Java Build",
    color: "terminal-orange",
    examples: [
      { title: "Dicionário Completo Maven", code: mavenCommands, filename: "maven-commands.sh" },
    ]
  },
  {
    id: "npm",
    title: "npm",
    badge: "Node.js",
    color: "primary",
    examples: [
      { title: "Dicionário Completo npm", code: npmCommands, filename: "npm-commands.sh" },
    ]
  },
  {
    id: "git",
    title: "Git",
    badge: "VCS",
    color: "terminal-orange",
    examples: [
      { title: "Dicionário Completo Git", code: gitCommands, filename: "git-commands.sh" },
    ]
  },
  {
    id: "conventional",
    title: "Conventional Commits",
    badge: "Padrões",
    color: "terminal-cyan",
    examples: [
      { title: "Prefixos e Exemplos", code: conventionalCommits, filename: "conventional-commits.md" },
    ]
  },
  {
    id: "svn",
    title: "Subversion (SVN)",
    badge: "Legacy VCS",
    color: "terminal-yellow",
    examples: [
      { title: "Dicionário Completo SVN", code: svnCommands, filename: "svn-commands.sh" },
    ]
  },
  {
    id: "linux",
    title: "Linux",
    badge: "Sistema",
    color: "terminal-purple",
    examples: [
      { title: "Dicionário Completo Linux", code: linuxCommands, filename: "linux-commands.sh" },
    ]
  },
  {
    id: "docker",
    title: "Docker",
    badge: "Containers",
    color: "terminal-cyan",
    examples: [
      { title: "Dicionário Completo Docker", code: dockerCommands, filename: "docker-commands.sh" },
    ]
  },
  {
    id: "weblogic",
    title: "WebLogic",
    badge: "App Server",
    color: "accent",
    examples: [
      { title: "Dicionário Completo WebLogic", code: weblogicCommands, filename: "weblogic-commands.sh" },
    ]
  },
];

const CommandsReference = () => {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Dicionários completos de comandos estilo livros de referência. Clique para expandir cada categoria.
        </p>
      </div>
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border-border">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={`bg-[hsl(var(--${category.color}))]/10 text-[hsl(var(--${category.color}))] border-[hsl(var(--${category.color}))]/30`}>
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
                    defaultExpanded={false}
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

export default CommandsReference;
