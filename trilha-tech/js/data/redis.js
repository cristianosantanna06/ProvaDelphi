TRACKS.push({
  id: 'redis', order: 6, level: 2, icon: '🧠', color: '#dc382d', title: 'Redis',
  desc: 'Estruturas de dados em memória: cache, rate limit, filas, rankings e tempo real.',
  long: 'Redis é um armazenamento de estruturas de dados em memória. Usado corretamente, tira carga do banco e entrega latência de sub-milissegundo. Usado sem critério, vira fonte de bugs de consistência — aqui você aprende os dois lados.',
  why: 'Cache e rate limit são essenciais para APIs performáticas.',
  prereq: 'Docker básico. Noções de SQL ajudam.',
  refs: [doc('Redis — Documentação', 'https://redis.io/docs/latest/'), doc('Tipos de dados', 'https://redis.io/docs/latest/develop/data-types/'), doc('Referência de comandos', 'https://redis.io/docs/latest/commands/'), doc('Redis University (cursos gratuitos)', 'https://university.redis.io/'), vid('Canal oficial do Redis no YouTube', 'https://www.youtube.com/@Redisinc', 'Vídeos oficiais')],
  lessons: [
    {
      slug: 'intro', title: 'O que é Redis e quando usar', level: 1, min: 20, kw: 'redis cache in-memory valkey licença latência',
      goals: ['Explicar onde o Redis brilha (e onde não)', 'Subir um Redis local e usar o redis-cli', 'Entender o modelo single-thread de execução de comandos'],
      blocks: [
        { t: 'p', x: 'Redis guarda dados <b>na memória RAM</b> (com opção de persistência em disco) e expõe estruturas ricas — strings, hashes, listas, conjuntos, sorted sets, streams… — com comandos atômicos. Executa comandos em uma thread principal, o que simplifica a atomicidade: cada comando roda por inteiro, sem interferência.' },
        { t: 'bars', title: 'Ordem de grandeza de latência por operação (ilustrativo)', log: true, unit: ' µs', items: [
          { n: 'Redis (rede local)', v: 200, l: '~0,2 ms', c: '#16a34a' }, { n: 'Banco SQL com índice', v: 2000, l: '~1–5 ms', c: '#d97706' }, { n: 'Consulta pesada / agregação', v: 80000, l: '~50–500 ms', c: '#dc2626' }], cap: 'Números ilustrativos que variam muito com hardware, rede e carga. Meça no seu ambiente.' },
        { t: 'table', head: ['Caso de uso', 'Estrutura', 'Exemplo'], rows: [
          ['Cache', 'String / Hash + TTL', 'Resultado de consulta cara'],
          ['Sessão de usuário', 'Hash + TTL', 'Token → dados da sessão'],
          ['Rate limiting', 'String com INCR + EXPIRE', '100 req/min por API key'],
          ['Ranking / leaderboard', 'Sorted Set', 'Top 10 jogadores'],
          ['Fila simples / fan-out', 'List / Stream', 'Jobs em background'],
          ['Tempo real', 'Pub/Sub / Stream', 'Notificações ao vivo'],
          ['Busca vetorial / JSON', 'Módulos nativos nas versões recentes', 'RAG, buscas de similaridade']
        ] },
        { t: 'code', lang: 'bash', file: 'terminal', x: R`
docker run -d --name redis -p 6379:6379 redis:7-alpine
docker exec -it redis redis-cli
` },
        { t: 'code', lang: 'redis', file: 'redis-cli', x: R`
PING
SET saudacao "olá"
GET saudacao
SET sessao:abc "dados" EX 60
TTL sessao:abc
INCR visitas
`, cap: '<code>EX 60</code> faz a chave expirar em 60 segundos; <code>TTL</code> mostra o tempo restante; <code>INCR</code> incrementa de forma atômica.' },
        { t: 'callout', k: 'warn', x: '<b>Redis é memória, não "banco principal":</b> não trate como fonte única de verdade para dados que não podem ser perdidos, a menos que entenda e configure persistência e replicação. Padrão saudável: banco relacional = verdade; Redis = acelerador.' },
        { t: 'callout', k: 'info', x: '<b>Licenciamento:</b> o Redis mudou de licença em 2024 (RSALv2/SSPL) e, com o Redis 8, voltou a oferecer a opção AGPLv3. O <b>Valkey</b> é um fork BSD mantido pela Linux Foundation e compatível no dia a dia. Se pretende comercializar, leia a licença da distribuição que usar.' }
      ],
      quiz: { q: 'Qual papel é mais seguro para o Redis em uma arquitetura típica de API?', o: ['Única fonte de verdade de pedidos e pagamentos, sem persistência', 'Camada de cache/aceleração à frente do banco de dados relacional', 'Substituto de todo banco SQL', 'Armazenamento de arquivos grandes'], a: 1, w: 'Cache é o caso clássico: se o cache for perdido, o sistema continua correto (apenas mais lento), pois a verdade está no banco.' },
      refs: [doc('Introdução ao Redis', 'https://redis.io/docs/latest/get-started/'), doc('Valkey', 'https://valkey.io/'), yt('redis crash course data structures use cases')]
    },
    {
      slug: 'tipos', title: 'Tipos de dados e modelagem de chaves', level: 1, min: 25, kw: 'string hash list set sorted set stream bitmap hyperloglog json chaves',
      goals: ['Escolher o tipo de dado certo para cada problema', 'Nomear chaves de forma consistente', 'Usar SCAN em vez de KEYS'],
      blocks: [
        { t: 'table', head: ['Tipo', 'Comandos-chave', 'Quando usar'], rows: [
          ['<b>String</b>', 'SET GET INCR EXPIRE', 'Cache simples, contadores, flags'],
          ['<b>Hash</b>', 'HSET HGET HGETALL', 'Objetos (usuário, produto) sem serializar tudo'],
          ['<b>List</b>', 'LPUSH RPOP LRANGE', 'Filas simples, últimos N itens'],
          ['<b>Set</b>', 'SADD SISMEMBER SINTER', 'Únicos, tags, interseção entre conjuntos'],
          ['<b>Sorted Set</b>', 'ZADD ZRANGE ZREVRANK', 'Rankings, agendamento por score/tempo'],
          ['<b>Stream</b>', 'XADD XREADGROUP XACK', 'Log de eventos com consumer groups'],
          ['<b>Bitmap / HyperLogLog</b>', 'SETBIT PFADD PFCOUNT', 'Presença diária; contagem aproximada de únicos'],
          ['<b>Geo</b>', 'GEOADD GEOSEARCH', 'Busca por proximidade']
        ] },
        { t: 'code', lang: 'redis', file: 'redis-cli', x: R`
HSET produto:42 nome "Teclado" preco 199.9 estoque 12
HGET produto:42 preco
HINCRBY produto:42 estoque -1
ZADD ranking 1500 "ana" 2300 "bia" 1800 "caio"
ZREVRANGE ranking 0 2 WITHSCORES
ZRANK ranking "ana"
SADD post:7:tags redis cache api
SISMEMBER post:7:tags api
XADD pedidos * id 1001 status criado
XRANGE pedidos - +
`, cap: 'Em ordem: Hash (objeto produto), Sorted Set (ranking top 3), Set (tags) e Stream (eventos de pedido).' },
        { t: 'callout', k: 'tip', x: '<b>Nomeie chaves com padrão:</b> <code>app:entidade:id[:campo]</code> → <code>loja:produto:42</code>, <code>loja:sessao:abc</code>. Inclua versão quando o formato mudar (<code>v2:</code>) e <b>sempre defina TTL</b> em chaves de cache.' },
        { t: 'callout', k: 'bad', x: 'Evite <code>KEYS *</code> em produção (bloqueia o servidor ao varrer tudo). Use <code>SCAN</code> com cursor. Evite também chaves gigantes (milhões de itens num só hash/list): fatie.' }
      ],
      quiz: { q: 'Qual tipo é ideal para um ranking de jogadores ordenado por pontuação?', o: ['String', 'List', 'Sorted Set', 'Bitmap'], a: 2, w: 'Sorted Set mantém membros únicos ordenados por score, com operações de range e rank em O(log N).' },
      refs: [doc('Tipos de dados do Redis', 'https://redis.io/docs/latest/develop/data-types/'), doc('SCAN', 'https://redis.io/docs/latest/commands/scan/'), doc('Redis Streams', 'https://redis.io/docs/latest/develop/data-types/streams/')]
    },
    {
      slug: 'padroes', title: 'Padrões: cache-aside, rate limit, lock e Pub/Sub', level: 2, min: 30, kw: 'cache aside ttl stampede rate limit lock pubsub invalidação',
      goals: ['Implementar cache-aside com TTL e invalidação', 'Aplicar rate limiting com INCR/EXPIRE', 'Conhecer lock distribuído e seus limites'],
      blocks: [
        { t: 'p', x: '<b>Cache-aside</b> (ou lazy loading): a aplicação consulta o cache; se não achar (<i>miss</i>), busca no banco, grava no cache com TTL e responde. Experimente:' },
        { t: 'sim', id: 'cache' },
        { t: 'code', lang: 'python', file: 'cache.py', x: R`
import json, time, redis

r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)
TTL = 300  # 5 min

def get_produto(pid: int, db):
    key = f"loja:produto:{pid}"
    if (hit := r.get(key)):
        return json.loads(hit)                         # HIT
    produto = db.buscar_produto(pid)                   # MISS -> banco
    if produto:
        r.set(key, json.dumps(produto), ex=TTL)        # grava com TTL
    return produto

def atualizar_produto(pid: int, dados, db):
    db.atualizar_produto(pid, dados)
    r.delete(f"loja:produto:{pid}")                    # invalida ao escrever
` },
        { t: 'callout', k: 'warn', x: '<b>Cache stampede:</b> quando uma chave quente expira, centenas de requisições vão ao banco ao mesmo tempo. Mitigações: TTL com <i>jitter</i> aleatório, lock curto para recomputar, ou renovar antecipadamente (stale-while-revalidate). E lembre: "só há dois problemas difíceis em computação: invalidação de cache e nomear coisas".' },
        { t: 'h', x: 'Rate limiting (janela fixa)' },
        { t: 'code', lang: 'python', file: 'ratelimit.py', x: R`
def permitido(api_key: str, limite=100, janela=60) -> bool:
    k = f"loja:rl:{api_key}:{int(time.time() // janela)}"
    pipe = r.pipeline()
    pipe.incr(k)
    pipe.expire(k, janela)         # a janela limpa sozinha
    n, _ = pipe.execute()
    return n <= limite             # se False -> responda 429 Too Many Requests
` },
        { t: 'table', head: ['Padrão', 'Como', 'Cuidado'], rows: [
          ['Lock distribuído', '<code>SET lock:x token NX PX 30000</code> e liberar só se o token for o seu (script Lua)', 'Não é garantia absoluta em cenários de falha/clock; para exclusão mútua crítica prefira o banco ou algoritmos com fencing token'],
          ['Pub/Sub', '<code>PUBLISH canal msg</code> / <code>SUBSCRIBE canal</code>', 'Fire-and-forget: quem não está conectado perde a mensagem'],
          ['Stream + consumer group', '<code>XADD</code> / <code>XREADGROUP</code> / <code>XACK</code>', 'Entrega confiável com reprocessamento; planeje reentrega e idempotência']
        ] }
      ],
      quiz: { q: 'Ao ATUALIZAR um dado no banco no padrão cache-aside, o que fazer com a chave no cache?', o: ['Nada: o TTL resolve sempre', 'Invalidar (apagar) ou atualizar a chave para evitar servir dado obsoleto', 'Duplicar a chave', 'Reiniciar o Redis'], a: 1, w: 'Invalidar na escrita reduz a janela de dado obsoleto; o TTL é a rede de segurança caso a invalidação falhe.' },
      refs: [doc('Rate limiting com Redis', 'https://redis.io/glossary/rate-limiting/'), doc('Lock distribuído (SET NX)', 'https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/'), doc('Pub/Sub', 'https://redis.io/docs/latest/develop/pubsub/'), doc('redis-py (cliente Python)', 'https://redis.io/docs/latest/develop/clients/redis-py/')]
    },
    {
      slug: 'producao', title: 'Produção: persistência, eviction, HA e segurança', level: 3, min: 30, kw: 'rdb aof maxmemory eviction replication sentinel cluster acl tls',
      goals: ['Escolher RDB, AOF ou ambos', 'Configurar maxmemory e política de eviction', 'Diferenciar réplica, Sentinel e Cluster; proteger o acesso'],
      blocks: [
        { t: 'table', head: ['Persistência', 'Como', 'Trade-off'], rows: [
          ['<b>RDB</b>', 'Snapshots periódicos', 'Compacto e rápido para restaurar; pode perder minutos de dados'],
          ['<b>AOF</b>', 'Log de cada escrita (fsync configurável)', 'Perde bem menos; arquivo maior e mais lento'],
          ['<b>Nenhuma</b>', 'Só memória', 'Aceitável para cache puro']
        ] },
        { t: 'nest', title: 'Topologias de alta disponibilidade e escala', tree: { n: 'Opções', k: 's', c: [
          { n: 'Primário + Réplicas', k: 'b', s: 'leitura escalável, cópia dos dados', c: [{ n: 'primary' }, { n: 'replica 1' }, { n: 'replica 2' }] },
          { n: 'Sentinel', k: 'o', s: 'monitora e faz failover automático', c: [{ n: 'sentinel ×3' }, { n: 'primary + réplicas' }] },
          { n: 'Cluster', k: 'g', s: 'particiona dados em 16.384 hash slots', c: [{ n: 'shard A (slots 0–5460)' }, { n: 'shard B (5461–10922)' }, { n: 'shard C (10923–16383)' }] }
        ] } },
        { t: 'code', lang: 'bash', file: 'redis.conf', x: R`
# memória e eviction (essencial para cache)
maxmemory 2gb
maxmemory-policy allkeys-lru     # remove as chaves menos usadas ao atingir o limite

# persistência
save 900 1 300 10 60 10000       # RDB
appendonly yes                   # AOF
appendfsync everysec

# segurança
bind 127.0.0.1 ::1               # nunca exponha direto à internet
protected-mode yes
user app on >SENHA_FORTE ~app:* +@read +@write -@dangerous
` },
        { t: 'callout', k: 'warn', x: '<b>Segurança:</b> um Redis exposto sem autenticação é invasão garantida. Use ACLs por usuário (comandos e chaves permitidos), TLS em trânsito, rede privada/firewall, e desabilite/renomeie comandos perigosos. Nunca publique a porta 6379 na internet.' },
        { t: 'callout', k: 'tip', x: 'Monitore: <code>INFO memory</code>, hit ratio (<code>keyspace_hits/misses</code>), <code>evicted_keys</code>, latência (<code>--latency</code>) e <code>SLOWLOG</code>.' }
      ],
      quiz: { q: 'Qual a política de eviction mais comum para um Redis usado como cache puro?', o: ['noeviction', 'allkeys-lru', 'volatile-ttl sem TTLs', 'Não existe política'], a: 1, w: 'allkeys-lru remove as chaves menos recentemente usadas quando a memória enche. noeviction faz escritas falharem ao atingir o limite.' },
      refs: [doc('Persistência', 'https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/'), doc('Eviction', 'https://redis.io/docs/latest/develop/reference/eviction/'), doc('Replicação', 'https://redis.io/docs/latest/operate/oss_and_stack/management/replication/'), doc('Sentinel', 'https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/'), doc('Redis Cluster', 'https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/'), doc('Segurança', 'https://redis.io/docs/latest/operate/oss_and_stack/management/security/')]
    }
  ]
});
