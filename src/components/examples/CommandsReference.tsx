import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";

const linuxCommands = `# Comandos Linux Essenciais para Desenvolvedores
# ==============================================

# ==================== NAVEGAÇÃO E ARQUIVOS ====================

# Navegação
pwd                          # Diretório atual
cd /path/to/dir              # Ir para diretório
cd ~                         # Ir para home
cd -                         # Voltar ao diretório anterior
cd ..                        # Subir um nível

# Listagem
ls                           # Listar arquivos
ls -la                       # Listar com detalhes e ocultos
ls -lh                       # Tamanhos legíveis
ls -lt                       # Ordenar por data
ls -lS                       # Ordenar por tamanho
tree -L 2                    # Árvore de diretórios (2 níveis)

# Manipulação de arquivos
cp arquivo.txt destino/      # Copiar arquivo
cp -r pasta/ destino/        # Copiar pasta recursivamente
mv arquivo.txt novo_nome.txt # Renomear/mover
rm arquivo.txt               # Remover arquivo
rm -rf pasta/                # Remover pasta (CUIDADO!)
mkdir -p path/to/new/dir     # Criar diretórios recursivamente
touch arquivo.txt            # Criar arquivo vazio

# ==================== VISUALIZAÇÃO E BUSCA ====================

# Visualizar conteúdo
cat arquivo.txt              # Ver todo o conteúdo
head -n 20 arquivo.txt       # Primeiras 20 linhas
tail -n 20 arquivo.txt       # Últimas 20 linhas
tail -f log.txt              # Seguir arquivo (logs)
less arquivo.txt             # Visualizar paginado (q sai)

# Busca
find . -name "*.java"        # Buscar por nome
find . -type f -mtime -7     # Arquivos modificados últimos 7 dias
find . -size +100M           # Arquivos maiores que 100MB
grep "texto" arquivo.txt     # Buscar texto em arquivo
grep -r "texto" .            # Buscar recursivamente
grep -rn "TODO" --include="*.java"  # Buscar com número da linha
locate arquivo.txt           # Busca rápida (usa índice)

# ==================== PROCESSOS E SISTEMA ====================

# Processos
ps aux                       # Listar todos os processos
ps aux | grep java           # Filtrar processos Java
top                          # Monitor de processos (q sai)
htop                         # Monitor melhorado
kill PID                     # Encerrar processo
kill -9 PID                  # Forçar encerramento
pkill -f "java.*MyApp"       # Matar por nome

# Sistema
df -h                        # Uso de disco
du -sh pasta/                # Tamanho de pasta
du -sh * | sort -h           # Tamanho ordenado
free -h                      # Uso de memória
uptime                       # Tempo ligado e carga
uname -a                     # Info do sistema

# ==================== REDE ====================

# Rede
curl -X GET http://localhost:8080/api  # Requisição HTTP
curl -X POST -H "Content-Type: application/json" -d '{"name":"test"}' http://localhost:8080/api
wget http://example.com/file.zip       # Download
netstat -tlnp                          # Portas em uso
ss -tlnp                               # Alternativa moderna
lsof -i :8080                          # Quem está na porta 8080
ping host.com                          # Testar conectividade
nslookup domain.com                    # Resolver DNS

# ==================== PERMISSÕES ====================

# Permissões
chmod 755 script.sh          # Dar permissão de execução
chmod +x script.sh           # Adicionar execução
chmod -R 644 pasta/          # Recursivo
chown user:group arquivo     # Mudar dono
chown -R user:group pasta/   # Recursivo

# ==================== COMPRESSÃO ====================

# Compressão
tar -czvf arquivo.tar.gz pasta/        # Compactar
tar -xzvf arquivo.tar.gz               # Descompactar
tar -xzvf arquivo.tar.gz -C destino/   # Descompactar para pasta
zip -r arquivo.zip pasta/              # Criar ZIP
unzip arquivo.zip                      # Descompactar ZIP

# ==================== TEXTO E PIPES ====================

# Pipes e redireção
comando > arquivo.txt        # Redirecionar saída (sobrescreve)
comando >> arquivo.txt       # Redirecionar saída (append)
comando 2>&1                 # Redirecionar erro para saída
comando1 | comando2          # Pipe
cat arquivo | sort | uniq    # Encadear comandos

# Manipulação de texto
sort arquivo.txt             # Ordenar linhas
uniq arquivo.txt             # Remover duplicatas consecutivas
sort arquivo.txt | uniq      # Ordenar e remover duplicatas
wc -l arquivo.txt            # Contar linhas
cut -d',' -f1 arquivo.csv    # Cortar colunas
awk '{print $1}' arquivo     # Imprimir primeira coluna
sed 's/antigo/novo/g' arquivo  # Substituir texto

# ==================== SSH E TRANSFERÊNCIA ====================

# SSH
ssh user@host                # Conectar
ssh -p 2222 user@host        # Porta específica
ssh -i ~/.ssh/key.pem user@host  # Com chave privada
scp arquivo.txt user@host:/path/  # Copiar para remoto
scp user@host:/path/arquivo.txt .  # Copiar de remoto
rsync -avz pasta/ user@host:/path/  # Sincronizar`;

