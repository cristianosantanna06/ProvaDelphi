TRACKS.push({
  id: 'apis', order: 5, level: 2, icon: '🔌', color: '#10b981', title: 'APIs seguras e performáticas',
  desc: 'Projete APIs REST confiáveis para integrar sistemas: segurança (OWASP), performance e acesso a SQL Server, Postgres, DuckDB e DuckLake.',
  long: 'Uma API é o contrato entre seu sistema e o mundo. Aqui você aprende a desenhá-la (REST/OpenAPI), protegê-la (OWASP API Top 10, OAuth2/JWT), acelerá-la (paginação, cache, índices) e conectá-la a diferentes bancos. Os exemplos usam <b>Python + FastAPI</b>, mas os princípios valem para qualquer linguagem (C#/.NET, Java, Go, Node, Delphi…).',
  why: 'É o produto final que conecta tudo: dados, cache, segurança e entrega.',
  prereq: 'Lógica de programação, SQL básico e noções de HTTP. Ajuda ter feito Git e Docker.',
  refs: [doc('OpenAPI Specification', 'https://spec.openapis.org/oas/latest.html'), doc('OWASP API Security Top 10 (2023)', 'https://owasp.org/API-Security/editions/2023/en/0x11-t10/'), doc('FastAPI (docs)', 'https://fastapi.tiangolo.com/pt/'), doc('RFC 9110 — Semântica HTTP', 'https://www.rfc-editor.org/rfc/rfc9110')],
  lessons: [
    {
      slug: 'fundamentos', title: 'Desenhando uma API REST de qualidade', level: 1, min: 30, kw: 'rest http verbos status code openapi versionamento erro problem details idempotência',
      goals: ['Modelar recursos, URLs e verbos HTTP corretamente', 'Usar status codes e erros padronizados (RFC 9457)', 'Documentar com OpenAPI e versionar sem quebrar clientes'],
      blocks: [
        { t: 'p', x: 'REST modela o sistema como <b>recursos</b> (substantivos) manipulados por <b>verbos HTTP</b>. A semântica dos métodos e códigos de status é definida na RFC 9110 — respeitá-la torna sua API previsível para qualquer cliente, cache ou proxy.' },
        { t: 'flow', title: 'Ciclo de uma requisição bem projetada', steps: [
          { n: 'Cliente', s: 'POST /v1/pedidos', d: 'Envia JSON com <code>Content-Type: application/json</code> e credencial no cabeçalho <code>Authorization</code>.' },
          { n: 'Borda', s: 'TLS, WAF, rate limit', d: 'HTTPS obrigatório; limites de taxa e tamanho de payload antes de chegar na aplicação.' },
          { n: 'Autenticação', s: 'quem é você?', d: 'Valida o token (assinatura, expiração, emissor, audience). Falhou → <b>401</b>.' },
          { n: 'Autorização', s: 'pode fazer isso?', d: 'Verifica permissões e <b>propriedade do recurso</b>. Sem permissão → <b>403</b> (ou 404 para não revelar existência).' },
          { n: 'Validação', s: 'schema', d: 'Tipos, tamanhos, formatos e regras de negócio. Inválido → <b>422/400</b> com detalhes.' },
          { n: 'Negócio + dados', s: 'transação', d: 'Executa a regra em uma transação; consultas parametrizadas.' },
          { n: 'Resposta', s: '201 + Location', d: 'Status correto, corpo enxuto e cabeçalhos úteis (<code>Location</code>, <code>ETag</code>, <code>Cache-Control</code>).' }
        ] },
        { t: 'table', head: ['Método', 'Uso', 'Seguro?', 'Idempotente?', 'Sucesso típico'], rows: [
          ['GET', 'Ler recurso/coleção', 'Sim', 'Sim', '200'],
          ['POST', 'Criar / ação não idempotente', 'Não', 'Não*', '201 + Location'],
          ['PUT', 'Substituir recurso inteiro', 'Não', 'Sim', '200 / 204'],
          ['PATCH', 'Alterar parcialmente', 'Não', 'Depende', '200 / 204'],
          ['DELETE', 'Remover', 'Não', 'Sim', '204']
        ], cap: '*POST pode ser tornado idempotente com um cabeçalho <code>Idempotency-Key</code> (pagamentos, pedidos) — o servidor guarda o resultado da 1ª tentativa e o devolve em repetições.' },
        { t: 'table', head: ['Status', 'Quando'], rows: [
          ['200 / 201 / 204', 'OK / criado / sem conteúdo'],
          ['400 / 422', 'Requisição malformada / dados inválidos'],
          ['401 / 403', 'Não autenticado / autenticado sem permissão'],
          ['404 / 409', 'Não existe / conflito de estado (ex.: duplicidade)'],
          ['429', 'Limite de requisições excedido (envie <code>Retry-After</code>)'],
          ['500 / 503', 'Erro no servidor / indisponível — nunca vaze stack trace']
        ] },
        { t: 'code', lang: 'python', file: 'app/main.py', x: R`
from fastapi import FastAPI, status, Response
from pydantic import BaseModel, Field

app = FastAPI(title="API de Pedidos", version="1.0.0")   # gera OpenAPI + /docs automaticamente

class ItemIn(BaseModel):
    sku: str = Field(min_length=3, max_length=40)
    quantidade: int = Field(gt=0, le=1000)

class PedidoIn(BaseModel):
    cliente_id: int = Field(gt=0)
    itens: list[ItemIn] = Field(min_length=1, max_length=100)   # limite = proteção contra abuso

class PedidoOut(BaseModel):
    id: int
    status: str

@app.post("/v1/pedidos", response_model=PedidoOut, status_code=status.HTTP_201_CREATED)
def criar_pedido(p: PedidoIn, response: Response):
    novo = {"id": 1001, "status": "criado"}               # (persistência virá nas próximas lições)
    response.headers["Location"] = f"/v1/pedidos/{novo['id']}"
    return novo
` },
        { t: 'code', lang: 'yaml', file: 'erro (RFC 9457 - application/problem+json)', x: R`
{
  "type": "https://api.exemplo.com/erros/estoque-insuficiente",
  "title": "Estoque insuficiente",
  "status": 409,
  "detail": "O SKU ABC-123 possui apenas 2 unidades.",
  "instance": "/v1/pedidos"
}
` },
        { t: 'ul', items: [
          '<b>URLs:</b> substantivos no plural e hierarquia clara — <code>/v1/clientes/42/pedidos</code>; nada de <code>/getPedido</code>.',
          '<b>Versionamento:</b> <code>/v1/</code> no caminho ou por cabeçalho; mudanças <i>aditivas</i> não quebram clientes (novo campo opcional), remoção/renomeação exige nova versão.',
          '<b>Coleções:</b> sempre paginadas, com filtros e ordenação explícitos.',
          '<b>Contrato primeiro:</b> o OpenAPI é a fonte de verdade para documentação, SDKs e testes de contrato.'
        ] }
      ],
      quiz: { q: 'Um cliente reenvia um PUT idêntico por falha de rede. O que garante a semântica correta?', o: ['PUT é idempotente: repetir produz o mesmo estado final', 'PUT sempre cria um novo recurso', 'PUT não pode ser repetido', 'Só POST é permitido'], a: 0, w: 'Idempotência significa que N requisições iguais têm o mesmo efeito de uma. É o que torna retentativas seguras (PUT, DELETE, GET). Para POST, use Idempotency-Key.' },
      refs: [doc('RFC 9110 — Semântica HTTP', 'https://www.rfc-editor.org/rfc/rfc9110'), doc('RFC 9457 — Problem Details', 'https://www.rfc-editor.org/rfc/rfc9457'), doc('OpenAPI Specification', 'https://spec.openapis.org/oas/latest.html'), doc('FastAPI — Tutorial', 'https://fastapi.tiangolo.com/pt/tutorial/'), yt('REST API design best practices openapi')]
    },
    {
      slug: 'seguranca', title: 'Segurança: OWASP API Top 10, OAuth2 e JWT', level: 2, min: 40, kw: 'owasp bola autenticação autorização jwt oauth2 oidc rate limit ssrf injection cors',
      goals: ['Reconhecer as 10 principais vulnerabilidades de API (OWASP 2023)', 'Validar JWT corretamente e separar autenticação de autorização', 'Impedir BOLA (acesso a objetos de outros usuários)'],
      blocks: [
        { t: 'p', x: 'A maioria dos incidentes em APIs não vem de criptografia quebrada, e sim de <b>lógica de autorização falha</b>: o usuário A consegue ler o pedido do usuário B só trocando o ID. O OWASP mantém a lista das 10 maiores categorias de risco em APIs.' },
        { t: 'table', head: ['#', 'Risco (OWASP API 2023)', 'Em linguagem simples', 'Defesa-chave'], rows: [
          ['API1', 'Broken Object Level Authorization (BOLA)', 'Acessar objeto de outro usuário trocando o ID', 'Checar dono do objeto em <b>toda</b> consulta'],
          ['API2', 'Broken Authentication', 'Login/token fraco ou mal validado', 'OAuth2/OIDC, validar JWT, MFA, bloqueio de força bruta'],
          ['API3', 'Broken Object Property Level Authorization', 'Ler/alterar campos que não deveria (mass assignment, excesso de dados)', 'DTOs de entrada/saída explícitos, nunca devolver o modelo do banco'],
          ['API4', 'Unrestricted Resource Consumption', 'Abuso de CPU/memória/custo', 'Rate limit, limites de payload/paginação/timeouts'],
          ['API5', 'Broken Function Level Authorization', 'Usuário comum chama endpoint administrativo', 'Autorização por função/escopo no servidor'],
          ['API6', 'Unrestricted Access to Sensitive Business Flows', 'Automação abusiva de fluxos (comprar tudo, criar contas)', 'Limites por fluxo, antibot, detecção de anomalias'],
          ['API7', 'Server Side Request Forgery (SSRF)', 'API busca URL fornecida pelo atacante', 'Allowlist de destinos, bloquear redes internas'],
          ['API8', 'Security Misconfiguration', 'Debug ligado, CORS aberto, headers ausentes', 'Baseline endurecido, IaC revisada, scanners'],
          ['API9', 'Improper Inventory Management', 'APIs antigas/esquecidas expostas', 'Catálogo de APIs, desligar versões obsoletas'],
          ['API10', 'Unsafe Consumption of APIs', 'Confiar cegamente em APIs de terceiros', 'Validar e limitar respostas externas']
        ] },
        { t: 'nest', title: 'Defesa em camadas', tree: { n: 'Requisição', k: 's', c: [
          { n: 'Borda', k: 'b', c: [{ n: 'TLS 1.2+' }, { n: 'WAF / API Gateway' }, { n: 'Rate limit' }] },
          { n: 'Aplicação', k: 'g', c: [{ n: 'AuthN (token)' }, { n: 'AuthZ (dono/escopo)' }, { n: 'Validação de schema' }, { n: 'Erros genéricos' }] },
          { n: 'Dados', k: 'o', c: [{ n: 'Queries parametrizadas' }, { n: 'Usuário de BD com menor privilégio' }, { n: 'Criptografia em repouso' }] },
          { n: 'Operação', k: 'p', c: [{ n: 'Logs de auditoria' }, { n: 'Segredos em cofre' }, { n: 'Atualização de dependências' }] }
        ] } },
        { t: 'h', x: 'Validando JWT e protegendo contra BOLA' },
        { t: 'code', lang: 'python', file: 'app/auth.py', x: R`
import os, jwt                                   # PyJWT
from jwt import PyJWKClient
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

ISSUER   = os.environ["OIDC_ISSUER"]            # ex.: https://login.exemplo.com/
AUDIENCE = os.environ["OIDC_AUDIENCE"]          # identifica ESTA api
jwks = PyJWKClient(f"{ISSUER}.well-known/jwks.json")   # chaves públicas do provedor (cacheadas)
bearer = HTTPBearer(auto_error=False)

def usuario_atual(cred: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if cred is None:
        raise HTTPException(401, "Token ausente", headers={"WWW-Authenticate": "Bearer"})
    try:
        chave = jwks.get_signing_key_from_jwt(cred.credentials).key
        return jwt.decode(
            cred.credentials, chave,
            algorithms=["RS256"],                # allowlist: jamais aceite "none" ou o alg do token às cegas
            audience=AUDIENCE, issuer=ISSUER,    # valida aud e iss
            options={"require": ["exp", "sub"]}, # exige expiração e sujeito
        )
    except jwt.PyJWTError:
        raise HTTPException(401, "Token inválido", headers={"WWW-Authenticate": "Bearer"})

def exige_escopo(escopo: str):
    def dep(user: dict = Depends(usuario_atual)):
        if escopo not in user.get("scope", "").split():
            raise HTTPException(403, "Permissão insuficiente")
        return user
    return dep
` },
        { t: 'code', lang: 'python', file: 'app/routes.py', x: R`
@app.get("/v1/pedidos/{pedido_id}")
def obter_pedido(pedido_id: int, user: dict = Depends(exige_escopo("pedidos:read")), db=Depends(get_db)):
    # ✅ o filtro por dono está NA CONSULTA, não depois
    row = db.execute(
        text("SELECT id, status, total FROM pedidos WHERE id = :id AND cliente_sub = :sub"),
        {"id": pedido_id, "sub": user["sub"]},
    ).mappings().first()
    if not row:
        raise HTTPException(404, "Pedido não encontrado")   # 404 também para "não é seu": não revela existência
    return row
` },
        { t: 'ul', items: [
          '<b>Autenticação ≠ autorização:</b> token válido só diz <i>quem</i> é; você ainda decide <i>o que</i> pode.',
          '<b>CORS</b> não é segurança de servidor: restrinja origens permitidas, mas não confie nele para proteger dados.',
          '<b>Segredos</b> (chaves, senhas de BD) em variáveis de ambiente/cofre, nunca no código. Rotacione.',
          '<b>Erros e logs:</b> mensagens genéricas ao cliente; detalhes só no log — e sem dados pessoais/segredos.',
          '<b>LGPD:</b> minimize dados pessoais, registre finalidade e acessos; mascare dados sensíveis nos logs.'
        ] }
      ],
      quiz: { q: 'O endpoint <code>GET /pedidos/{id}</code> retorna qualquer pedido para qualquer usuário autenticado. Qual vulnerabilidade é essa?', o: ['SSRF', 'BOLA (API1) — falta checar se o objeto pertence ao usuário', 'CORS mal configurado', 'Injeção de SQL'], a: 1, w: 'É o clássico BOLA, a categoria nº 1 do OWASP API Top 10. A correção é incluir a verificação de propriedade na própria consulta (ou política de autorização central).' },
      refs: [doc('OWASP API Security Top 10 — 2023', 'https://owasp.org/API-Security/editions/2023/en/0x11-t10/'), doc('OWASP Cheat Sheet — REST Security', 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html'), doc('OWASP Cheat Sheet — JWT', 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html'), doc('OAuth 2.0 (RFC 6749)', 'https://datatracker.ietf.org/doc/html/rfc6749'), doc('OpenID Connect — como funciona', 'https://openid.net/developers/how-connect-works/')]
    },
    {
      slug: 'sql', title: 'Dados relacionais: Postgres e SQL Server sem dor', level: 2, min: 35, kw: 'sql server postgres sqlalchemy pool parametrizado injection paginação returning output merge upsert',
      goals: ['Acessar Postgres e SQL Server com consultas parametrizadas e pool de conexões', 'Conhecer as diferenças de dialeto que mais causam bugs', 'Aplicar menor privilégio no usuário do banco'],
      blocks: [
        { t: 'p', x: 'Duas regras valem para qualquer banco: <b>(1)</b> nunca monte SQL concatenando entrada do usuário — use parâmetros; <b>(2)</b> conexões são caras — use um <b>pool</b>. SQLAlchemy 2.x fornece ambos, com drivers para Postgres (<code>psycopg</code>) e SQL Server (<code>pyodbc</code> + Microsoft ODBC Driver).' },
        { t: 'flow', title: 'Caminho seguro até o banco', steps: [
          { n: 'Endpoint', s: 'valida entrada', d: 'Tipos e limites já validados pelo schema (Pydantic).' },
          { n: 'Repositório', s: 'SQL com :parâmetros', d: 'O texto SQL é fixo; os valores vão separados como parâmetros. O driver cuida do escape — fim da injeção de SQL.' },
          { n: 'Pool', s: 'reaproveita conexões', d: 'Evita o custo de abrir conexão a cada requisição e limita a carga sobre o banco (<code>pool_size</code>, <code>max_overflow</code>).' },
          { n: 'Banco', s: 'usuário restrito', d: 'A API usa um login com apenas SELECT/INSERT/UPDATE nas tabelas necessárias — nunca <code>sa</code>/<code>postgres</code>.' }
        ] },
        { t: 'code', lang: 'python', file: 'app/db.py', x: R`
import os
from sqlalchemy import create_engine, text

# PostgreSQL (psycopg 3)
pg = create_engine(
    os.environ["PG_URL"],            # postgresql+psycopg://api_user:***@host:5432/loja
    pool_size=10, max_overflow=5, pool_pre_ping=True, pool_recycle=1800,
)

# SQL Server (ODBC Driver 18 da Microsoft)
mssql = create_engine(
    os.environ["MSSQL_URL"],         # mssql+pyodbc://api_user:***@host/loja?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes
    pool_size=10, max_overflow=5, pool_pre_ping=True, pool_recycle=1800,
)

def listar_clientes(engine, limite=20, depois_do_id=0):
    sql = text(QUERY_POR_DIALETO[engine.dialect.name])
    with engine.connect() as c:
        return c.execute(sql, {"n": limite, "ultimo": depois_do_id}).mappings().all()

QUERY_POR_DIALETO = {
    "postgresql": "SELECT id, nome FROM clientes WHERE id > :ultimo ORDER BY id LIMIT :n",
    "mssql":      "SELECT TOP (:n) id, nome FROM clientes WHERE id > :ultimo ORDER BY id",
}
` },
        { t: 'table', head: ['Tarefa', 'PostgreSQL', 'SQL Server (T-SQL)'], rows: [
          ['Limitar linhas', '<code>LIMIT n OFFSET m</code>', '<code>TOP (n)</code> ou <code>ORDER BY … OFFSET m ROWS FETCH NEXT n ROWS ONLY</code>'],
          ['Chave autoincremento', '<code>GENERATED ALWAYS AS IDENTITY</code> / <code>serial</code>', '<code>IDENTITY(1,1)</code>'],
          ['Devolver linha inserida', '<code>INSERT … RETURNING id</code>', '<code>INSERT … OUTPUT INSERTED.id …</code>'],
          ['Upsert', '<code>INSERT … ON CONFLICT (sku) DO UPDATE</code>', '<code>MERGE</code> (cuidado com concorrência: use <code>HOLDLOCK</code>) ou UPDATE+INSERT em transação'],
          ['Concatenar texto', '<code>a || b</code> / <code>concat()</code>', '<code>a + b</code> / <code>CONCAT()</code>'],
          ['Data/hora atual UTC', '<code>now()</code> (timestamptz)', '<code>SYSUTCDATETIME()</code>'],
          ['Booleano', '<code>boolean</code>', '<code>BIT</code>'],
          ['JSON', '<code>jsonb</code> (indexável com GIN)', 'Funções JSON (<code>JSON_VALUE</code>, <code>OPENJSON</code>); tipo <code>json</code> nativo nas versões mais recentes']
        ], cap: 'Dica: se precisa suportar os dois bancos, isole as diferenças no repositório (padrão Repository/Adapter) e teste ambos no CI com containers.' },
        { t: 'code', lang: 'sql', file: 'least-privilege.sql', x: R`
-- PostgreSQL
CREATE ROLE api_user LOGIN PASSWORD '***';
GRANT CONNECT ON DATABASE loja TO api_user;
GRANT USAGE ON SCHEMA public TO api_user;
GRANT SELECT, INSERT, UPDATE ON pedidos, itens_pedido TO api_user;   -- sem DELETE, sem DDL

-- SQL Server
CREATE LOGIN api_user WITH PASSWORD = '***';
CREATE USER api_user FOR LOGIN api_user;
GRANT SELECT, INSERT, UPDATE ON dbo.pedidos TO api_user;
` },
        { t: 'callout', k: 'bad', x: 'Isto é <b>injeção de SQL</b>: <code>f"SELECT * FROM clientes WHERE nome = \'{nome}\'"</code>. Se <code>nome</code> for <code>\' OR 1=1 --</code>, o atacante lê tudo. Sempre: <code>text("… WHERE nome = :nome")</code> + <code>{"nome": nome}</code>. Nomes de tabela/coluna dinâmicos não podem ser parâmetros — valide contra uma allowlist.' },
        { t: 'callout', k: 'tip', x: 'Use <b>transações</b> para operações que precisam ser atômicas (pedido + itens + baixa de estoque) e defina <b>timeouts</b> de consulta para impedir que uma query lenta derrube a API.' }
      ],
      quiz: { q: 'Qual a forma correta de inserir um valor vindo do usuário em uma consulta?', o: ['Concatenar a string no SQL', 'Usar parâmetros vinculados (bind) e manter o texto SQL constante', 'Remover aspas manualmente', 'Converter tudo para maiúsculas'], a: 1, w: 'Com parâmetros, o banco trata o valor como dado, nunca como código SQL — é a defesa primária contra injeção.' },
      refs: [doc('SQLAlchemy 2.0 — Tutorial', 'https://docs.sqlalchemy.org/en/20/tutorial/'), doc('PostgreSQL — Documentação', 'https://www.postgresql.org/docs/current/'), doc('SQL Server — Documentação Microsoft', 'https://learn.microsoft.com/pt-br/sql/sql-server/'), doc('ODBC Driver for SQL Server', 'https://learn.microsoft.com/pt-br/sql/connect/odbc/microsoft-odbc-driver-for-sql-server'), doc('OWASP — SQL Injection Prevention', 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html')]
    },
    {
      slug: 'performance', title: 'Performance: medir, indexar, paginar e cachear', level: 3, min: 40, kw: 'performance latência p95 índice keyset paginação n+1 cache etag compressão k6',
      goals: ['Medir com percentis (p50/p95/p99) em vez de médias', 'Eliminar gargalos comuns: N+1, OFFSET grande, falta de índice', 'Combinar cache HTTP, ETag e Redis'],
      blocks: [
        { t: 'p', x: '<b>Meça antes de otimizar.</b> Use percentis: a média esconde a cauda lenta que seus usuários sentem. Ferramentas como k6 geram carga e apontam p95/p99; o plano de execução do banco (<code>EXPLAIN ANALYZE</code> no Postgres, plano de execução no SQL Server) mostra o porquê.' },
        { t: 'flow', title: 'Camadas de cache: a requisição mais rápida é a que não chega ao banco', steps: [
          { n: 'Navegador / CDN', s: 'Cache-Control, ETag', d: 'Respostas públicas ou semi-estáticas podem ser servidas sem chegar à API. Com <code>ETag</code> + <code>If-None-Match</code> o servidor responde <b>304</b> sem corpo.' },
          { n: 'API Gateway', s: 'cache de borda', d: 'Pode cachear respostas idempotentes por rota/consulta.' },
          { n: 'Redis', s: 'cache-aside', d: 'Resultados caros de consultas e agregações, com TTL e invalidação.' },
          { n: 'Banco', s: 'índices + plano', d: 'Última linha: consultas rápidas graças a índices corretos e estatísticas atualizadas.' }
        ] },
        { t: 'bars', title: 'Paginação: OFFSET vs keyset (tendência ilustrativa em tabela grande)', log: true, unit: ' ms', items: [
          { n: 'OFFSET página 1', v: 5, c: '#16a34a' }, { n: 'OFFSET página 10.000', v: 900, c: '#dc2626' }, { n: 'Keyset página 10.000', v: 5, c: '#16a34a' }], cap: 'OFFSET precisa varrer e descartar as linhas anteriores; keyset usa o índice para "pular" direto. Valores ilustrativos — meça no seu dado.' },
        { t: 'code', lang: 'sql', file: 'keyset.sql', x: R`
-- Cliente envia o último id visto: GET /v1/pedidos?depois_de=12345&limite=50
SELECT id, cliente_id, total, criado_em
FROM pedidos
WHERE id > 12345          -- índice na chave de ordenação
ORDER BY id
LIMIT 50;                 -- (SQL Server: SELECT TOP (50) ...)

-- Índice composto para o filtro mais comum
CREATE INDEX ix_pedidos_cliente_data ON pedidos (cliente_id, criado_em DESC);
` },
        { t: 'h', x: 'N+1: o vilão silencioso' },
        { t: 'code', lang: 'python', file: 'n_mais_1.py', x: R`
# ❌ 1 consulta de pedidos + N consultas de itens (N = nº de pedidos)
for p in pedidos:
    p.itens = db.execute(text("SELECT * FROM itens WHERE pedido_id = :id"), {"id": p.id})

# ✅ 2 consultas no total (ou 1 com JOIN)
ids = [p.id for p in pedidos]
itens = db.execute(text("SELECT * FROM itens WHERE pedido_id = ANY(:ids)"), {"ids": ids})  # Postgres
# SQL Server: WHERE pedido_id IN (SELECT value FROM OPENJSON(:ids_json)) ou parâmetro de tabela
` },
        { t: 'code', lang: 'python', file: 'app/http_cache.py', x: R`
import hashlib, json
from fastapi import Request, Response
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1024)       # comprime respostas grandes

@app.get("/v1/produtos/{pid}")
def produto(pid: int, request: Request, response: Response):
    dados = get_produto(pid)                                 # cache-aside no Redis (lição de Redis)
    etag = '"' + hashlib.sha256(json.dumps(dados, sort_keys=True).encode()).hexdigest()[:16] + '"'
    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304)                     # sem corpo: economiza banda e CPU
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "public, max-age=60"   # use "private" se depender do usuário
    return dados
` },
        { t: 'table', head: ['Técnica', 'Ganho', 'Cuidado'], rows: [
          ['Índices certos', 'Maior ganho em leitura', 'Cada índice custa escrita e espaço; confirme no plano'],
          ['Keyset pagination', 'Páginas profundas estáveis', 'Exige ordenação determinística (chave única)'],
          ['Projeção (só colunas necessárias / <code>?campos=</code>)', 'Menos I/O e payload', 'Documente os campos permitidos'],
          ['Pool + <code>def</code>/async coerente', 'Menos latência de conexão', 'Dimensione contra o limite de conexões do banco'],
          ['Compressão (gzip/br)', 'Menor payload JSON', 'Custo de CPU em respostas minúsculas'],
          ['Rate limit + timeouts', 'Protege o sistema sob pico', 'Mensagens claras (429 + Retry-After)'],
          ['Processamento assíncrono (fila)', 'Resposta rápida para trabalho pesado', 'Retorne 202 + URL de status']
        ] },
        { t: 'lab', title: 'Caçando gargalos', steps: ['Gere 1 milhão de linhas e meça <code>EXPLAIN ANALYZE</code> de um filtro sem e com índice', 'Compare OFFSET 500000 com keyset', 'Instale o k6 e rode um teste de carga olhando p95 antes/depois do cache Redis', 'Adicione ETag a um endpoint e confirme o 304 com <code>curl -i</code>'] }
      ],
      quiz: { q: 'Por que usar percentis (p95/p99) em vez da média para medir latência?', o: ['Porque são mais fáceis de calcular', 'A média esconde as requisições mais lentas, que afetam parte relevante dos usuários', 'Porque a média é sempre maior', 'Não há diferença'], a: 1, w: 'Poucas requisições muito lentas pouco alteram a média, mas p95/p99 mostram a experiência da cauda — onde costumam estar timeouts e reclamações.' },
      refs: [doc('PostgreSQL — Usando EXPLAIN', 'https://www.postgresql.org/docs/current/using-explain.html'), doc('Grafana k6 — teste de carga', 'https://grafana.com/docs/k6/latest/'), doc('MDN — HTTP caching', 'https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Caching'), doc('Use The Index, Luke (referência clássica de índices)', 'https://use-the-index-luke.com/')]
    },
    {
      slug: 'analitico', title: 'Servindo dados analíticos com DuckDB e DuckLake', level: 3, min: 35, kw: 'duckdb ducklake parquet analytics olap relatório api read only attach postgres',
      goals: ['Decidir quando separar o analítico do transacional', 'Servir relatórios por API usando DuckDB com segurança', 'Entender onde DuckLake entra na arquitetura'],
      blocks: [
        { t: 'p', x: 'Consultas de relatório (somar milhões de linhas por mês/cliente) competem com as transações do dia a dia no banco OLTP. Uma solução comum é manter uma <b>cópia analítica</b> em formato colunar (Parquet) e consultá-la com <b>DuckDB</b>, um motor SQL analítico que roda <i>dentro do seu processo</i> — sem servidor para administrar.' },
        { t: 'pipe', title: 'Arquitetura: transacional + analítico', stages: [
          { n: 'OLTP', jobs: [{ n: 'SQL Server / Postgres', s: 'pedidos, clientes' }] },
          { n: 'Carga (ELT)', jobs: [{ n: 'job noturno/CDC', s: 'extrai incrementais' }] },
          { n: 'Lake', jobs: [{ n: 'Parquet / DuckLake', s: 'S3 ou disco' }] },
          { n: 'Motor', jobs: [{ n: 'DuckDB', s: 'embutido na API' }] },
          { n: 'API', jobs: [{ n: '/v1/relatorios/*', s: 'cache Redis' }] }
        ] },
        { t: 'code', lang: 'python', file: 'app/relatorios.py', x: R`
import duckdb
from datetime import date
from typing import Literal
from fastapi import APIRouter, Depends, Query

router = APIRouter(prefix="/v1/relatorios")
con = duckdb.connect("analytics.duckdb", read_only=True)     # leitura: sem risco de a API alterar o lake

# Valores dinâmicos de SQL que NÃO podem ser parâmetros -> allowlist
GRUPOS = {"dia": "day", "mes": "month", "ano": "year"}

@router.get("/vendas")
def vendas(
    de: date, ate: date,
    grupo: Literal["dia", "mes", "ano"] = "mes",
    user: dict = Depends(exige_escopo("relatorios:read")),
):
    if (ate - de).days > 366:                                 # limite de consumo (OWASP API4)
        raise HTTPException(422, "Intervalo máximo: 366 dias")
    cur = con.cursor()                                        # um cursor por requisição (thread-safe)
    try:
        rows = cur.execute(
            f"""SELECT date_trunc('{GRUPOS[grupo]}', data) AS periodo,
                       sum(valor) AS total, count(*) AS pedidos
                FROM vendas
                WHERE data BETWEEN ? AND ?                    -- valores sempre parametrizados
                GROUP BY 1 ORDER BY 1""",
            [de, ate],
        ).fetchall()
    finally:
        cur.close()
    return [{"periodo": r[0], "total": float(r[1]), "pedidos": r[2]} for r in rows]
` },
        { t: 'code', lang: 'sql', file: 'duckdb — lendo direto do Postgres e de Parquet', x: R`
INSTALL postgres; LOAD postgres;
ATTACH 'dbname=loja host=db-replica user=ro_user' AS pg (TYPE postgres, READ_ONLY);

-- Consulta federada: Parquet no S3 + tabela do Postgres
SELECT c.segmento, sum(v.valor) AS total
FROM read_parquet('s3://meu-lake/vendas/ano=2026/*.parquet') v
JOIN pg.public.clientes c ON c.id = v.cliente_id
GROUP BY 1 ORDER BY 2 DESC;
` },
        { t: 'callout', k: 'info', x: '<b>E o SQL Server?</b> O caminho mais portável é extrair os dados (consulta incremental via driver, BCP, ferramenta de ETL ou CDC) e gravar em Parquet; existem também extensões da comunidade para DuckDB, mas confira a maturidade e a versão suportada na documentação antes de depender delas.' },
        { t: 'ul', items: [
          '<b>Concorrência:</b> um arquivo <code>.duckdb</code> aceita <b>um</b> processo com escrita <i>ou</i> vários processos somente leitura. Para vários leitores e escritores sobre os mesmos dados, use <b>DuckLake</b> (próxima trilha) com um catálogo SQL como Postgres.',
          '<b>Cache:</b> relatórios caros e pouco voláteis → Redis com TTL (padrão da trilha de Redis).',
          '<b>Não substitua o OLTP:</b> DuckDB não é para milhares de pequenas transações concorrentes; é para leituras analíticas em lote.'
        ] }
      ],
      quiz: { q: 'Por que a API de relatórios abre o DuckDB como <code>read_only=True</code>?', o: ['Para ficar mais lenta', 'Para impedir que a API altere os dados analíticos e permitir leitura por vários processos', 'Porque DuckDB não suporta escrita', 'Para evitar usar SQL'], a: 1, w: 'Leitura somente permite que múltiplos processos abram o mesmo arquivo e reduz a superfície de dano: um bug/injeção na API não consegue modificar o lake.' },
      refs: [doc('DuckDB — Documentação', 'https://duckdb.org/docs/stable/'), doc('DuckDB — API Python', 'https://duckdb.org/docs/stable/clients/python/overview'), doc('DuckDB — extensão PostgreSQL', 'https://duckdb.org/docs/stable/core_extensions/postgres'), doc('DuckDB — Parquet', 'https://duckdb.org/docs/stable/data/parquet/overview')]
    },
    {
      slug: 'projeto', title: 'Projeto final: API de pedidos pronta para produção', level: 3, min: 60, kw: 'projeto fastapi postgres redis docker compose health 12 factor checklist',
      goals: ['Estruturar um projeto de API em camadas', 'Subir tudo com Docker Compose e testar no CI', 'Verificar um checklist de prontidão para produção'],
      blocks: [
        { t: 'p', x: 'Hora de juntar tudo. O projeto-âncora é uma <b>API de pedidos</b>: autenticação JWT, Postgres (ou SQL Server) para transações, Redis para cache e rate limit, relatórios analíticos via DuckDB, testes, container e pipeline.' },
        { t: 'nest', title: 'Estrutura sugerida (separação de responsabilidades)', tree: { n: 'api-pedidos/', k: 's', c: [
          { n: 'app/', k: 'b', c: [{ n: 'main.py', s: 'cria o app, middlewares' }, { n: 'config.py', s: 'variáveis de ambiente (12-factor)' }, { n: 'auth.py', s: 'JWT / escopos' }, { n: 'routers/', s: 'HTTP: valida e delega' }, { n: 'services/', s: 'regras de negócio' }, { n: 'repositories/', s: 'SQL / cache' }, { n: 'schemas.py', s: 'DTOs Pydantic' }] },
          { n: 'tests/', k: 'g', c: [{ n: 'unit' }, { n: 'integration', s: 'Postgres real (container)' }] },
          { n: 'Dockerfile + compose.yaml', k: 'o' }, { n: '.github/workflows/', k: 'p', c: [{ n: 'ci.yml' }, { n: 'release.yml' }] }
        ] } },
        { t: 'code', lang: 'python', file: 'app/config.py', x: R`
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    pg_url: str
    redis_url: str = "redis://localhost:6379/0"
    oidc_issuer: str
    oidc_audience: str
    rate_limit_por_minuto: int = 120
    cors_origins: list[str] = []           # vazio = nenhuma origem liberada
    producao: bool = False                 # em produção: desliga /docs

settings = Settings()                      # falha na inicialização se faltar algo (fail fast)
` },
        { t: 'code', lang: 'python', file: 'app/main.py (observabilidade e saúde)', x: R`
import logging, time, uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="API de Pedidos", version="1.0.0", docs_url=None if settings.producao else "/docs")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins,
                   allow_methods=["GET", "POST", "PUT", "DELETE"], allow_headers=["Authorization", "Content-Type"])

log = logging.getLogger("api")

@app.middleware("http")
async def acesso(request: Request, call_next):
    rid = request.headers.get("x-request-id", str(uuid.uuid4()))
    t0 = time.perf_counter()
    resp = await call_next(request)
    ms = (time.perf_counter() - t0) * 1000
    log.info('{"rid":"%s","metodo":"%s","path":"%s","status":%d,"ms":%.1f}',
             rid, request.method, request.url.path, resp.status_code, ms)   # log estruturado
    resp.headers["x-request-id"] = rid
    resp.headers["X-Content-Type-Options"] = "nosniff"
    return resp

@app.get("/health")            # liveness: o processo está vivo
def health(): return {"status": "ok"}

@app.get("/ready")             # readiness: dependências OK? (usado pelo Kubernetes)
def ready(db=Depends(get_db)):
    db.execute(text("SELECT 1")); r.ping(); return {"status": "ready"}
` },
        { t: 'lab', title: 'Checklist de prontidão para produção', steps: [
          'HTTPS e HSTS na borda; CORS restrito; docs desativadas ou protegidas em produção',
          'Autenticação (OIDC/JWT) + autorização por escopo + checagem de dono em todo acesso a objeto (BOLA)',
          'Validação de entrada com limites (tamanho, quantidade, paginação máxima)',
          'Rate limit com Redis e resposta 429 + <code>Retry-After</code>',
          'Consultas parametrizadas; usuário de BD com menor privilégio; pool dimensionado',
          'Índices revisados com EXPLAIN; N+1 eliminado; paginação keyset',
          'Cache (ETag/Redis) com TTL e invalidação definida',
          'Logs estruturados com request-id, sem dados sensíveis; métricas e traces (OpenTelemetry)',
          'Endpoints /health e /ready; shutdown gracioso; timeouts em todas as chamadas externas',
          'Configuração só por ambiente; segredos em cofre; imagem não-root escaneada',
          'Testes unitários + integração no CI; contrato OpenAPI versionado; dependências atualizadas pelo Dependabot',
          'Deploy automatizado (Actions) em Kubernetes com probes, requests/limits e HPA'
        ] },
        { t: 'callout', k: 'tip', x: 'Para comercializar: transforme o projeto em <b>template</b> (cookiecutter/repositório modelo) e em material do curso — é um excelente "capstone" que o aluno pode colocar no portfólio.' }
      ],
      quiz: { q: 'Qual a diferença entre <code>/health</code> e <code>/ready</code>?', o: ['Nenhuma', 'Health indica que o processo está vivo; ready indica que ele e suas dependências podem atender tráfego', 'Ready é só para banco de dados', 'Health reinicia o servidor'], a: 1, w: 'No Kubernetes, liveness usa /health (reiniciar se travar) e readiness usa /ready (tirar do balanceamento se uma dependência estiver fora).' },
      refs: [doc('The Twelve-Factor App', 'https://12factor.net/pt_br/'), doc('FastAPI — Deployment em containers', 'https://fastapi.tiangolo.com/pt/deployment/docker/'), doc('OpenTelemetry — Python', 'https://opentelemetry.io/docs/languages/python/'), doc('Testcontainers', 'https://testcontainers.com/')]
    }
  ]
});
