TRACKS.push({
  id: 'git', order: 1, level: 1, icon: '🌿', color: '#f05133', title: 'Git & GitHub',
  desc: 'Versionamento, fluxo de Pull Request, proteção de branch e segurança do repositório.',
  long: 'Git é a base de qualquer time de tecnologia moderno. Aqui você entende o modelo mental (não só os comandos), aprende os fluxos de trabalho usados no mercado e configura o GitHub como plataforma de colaboração e segurança.',
  why: 'Tudo (CI/CD, IaC, GitOps) parte de um repositório Git.',
  prereq: 'Saber usar o terminal básico. Instale o Git e crie uma conta no GitHub.',
  refs: [doc('Pro Git (livro oficial, PT-BR)', 'https://git-scm.com/book/pt-br/v2'), doc('GitHub Skills — cursos interativos oficiais', 'https://skills.github.com/'), doc('Documentação do GitHub', 'https://docs.github.com/pt')],
  lessons: [
    {
      slug: 'modelo', title: 'Git por dentro: o modelo mental', level: 1, min: 20, kw: 'commit branch staging merge rebase',
      goals: ['Explicar as 4 áreas do Git (working dir, staging, repositório local, remoto)', 'Entender commit como "foto" (snapshot) e branch como ponteiro', 'Executar o ciclo init → add → commit → push com confiança'],
      blocks: [
        { t: 'p', x: 'Git é um sistema de controle de versão <b>distribuído</b>: cada pessoa tem o histórico completo no próprio computador. Ele guarda <b>snapshots</b> do projeto (commits) ligados em um grafo — não "diferenças de arquivos" como sistemas antigos.' },
        { t: 'flow', title: 'O caminho de uma alteração', steps: [
          { n: 'Working dir', s: 'seus arquivos', d: 'É a pasta do projeto, onde você edita. Arquivos aqui podem estar <b>modificados</b> mas ainda não selecionados para o próximo commit.' },
          { n: 'Staging (index)', s: 'git add', d: '<code>git add</code> escolhe <i>exatamente</i> o que entrará no próximo commit. Isso permite commits pequenos e focados mesmo com muitas mudanças no disco.' },
          { n: 'Repo local', s: 'git commit', d: '<code>git commit</code> grava um snapshot permanente com autor, data, mensagem e ponteiro para o commit anterior (pai).' },
          { n: 'Remoto', s: 'git push', d: '<code>git push</code> envia seus commits ao servidor (GitHub). <code>git fetch</code>/<code>git pull</code> trazem os commits dos outros.' }
        ] },
        { t: 'nest', title: 'Branches são apenas ponteiros para commits', tree: { n: 'Repositório', k: 's', c: [
          { n: 'main', s: 'ponteiro → C3', k: 'g', c: [{ n: 'C1' }, { n: 'C2' }, { n: 'C3' }] },
          { n: 'feature/login', s: 'ponteiro → C5', k: 'b', c: [{ n: 'C4 (pai: C2)' }, { n: 'C5' }] },
          { n: 'HEAD', s: 'onde você está agora', k: 'o' }
        ] }, cap: 'Criar uma branch é instantâneo e barato: Git só cria um novo ponteiro.' },
        { t: 'code', lang: 'bash', file: 'terminal', x: R`
git init meu-projeto && cd meu-projeto
git config user.name  "Seu Nome"
git config user.email "voce@exemplo.com"

echo "# Meu projeto" > README.md
git status                  # o que mudou?
git add README.md           # coloca no staging
git commit -m "docs: adiciona README"

git log --oneline --graph --decorate --all   # veja o grafo
git switch -c feature/login                  # cria e troca de branch
git remote add origin git@github.com:SEU_USUARIO/meu-projeto.git
git push -u origin feature/login
` },
        { t: 'callout', k: 'tip', x: '<b>Desfazer sem pânico:</b> <code>git restore &lt;arquivo&gt;</code> descarta alterações do disco; <code>git restore --staged &lt;arquivo&gt;</code> tira do staging; <code>git revert &lt;commit&gt;</code> cria um commit que desfaz outro (seguro em branch compartilhada). Evite <code>git reset --hard</code> e <code>push --force</code> em branches compartilhadas.' },
        { t: 'lab', title: 'Seu primeiro repositório', steps: ['Crie um repositório no GitHub e clone com SSH ou HTTPS', 'Crie uma branch, faça 3 commits pequenos com mensagens claras', 'Rode <code>git log --oneline --graph --all</code> e identifique HEAD e os ponteiros de branch', 'Faça push e abra o repositório no navegador'] }
      ],
      quiz: { q: 'O que o comando <code>git add</code> faz?', o: ['Envia o código ao GitHub', 'Seleciona alterações para entrarem no próximo commit (staging)', 'Cria uma nova branch', 'Apaga arquivos do histórico'], a: 1, w: '<code>git add</code> move alterações para a área de staging. O commit grava o que está no staging; o push envia commits ao remoto.' },
      refs: [doc('Pro Git — O que é Git?', 'https://git-scm.com/book/pt-br/v2/Come%C3%A7ando-O-que-%C3%A9-Git%3F'), doc('Referência de comandos Git', 'https://git-scm.com/docs'), yt('git explained for beginners branches commits')]
    },
    {
      slug: 'fluxo', title: 'Branches, Pull Requests e fluxos de trabalho', level: 1, min: 20, kw: 'github flow trunk based gitflow pull request merge squash',
      goals: ['Escolher entre GitHub Flow, Trunk-Based e Gitflow', 'Conduzir o ciclo de vida de um Pull Request', 'Diferenciar merge, squash e rebase'],
      blocks: [
        { t: 'p', x: 'Um <b>fluxo de trabalho</b> é o acordo do time sobre como o código chega à produção. Hoje, times de alta performance preferem fluxos <b>simples e de integração frequente</b> — branches curtas, PRs pequenos e deploy contínuo (as pesquisas DORA associam integração frequente a melhor desempenho de entrega).' },
        { t: 'flow', title: 'Ciclo de vida de um Pull Request (GitHub Flow)', steps: [
          { n: 'Branch', s: 'a partir da main', d: 'Crie uma branch curta e com nome descritivo: <code>feat/checkout-pix</code>, <code>fix/timeout-api</code>.' },
          { n: 'Commits', s: 'pequenos', d: 'Commits coesos, mensagens no padrão <b>Conventional Commits</b> (<code>feat:</code>, <code>fix:</code>, <code>docs:</code>…).' },
          { n: 'Pull Request', s: 'abrir cedo', d: 'Abra o PR (pode ser <i>Draft</i>) cedo. Descreva o <b>porquê</b>, como testar e anexe prints quando for visual.' },
          { n: 'CI + Review', s: 'automação + pessoas', d: 'Testes, lint e scanners rodam automaticamente (GitHub Actions). Pelo menos 1 revisor aprova. Revisão é diálogo, não julgamento.' },
          { n: 'Merge', s: 'squash/rebase/merge', d: 'Com checks verdes e aprovação, faça o merge. Branch é apagada automaticamente.' },
          { n: 'Deploy', s: 'contínuo', d: 'A main está sempre "implantável": o merge dispara o pipeline de entrega.' }
        ] },
        { t: 'table', head: ['Fluxo', 'Como funciona', 'Quando usar'], rows: [
          ['<b>GitHub Flow</b>', 'main + branches curtas + PR. Deploy a partir da main.', 'Padrão para a maioria: apps web, APIs, SaaS.'],
          ['<b>Trunk-Based Development</b>', 'Todos integram na main (trunk) várias vezes ao dia; branches duram horas; feature flags escondem o incompleto.', 'Times maduros em CI/CD e testes automatizados. Ótimo para alta frequência de deploy.'],
          ['<b>Gitflow</b>', 'develop, release/*, hotfix/* + main. Mais cerimônia.', 'Software com versões instaláveis e várias versões em suporte (ex.: apps mobile/desktop, bibliotecas).']
        ] },
        { t: 'table', head: ['Estratégia de merge', 'Resultado no histórico', 'Use quando'], rows: [
          ['Merge commit', 'Preserva todos os commits + commit de merge', 'Quer rastrear exatamente como a branch evoluiu'],
          ['Squash and merge', 'Um único commit na main', 'PR com muitos commits "WIP" — histórico limpo (muito comum)'],
          ['Rebase and merge', 'Commits reaplicados linearmente', 'Quer histórico linear mantendo commits individuais']
        ] },
        { t: 'code', lang: 'bash', file: 'terminal', x: R`
git switch main && git pull --ff-only
git switch -c feat/busca-por-cpf
# ... edita, testa ...
git add -p                                   # revisa pedaço a pedaço
git commit -m "feat(api): permite buscar cliente por CPF"
git fetch origin && git rebase origin/main   # atualiza a branch com a main
git push -u origin feat/busca-por-cpf        # e abra o PR no GitHub
` },
        { t: 'callout', k: 'tip', x: '<b>Regra prática:</b> PRs pequenos (algumas centenas de linhas no máximo) são revisados mais rápido e com mais qualidade. Se o PR está enorme, quebre-o.' }
      ],
      quiz: { q: 'Qual prática define o Trunk-Based Development?', o: ['Manter uma branch develop por 3 meses', 'Integrar na branch principal com frequência, usando branches curtas e feature flags', 'Nunca usar Pull Requests', 'Fazer deploy apenas uma vez por trimestre'], a: 1, w: 'No Trunk-Based Development a integração é contínua: branches duram horas/poucos dias e funcionalidades incompletas ficam atrás de feature flags.' },
      refs: [doc('GitHub Flow (oficial)', 'https://docs.github.com/pt/get-started/using-github/github-flow'), doc('Trunk Based Development', 'https://trunkbaseddevelopment.com/'), doc('Conventional Commits', 'https://www.conventionalcommits.org/pt-br/v1.0.0/'), doc('Versionamento Semântico', 'https://semver.org/lang/pt-BR/'), vid('Canal oficial do GitHub no YouTube', 'https://www.youtube.com/@github', 'Tutoriais e novidades da plataforma')]
    },
    {
      slug: 'plataforma', title: 'GitHub como plataforma: proteção, revisão e segurança', level: 2, min: 25, kw: 'rulesets codeowners dependabot secret scanning codeql branch protection',
      goals: ['Proteger a branch principal com rulesets/branch protection', 'Automatizar revisão com CODEOWNERS', 'Ativar Dependabot, secret scanning e code scanning'],
      blocks: [
        { t: 'p', x: 'Repositório bem configurado impede acidentes e reduz risco de segurança <b>sem depender de disciplina individual</b>. Os recursos abaixo estão na documentação oficial do GitHub; alguns dependem do plano (repositórios públicos têm vários gratuitamente).' },
        { t: 'nest', title: 'Camadas de proteção de um repositório', tree: { n: 'Repositório GitHub', k: 's', c: [
          { n: 'Regras de merge', k: 'b', c: [{ n: 'Ruleset / Branch protection', s: 'PR obrigatório, checks, sem force-push' }, { n: 'CODEOWNERS', s: 'revisão por dono do código' }] },
          { n: 'Cadeia de suprimentos', k: 'o', c: [{ n: 'Dependabot', s: 'alertas + PRs de atualização' }, { n: 'Dependency review', s: 'bloqueia dependência vulnerável no PR' }] },
          { n: 'Código e segredos', k: 'r', c: [{ n: 'Secret scanning + push protection', s: 'impede vazar tokens' }, { n: 'Code scanning (CodeQL)', s: 'análise estática (SAST)' }] },
          { n: 'Automação', k: 'g', c: [{ n: 'GitHub Actions', s: 'CI/CD com permissões mínimas' }, { n: 'Environments', s: 'aprovação manual para produção' }] }
        ] } },
        { t: 'h', x: 'Exemplo: CODEOWNERS' },
        { t: 'code', lang: 'bash', file: '.github/CODEOWNERS', x: R`
# Dono padrão de tudo
*                      @minha-org/engenharia

# Infraestrutura exige revisão do time de plataforma
/infra/                @minha-org/plataforma
*.tf                   @minha-org/plataforma

# Pipelines só com aprovação de segurança
/.github/workflows/    @minha-org/seguranca
` },
        { t: 'h', x: 'Exemplo: Dependabot semanal' },
        { t: 'code', lang: 'yaml', file: '.github/dependabot.yml', x: R`
version: 2
updates:
  - package-ecosystem: "pip"
    directory: "/"
    schedule: { interval: "weekly" }
    open-pull-requests-limit: 5
  - package-ecosystem: "github-actions"   # mantém as Actions atualizadas
    directory: "/"
    schedule: { interval: "weekly" }
  - package-ecosystem: "docker"
    directory: "/"
    schedule: { interval: "weekly" }
` },
        { t: 'callout', k: 'warn', x: '<b>Segredo vazou?</b> Apagar o commit não basta: o token já foi exposto. <b>Revogue/rotacione</b> o segredo primeiro; depois limpe o histórico se necessário. Prefira credenciais efêmeras (OIDC) a tokens de longa duração.' },
        { t: 'lab', title: 'Blindando seu repositório', steps: ['Em Settings → Rules, crie um ruleset para a main: exigir PR, 1 aprovação e status checks', 'Adicione um arquivo CODEOWNERS', 'Ative Dependabot alerts/security updates e o secret scanning (push protection)', 'Adicione um <code>SECURITY.md</code> explicando como reportar vulnerabilidades'] }
      ],
      quiz: { q: 'Por que habilitar "push protection" do secret scanning?', o: ['Para acelerar o git push', 'Para bloquear o push que contém segredos (tokens, chaves) antes de eles chegarem ao repositório', 'Para criptografar o repositório', 'Para impedir forks'], a: 1, w: 'A push protection verifica o conteúdo no momento do push e bloqueia se detectar segredos conhecidos — prevenção é muito mais barata que rotação de credenciais.' },
      refs: [doc('Sobre rulesets', 'https://docs.github.com/pt/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets'), doc('Sobre CODEOWNERS', 'https://docs.github.com/pt/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners'), doc('Dependabot', 'https://docs.github.com/pt/code-security/dependabot'), doc('Segurança do código no GitHub', 'https://docs.github.com/pt/code-security')]
    }
  ]
});