const gitCommands = `# Comandos Git Completos
# =====================

# ==================== CONFIGURAÇÃO ====================

git config --global user.name "Seu Nome"
git config --global user.email "email@example.com"
git config --global core.editor "code --wait"
git config --global init.defaultBranch main
git config --list                     # Ver configurações

# ==================== BÁSICO ====================

git init                              # Inicializar repositório
git clone url                         # Clonar repositório
git clone --depth 1 url               # Clone raso (apenas último commit)
git status                            # Status atual
git status -s                         # Status resumido
git diff                              # Ver diferenças não staged
git diff --staged                     # Ver diferenças staged
git diff branch1..branch2             # Diferença entre branches

# ==================== STAGING E COMMITS ====================

git add arquivo.txt                   # Adicionar arquivo
git add .                             # Adicionar tudo
git add -p                            # Adicionar interativamente
git reset HEAD arquivo.txt            # Remover do staging
git commit -m "mensagem"              # Commit
git commit -am "mensagem"             # Add + Commit (arquivos tracked)
git commit --amend                    # Editar último commit
git commit --amend --no-edit          # Adicionar ao último commit

# ==================== BRANCHES ====================

git branch                            # Listar branches locais
git branch -a                         # Listar todas (incluindo remoto)
git branch feature/nova               # Criar branch
git branch -d feature/velha           # Deletar branch (merged)
git branch -D feature/velha           # Forçar delete
git checkout branch                   # Mudar para branch
git checkout -b feature/nova          # Criar e mudar
git switch branch                     # Mudar (Git 2.23+)
git switch -c feature/nova            # Criar e mudar (Git 2.23+)

# ==================== MERGE E REBASE ====================

git merge feature/branch              # Merge branch
git merge --no-ff feature/branch      # Merge com commit de merge
git rebase main                       # Rebase na main
git rebase -i HEAD~3                  # Rebase interativo (últimos 3)
git rebase --abort                    # Cancelar rebase
git cherry-pick abc123                # Aplicar commit específico

# ==================== REMOTO ====================

git remote -v                         # Ver remotes
git remote add origin url             # Adicionar remote
git fetch                             # Baixar alterações (sem merge)
git fetch --all                       # Fetch de todos remotes
git pull                              # Fetch + Merge
git pull --rebase                     # Fetch + Rebase
git push                              # Enviar para remoto
git push -u origin branch             # Push e setar upstream
git push --force-with-lease           # Force push seguro
git push origin --delete branch       # Deletar branch remota

# ==================== HISTÓRICO ====================

git log                               # Ver histórico
git log --oneline                     # Histórico resumido
git log --graph --oneline --all       # Gráfico de branches
git log -p arquivo.txt                # Histórico de um arquivo
git log --author="Nome"               # Commits de um autor
git log --since="2024-01-01"          # Commits desde data
git blame arquivo.txt                 # Quem alterou cada linha
git show abc123                       # Ver commit específico

# ==================== DESFAZER ====================

git checkout -- arquivo.txt           # Descartar alterações
git restore arquivo.txt               # Descartar (Git 2.23+)
git restore --staged arquivo.txt      # Unstage (Git 2.23+)
git reset --soft HEAD~1               # Desfazer commit (manter staged)
git reset --mixed HEAD~1              # Desfazer commit (manter working)
git reset --hard HEAD~1               # Desfazer commit (perder tudo!)
git revert abc123                     # Criar commit que reverte

# ==================== STASH ====================

git stash                             # Guardar alterações
git stash save "mensagem"             # Stash com mensagem
git stash list                        # Listar stashes
git stash pop                         # Aplicar e remover
git stash apply stash@{0}             # Aplicar sem remover
git stash drop stash@{0}              # Remover stash
git stash clear                       # Limpar todos stashes

# ==================== TAGS ====================

git tag                               # Listar tags
git tag v1.0.0                        # Criar tag leve
git tag -a v1.0.0 -m "Version 1.0.0"  # Tag anotada
git push origin v1.0.0                # Push de uma tag
git push origin --tags                # Push de todas tags

# ==================== LIMPEZA ====================

git clean -n                          # Preview de limpeza
git clean -fd                         # Remover untracked
git gc                                # Garbage collection
git prune                             # Remover objetos órfãos`;

