TRACKS.push({
  id: 'docker', order: 2, level: 1, icon: '🐳', color: '#0db7ed', title: 'Docker & Containers',
  desc: 'Empacote aplicações de forma reproduzível: imagens, Dockerfile, multi-stage e Compose.',
  long: 'Containers são o "formato de entrega" da engenharia moderna. Sem entender imagem, camada e registry, Kubernetes e CI/CD viram caixa-preta.',
  why: 'Pré-requisito direto de CI/CD e Kubernetes.',
  prereq: 'Terminal básico. Instale Docker Desktop ou Docker Engine.',
  refs: [doc('Docker — Get started', 'https://docs.docker.com/get-started/'), doc('Boas práticas de build', 'https://docs.docker.com/build/building/best-practices/'), doc('Docker Compose', 'https://docs.docker.com/compose/')],
  lessons: [
    {
      slug: 'conceitos', title: 'Imagem, container e registry', level: 1, min: 20, kw: 'docker image container registry layers vm',
      goals: ['Diferenciar imagem de container', 'Explicar camadas (layers) e cache de build', 'Executar, inspecionar e publicar um container'],
      blocks: [
        { t: 'p', x: 'Uma <b>imagem</b> é um pacote imutável (sistema de arquivos + metadados) com sua aplicação e dependências. Um <b>container</b> é uma imagem em execução, isolada por recursos do kernel Linux (namespaces e cgroups). Um <b>registry</b> (Docker Hub, GHCR, ECR…) armazena imagens.' },
        { t: 'flow', title: 'Do código ao container', steps: [
          { n: 'Dockerfile', s: 'receita', d: 'Arquivo de texto com as instruções para montar a imagem (<code>FROM</code>, <code>COPY</code>, <code>RUN</code>, <code>CMD</code>…).' },
          { n: 'docker build', s: 'cria a imagem', d: 'Cada instrução gera uma <b>camada</b>. Se nada mudou numa camada, o Docker reutiliza do cache — por isso a ordem das instruções importa.' },
          { n: 'Imagem', s: 'imutável', d: 'Identificada por <code>nome:tag</code> e por um digest (<code>sha256:…</code>). Para produção, prefira tags versionadas ou digest, nunca <code>latest</code>.' },
          { n: 'Registry', s: 'docker push', d: 'Publica a imagem para que outros ambientes (CI, Kubernetes) possam baixá-la.' },
          { n: 'Container', s: 'docker run', d: 'Processo isolado criado a partir da imagem. É descartável: dados importantes vão em volumes ou serviços externos.' }
        ] },
        { t: 'table', head: ['', 'Máquina virtual', 'Container'], rows: [
          ['Isolamento', 'Hardware virtualizado + SO convidado completo', 'Processos isolados compartilhando o kernel do host'],
          ['Tamanho típico', 'Gigabytes', 'Megabytes'],
          ['Inicialização', 'Minutos/segundos', 'Segundos ou menos'],
          ['Ideal para', 'Isolamento forte, SOs diferentes', 'Empacotar e escalar aplicações']
        ] },
        { t: 'code', lang: 'bash', file: 'terminal', x: R`
docker run --rm -it alpine:3.20 sh          # roda e descarta ao sair
docker run -d --name web -p 8080:80 nginx:1.27   # background + mapeia porta
docker ps                                   # containers rodando
docker logs -f web                          # logs
docker exec -it web sh                      # entra no container
docker stop web && docker rm web
docker images                               # imagens locais
docker history nginx:1.27                   # veja as camadas
` },
        { t: 'callout', k: 'info', x: 'Container <b>não é</b> uma fronteira de segurança perfeita. Rode como usuário não-root, remova capabilities desnecessárias e mantenha imagens atualizadas.' }
      ],
      quiz: { q: 'Qual a relação entre imagem e container?', o: ['São a mesma coisa', 'Container é uma instância em execução de uma imagem', 'Imagem é uma instância em execução de um container', 'Container só existe em máquinas virtuais'], a: 1, w: 'A imagem é o molde imutável; o container é uma instância em execução criada a partir dela (você pode criar vários containers da mesma imagem).' },
      refs: [doc('Docker overview', 'https://docs.docker.com/get-started/docker-overview/'), doc('Docker Hub', 'https://hub.docker.com/'), yt('docker tutorial for beginners images containers')]
    },
    {
      slug: 'dockerfile', title: 'Dockerfile profissional e Docker Compose', level: 2, min: 25, kw: 'multi-stage dockerfile compose non-root healthcheck dockerignore',
      goals: ['Escrever Dockerfile multi-stage, enxuto e seguro', 'Aproveitar o cache de camadas', 'Subir API + Postgres + Redis com Compose'],
      blocks: [
        { t: 'p', x: 'Um bom Dockerfile é <b>pequeno</b>, <b>reproduzível</b> e <b>seguro</b>. A técnica-chave é o <b>multi-stage build</b>: um estágio com ferramentas de build e um estágio final só com o necessário para rodar.' },
        { t: 'bars', title: 'Impacto típico de boas práticas no tamanho da imagem (ordem de grandeza, ilustrativo)', unit: ' MB', items: [{ n: 'python:3.12 completa', v: 1000, c: '#dc2626' }, { n: 'python:3.12-slim', v: 150, c: '#d97706' }, { n: 'slim + multi-stage', v: 120, c: '#16a34a' }], cap: 'Valores ilustrativos: meça com <code>docker images</code> no seu projeto. Menos pacotes = menos superfície de ataque e pull mais rápido.' },
        { t: 'code', lang: 'dockerfile', file: 'Dockerfile', x: R`
# ---- estágio de build ----
FROM python:3.12-slim AS build
WORKDIR /app
ENV PIP_NO_CACHE_DIR=1
# 1) só dependências primeiro: a camada fica em cache enquanto elas não mudam
COPY requirements.txt .
RUN pip install --prefix=/install -r requirements.txt

# ---- estágio final ----
FROM python:3.12-slim
# NÃO rodar como root
RUN useradd --create-home --uid 10001 app
WORKDIR /app
COPY --from=build /install /usr/local
# 2) o código muda mais: fica por último
COPY . .
USER 10001
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request as u; u.urlopen('http://localhost:8000/health')"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
` },
        { t: 'code', lang: 'bash', file: '.dockerignore', x: R`
.git
__pycache__/
.venv/
.env
*.md
tests/
` },
        { t: 'h', x: 'Compose: o ambiente local completo em um arquivo' },
        { t: 'code', lang: 'yaml', file: 'compose.yaml', x: R`
services:
  api:
    build: .
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql+psycopg://app:app@db:5432/app
      REDIS_URL: redis://cache:6379/0
    depends_on:
      db:    { condition: service_healthy }
      cache: { condition: service_started }
  db:
    image: postgres:17
    environment: { POSTGRES_USER: app, POSTGRES_PASSWORD: app, POSTGRES_DB: app }
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      retries: 10
  cache:
    image: redis:7-alpine
volumes:
  pgdata:
` },
        { t: 'callout', k: 'warn', x: 'Senhas no <code>compose.yaml</code> servem apenas para desenvolvimento local. Em produção, use um gerenciador de segredos (Kubernetes Secrets com criptografia, Vault, AWS/Azure/GCP Secret Manager).' },
        { t: 'lab', title: 'Containerize sua API', steps: ['Escreva o Dockerfile multi-stage acima para uma API simples', 'Rode <code>docker compose up --build</code>', 'Altere só o código e rebuilde: veja que as camadas de dependências vêm do cache', 'Confirme que o processo roda sem root: <code>docker compose exec api id</code>'] }
      ],
      quiz: { q: 'Por que copiar o <code>requirements.txt</code> e instalar dependências ANTES de copiar o código?', o: ['É obrigatório pela sintaxe do Docker', 'Para o Docker reaproveitar a camada de dependências no cache quando só o código muda', 'Para deixar a imagem maior', 'Para evitar usar multi-stage'], a: 1, w: 'Camadas são cacheadas em ordem. Dependências mudam pouco, código muda muito: colocar o que muda menos primeiro acelera builds.' },
      refs: [doc('Multi-stage builds', 'https://docs.docker.com/build/building/multi-stage/'), doc('Boas práticas de Dockerfile', 'https://docs.docker.com/build/building/best-practices/'), doc('Compose — referência', 'https://docs.docker.com/reference/compose-file/')]
    }
  ]
});
