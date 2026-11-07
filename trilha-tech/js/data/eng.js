TRACKS.push({
  id: 'eng', order: 3, level: 1, icon: '🧭', color: '#ec4899', title: 'Engenharia de Software & Ágil',
  desc: 'Clean Code, SOLID, testes, métodos ágeis, DevOps/DORA, observabilidade e linguagens. A trilha transversal.',
  long: 'Tecnologia não resolve sozinha: times produtivos combinam <b>código sustentável</b>, <b>testes</b>, <b>entrega frequente</b> e <b>aprendizado contínuo</b>. Esta trilha deve andar em paralelo com todas as outras.',
  why: 'Define a qualidade do que você constrói com todas as outras ferramentas.',
  prereq: 'Nenhum — mas aplique tudo no projeto-âncora.',
  refs: [doc('Manifesto Ágil', 'https://agilemanifesto.org/iso/ptbr/manifesto.html'), doc('Scrum Guide', 'https://scrumguides.org/scrum-guide.html'), doc('DORA', 'https://dora.dev/'), doc('Refactoring Guru (padrões e refatoração)', 'https://refactoring.guru/pt-br'), doc('roadmap.sh', 'https://roadmap.sh/')],
  lessons: [
    {
      slug: 'cleancode', title: 'Clean Code: nomes, funções e legibilidade', level: 1, min: 25, kw: 'clean code nomes funções refatoração dry kiss yagni comentários',
      goals: ['Aplicar regras práticas de nomeação e tamanho de funções', 'Refatorar um código confuso em código legível', 'Distinguir DRY, KISS e YAGNI'],
      blocks: [
        { t: 'p', x: 'Código é lido muito mais vezes do que escrito. <b>Clean Code</b> (Robert C. Martin) e <b>Refactoring</b> (Martin Fowler) tratam de reduzir o custo de entender e mudar o software. Não é estética: é produtividade e menos bugs.' },
        { t: 'table', head: ['Princípio', 'Significa', 'Exemplo'], rows: [
          ['Nomes que revelam intenção', 'O nome responde "o que e por quê"', '<code>dias_desde_ultimo_login</code> em vez de <code>d</code>'],
          ['Funções pequenas', 'Fazem <b>uma coisa</b>, em um nível de abstração', 'Extrair <code>calcular_desconto()</code> de <code>finalizar_pedido()</code>'],
          ['DRY', 'Cada conhecimento tem uma única fonte', 'Regra de imposto em um só lugar'],
          ['KISS', 'A solução mais simples que resolve', 'Evite padrões "por precaução"'],
          ['YAGNI', 'Não construa o que ainda não precisa', 'Sem plugin system para uma única integração'],
          ['Comentários explicam o "porquê"', 'O "o quê" deve estar claro no código', 'Comente uma regra de negócio contraintuitiva']
        ] },
        { t: 'code', lang: 'python', file: 'antes.py', x: R`
def proc(l, t):
    r = 0
    for i in l:
        if i[2] == 1:
            r += i[0] * i[1] * 0.9
        else:
            r += i[0] * i[1]
    if t == "vip":
        r = r * 0.95
    return r
` },
        { t: 'code', lang: 'python', file: 'depois.py', x: R`
from dataclasses import dataclass

DESCONTO_PROMOCAO = 0.10
DESCONTO_VIP = 0.05

@dataclass(frozen=True)
class ItemPedido:
    preco: float
    quantidade: int
    em_promocao: bool

    def subtotal(self) -> float:
        bruto = self.preco * self.quantidade
        return bruto * (1 - DESCONTO_PROMOCAO) if self.em_promocao else bruto

def total_do_pedido(itens: list[ItemPedido], cliente_vip: bool) -> float:
    total = sum(item.subtotal() for item in itens)
    return total * (1 - DESCONTO_VIP) if cliente_vip else total
` },
        { t: 'callout', k: 'tip', x: '<b>Regra do escoteiro:</b> deixe o código um pouco melhor do que encontrou. Refatore em passos pequenos, <i>sempre com testes verdes</i> — refatorar é mudar a estrutura sem mudar o comportamento.' },
        { t: 'lab', title: 'Refatore um trecho seu', steps: ['Escolha uma função com mais de 30 linhas do seu código (ou do repositório Delphi!)', 'Escreva testes que fixam o comportamento atual', 'Renomeie variáveis, extraia funções e elimine números mágicos', 'Peça uma revisão (PR) focada apenas na refatoração'] }
      ],
      quiz: { q: 'O que significa YAGNI?', o: ['Você sempre vai precisar disso', 'Você não vai precisar disso: não implemente antes de haver necessidade real', 'Yet Another Great New Idea', 'Escreva tudo em uma só função'], a: 1, w: 'YAGNI (You Aren\'t Gonna Need It) combate complexidade especulativa — implemente o que é necessário agora e evolua quando a necessidade aparecer.' },
      refs: [doc('Refactoring — catálogo (Martin Fowler)', 'https://refactoring.com/catalog/'), doc('Refactoring Guru — code smells', 'https://refactoring.guru/pt-br/refactoring/smells'), doc('PEP 8 (estilo Python)', 'https://peps.python.org/pep-0008/'), yt('clean code principles examples refactoring')]
    },
    {
      slug: 'solid', title: 'SOLID e arquitetura hexagonal', level: 2, min: 30, kw: 'solid arquitetura hexagonal ports adapters clean architecture dependency inversion',
      goals: ['Explicar os 5 princípios SOLID com exemplos', 'Aplicar inversão de dependência para isolar regras de negócio', 'Desenhar uma arquitetura em camadas/hexagonal'],
      blocks: [
        { t: 'table', head: ['Letra', 'Princípio', 'Ideia em uma frase'], rows: [
          ['<b>S</b>', 'Single Responsibility', 'Um módulo deve ter <b>um motivo para mudar</b>'],
          ['<b>O</b>', 'Open/Closed', 'Aberto para extensão, fechado para modificação (adicione comportamento sem editar o existente)'],
          ['<b>L</b>', 'Liskov Substitution', 'Subtipos devem poder substituir seus tipos base sem quebrar o programa'],
          ['<b>I</b>', 'Interface Segregation', 'Prefira várias interfaces pequenas a uma enorme'],
          ['<b>D</b>', 'Dependency Inversion', 'Dependa de <b>abstrações</b>, não de implementações concretas']
        ] },
        { t: 'nest', title: 'Arquitetura hexagonal (ports & adapters): as dependências apontam para dentro', tree: { n: 'Mundo externo', k: 's', c: [
          { n: 'Adaptadores de entrada', k: 'b', c: [{ n: 'API REST' }, { n: 'CLI' }, { n: 'Fila' }] },
          { n: 'Núcleo', k: 'g', c: [{ n: 'Casos de uso (aplicação)', s: 'orquestram', c: [{ n: 'Domínio', s: 'regras de negócio puras' }, { n: 'Portas (interfaces)', s: 'RepositorioPedidos, Notificador' }] }] },
          { n: 'Adaptadores de saída', k: 'o', c: [{ n: 'Postgres / SQL Server' }, { n: 'Redis' }, { n: 'E-mail / API externa' }] }
        ] }, cap: 'O domínio não importa FastAPI, SQLAlchemy ou Redis. Trocar o banco ou testar sem infraestrutura fica trivial.' },
        { t: 'code', lang: 'python', file: 'dominio_e_adaptadores.py', x: R`
from typing import Protocol

# --- PORTA (abstração definida pelo núcleo) ---
class RepositorioPedidos(Protocol):
    def salvar(self, pedido: "Pedido") -> None: ...

# --- CASO DE USO: depende da abstração, não do banco ---
class CriarPedido:
    def __init__(self, repo: RepositorioPedidos):
        self.repo = repo
    def executar(self, cliente_id: int, itens: list[ItemPedido]) -> "Pedido":
        if not itens:
            raise ValueError("Pedido sem itens")
        pedido = Pedido(cliente_id=cliente_id, itens=itens)
        self.repo.salvar(pedido)
        return pedido

# --- ADAPTADORES: implementações plugáveis ---
class RepoPostgres:
    def salvar(self, pedido): ...        # INSERT via SQLAlchemy
class RepoEmMemoria:                     # usado nos testes unitários
    def __init__(self): self.dados = []
    def salvar(self, pedido): self.dados.append(pedido)
` },
        { t: 'callout', k: 'warn', x: '<b>Não exagere:</b> arquitetura em camadas custa complexidade. Para um CRUD pequeno, um serviço simples basta. Aplique inversão de dependência onde há <i>regra de negócio relevante</i> ou necessidade real de trocar/testar infraestrutura (YAGNI).' }
      ],
      quiz: { q: 'Na inversão de dependência, o caso de uso "CriarPedido" depende de…', o: ['Da classe concreta RepoPostgres', 'De uma interface (porta) RepositorioPedidos', 'Do framework web', 'Do Redis'], a: 1, w: 'O núcleo define a abstração; os adaptadores a implementam. A dependência de código aponta para o núcleo, nunca o contrário.' },
      refs: [doc('Arquitetura Hexagonal (Alistair Cockburn)', 'https://alistair.cockburn.us/hexagonal-architecture/'), doc('Princípios SOLID — Refactoring Guru', 'https://refactoring.guru/pt-br/design-patterns'), doc('Martin Fowler — blog', 'https://martinfowler.com/')]
    },
    {
      slug: 'testes', title: 'Testes automatizados e TDD', level: 2, min: 30, kw: 'testes pirâmide tdd pytest testcontainers contrato mock cobertura',
      goals: ['Aplicar a pirâmide de testes', 'Praticar o ciclo Red → Green → Refactor', 'Usar containers reais para testes de integração'],
      blocks: [
        { t: 'bars', title: 'Pirâmide de testes: onde investir (proporção sugerida)', unit: '%', items: [
          { n: 'Unitários (rápidos, muitos)', v: 70, c: '#16a34a' }, { n: 'Integração (BD, cache, API)', v: 20, c: '#d97706' }, { n: 'E2E / UI (poucos, lentos)', v: 10, c: '#dc2626' }], cap: 'Proporção ilustrativa: o princípio é ter mais testes onde o feedback é mais rápido e barato.' },
        { t: 'flow', title: 'TDD — o ciclo Red-Green-Refactor', steps: [
          { n: '🔴 Red', s: 'escreva um teste que falha', d: 'Descreve o comportamento desejado <i>antes</i> do código. Falhar prova que o teste testa algo.' },
          { n: '🟢 Green', s: 'faça passar', d: 'Escreva o mínimo de código para passar. Sem generalizar demais.' },
          { n: '🔵 Refactor', s: 'melhore', d: 'Com testes verdes, limpe a estrutura sem mudar o comportamento.' }
        ] },
        { t: 'code', lang: 'python', file: 'tests/test_pedidos.py', x: R`
import pytest
from app.dominio import ItemPedido, total_do_pedido

def test_total_sem_desconto():
    itens = [ItemPedido(preco=10.0, quantidade=2, em_promocao=False)]
    assert total_do_pedido(itens, cliente_vip=False) == 20.0

def test_vip_recebe_5_por_cento():
    itens = [ItemPedido(preco=100.0, quantidade=1, em_promocao=False)]
    assert total_do_pedido(itens, cliente_vip=True) == pytest.approx(95.0)

@pytest.mark.parametrize("qtd", [0, -1])
def test_quantidade_invalida_e_rejeitada(qtd):
    with pytest.raises(ValueError):
        ItemPedido(preco=10.0, quantidade=qtd, em_promocao=False)
` },
        { t: 'code', lang: 'python', file: 'tests/test_repo_postgres.py', x: R`
# Integração com banco REAL e descartável (Testcontainers)
import pytest
from testcontainers.postgres import PostgresContainer

@pytest.fixture(scope="session")
def pg_url():
    with PostgresContainer("postgres:17") as pg:
        yield pg.get_connection_url()      # sobe um Postgres limpo para a suíte e destrói no fim

def test_salva_e_le_pedido(pg_url):
    repo = RepoPostgres(pg_url)
    repo.salvar(Pedido(cliente_id=1, itens=[...]))
    assert repo.buscar_por_cliente(1)
` },
        { t: 'ul', items: [
          '<b>Bons testes são:</b> rápidos, independentes, determinísticos e legíveis (padrão Arrange-Act-Assert).',
          '<b>Teste de contrato</b> (OpenAPI/Pact) protege a integração entre serviços sem subir tudo.',
          '<b>Cobertura</b> mede o que não foi testado — não a qualidade. 100% de cobertura com asserts fracos é falsa segurança.',
          '<b>No CI</b>, testes são o portão: sem verde, sem merge.'
        ] }
      ],
      quiz: { q: 'Qual a ordem correta do TDD?', o: ['Green → Red → Refactor', 'Red → Green → Refactor', 'Refactor → Red → Green', 'Código → Teste → Deploy'], a: 1, w: 'Primeiro um teste que falha (Red), depois o mínimo para passar (Green), então melhora o design (Refactor).' },
      refs: [doc('pytest', 'https://docs.pytest.org/'), doc('Testcontainers', 'https://testcontainers.com/'), doc('Martin Fowler — Test Pyramid', 'https://martinfowler.com/articles/practical-test-pyramid.html'), doc('Pact — testes de contrato', 'https://docs.pact.io/')]
    },
    {
      slug: 'agil', title: 'Métodos ágeis: Manifesto, Scrum, Kanban e XP', level: 1, min: 30, kw: 'ágil scrum kanban xp manifesto sprint backlog retrospectiva wip',
      goals: ['Citar os valores do Manifesto Ágil', 'Descrever eventos, papéis e artefatos do Scrum', 'Aplicar limites de WIP do Kanban e práticas de XP'],
      blocks: [
        { t: 'p', x: 'Agilidade é <b>aprender rápido com ciclos curtos de entrega e feedback</b>, não um conjunto de cerimônias. O Manifesto Ágil (2001) estabelece quatro valores:' },
        { t: 'table', head: ['Valorizamos mais…', '…do que'], rows: [
          ['Indivíduos e interações', 'Processos e ferramentas'], ['Software em funcionamento', 'Documentação abrangente'],
          ['Colaboração com o cliente', 'Negociação de contratos'], ['Responder a mudanças', 'Seguir um plano']
        ], cap: 'Os itens da direita têm valor — os da esquerda têm mais.' },
        { t: 'pipe', title: 'Scrum — um Sprint (no máximo 1 mês)', stages: [
          { n: 'Sprint Planning', jobs: [{ n: 'Meta da Sprint', s: 'por que / o quê / como' }] },
          { n: 'Sprint (execução)', jobs: [{ n: 'Daily Scrum', s: '15 min, replanejar o dia' }, { n: 'Trabalho + refino', s: 'incremento utilizável' }] },
          { n: 'Sprint Review', jobs: [{ n: 'Inspecionar o Incremento', s: 'com stakeholders' }] },
          { n: 'Retrospectiva', jobs: [{ n: 'Melhorar o processo', s: 'ações concretas' }] }
        ] },
        { t: 'table', head: ['Scrum (Guia 2020)', 'Itens'], rows: [
          ['<b>Responsabilidades</b>', 'Developers (entregam o Incremento) · Product Owner (maximiza valor, ordena o Product Backlog) · Scrum Master (efetividade do time e do Scrum)'],
          ['<b>Artefatos e compromissos</b>', 'Product Backlog → <i>Product Goal</i> · Sprint Backlog → <i>Sprint Goal</i> · Incremento → <i>Definição de Pronto (DoD)</i>'],
          ['<b>Eventos</b>', 'Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective']
        ] },
        { t: 'nest', title: 'Quadro Kanban com limite de WIP (trabalho em andamento)', tree: { n: 'Fluxo', k: 's', c: [
          { n: 'Backlog', k: 's', c: [{ n: 'Item F' }, { n: 'Item G' }, { n: 'Item H' }] },
          { n: 'Fazendo (WIP ≤ 3)', k: 'o', c: [{ n: 'Item C' }, { n: 'Item D' }, { n: 'Item E' }] },
          { n: 'Revisão (WIP ≤ 2)', k: 'p', c: [{ n: 'Item B' }] },
          { n: 'Pronto', k: 'g', c: [{ n: 'Item A' }] }
        ] }, cap: 'Limitar WIP expõe gargalos e faz o time terminar o que começou antes de começar outra coisa. Métricas de fluxo: lead/cycle time, throughput, WIP, idade do item.' },
        { t: 'table', head: ['Prática de XP (Extreme Programming)', 'Benefício'], rows: [
          ['TDD e testes automatizados', 'Feedback rápido, refatoração segura'], ['Programação em par / mob', 'Revisão contínua, difusão de conhecimento'],
          ['Integração contínua', 'Problemas de integração aparecem cedo'], ['Refatoração contínua', 'Design evolutivo, dívida técnica baixa'],
          ['Pequenas entregas', 'Valor frequente e risco menor']
        ] },
        { t: 'callout', k: 'tip', x: '<b>Escolha pelo contexto:</b> Scrum ajuda a dar cadência a produtos novos; Kanban é ótimo para fluxo contínuo (suporte, plataforma); XP é a base técnica que sustenta ambos. Muitos times combinam ("Scrumban").' }
      ],
      quiz: { q: 'Qual o principal efeito de limitar o WIP no Kanban?', o: ['Aumentar o número de tarefas simultâneas', 'Expor gargalos e reduzir o tempo de ciclo ao focar em terminar o que começou', 'Eliminar a necessidade de planejamento', 'Aumentar reuniões'], a: 1, w: 'Menos itens em paralelo = menos troca de contexto e fluxo mais rápido; o gargalo fica visível porque a fila "trava".' },
      refs: [doc('Manifesto Ágil (PT-BR)', 'https://agilemanifesto.org/iso/ptbr/manifesto.html'), doc('Princípios por trás do Manifesto', 'https://agilemanifesto.org/iso/ptbr/principles.html'), doc('Scrum Guide', 'https://scrumguides.org/scrum-guide.html'), doc('Kanban Guide', 'https://kanbanguides.org/'), yt('scrum em 10 minutos papéis eventos artefatos')]
    },
    {
      slug: 'devops', title: 'DevOps, DORA e engenharia de plataforma', level: 2, min: 25, kw: 'devops dora métricas deployment frequency lead time change failure rate platform engineering trunk feature flags',
      goals: ['Citar as métricas DORA e o que elas medem', 'Entender a relação entre velocidade e estabilidade', 'Explicar o papel de plataformas internas (IDP)'],
      blocks: [
        { t: 'p', x: 'DevOps é uma cultura de colaboração entre desenvolvimento e operações apoiada por automação. O programa de pesquisa <b>DORA</b> (DevOps Research and Assessment, Google Cloud) identificou métricas que se correlacionam com alto desempenho organizacional.' },
        { t: 'table', head: ['Métrica DORA', 'Mede', 'Dimensão'], rows: [
          ['Frequência de deploy', 'Com que frequência você implanta em produção', 'Velocidade'],
          ['Lead time de mudanças', 'Do commit até estar em produção', 'Velocidade'],
          ['Taxa de falha de mudanças', '% de deploys que causam falha/rollback', 'Estabilidade'],
          ['Tempo de recuperação (falha de deploy)', 'Quanto leva para restaurar o serviço', 'Estabilidade']
        ], cap: 'Relatórios mais recentes do DORA também destacam a taxa de retrabalho (rework) como sinal complementar de estabilidade. Consulte dora.dev para as definições atuais.' },
        { t: 'callout', k: 'info', x: 'A descoberta central: <b>velocidade e estabilidade não são um trade-off</b> — times de alto desempenho entregam mais rápido <i>e</i> com menos falhas, graças a lotes pequenos, automação e feedback rápido.' },
        { t: 'flow', title: 'Práticas que movem as métricas', steps: [
          { n: 'Lotes pequenos', s: 'PRs curtos', d: 'Mudanças pequenas são mais fáceis de revisar, testar e reverter.' },
          { n: 'Trunk-based + feature flags', s: 'integrar sempre', d: 'Código incompleto vai para produção desligado por flag; liga-se gradualmente (canary, % de usuários).' },
          { n: 'CI/CD automatizado', s: 'pipeline confiável', d: 'Testes, scans e deploy automatizados; mesma artefato promovido entre ambientes.' },
          { n: 'Observabilidade', s: 'detectar rápido', d: 'Alertas baseados em SLOs reduzem o tempo de detecção e recuperação.' },
          { n: 'Aprendizado', s: 'post-mortems sem culpa', d: 'Incidentes viram melhorias no sistema, não punição de pessoas.' }
        ] },
        { t: 'p', x: '<b>Engenharia de plataforma:</b> com muitas ferramentas (K8s, Terraform, pipelines), cada time reinventar tudo gera sobrecarga cognitiva. Times de plataforma oferecem <i>caminhos pavimentados</i> — templates, módulos Terraform, pipelines reutilizáveis, portal de desenvolvedor (IDP) — tratando a plataforma como um produto interno.' },
        { t: 'callout', k: 'tip', x: 'Comece medindo as 4 métricas do seu time (ex.: deploys/semana, tempo do merge ao deploy). O que não se mede, não melhora — e use como diagnóstico do sistema, <b>não</b> como ranking de pessoas.' }
      ],
      quiz: { q: 'Segundo a pesquisa DORA, velocidade e estabilidade…', o: ['São sempre opostas: ganhar um exige perder o outro', 'Tendem a andar juntas em times de alto desempenho', 'Não têm relação com automação', 'Só dependem do tamanho da empresa'], a: 1, w: 'Times que implantam com frequência em pequenos lotes têm também menor taxa de falha e recuperação mais rápida.' },
      refs: [doc('DORA — as quatro métricas-chave', 'https://dora.dev/guides/dora-metrics-four-keys/'), doc('DORA — pesquisa e relatórios', 'https://dora.dev/research/'), doc('Trunk Based Development', 'https://trunkbaseddevelopment.com/'), doc('Platform Engineering (comunidade)', 'https://platformengineering.org/')]
    },
    {
      slug: 'observabilidade', title: 'Observabilidade e SRE: logs, métricas, traces e SLOs', level: 3, min: 30, kw: 'observabilidade sre slo sli error budget opentelemetry logs métricas traces golden signals',
      goals: ['Diferenciar logs, métricas e traces', 'Definir SLI, SLO e error budget', 'Instrumentar uma API com OpenTelemetry'],
      blocks: [
        { t: 'p', x: 'Monitorar é saber <i>se</i> está quebrado; observabilidade é conseguir descobrir <i>por quê</i>, com perguntas que você não previu. Os três sinais clássicos:' },
        { t: 'nest', title: 'Os três pilares + correlação', tree: { n: 'Observabilidade', k: 's', c: [
          { n: 'Métricas', k: 'b', s: 'números agregados no tempo', c: [{ n: 'latência p95' }, { n: 'taxa de erro' }, { n: 'CPU / memória' }] },
          { n: 'Logs', k: 'o', s: 'eventos detalhados', c: [{ n: 'JSON estruturado' }, { n: 'request-id' }] },
          { n: 'Traces', k: 'p', s: 'caminho de 1 requisição entre serviços', c: [{ n: 'API' }, { n: 'Redis' }, { n: 'Postgres' }] }
        ] }, cap: 'O <b>trace-id</b> nos logs permite pular de um alerta de métrica para a requisição exata que falhou.' },
        { t: 'table', head: ['Conceito', 'Definição', 'Exemplo'], rows: [
          ['<b>SLI</b>', 'Indicador de nível de serviço (o que medimos)', '% de requisições com status < 500 e < 300 ms'],
          ['<b>SLO</b>', 'Objetivo para o SLI', '99,9% em 30 dias'],
          ['<b>Error budget</b>', 'O quanto você pode falhar dentro do SLO', '0,1% ≈ 43 min/mês de indisponibilidade'],
          ['<b>Golden signals</b>', 'Latência, tráfego, erros e saturação', 'Painel mínimo de qualquer serviço']
        ], cap: 'Se o orçamento de erro acabou, a equipe prioriza confiabilidade sobre novas funcionalidades — um acordo explícito entre produto e engenharia.' },
        { t: 'code', lang: 'bash', file: 'terminal', x: R`
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install          # instala instrumentações (FastAPI, SQLAlchemy, Redis…)

OTEL_SERVICE_NAME=api-pedidos \
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317 \
opentelemetry-instrument uvicorn app.main:app --host 0.0.0.0
` },
        { t: 'code', lang: 'yaml', file: 'log estruturado (uma linha por evento)', x: R`
{"ts":"2026-11-07T14:03:22Z","nivel":"ERROR","servico":"api-pedidos","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","rid":"b1c2","rota":"/v1/pedidos","status":500,"ms":812,"erro":"timeout ao consultar postgres"}
` },
        { t: 'callout', k: 'warn', x: 'Nunca registre senhas, tokens, números de cartão ou dados pessoais em logs. Mascare/anonimize (LGPD) e defina retenção.' }
      ],
      quiz: { q: 'Se o SLO é 99,9% de disponibilidade, o error budget é…', o: ['99,9%', '0,1% de falhas permitidas no período', '10%', 'Zero'], a: 1, w: 'Error budget = 100% − SLO. É a margem de falha aceitável que orienta decisões de risco e prioridade.' },
      refs: [doc('Google SRE Book (grátis online)', 'https://sre.google/sre-book/table-of-contents/'), doc('OpenTelemetry — documentação', 'https://opentelemetry.io/docs/'), doc('Prometheus — visão geral', 'https://prometheus.io/docs/introduction/overview/'), doc('Grafana — documentação', 'https://grafana.com/docs/')]
    },
    {
      slug: 'linguagens', title: 'Linguagens e trilha de carreira: o que aprender e por quê', level: 1, min: 20, kw: 'linguagens python sql typescript go csharp java rust bash delphi carreira ia',
      goals: ['Escolher linguagens por caso de uso (não por moda)', 'Montar um plano de estudo em fases', 'Usar assistentes de IA com responsabilidade'],
      blocks: [
        { t: 'table', head: ['Linguagem', 'Onde brilha', 'Por que aprender'], rows: [
          ['<b>SQL</b>', 'Dados em qualquer lugar', 'Obrigatória; sobrevive a todas as modas'],
          ['<b>Python</b>', 'APIs, dados, automação, IA', 'Curva suave, ecossistema enorme (FastAPI, DuckDB, pandas)'],
          ['<b>TypeScript</b>', 'Front-end e back-end web', 'Tipagem sobre JavaScript; base de apps web modernos'],
          ['<b>Go</b>', 'Infra, CLIs, serviços de alta concorrência', 'Kubernetes e Terraform são escritos em Go; binário único simples'],
          ['<b>C# / .NET</b>', 'Sistemas corporativos, integração com SQL Server', 'Ótima performance e ferramentas maduras'],
          ['<b>Java / Kotlin</b>', 'Grandes sistemas corporativos e Android', 'Mercado sólido e ecossistema maduro'],
          ['<b>Rust</b>', 'Sistemas, performance e segurança de memória', 'Cresce em infraestrutura e ferramentas'],
          ['<b>Bash</b>', 'Automação e glue de pipelines', 'Presente em todo CI/CD e container']
        ] },
        { t: 'callout', k: 'info', x: '<b>Vem do Delphi/Object Pascal?</b> Seus conceitos de orientação a objetos, componentes, threads e acesso a dados se transferem diretamente. Um caminho produtivo: manter o Delphi nos sistemas existentes e <b>expô-los/integrá-los via APIs REST</b> (o Delphi consome REST nativamente), modernizando aos poucos com o padrão <i>strangler</i>.' },
        { t: 'pipe', title: 'Plano de estudo em fases (ritmo sugerido, ajuste ao seu tempo)', stages: [
          { n: 'Fase 1 · Base', jobs: ['Git + GitHub', 'Docker', 'SQL sólido', 'Clean Code'] },
          { n: 'Fase 2 · Construir', jobs: ['API (Python/FastAPI ou .NET)', 'Redis', 'Testes + CI'] },
          { n: 'Fase 3 · Entregar', jobs: ['GitHub Actions', 'Terraform', 'Observabilidade'] },
          { n: 'Fase 4 · Escalar', jobs: ['Kubernetes', 'GitOps', 'Dados (DuckDB/DuckLake)'] }
        ] },
        { t: 'ul', items: [
          '<b>Aprenda em T:</b> profundidade em uma área (ex.: backend) e amplitude suficiente nas vizinhas (dados, infra, segurança).',
          '<b>Projetos > tutoriais:</b> construa o projeto-âncora e publique no GitHub com README, CI e diagrama.',
          '<b>Leia código e documentação oficial</b> — é onde está a verdade mais atual.',
          '<b>Assistentes de IA:</b> aceleram, mas você é responsável pelo resultado. Revise, teste, entenda cada linha, não cole segredos nem dados sensíveis, e valide recomendações de segurança na fonte oficial.'
        ] }
      ],
      quiz: { q: 'Qual a melhor forma de escolher uma linguagem para estudar agora?', o: ['A mais popular nas redes sociais', 'A que melhor resolve o problema/contexto que você pretende atuar, combinada com SQL', 'A mais difícil', 'Aleatoriamente'], a: 1, w: 'Linguagem é ferramenta: escolha pelo contexto (dados → Python/SQL, infra → Go/Bash, corporativo → C#/Java) e aprofunde com projetos reais.' },
      refs: [doc('roadmap.sh — trilhas de carreira', 'https://roadmap.sh/'), doc('Python — Tutorial oficial', 'https://docs.python.org/pt-br/3/tutorial/'), doc('A Tour of Go', 'https://go.dev/tour/'), doc('Microsoft Learn — C# e .NET', 'https://learn.microsoft.com/pt-br/dotnet/csharp/'), doc('TypeScript Handbook', 'https://www.typescriptlang.org/docs/handbook/intro.html')]
    }
  ]
});