const conventionalCommits = `# Conventional Commits - Padrões de Mensagens
# ============================================

# FORMATO: <tipo>[escopo opcional]: <descrição>
#
# [corpo opcional]
#
# [rodapé opcional]

# ==================== TIPOS PRINCIPAIS ====================

# feat: Nova funcionalidade para o usuário
feat: add user authentication with JWT
feat(auth): implement OAuth2 login with Google
feat(api): add pagination to list endpoints

# fix: Correção de bug que afeta o usuário
fix: resolve login redirect loop
fix(cart): correct total calculation with discounts
fix(api): handle null values in user response

# docs: Mudanças apenas em documentação
docs: update README with installation steps
docs(api): add OpenAPI specification
docs: fix typos in contributing guide

# style: Formatação, ponto-e-vírgula, etc (não afeta código)
style: format code with prettier
style(css): fix indentation in main.css
style: remove trailing whitespaces

# refactor: Refatoração que não adiciona feature nem corrige bug
refactor: extract validation logic to separate module
refactor(auth): simplify token refresh mechanism
refactor: rename variables for clarity

# perf: Mudança que melhora performance
perf: optimize database queries with indexes
perf(images): implement lazy loading
perf: cache API responses

# test: Adicionar ou corrigir testes
test: add unit tests for UserService
test(e2e): add login flow tests
test: increase coverage for utils module

# build: Mudanças no sistema de build ou dependências
build: upgrade to Node 20
build(deps): update react to v18
build: configure webpack for production

# ci: Mudanças em scripts/configuração de CI
ci: add GitHub Actions workflow
ci: configure automatic deployments
ci(docker): optimize multi-stage build

# chore: Tarefas de manutenção, configs, etc
chore: update .gitignore
chore: configure husky pre-commit hooks
chore(deps): update dev dependencies

# revert: Reverte um commit anterior
revert: revert "feat: add experimental feature"
revert: revert commit abc123

# ==================== EXEMPLOS COMPLETOS ====================

# Com escopo
feat(user-profile): add ability to upload avatar image

Implement avatar upload functionality with the following features:
- Accept jpg, png, gif formats up to 5MB
- Auto-resize to 200x200 thumbnail
- Store in S3 bucket

Closes #123

# Breaking change
feat(api)!: change response format for all endpoints

BREAKING CHANGE: All API responses now follow JSON:API specification.
Response structure changed from { data: ... } to { data: { type, id, attributes } }

Migration guide: https://docs.example.com/migration

# Múltiplos rodapés
fix(security): sanitize user input in search

Reviewed-by: John Doe
Refs: #456, #789
`;

