TRACKS.push({
  id: 'terraform', order: 8, level: 3, icon: '🏗️', color: '#7b42bc', title: 'Terraform (IaC)',
  desc: 'Infraestrutura como código: providers, HCL, state, módulos e pipelines de plan/apply.',
  long: 'Com Terraform você descreve a infraestrutura (redes, bancos, clusters) em arquivos versionados, revisa mudanças via <i>plan</i> e aplica de forma repetível. É a mesma ideia do Kubernetes — declarativo — aplicada à nuvem.',
  why: 'Cria o cluster, o banco e a rede que o resto da trilha usa — de forma reproduzível e revisável.',
  prereq: 'Git, GitHub Actions e noções de uma nuvem (AWS/Azure/GCP). Instale o Terraform (ou OpenTofu).',
  refs: [doc('Terraform — Documentação', 'https://developer.hashicorp.com/terraform/docs'), doc('Tutoriais oficiais', 'https://developer.hashicorp.com/terraform/tutorials'), doc('Terraform Registry', 'https://registry.terraform.io/'), doc('OpenTofu (fork aberto)', 'https://opentofu.org/docs/'), vid('Canal oficial da HashiCorp no YouTube', 'https://www.youtube.com/@HashiCorp', 'Palestras e demos oficiais')],
  lessons: [
    {
      slug: 'iac', title: 'IaC e o fluxo: write → init → plan → apply', level: 1, min: 20, kw: 'terraform iac init plan apply destroy provider opentofu',
      goals: ['Explicar por que usar IaC', 'Executar o fluxo init/plan/apply/destroy', 'Entender o papel de providers e do Terraform Core'],
      blocks: [
        { t: 'p', x: 'Criar recursos clicando no console é rápido, mas <b>não é reproduzível, revisável nem auditável</b>. IaC trata infraestrutura como software: versionada, revisada em PR, testada e aplicada por pipeline.' },
        { t: 'flow', title: 'O ciclo de vida do Terraform', steps: [
          { n: 'Write', s: 'arquivos .tf', d: 'Você descreve o <b>estado desejado</b> em HCL (HashiCorp Configuration Language).' },
          { n: 'init', s: 'terraform init', d: 'Baixa os <b>providers</b> (plugins que falam com AWS, Azure, GCP, GitHub, Kubernetes…) e módulos, e configura o backend do state.' },
          { n: 'plan', s: 'terraform plan', d: 'Compara o código com o <b>state</b> e a realidade, e mostra o que será criado (+), alterado (~) ou destruído (-). <b>Nada é alterado ainda.</b>' },
          { n: 'apply', s: 'terraform apply', d: 'Executa o plano na ordem correta (grafo de dependências), em paralelo quando possível, e atualiza o state.' },
          { n: 'destroy', s: 'terraform destroy', d: 'Remove tudo o que o código gerencia. Excelente para ambientes de laboratório efêmeros.' }
        ] },
        { t: 'code', lang: 'hcl', file: 'main.tf', x: R`
terraform {
  required_version = ">= 1.9"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"          # aceita 5.x, nunca 6.0 sem você decidir
    }
  }
}

provider "aws" {
  region = "sa-east-1"
}

resource "aws_s3_bucket" "logs" {
  bucket = "minha-org-logs-dev-12345"      # nomes de bucket são globais
  tags   = { Ambiente = "dev", Gerido_por = "terraform" }
}

output "bucket_arn" {
  value = aws_s3_bucket.logs.arn
}
` },
        { t: 'code', lang: 'bash', file: 'terminal', x: R`
terraform fmt -recursive      # formata
terraform init
terraform validate            # sintaxe e consistência
terraform plan -out=tfplan
terraform apply tfplan        # aplica exatamente o plano revisado
terraform destroy
` },
        { t: 'callout', k: 'info', x: '<b>Licença e alternativas:</b> em 2023 a HashiCorp mudou a licença do Terraform para BSL (Business Source License). A comunidade criou o <b>OpenTofu</b>, fork de código aberto mantido sob a Linux Foundation, com sintaxe e fluxo praticamente idênticos. Avalie o impacto de licença para o seu caso de uso — especialmente se pretende comercializar serviços em cima da ferramenta.' }
      ],
      quiz: { q: 'O que o <code>terraform plan</code> faz?', o: ['Cria os recursos na nuvem', 'Mostra o que seria criado/alterado/destruído, sem aplicar', 'Apaga o state', 'Baixa providers'], a: 1, w: 'O plan é a "pré-visualização" que você revisa (em PR, inclusive) antes do apply. Baixar providers é função do init.' },
      refs: [doc('O que é Terraform?', 'https://developer.hashicorp.com/terraform/intro'), doc('Comandos do workflow', 'https://developer.hashicorp.com/terraform/cli/run'), yt('terraform tutorial for beginners init plan apply')]
    },
    {
      slug: 'hcl', title: 'HCL na prática: variáveis, dados, loops e dependências', level: 2, min: 30, kw: 'hcl variable output locals data for_each count depends_on lifecycle',
      goals: ['Parametrizar a configuração com variables/locals/outputs', 'Usar for_each e data sources', 'Entender dependências implícitas e o grafo'],
      blocks: [
        { t: 'table', head: ['Bloco', 'Função'], rows: [
          ['<code>resource</code>', 'Algo que o Terraform cria e gerencia'],
          ['<code>data</code>', 'Lê algo que já existe (somente leitura)'],
          ['<code>variable</code>', 'Entrada parametrizável (com tipo, default e validação)'],
          ['<code>locals</code>', 'Valores calculados internos, evitam repetição'],
          ['<code>output</code>', 'Valores expostos (para humanos, pipelines ou outros módulos)']
        ] },
        { t: 'nest', title: 'Dependências implícitas formam um grafo', tree: { n: 'Terraform Core', k: 's', c: [
          { n: 'aws_vpc.main', k: 'b', c: [{ n: 'aws_subnet.privada', s: 'usa vpc.main.id' }, { n: 'aws_security_group.db', s: 'usa vpc.main.id' }] },
          { n: 'aws_db_instance.pg', k: 'o', s: 'depende da subnet e do SG' }
        ] }, cap: 'Ao referenciar <code>aws_vpc.main.id</code>, você cria a dependência. O Terraform ordena e paraleliza sozinho; <code>depends_on</code> só para dependências não visíveis no código.' },
        { t: 'code', lang: 'hcl', file: 'variables.tf + main.tf', x: R`
variable "ambiente" {
  type        = string
  description = "dev | staging | prod"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.ambiente)
    error_message = "ambiente deve ser dev, staging ou prod."
  }
}

variable "buckets" {
  type    = set(string)
  default = ["raw", "curated", "exports"]
}

variable "db_password" {
  type      = string
  sensitive = true            # oculta em logs/plan (mas continua no state!)
}

locals {
  tags = { Ambiente = var.ambiente, Gerido_por = "terraform" }
}

resource "aws_s3_bucket" "dados" {
  for_each = var.buckets                      # um recurso por item
  bucket   = "minha-org-$\{var.ambiente}-$\{each.key}"
  tags     = local.tags
}

data "aws_caller_identity" "atual" {}          # lê a conta atual

output "buckets" {
  value = { for k, b in aws_s3_bucket.dados : k => b.arn }
}
` },
        { t: 'callout', k: 'tip', x: 'Prefira <code>for_each</code> a <code>count</code> para coleções: com <code>count</code>, remover um item do meio muda os índices e pode recriar recursos.' },
        { t: 'lab', title: 'Pratique sem custo', steps: ['Use o provider <code>local</code> ou <code>random</code> (sem nuvem) para criar arquivos/IDs com variables e for_each', 'Passe variáveis por <code>-var</code>, por <code>terraform.tfvars</code> e por <code>TF_VAR_nome</code>', 'Quebre a validação de propósito e leia o erro'] }
      ],
      quiz: { q: 'Por que preferir <code>for_each</code> a <code>count</code> em listas de recursos?', o: ['É mais rápido na CPU', 'As chaves são estáveis: remover um item não renumera nem recria os outros', 'Count foi removido do Terraform', 'for_each não precisa de provider'], a: 1, w: 'Com count o identificador é o índice; remover o elemento 0 desloca todos. Com for_each cada instância é identificada pela chave.' },
      refs: [doc('Linguagem do Terraform', 'https://developer.hashicorp.com/terraform/language'), doc('Variáveis de entrada', 'https://developer.hashicorp.com/terraform/language/values/variables'), doc('Meta-argumento for_each', 'https://developer.hashicorp.com/terraform/language/meta-arguments/for_each')]
    },
    {
      slug: 'state', title: 'State, backends remotos e drift', level: 2, min: 25, kw: 'state backend remote s3 lock import moved drift sensitive',
      goals: ['Explicar o que é o state e por que ele é crítico', 'Configurar backend remoto com locking', 'Lidar com import, refactor (moved) e drift'],
      blocks: [
        { t: 'p', x: 'O <b>state</b> é o mapa entre o seu código e os recursos reais (IDs, atributos). Sem ele o Terraform não sabe o que já existe. Por isso: <b>nunca</b> versione o state no Git, nunca o edite à mão e use um <b>backend remoto</b> com locking para o time.' },
        { t: 'flow', title: 'Como o Terraform decide o que fazer', steps: [
          { n: 'Código (.tf)', s: 'estado desejado', d: 'O que você declarou.' },
          { n: 'State', s: 'último estado conhecido', d: 'O que o Terraform lembra ter criado.' },
          { n: 'Refresh', s: 'realidade', d: 'Consulta a API do provider para ver como os recursos estão de fato. Se alguém mudou algo no console, isso é <b>drift</b>.' },
          { n: 'Diff', s: 'plano', d: 'Calcula a diferença entre desejado e real e produz o plano de ações.' }
        ] },
        { t: 'code', lang: 'hcl', file: 'backend.tf', x: R`
terraform {
  backend "s3" {
    bucket       = "minha-org-tfstate"
    key          = "plataforma/prod/terraform.tfstate"
    region       = "sa-east-1"
    encrypt      = true
    use_lockfile = true      # locking nativo no S3 (Terraform 1.10+); versões antigas usavam DynamoDB
  }
}
` },
        { t: 'code', lang: 'hcl', file: 'refactor.tf', x: R`
# Renomeou um recurso sem destruí-lo? Informe ao Terraform:
moved {
  from = aws_s3_bucket.logs
  to   = aws_s3_bucket.audit_logs
}

# Adotar um recurso que já existia (criado à mão):
import {
  to = aws_s3_bucket.legado
  id = "bucket-que-ja-existe"
}
` },
        { t: 'callout', k: 'warn', x: '<b>Segredos no state:</b> mesmo marcados como <code>sensitive</code>, valores como senhas de banco acabam no state em texto. Proteja o bucket (criptografia, acesso mínimo, versionamento) e prefira que segredos sejam gerados/gerenciados por serviços de segredos.' },
        { t: 'callout', k: 'tip', x: '<b>Drift:</b> rode <code>terraform plan</code> periodicamente em pipeline agendado (ou use as verificações de drift do HCP Terraform) para detectar alterações manuais.' }
      ],
      quiz: { q: 'Qual prática é correta para o arquivo de state em time?', o: ['Commitar o terraform.tfstate no Git', 'Usar backend remoto com criptografia e locking', 'Mandar por e-mail antes do apply', 'Apagar após cada apply'], a: 1, w: 'Backend remoto (S3, Azure Storage, GCS, HCP Terraform…) com locking evita applies simultâneos que corromperiam o state; criptografia protege dados sensíveis.' },
      refs: [doc('State', 'https://developer.hashicorp.com/terraform/language/state'), doc('Backend S3', 'https://developer.hashicorp.com/terraform/language/backend/s3'), doc('Bloco import', 'https://developer.hashicorp.com/terraform/language/import'), doc('Bloco moved (refactor)', 'https://developer.hashicorp.com/terraform/language/modules/develop/refactoring')]
    },
    {
      slug: 'modulos-ci', title: 'Módulos, ambientes e Terraform no CI/CD', level: 3, min: 35, kw: 'modules environments plan pr oidc tflint checkov trivy terraform test',
      goals: ['Criar e consumir módulos reutilizáveis', 'Estruturar ambientes dev/staging/prod', 'Rodar plan em PR e apply na main com OIDC'],
      blocks: [
        { t: 'p', x: 'Um <b>módulo</b> é um conjunto de recursos empacotado com entradas (variables) e saídas (outputs). Módulos reduzem repetição e embutem boas práticas (rede padrão, banco com backup, tags obrigatórias).' },
        { t: 'nest', title: 'Estrutura de repositório sugerida', tree: { n: 'infra/', k: 's', c: [
          { n: 'modules/', k: 'b', c: [{ n: 'network' }, { n: 'postgres' }, { n: 'k8s-cluster' }] },
          { n: 'envs/', k: 'g', c: [{ n: 'dev', s: 'chama modules + tfvars' }, { n: 'staging' }, { n: 'prod', s: 'state separado' }] },
          { n: '.terraform.lock.hcl', k: 'o', s: 'versões dos providers (commitar!)' }
        ] } },
        { t: 'code', lang: 'hcl', file: 'envs/prod/main.tf', x: R`
module "banco" {
  source  = "../../modules/postgres"
  nome    = "pedidos"
  classe  = "db.r6g.large"
  backup_dias = 14
  tags    = local.tags
}
# Módulos públicos também podem ser usados — sempre fixe a versão:
# source  = "terraform-aws-modules/vpc/aws"
# version = "~> 5.0"
` },
        { t: 'pipe', title: 'Terraform no pipeline', stages: [
          { n: 'Pull Request', jobs: ['fmt + validate', 'tflint / checkov / trivy', 'plan → comentário no PR'] },
          { n: 'Revisão', jobs: ['humano lê o plan', 'CODEOWNERS de infra'] },
          { n: 'Merge main', jobs: ['plan salvo (artefato)', '⏸ aprovação (Environment)', 'apply do plano'] },
          { n: 'Contínuo', jobs: ['plan agendado p/ detectar drift'] }
        ] },
        { t: 'code', lang: 'yaml', file: '.github/workflows/terraform.yml', x: R`
name: Terraform
on:
  pull_request: { paths: ["infra/**"] }
  push: { branches: [main], paths: ["infra/**"] }

permissions: { id-token: write, contents: read, pull-requests: write }

jobs:
  plan:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: infra/envs/prod } }
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - uses: aws-actions/configure-aws-credentials@v4     # OIDC, sem chaves
        with:
          role-to-assume: arn:aws:iam::123456789012:role/terraform-plan
          aws-region: sa-east-1
      - run: terraform fmt -check -recursive
      - run: terraform init -input=false
      - run: terraform validate
      - run: terraform plan -input=false -out=tfplan

  apply:
    if: github.ref == 'refs/heads/main'
    needs: plan
    runs-on: ubuntu-latest
    environment: production          # aprovação manual antes do apply
    steps:
      - run: echo "terraform apply com o plano aprovado"
` },
        { t: 'callout', k: 'tip', x: 'Teste a infraestrutura: <code>terraform test</code> (nativo, com módulos e asserts), além de <b>policy as code</b> (OPA/Sentinel/Checkov) para impedir, por exemplo, buckets públicos.' },
        { t: 'lab', title: 'Do código à nuvem com revisão', steps: ['Extraia um recurso repetido para um módulo local', 'Crie envs/dev e envs/prod com states separados', 'Monte o workflow de plan no PR e veja o plano como checagem', 'Adicione <code>checkov</code> ou <code>trivy config</code> e corrija um achado'] }
      ],
      quiz: { q: 'Por que fixar a versão de módulos e providers?', o: ['Para o plano ficar mais bonito', 'Para builds reproduzíveis: uma atualização externa não muda sua infraestrutura sem você decidir', 'Porque o Terraform exige', 'Para reduzir o custo da nuvem'], a: 1, w: 'Sem pin, um <code>init -upgrade</code> pode trazer comportamento novo/breaking. O lock file e <code>version</code> tornam a infra previsível.' },
      refs: [doc('Módulos', 'https://developer.hashicorp.com/terraform/language/modules'), doc('Testes (terraform test)', 'https://developer.hashicorp.com/terraform/language/tests'), doc('Automatizando Terraform com GitHub Actions', 'https://developer.hashicorp.com/terraform/tutorials/automation/github-actions'), doc('Trivy — IaC scanning', 'https://trivy.dev/latest/docs/scanner/misconfiguration/')]
    }
  ]
});
