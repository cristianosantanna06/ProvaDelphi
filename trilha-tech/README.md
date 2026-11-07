# Trilha Tech — do código à produção

Curso visual e evolutivo em formato de dashboard. **Site estático** (HTML + CSS + JS puro): sem build, sem dependências, funciona offline e hospeda em qualquer lugar (GitHub Pages, Netlify, S3, Nginx).

## Como abrir

```bash
cd trilha-tech
python3 -m http.server 8000      # ou: npx serve .
# abra http://localhost:8000
```

## Conteúdo (9 trilhas · 38 lições)

| Ordem | Trilha | Lições |
|---|---|---|
| 1 | Git & GitHub | modelo mental · fluxos e PR · proteção/segurança do repositório |
| 2 | Docker & Containers | imagem/container/registry · Dockerfile profissional + Compose |
| 3 | Engenharia & Ágil | Clean Code · SOLID/hexagonal · testes/TDD · Scrum/Kanban/XP · DevOps/DORA · observabilidade/SRE · linguagens |
| 4 | GitHub Actions | anatomia · CI · segurança (OIDC, permissões) · pipeline CD completo |
| 5 | APIs seguras e performáticas | REST/OpenAPI · OWASP API Top 10 + JWT · Postgres e SQL Server · performance · DuckDB na API · projeto final |
| 6 | Redis | introdução · tipos de dados · padrões (cache-aside, rate limit) · produção |
| 7 | DuckDB & DuckLake | DuckDB essencial · DuckLake · arquitetura de dados |
| 8 | Terraform | IaC e fluxo · HCL · state/backends · módulos + CI |
| 9 | Kubernetes | arquitetura · workloads · rede/Gateway API · produção · segurança + GitOps |

Recursos de aprendizado: diagramas interativos (clique nas etapas), simuladores (Deployment/ReplicaSet e cache-aside), código com cópia em 1 clique, laboratórios com checklist, quiz por lição, XP/progresso (salvo no navegador, com export/import), busca (`/`), tema claro/escuro, responsivo.

## Estrutura

```
index.html            shell da aplicação
css/style.css         design system (tokens CSS, tema claro/escuro)
js/app.js             roteador, progresso, dashboard, quiz
js/render.js          renderizadores de blocos (flow, nest, pipe, bars, code, lab, sim…)
js/data/*.js          UM ARQUIVO POR TRILHA (aqui mora o conteúdo)
tools/validate.mjs    valida a estrutura do conteúdo
tools/check-links.mjs verifica se as URLs oficiais respondem (rode com internet)
```

## Como adicionar/editar conteúdo

Cada trilha é um objeto em `js/data/<trilha>.js`; cada lição tem `goals`, `blocks`, `quiz` e `refs`. Tipos de bloco:
`p`, `h`, `ul`, `callout (tip|warn|info|bad)`, `code`, `table`, `flow` (passo a passo clicável), `nest` (caixas aninhadas), `pipe` (etapas/jobs), `bars`, `lab`, `sim`.

Em blocos `code`, use `R\`...\`` (String.raw) e escreva `$\{` no lugar de `${` (ex.: `$\{{ secrets.X }}`).

```bash
node tools/validate.mjs        # estrutura, tabelas, quiz, ids
node tools/check-links.mjs     # links oficiais (precisa de internet)
```

## Fontes e honestidade de conteúdo

- Todo conteúdo é **escrito em texto próprio** e aponta, em cada lição, para a **documentação oficial** (Kubernetes, HashiCorp, Redis, GitHub, Docker, DuckDB/DuckLake, OWASP, RFCs, Scrum Guide, DORA, Google SRE…). Não copie trechos de documentação/livros: cite e linke.
- **Versões mudam** (principalmente Actions, Terraform, Kubernetes/Gateway API, DuckLake). O rodapé indica a data da última revisão; revise a cada trimestre.
- Os “vídeos” são **buscas do YouTube** e canais oficiais, não vídeos específicos: escolha e fixe os que você validar assistindo. Valores em gráficos marcados como *ilustrativos* devem ser medidos no seu ambiente.
- As URLs **não foram verificadas automaticamente** no ambiente de criação (sem acesso à internet externa). Rode `node tools/check-links.mjs` antes de publicar.

## Caminho para comercializar

1. **Validar a trilha** estudando (modo atual): ajuste lições, ordem e dificuldade conforme sua experiência.
2. **Conteúdo licenciável:** decida a licença do material (ex.: © todos os direitos reservados) e mantenha as atribuições às fontes oficiais. Atenção às licenças das ferramentas que ensina (Terraform BSL / OpenTofu, Redis / Valkey).
3. **Backend mínimo:** trocar o `localStorage` por conta + progresso no servidor (ex.: Supabase/Postgres), login (OIDC), pagamento (Stripe/Pix) e controle de acesso por trilha.
4. **Diferenciais vendáveis:** laboratórios em ambiente real (Codespaces/containers), correção automática de exercícios via GitHub Actions, certificado por trilha, projeto-âncora com revisão de código.
5. **Conformidade:** LGPD para dados de alunos (finalidade, minimização, consentimento), termos de uso e política de privacidade.