const svnCommands = `# Comandos SVN (Subversion)
# =========================

# ==================== BÁSICO ====================

svn checkout URL path          # Checkout do repositório
svn checkout URL path --depth empty  # Checkout vazio
svn co URL path                # Alias para checkout

svn update                     # Atualizar working copy
svn update -r 123              # Atualizar para revisão específica
svn up                         # Alias

svn status                     # Status dos arquivos
svn status -u                  # Status com info do servidor
svn st                         # Alias

# ==================== MODIFICAÇÕES ====================

svn add arquivo.txt            # Adicionar arquivo
svn add pasta/ --force         # Adicionar pasta recursivamente
svn add * --force              # Adicionar tudo

svn delete arquivo.txt         # Marcar para remoção
svn del arquivo.txt            # Alias
svn rm arquivo.txt             # Alias

svn move antigo.txt novo.txt   # Renomear/mover
svn mv antigo.txt novo.txt     # Alias

svn copy arquivo.txt copia.txt # Copiar
svn cp arquivo.txt copia.txt   # Alias

svn revert arquivo.txt         # Desfazer alterações locais
svn revert -R pasta/           # Revert recursivo

# ==================== COMMIT ====================

svn commit -m "mensagem"       # Commit
svn ci -m "mensagem"           # Alias
svn commit -F mensagem.txt     # Commit com arquivo de mensagem

# ==================== DIFF E LOG ====================

svn diff                       # Ver diferenças
svn diff -r 100:HEAD           # Diff entre revisões
svn diff arquivo.txt           # Diff de arquivo específico

svn log                        # Histórico
svn log -v                     # Histórico detalhado
svn log -l 10                  # Últimas 10 revisões
svn log -r 100:200             # Range de revisões
svn log arquivo.txt            # Histórico de arquivo

svn blame arquivo.txt          # Quem alterou cada linha
svn annotate arquivo.txt       # Alias

# ==================== BRANCHES E TAGS ====================

# SVN usa convenção de pastas para branches/tags
# trunk/ - linha principal
# branches/ - branches de desenvolvimento
# tags/ - versões marcadas

# Criar branch
svn copy URL/trunk URL/branches/feature-x -m "Create feature branch"

# Criar tag
svn copy URL/trunk URL/tags/v1.0.0 -m "Tag version 1.0.0"

# Merge de branch
svn merge URL/branches/feature-x
svn merge -r 100:150 URL/branches/feature-x  # Range específico

# Switch de branch
svn switch URL/branches/feature-x

# ==================== INFO E PROPRIEDADES ====================

svn info                       # Info do working copy
svn info URL                   # Info de URL remota
svn list URL                   # Listar conteúdo de URL

svn propset svn:ignore "*.log" .  # Ignorar arquivos
svn propedit svn:ignore .         # Editar ignore
svn propget svn:ignore .          # Ver ignore

svn propset svn:keywords "Id Author Date Rev" arquivo.txt
# Habilita substituição de keywords

# ==================== CONFLITOS ====================

svn resolve --accept working arquivo.txt   # Aceitar versão local
svn resolve --accept theirs-full arquivo.txt  # Aceitar versão do servidor
svn resolved arquivo.txt       # Marcar como resolvido (antigo)

# ==================== LIMPEZA ====================

svn cleanup                    # Limpar locks e working copy
svn cleanup --remove-unversioned  # Remover não versionados

# ==================== COMPARAÇÃO SVN vs GIT ====================

# SVN             | GIT
# ================|================
# svn checkout    | git clone
# svn update      | git pull
# svn commit      | git commit + git push
# svn add         | git add
# svn revert      | git checkout -- / git restore
# svn diff        | git diff
# svn log         | git log
# svn blame       | git blame
# svn copy (branch) | git branch / git checkout -b
# svn merge       | git merge
# svn switch      | git checkout / git switch

# DIFERENÇAS IMPORTANTES:
# - SVN: commit envia direto para servidor
# - Git: commit local, push para servidor
# - SVN: revisões globais numéricas (r123)
# - Git: hashes SHA de commits
# - SVN: servidor centralizado obrigatório
# - Git: totalmente distribuído`;

const categories = [
  {
    id: "linux",
    title: "Linux Commands",
    badge: "Linux",
    examples: [
      { title: "Comandos Essenciais", code: linuxCommands, filename: "linux-commands.sh" },
    ]
  },
  {
    id: "git",
    title: "Git Commands",
    badge: "Git",
    examples: [
      { title: "Comandos Git Completos", code: gitCommands, filename: "git-commands.sh" },
    ]
  },
  {
    id: "conventional",
    title: "Conventional Commits",
    badge: "Padrões",
    examples: [
      { title: "Prefixos e Exemplos", code: conventionalCommits, filename: "conventional-commits.md" },
    ]
  },
  {
    id: "svn",
    title: "Subversion (SVN)",
    badge: "Legacy",
    examples: [
      { title: "Comandos SVN", code: svnCommands, filename: "svn-commands.sh" },
    ]
  },
];

const CommandsReference = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border-border">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-[hsl(var(--terminal-cyan))]/10 text-[hsl(var(--terminal-cyan))] border-[hsl(var(--terminal-cyan))]/30">
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

export default CommandsReference;
