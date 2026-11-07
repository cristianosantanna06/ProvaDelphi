TRACKS.push({
  id: 'dados', order: 7, level: 2, icon: '🦆', color: '#d4a017', title: 'Dados analíticos: DuckDB & DuckLake',
  desc: 'SQL analítico rápido sem servidor, Parquet e o formato de lakehouse DuckLake com catálogo SQL.',
  long: 'DuckDB mudou a forma de fazer análise: um motor SQL colunar embutido, capaz de consultar CSV/Parquet direto, localmente ou em S3. DuckLake leva isso ao nível "lakehouse" guardando os metadados em um banco SQL em vez de uma pilha de arquivos.',
  why: 'Relatórios e analytics sem derrubar o banco transacional — e sem a complexidade de clusters Spark.',
  prereq: 'SQL básico. Ajuda ter visto a lição "Servindo dados analíticos" na trilha de APIs.',
  refs: [doc('DuckDB — Documentação', 'https://duckdb.org/docs/stable/'), doc('DuckLake — site oficial', 'https://ducklake.select/'), doc('DuckLake — documentação', 'https://ducklake.select/docs/stable/'), doc('DuckDB — anúncio do DuckLake (blog)', 'https://duckdb.org/2025/05/27/ducklake.html')],
  lessons: [
    {
      slug: 'duckdb', title: 'DuckDB essencial: colunar, embutido e rápido', level: 1, min: 30, kw: 'duckdb parquet csv colunar olap sql python s3 httpfs',
      goals: ['Explicar por que o armazenamento colunar acelera análises', 'Consultar CSV/Parquet direto com SQL', 'Usar DuckDB via CLI e Python'],
      blocks: [
        { t: 'p', x: 'Bancos <b>OLTP</b> (Postgres, SQL Server) são otimizados para muitas operações pequenas em linhas. Análises (somas, médias, agrupamentos) leem <i>poucas colunas de muitas linhas</i> — onde o formato <b>colunar</b> e a execução <b>vetorizada</b> do DuckDB brilham.' },
        { t: 'nest', title: 'Quanto de dado precisa ser lido para "SUM(valor)"?', tree: { n: 'Tabela vendas (id, cliente, data, valor)', k: 's', c: [
          { n: 'Armazenamento por LINHA', k: 'r', s: 'lê tudo', c: [{ n: 'id·cliente·data·valor' }, { n: 'id·cliente·data·valor' }, { n: 'id·cliente·data·valor' }] },
          { n: 'Armazenamento por COLUNA', k: 'g', s: 'lê só o necessário', c: [{ n: 'id' }, { n: 'cliente' }, { n: 'data' }, { n: 'valor ◀ lido', k: 'o' }] }
        ] }, cap: 'Além de ler menos, colunas do mesmo tipo comprimem muito melhor (Parquet usa isso).' },
        { t: 'code', lang: 'bash', file: 'terminal', x: R`
pip install duckdb         # ou baixe o CLI em duckdb.org
duckdb                     # abre o shell interativo
` },
        { t: 'code', lang: 'sql', file: 'duckdb shell', x: R`
-- consulta direta em arquivos, sem "importar" nada
SELECT * FROM 'vendas.parquet' LIMIT 5;
SELECT * FROM read_csv('vendas.csv', header = true) LIMIT 5;
DESCRIBE SELECT * FROM 'vendas.parquet';

-- análise
SELECT date_trunc('month', data) AS mes, sum(valor) AS total, count(*) AS pedidos
FROM 'vendas/*.parquet'                      -- glob: vários arquivos de uma vez
GROUP BY 1 ORDER BY 1;

-- converter CSV em Parquet (menor e muito mais rápido)
COPY (SELECT * FROM read_csv('vendas.csv')) TO 'vendas.parquet' (FORMAT parquet, COMPRESSION zstd);

-- dados em S3 (credenciais da cadeia padrão da AWS)
INSTALL httpfs; LOAD httpfs;
CREATE SECRET (TYPE s3, PROVIDER credential_chain);
SELECT count(*) FROM read_parquet('s3://meu-bucket/vendas/*.parquet');
` },
        { t: 'code', lang: 'python', file: 'analise.py', x: R`
import duckdb

# banco em memória; use duckdb.connect("arquivo.duckdb") para persistir
con = duckdb.connect()
df = con.execute("""
    SELECT cliente_id, sum(valor) AS total
    FROM 'vendas.parquet'
    WHERE data >= ?
    GROUP BY 1 ORDER BY total DESC LIMIT 10
""", ["2026-01-01"]).df()          # devolve um DataFrame pandas
print(df)
` },
        { t: 'table', head: ['Use DuckDB para…', 'Evite para…'], rows: [
          ['Análise exploratória, relatórios, ETL/ELT local ou em job', 'Milhares de transações pequenas e concorrentes (OLTP)'],
          ['Consultar Parquet/CSV/JSON em disco ou S3', 'Servir como banco multiusuário de escrita simultânea (arquivo único)'],
          ['Motor embutido em API/notebook/CLI', 'Dados que não cabem em um único nó e exigem processamento distribuído massivo']
        ] },
        { t: 'lab', title: 'Seu primeiro mini data lake', steps: ['Gere um CSV de vendas (1+ milhão de linhas) com Python', 'Converta para Parquet e compare tamanho e tempo de consulta CSV × Parquet', 'Crie uma consulta de top 10 clientes e rode com <code>EXPLAIN ANALYZE</code>'] }
      ],
      quiz: { q: 'Por que o formato colunar é vantajoso para <code>SELECT sum(valor) FROM vendas</code>?', o: ['Porque usa mais memória', 'Porque lê apenas a coluna "valor" em vez de linhas inteiras', 'Porque dispensa SQL', 'Porque grava mais rápido que o OLTP'], a: 1, w: 'Em colunar, cada coluna fica armazenada junta: a consulta toca só o que precisa, com compressão e execução vetorizada.' },
      refs: [doc('Por que DuckDB?', 'https://duckdb.org/why_duckdb'), doc('DuckDB — Guia de SQL', 'https://duckdb.org/docs/stable/sql/introduction'), doc('Apache Parquet', 'https://parquet.apache.org/docs/'), yt('duckdb tutorial parquet analytics')]
    },
    {
      slug: 'ducklake', title: 'DuckLake: lakehouse com catálogo SQL', level: 2, min: 35, kw: 'ducklake lakehouse iceberg delta catalog snapshot time travel postgres parquet metadata',
      goals: ['Explicar a arquitetura do DuckLake (catálogo SQL + arquivos Parquet)', 'Criar um lake, inserir dados e usar snapshots/time travel', 'Comparar com Iceberg e Delta Lake em alto nível'],
      blocks: [
        { t: 'p', x: 'Formatos de lakehouse como Iceberg e Delta guardam <b>metadados em arquivos</b> (manifestos, logs) junto aos dados. O <b>DuckLake</b> adota outra ideia: os metadados vivem em um <b>banco SQL</b> (DuckDB, SQLite, Postgres, MySQL…) e os dados em arquivos <b>Parquet</b>. Resultado: transações ACID, snapshots e evolução de esquema usando a robustez de um banco relacional para o catálogo.' },
        { t: 'nest', title: 'Arquitetura do DuckLake', tree: { n: 'Seus clientes', k: 's', c: [
          { n: 'DuckDB (API)', k: 'b' }, { n: 'DuckDB (notebook)', k: 'b' }, { n: 'DuckDB (job ETL)', k: 'b' },
          { n: 'Catálogo (metadados)', k: 'p', s: 'Postgres / SQLite / DuckDB', c: [{ n: 'tabelas, colunas' }, { n: 'snapshots' }, { n: 'lista de arquivos' }, { n: 'estatísticas' }] },
          { n: 'Armazenamento (dados)', k: 'g', s: 'disco ou S3', c: [{ n: 'part-1.parquet' }, { n: 'part-2.parquet' }, { n: '…' }] }
        ] }, cap: 'Cada cliente DuckDB conversa com o catálogo (transações) e lê/escreve Parquet diretamente no armazenamento.' },
        { t: 'code', lang: 'sql', file: 'ducklake — primeiros passos (catálogo local)', x: R`
INSTALL ducklake; LOAD ducklake;

-- catálogo em um arquivo + dados em uma pasta
ATTACH 'ducklake:meu_lake.ducklake' AS lake (DATA_PATH 'lake_files/');
USE lake;

CREATE TABLE vendas (id BIGINT, data DATE, cliente_id BIGINT, valor DECIMAL(12,2));
INSERT INTO vendas VALUES (1, '2026-01-10', 7, 150.00), (2, '2026-01-11', 8, 99.90);
UPDATE vendas SET valor = 120.00 WHERE id = 1;       -- ACID + histórico preservado

-- cada operação confirmada gera um snapshot
SELECT * FROM lake.snapshots();

-- time travel: como a tabela estava na versão 2?
SELECT * FROM vendas AT (VERSION => 2);
SELECT * FROM vendas AT (TIMESTAMP => now() - INTERVAL '1 day');
` },
        { t: 'code', lang: 'sql', file: 'ducklake — multiusuário com Postgres + S3', x: R`
-- Catálogo compartilhado no Postgres; dados no S3. Vários clientes DuckDB usam o mesmo lake.
ATTACH 'ducklake:postgres:dbname=ducklake_catalog host=db-catalogo user=lake_user' AS lake
    (DATA_PATH 's3://meu-bucket/lake/');
USE lake;
SELECT cliente_id, sum(valor) FROM vendas GROUP BY 1;
` },
        { t: 'table', head: ['', 'Parquet “solto”', 'Iceberg / Delta', 'DuckLake'], rows: [
          ['Transações ACID', 'Não', 'Sim', 'Sim (via catálogo SQL)'],
          ['Time travel / snapshots', 'Não', 'Sim', 'Sim'],
          ['Evolução de esquema', 'Manual', 'Sim', 'Sim'],
          ['Onde ficam os metadados', '—', 'Arquivos (manifestos/logs)', 'Banco SQL'],
          ['Complexidade operacional', 'Baixa (mas frágil)', 'Maior (catálogo + engines)', 'Menor: reaproveita um banco que você já opera'],
          ['Maturidade/ecossistema', 'Universal', 'Muito amplo', 'Novo (lançado em 2025): confira o status da versão estável']
        ] },
        { t: 'callout', k: 'warn', x: '<b>Tecnologia jovem:</b> o DuckLake foi apresentado em 2025 e evolui rápido. Antes de usar em produção, leia a especificação e as notas de versão em <a href="https://ducklake.select/" target="_blank" rel="noopener">ducklake.select</a> e fixe a versão do DuckDB/extensão. Para necessidades de interoperabilidade ampla com outras engines hoje, Iceberg/Delta ainda têm mais suporte.' },
        { t: 'callout', k: 'tip', x: 'Backup do lake = <b>backup do catálogo</b> (dump do Postgres) + bucket versionado. Perder o catálogo é perder o mapa dos arquivos.' }
      ],
      quiz: { q: 'Onde o DuckLake guarda os metadados (tabelas, snapshots, lista de arquivos)?', o: ['Em arquivos JSON no S3', 'Em um banco de dados SQL (ex.: Postgres, SQLite, DuckDB)', 'Dentro de cada arquivo Parquet', 'No navegador'], a: 1, w: 'A ideia central do DuckLake é usar um banco SQL como catálogo, aproveitando transações ACID nativas, e deixar os dados em Parquet.' },
      refs: [doc('DuckLake — site e FAQ', 'https://ducklake.select/'), doc('DuckLake — documentação', 'https://ducklake.select/docs/stable/'), doc('Blog: apresentando o DuckLake', 'https://duckdb.org/2025/05/27/ducklake.html'), yt('ducklake duckdb lakehouse')]
    },
    {
      slug: 'arquitetura', title: 'Arquitetura de dados: camadas e escolha da ferramenta', level: 3, min: 25, kw: 'medallion bronze silver gold elt cdc oltp olap arquitetura escolha',
      goals: ['Organizar dados em camadas (bronze/silver/gold)', 'Escolher entre Postgres, SQL Server, DuckDB, DuckLake e Redis', 'Desenhar o fluxo OLTP → lake → API'],
      blocks: [
        { t: 'pipe', title: 'Arquitetura medallion (camadas de qualidade)', stages: [
          { n: 'Fontes', jobs: ['SQL Server', 'Postgres', 'APIs / arquivos'] },
          { n: '🥉 Bronze', jobs: [{ n: 'Cru, como veio', s: 'Parquet, imutável' }] },
          { n: '🥈 Silver', jobs: [{ n: 'Limpo e padronizado', s: 'tipos, duplicados, chaves' }] },
          { n: '🥇 Gold', jobs: [{ n: 'Pronto p/ negócio', s: 'métricas e agregados' }] },
          { n: 'Consumo', jobs: ['API (DuckDB)', 'BI / dashboards', 'ML'] }
        ], cap: 'Cada camada é recriável a partir da anterior (ELT): se a regra mudar, reprocesse.' },
        { t: 'table', head: ['Preciso de…', 'Ferramenta natural', 'Por quê'], rows: [
          ['Transações, integridade, muitas escritas pequenas', '<b>PostgreSQL / SQL Server</b>', 'OLTP maduro, ACID, índices, segurança'],
          ['Relatórios e agregações sobre muito histórico', '<b>DuckDB</b> (+ Parquet)', 'Colunar e vetorizado, sem servidor'],
          ['Vários usuários/jobs sobre o mesmo lake, versionamento, time travel', '<b>DuckLake</b> (catálogo em Postgres)', 'ACID no lake com catálogo simples'],
          ['Latência de sub-milissegundo, contadores, sessões, rate limit', '<b>Redis</b>', 'Estruturas em memória'],
          ['Busca textual avançada', 'Motor de busca dedicado (OpenSearch/Elasticsearch) ou recursos de FTS do banco', 'Relevância, tokenização']
        ] },
        { t: 'flow', title: 'Do pedido ao relatório', steps: [
          { n: 'Pedido gravado', s: 'OLTP', d: 'A API grava o pedido no Postgres/SQL Server em uma transação.' },
          { n: 'Captura', s: 'CDC ou incremental', d: 'Um job lê as mudanças desde o último marcador (coluna <code>atualizado_em</code>, CDC do SQL Server ou replicação lógica do Postgres).' },
          { n: 'Bronze/Silver', s: 'Parquet/DuckLake', d: 'DuckDB grava os dados em Parquet particionado (ex.: por data) e aplica limpeza.' },
          { n: 'Gold', s: 'agregados', d: 'Tabelas prontas para consulta (vendas por dia/cliente).' },
          { n: 'API de relatórios', s: 'DuckDB + Redis', d: 'Consulta o gold e guarda respostas caras no Redis com TTL.' }
        ] },
        { t: 'callout', k: 'info', x: 'Comece simples: <b>Postgres + um job diário que gera Parquet + DuckDB na API</b> resolve boa parte dos casos. Adote DuckLake quando precisar de múltiplos escritores, histórico/auditoria e gestão de esquema.' }
      ],
      quiz: { q: 'Qual o objetivo da camada Bronze na arquitetura medallion?', o: ['Servir dashboards finais', 'Guardar o dado bruto, como veio da origem, para permitir reprocessamento', 'Substituir o banco transacional', 'Armazenar senhas'], a: 1, w: 'Bronze preserva o dado cru e imutável; Silver e Gold derivam dele. Assim, se uma regra de limpeza mudar, você reprocessa sem reextrair da fonte.' },
      refs: [doc('Arquitetura medallion (Databricks)', 'https://www.databricks.com/glossary/medallion-architecture'), doc('DuckDB — particionamento Hive em Parquet', 'https://duckdb.org/docs/stable/data/partitioning/hive_partitioning'), doc('PostgreSQL — replicação lógica', 'https://www.postgresql.org/docs/current/logical-replication.html'), doc('SQL Server — Change Data Capture', 'https://learn.microsoft.com/pt-br/sql/relational-databases/track-changes/about-change-data-capture-sql-server')]
    }
  ]
});
