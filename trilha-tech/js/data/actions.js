TRACKS.push({
  id: 'actions', order: 4, level: 3, icon: '⚙️', color: '#2088ff', title: 'GitHub Actions & Pipelines',
  desc: 'CI/CD como código: do primeiro workflow ao pipeline completo com build, scan e deploy seguro.',
  long: 'GitHub Actions automatiza build, teste e entrega direto no repositório. O foco aqui é construir pipelines <b>rápidos, seguros e reutilizáveis</b>, seguindo as práticas de hardening da documentação oficial.',
  why: 'Automatiza testes, build de imagem e deploy — a espinha dorsal da entrega contínua.',
  prereq: 'Trilhas Git & GitHub e Docker.',
  refs: [doc('Documentação do GitHub Actions', 'https://docs.github.com/pt/actions'), doc('Marketplace de Actions', 'https://github.com/marketplace?type=actions'), doc('Hardening de segurança para Actions', 'https://docs.github.com/pt/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions'), vid('Canal oficial do GitHub no YouTube', 'https://www.youtube.com/@github', 'Vídeos oficiais sobre Actions e Copilot')],
  lessons: [
    {
      slug: 'conceitos', title: 'Anatomia: eventos, workflows, jobs e steps', level: 1, min: 20, kw: 'workflow yaml runner event job step action',
      goals: ['Nomear as peças de um workflow e como se relacionam', 'Escrever um workflow mínimo que dispara em push e pull_request', 'Entender runners e execução paralela vs sequencial (needs)'],
      blocks: [
        { t: 'p', x: 'Um <b>workflow</b> é um arquivo YAML em <code>.github/workflows/</code>. Ele é disparado por um <b>evento</b> (push, pull_request, schedule, workflow_dispatch…), contém um ou mais <b>jobs</b> que rodam em <b>runners</b> (máquinas), e cada job é uma sequência de <b>steps</b> — comandos (<code>run</code>) ou <b>actions</b> reutilizáveis (<code>uses</code>).' },
        { t: 'flow', title: 'Do evento à execução', steps: [
          { n: 'Evento', s: 'push / PR / cron', d: 'Algo acontece no repositório (ou um agendamento/manual) e o GitHub procura workflows com aquele gatilho (<code>on:</code>).' },
          { n: 'Workflow', s: 'arquivo .yml', d: 'Define nome, gatilhos, permissões, variáveis e os jobs.' },
          { n: 'Jobs', s: 'paralelos por padrão', d: 'Cada job roda numa máquina limpa. Para ordenar, use <code>needs: [outro-job]</code>.' },
          { n: 'Runner', s: 'ubuntu-latest…', d: 'VM hospedada pelo GitHub (Linux, Windows, macOS) ou <i>self-hosted</i> (sua infraestrutura).' },
          { n: 'Steps', s: 'run / uses', d: 'Executam em ordem dentro do job e compartilham o mesmo sistema de arquivos. Falhou um step → job falha.' }
        ] },
        { t: 'code', lang: 'yaml', file: '.github/workflows/ola.yml', x: R`
name: Olá Actions
on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:          # botão "Run workflow" manual

permissions:
  contents: read              # princípio do menor privilégio

jobs:
  saudacao:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4          # baixa o código
      - name: Mostrar contexto
        run: |
          echo "Evento: $\{{ github.event_name }}"
          echo "Branch: $\{{ github.ref_name }}"
          ls -la
` },
        { t: 'pipe', title: 'Dois jobs em sequência com needs', stages: [
          { n: 'job: test', jobs: [{ n: 'checkout', s: 'uses' }, { n: 'pytest', s: 'run' }] },
          { n: 'job: build (needs: test)', jobs: [{ n: 'docker build', s: 'run' }, { n: 'push GHCR', s: 'uses' }] }
        ], cap: 'Sem <code>needs</code>, os dois jobs começariam ao mesmo tempo.' },
        { t: 'callout', k: 'tip', x: '<b>Pin de versão:</b> <code>actions/checkout@v4</code> segue a major. Para máxima segurança em ações de terceiros, fixe pelo <b>SHA do commit</b> (e deixe o Dependabot atualizar). Confira no repositório da action qual é a major mais recente.' }
      ],
      quiz: { q: 'Como fazer o job "deploy" esperar o job "test" terminar com sucesso?', o: ['Colocando deploy depois de test no arquivo', 'Usando <code>needs: test</code> no job deploy', 'Usando <code>on: test</code>', 'Não é possível'], a: 1, w: 'Jobs rodam em paralelo por padrão; a ordem no arquivo não importa. <code>needs</code> cria a dependência.' },
      refs: [doc('Entendendo o GitHub Actions', 'https://docs.github.com/pt/actions/get-started/understand-github-actions'), doc('Sintaxe de workflow', 'https://docs.github.com/pt/actions/reference/workflows-and-actions/workflow-syntax'), yt('github actions tutorial workflow jobs steps')]
    },
    {
      slug: 'ci', title: 'CI rápido: testes, cache, matrix e artefatos', level: 2, min: 25, kw: 'ci pytest cache matrix artifact concurrency lint',
      goals: ['Montar um CI com lint + testes + cobertura', 'Usar cache de dependências e matrix de versões', 'Cancelar execuções obsoletas com concurrency'],
      blocks: [
        { t: 'p', x: 'CI (Integração Contínua) é rodar <b>build + testes + análises</b> a cada mudança. O objetivo é feedback rápido: se leva 30 minutos, ninguém espera — e os PRs acumulam. Metas práticas: PR validado em poucos minutos.' },
        { t: 'pipe', title: 'Pipeline de CI típico', stages: [
          { n: 'Checkout', jobs: ['actions/checkout'] }, { n: 'Setup', jobs: ['setup-python + cache'] },
          { n: 'Qualidade', jobs: ['ruff (lint)', 'mypy (tipos)'] }, { n: 'Testes', jobs: ['pytest + cobertura', 'matrix 3.11 / 3.12'] }, { n: 'Artefatos', jobs: ['relatório de cobertura'] }
        ] },
        { t: 'code', lang: 'yaml', file: '.github/workflows/ci.yml', x: R`
name: CI
on:
  pull_request:
  push: { branches: [main] }

concurrency:                       # novo push cancela a execução anterior da mesma branch
  group: ci-$\{{ github.workflow }}-$\{{ github.ref }}
  cancel-in-progress: true

permissions: { contents: read }

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    strategy:
      fail-fast: false
      matrix:
        python: ["3.11", "3.12"]
    services:
      postgres:                    # banco real para testes de integração
        image: postgres:17
        env: { POSTGRES_PASSWORD: test }
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U postgres" --health-interval 5s --health-retries 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: $\{{ matrix.python }}
          cache: pip                # cache automático de dependências
      - run: pip install -r requirements.txt -r requirements-dev.txt
      - run: ruff check .
      - run: pytest --cov=app --cov-report=xml
        env:
          DATABASE_URL: postgresql+psycopg://postgres:test@localhost:5432/postgres
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: coverage-$\{{ matrix.python }}, path: coverage.xml }
` },
        { t: 'table', head: ['Recurso', 'Para que serve'], rows: [
          ['<code>matrix</code>', 'Roda o mesmo job em várias combinações (versões de linguagem, SOs).'],
          ['<code>cache</code>', 'Reaproveita dependências entre execuções — grande ganho de tempo.'],
          ['<code>concurrency</code>', 'Evita execuções duplicadas/obsoletas; também protege deploys concorrentes.'],
          ['<code>services</code>', 'Sobe containers auxiliares (Postgres, Redis) durante o job.'],
          ['<code>upload-artifact</code>', 'Guarda relatórios, binários e logs para download/outros jobs.'],
          ['<code>timeout-minutes</code>', 'Evita jobs travados consumindo minutos.']
        ] },
        { t: 'lab', title: 'CI do seu projeto', steps: ['Crie <code>.github/workflows/ci.yml</code> com lint e testes', 'Abra um PR com um teste quebrando e veja o check vermelho bloquear o merge (com ruleset)', 'Corrija e observe o cache de dependências reduzindo o tempo', 'Adicione uma matrix com 2 versões da linguagem'] }
      ],
      quiz: { q: 'Para que serve <code>concurrency</code> com <code>cancel-in-progress: true</code>?', o: ['Rodar jobs mais rápido na CPU', 'Cancelar execuções antigas do mesmo grupo quando chega uma nova', 'Compartilhar variáveis entre jobs', 'Aumentar o limite de memória'], a: 1, w: 'Evita gastar minutos validando um commit que já foi substituído por outro push na mesma branch/PR.' },
      refs: [doc('Cache de dependências', 'https://docs.github.com/pt/actions/using-workflows/caching-dependencies-to-speed-up-workflows'), doc('Matrix strategy', 'https://docs.github.com/pt/actions/using-jobs/using-a-matrix-for-your-jobs'), doc('Containers de serviço', 'https://docs.github.com/pt/actions/using-containerized-services/about-service-containers')]
    },
    {
      slug: 'seguranca', title: 'Pipelines seguros: permissões, segredos e OIDC', level: 3, min: 30, kw: 'security oidc secrets permissions pull_request_target injection environment',
      goals: ['Aplicar menor privilégio ao GITHUB_TOKEN', 'Autenticar na nuvem com OIDC, sem chaves de longa duração', 'Evitar injeção de script e o uso perigoso de pull_request_target'],
      blocks: [
        { t: 'p', x: 'O pipeline tem acesso a segredos e à produção — por isso é alvo de ataques à <b>cadeia de suprimentos</b>. A documentação oficial de hardening resume o essencial abaixo.' },
        { t: 'nest', title: 'Defesa em profundidade no pipeline', tree: { n: 'Workflow', k: 's', c: [
          { n: 'Identidade', k: 'b', c: [{ n: 'permissions mínimas', s: 'contents: read por padrão' }, { n: 'OIDC → nuvem', s: 'token curto, sem secret estático' }] },
          { n: 'Entrada não confiável', k: 'r', c: [{ n: 'Evitar injeção', s: 'não interpolar títulos/branches no shell' }, { n: 'PRs de forks', s: 'sem acesso a segredos' }] },
          { n: 'Terceiros', k: 'o', c: [{ n: 'Pin por SHA', s: 'imutável' }, { n: 'Dependabot p/ Actions', s: 'atualiza o pin' }] },
          { n: 'Produção', k: 'g', c: [{ n: 'Environments', s: 'aprovação manual + segredos por ambiente' }] }
        ] } },
        { t: 'h', x: '1) Permissões mínimas' },
        { t: 'code', lang: 'yaml', file: 'workflow.yml', x: R`
permissions: { contents: read }          # padrão do workflow
jobs:
  publish:
    permissions:
      contents: read
      packages: write                    # só este job pode publicar imagem
      id-token: write                    # necessário para OIDC
` },
        { t: 'h', x: '2) OIDC: login na nuvem sem segredo estático (exemplo AWS)' },
        { t: 'code', lang: 'yaml', file: 'deploy.yml', x: R`
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/github-deploy   # confiança limitada ao repo/branch
    aws-region: sa-east-1
# O GitHub emite um JWT de curta duração; a nuvem troca por credenciais temporárias.
` },
        { t: 'h', x: '3) Injeção de script: o erro clássico' },
        { t: 'code', lang: 'yaml', file: 'ruim-vs-bom.yml', x: R`
# ❌ VULNERÁVEL: o título do PR é controlado por quem abre o PR
- run: echo "Título: $\{{ github.event.pull_request.title }}"

# ✅ Passe por variável de ambiente (o shell não interpreta como código)
- run: echo "Título: $TITULO"
  env:
    TITULO: $\{{ github.event.pull_request.title }}
` },
        { t: 'callout', k: 'bad', x: '<b>Cuidado com <code>pull_request_target</code>:</b> ele roda no contexto do repositório base <i>com acesso a segredos</i>. Nunca faça checkout e execute código do PR de um fork nesse evento.' },
        { t: 'callout', k: 'tip', x: 'Use <b>Environments</b> (ex.: <code>production</code>) com <i>required reviewers</i> e segredos próprios. O job de deploy só continua após a aprovação humana.' }
      ],
      quiz: { q: 'Qual a vantagem do OIDC frente a guardar uma chave de acesso da nuvem em Secrets?', o: ['É mais barato', 'Gera credenciais temporárias por execução; não há chave de longa duração para vazar', 'Dispensa permissões na nuvem', 'Funciona só em runners self-hosted'], a: 1, w: 'Com OIDC o workflow recebe um token de curta duração e a nuvem valida a identidade (repo/branch/ambiente). Não existe segredo estático para ser roubado.' },
      refs: [doc('Hardening de segurança para Actions', 'https://docs.github.com/pt/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions'), doc('OIDC no GitHub Actions', 'https://docs.github.com/pt/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect'), doc('Ambientes (Environments)', 'https://docs.github.com/pt/actions/deployment/targeting-different-environments/using-environments-for-deployment')]
    },
    {
      slug: 'cd', title: 'Pipeline completo: build, imagem, IaC e deploy', level: 3, min: 35, kw: 'cd ghcr docker build push reusable workflow terraform kubernetes deploy',
      goals: ['Construir e publicar uma imagem no GHCR', 'Encadear teste → build → plan → deploy com aprovação', 'Reaproveitar lógica com reusable workflows'],
      blocks: [
        { t: 'p', x: 'Entrega contínua = qualquer commit aprovado na main <b>pode</b> ir à produção de forma automática, repetível e auditável. Abaixo, o pipeline de referência que usaremos no projeto-âncora.' },
        { t: 'pipe', title: 'Pipeline de referência', stages: [
          { n: 'PR', jobs: ['lint + testes', 'scan de dependências', 'terraform plan (comentado no PR)'] },
          { n: 'Merge na main', jobs: ['build da imagem', 'scan da imagem (Trivy)', 'push no GHCR com tag = SHA'] },
          { n: 'Staging', jobs: ['terraform apply', 'deploy no K8s', 'smoke tests'] },
          { n: 'Produção', jobs: ['⏸ aprovação manual (Environment)', 'deploy progressivo', 'monitoração'] }
        ], cap: 'A mesma imagem (mesmo digest) é promovida entre ambientes: <b>build once, deploy many</b>.' },
        { t: 'code', lang: 'yaml', file: '.github/workflows/release.yml', x: R`
name: Release
on:
  push: { branches: [main] }

permissions: { contents: read }

jobs:
  test:
    uses: ./.github/workflows/ci.yml          # reusable workflow (precisa de on: workflow_call)

  image:
    needs: test
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    outputs:
      tag: $\{{ steps.meta.outputs.version }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: $\{{ github.actor }}
          password: $\{{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/$\{{ github.repository }}
          tags: type=sha
      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: $\{{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: image
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - run: echo "kubectl set image deployment/api api=ghcr.io/$\{{ github.repository }}:$\{{ needs.image.outputs.tag }}"

  deploy-prod:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production                   # exige aprovação configurada no Environment
    steps:
      - run: echo "deploy em produção"
` },
        { t: 'h', x: 'Reusable workflows: DRY para pipelines' },
        { t: 'code', lang: 'yaml', file: '.github/workflows/ci.yml (trecho)', x: R`
on:
  workflow_call:                # permite que outro workflow chame este
    inputs:
      python: { type: string, default: "3.12" }
    secrets:
      TOKEN: { required: false }
` },
        { t: 'callout', k: 'info', x: 'As versões das actions (<code>@v3</code>, <code>@v5</code>…) evoluem; confira a major mais recente no repositório de cada action e deixe o Dependabot propor atualizações.' },
        { t: 'lab', title: 'Seu pipeline ponta a ponta', steps: ['Faça o workflow publicar uma imagem em <code>ghcr.io/&lt;org&gt;/&lt;repo&gt;</code>', 'Crie os Environments <code>staging</code> e <code>production</code> (com revisor obrigatório em produção)', 'Extraia o CI para um reusable workflow e chame-o do release', 'Adicione um scan de imagem com Trivy e falhe em vulnerabilidades críticas'] }
      ],
      quiz: { q: 'O que significa "build once, deploy many"?', o: ['Fazer build diferente para cada ambiente', 'Construir a imagem uma vez e promover o mesmo artefato por staging e produção', 'Fazer deploy somente uma vez', 'Evitar usar containers'], a: 1, w: 'Rebuildar por ambiente pode gerar artefatos diferentes. Promover a mesma imagem (mesmo digest) garante que o que foi testado é o que vai para produção.' },
      refs: [doc('Publicar imagens Docker (Actions)', 'https://docs.github.com/pt/actions/use-cases-and-examples/publishing-packages/publishing-docker-images'), doc('Reutilizando workflows', 'https://docs.github.com/pt/actions/sharing-automations/reusing-workflows'), doc('GitHub Container Registry', 'https://docs.github.com/pt/packages/working-with-a-github-packages-registry/working-with-the-container-registry'), doc('Trivy (scanner)', 'https://trivy.dev/latest/')]
    }
  ]
});
