TRACKS.push({
  id: 'k8s', order: 9, level: 4, icon: '☸️', color: '#326ce5', title: 'Kubernetes',
  desc: 'Orquestração de containers: arquitetura, workloads, rede, configuração, escala e segurança.',
  long: 'Kubernetes (K8s) é o padrão para orquestrar containers. A chave é entender o <b>modelo declarativo</b>: você descreve o estado desejado em YAML e controladores trabalham continuamente para fazer a realidade convergir para ele.',
  why: 'Fecha o ciclo: a imagem do Docker, construída no CI, roda aqui com escala e auto-recuperação.',
  prereq: 'Trilhas Docker e GitHub Actions. Instale <code>kubectl</code> e <code>kind</code> (cluster local em Docker).',
  refs: [doc('Kubernetes — Documentação', 'https://kubernetes.io/pt-br/docs/home/'), doc('Tutorial interativo: Kubernetes Basics', 'https://kubernetes.io/docs/tutorials/kubernetes-basics/'), doc('kind — cluster local', 'https://kind.sigs.k8s.io/'), vid('CNCF no YouTube (conferências KubeCon)', 'https://www.youtube.com/@cncf', 'Palestras oficiais da comunidade')],
  lessons: [
    {
      slug: 'arquitetura', title: 'Arquitetura e o modelo declarativo', level: 1, min: 25, kw: 'control plane api server etcd scheduler kubelet node cluster reconciliation',
      goals: ['Nomear os componentes do control plane e dos nós', 'Explicar o loop de reconciliação (estado desejado vs atual)', 'Criar um cluster local e usar o kubectl'],
      blocks: [
        { t: 'p', x: 'Um <b>cluster</b> Kubernetes tem um <b>control plane</b> (o "cérebro") e <b>nós de trabalho</b> (workers) onde seus containers rodam. Tudo passa pela <b>API Server</b>: kubectl, controladores e kubelets conversam só com ela.' },
        { t: 'nest', title: 'Anatomia de um cluster', tree: { n: 'Cluster', k: 's', c: [
          { n: 'Control Plane', k: 'p', c: [{ n: 'kube-apiserver', s: 'porta de entrada da API' }, { n: 'etcd', s: 'banco chave-valor com o estado' }, { n: 'kube-scheduler', s: 'decide em qual nó cada Pod roda' }, { n: 'controller-manager', s: 'loops de reconciliação' }] },
          { n: 'Node 1', k: 'b', c: [{ n: 'kubelet', s: 'agente do nó' }, { n: 'kube-proxy', s: 'regras de rede de Services' }, { n: 'container runtime', s: 'containerd / CRI-O' }, { n: 'Pod A' }, { n: 'Pod B' }] },
          { n: 'Node 2', k: 'b', c: [{ n: 'kubelet' }, { n: 'kube-proxy' }, { n: 'container runtime' }, { n: 'Pod C' }] }
        ] } },
        { t: 'flow', title: 'O que acontece quando você roda kubectl apply -f deploy.yaml', steps: [
          { n: 'kubectl', s: 'envia o YAML', d: 'O kubectl autentica e envia o objeto ao <b>API Server</b>.' },
          { n: 'API Server', s: 'valida e grava', d: 'Valida (schema, admissão, RBAC) e persiste o estado desejado no <b>etcd</b>.' },
          { n: 'Controllers', s: 'reconciliam', d: 'O controller do Deployment cria um ReplicaSet; o do ReplicaSet cria os Pods (apenas objetos, ainda sem nó).' },
          { n: 'Scheduler', s: 'escolhe o nó', d: 'Considera recursos, afinidades, taints/tolerations e atribui cada Pod a um nó.' },
          { n: 'kubelet', s: 'executa', d: 'O kubelet do nó vê o Pod atribuído, pede ao runtime para baixar a imagem e iniciar os containers, e reporta o status.' }
        ] },
        { t: 'callout', k: 'info', x: '<b>Modelo declarativo:</b> você não manda "suba 3 containers"; você declara "quero 3 réplicas". Se um nó cair, os controladores percebem a diferença e recriam os Pods. Isso é a base da auto-recuperação.' },
        { t: 'code', lang: 'bash', file: 'terminal', x: R`
kind create cluster --name curso            # cluster local dentro do Docker
kubectl cluster-info
kubectl get nodes -o wide
kubectl get pods -A                         # pods de todos os namespaces (veja os do kube-system)
kubectl api-resources                       # todos os tipos de objeto disponíveis
kubectl explain deployment.spec.strategy    # documentação embutida
` }
      ],
      quiz: { q: 'Qual componente armazena o estado do cluster?', o: ['kubelet', 'etcd', 'kube-proxy', 'scheduler'], a: 1, w: 'O etcd é o armazenamento chave-valor consistente do cluster. Apenas o API Server fala com ele; os demais componentes passam pelo API Server.' },
      refs: [doc('Componentes do Kubernetes', 'https://kubernetes.io/pt-br/docs/concepts/overview/components/'), doc('Objetos do Kubernetes', 'https://kubernetes.io/docs/concepts/overview/working-with-objects/'), yt('kubernetes architecture explained control plane worker nodes')]
    },
    {
      slug: 'workloads', title: 'Pods, ReplicaSets, Deployments e rolling update', level: 1, min: 30, kw: 'pod deployment replicaset rolling update statefulset job cronjob daemonset',
      goals: ['Escrever um Deployment correto', 'Entender auto-recuperação e escala', 'Executar e reverter um rolling update'],
      blocks: [
        { t: 'p', x: 'O <b>Pod</b> é a menor unidade implantável (um ou mais containers que compartilham rede e volumes). Você quase nunca cria Pods diretamente: usa um <b>Deployment</b>, que gerencia um <b>ReplicaSet</b>, que mantém o número desejado de Pods.' },
        { t: 'nest', title: 'Hierarquia de objetos', tree: { n: 'Deployment: api', s: 'estratégia, versão, rollback', k: 'b', c: [{ n: 'ReplicaSet: api-7d9f', s: 'mantém N réplicas', k: 'g', c: [{ n: 'Pod 1' }, { n: 'Pod 2' }, { n: 'Pod 3' }] }] } },
        { t: 'sim', id: 'pods' },
        { t: 'code', lang: 'yaml', file: 'deployment.yaml', x: R`
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels: { app: api }
spec:
  replicas: 3
  selector:
    matchLabels: { app: api }          # tem que casar com os labels do template
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }   # zero downtime
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: api
          image: ghcr.io/minha-org/api:1.4.0        # tag fixa, nunca :latest
          ports: [{ containerPort: 8000 }]
` },
        { t: 'code', lang: 'bash', file: 'terminal', x: R`
kubectl apply -f deployment.yaml
kubectl get deploy,rs,pods -l app=api
kubectl scale deployment/api --replicas=5
kubectl set image deployment/api api=ghcr.io/minha-org/api:1.5.0
kubectl rollout status deployment/api       # acompanha o rolling update
kubectl rollout undo deployment/api         # volta para a versão anterior
kubectl describe pod <nome>                 # eventos: o primeiro lugar para debugar
kubectl logs -f deploy/api
` },
        { t: 'table', head: ['Objeto', 'Use para'], rows: [
          ['<b>Deployment</b>', 'Aplicações stateless (APIs, front-ends) com rolling update'],
          ['<b>StatefulSet</b>', 'Apps com identidade estável e disco próprio (bancos, filas)'],
          ['<b>DaemonSet</b>', 'Um Pod por nó (agentes de log, monitoração)'],
          ['<b>Job / CronJob</b>', 'Tarefas pontuais e agendadas (migrações, relatórios)']
        ] },
        { t: 'lab', title: 'Quebre de propósito', steps: ['Aplique o Deployment e rode <code>kubectl delete pod &lt;um&gt;</code>: veja o Pod voltar sozinho', 'Faça rollout para uma imagem inexistente e veja <code>ImagePullBackOff</code>; depois use <code>rollout undo</code>', 'Escale para 5 réplicas e de volta para 2'] }
      ],
      quiz: { q: 'Com <code>maxSurge: 1</code> e <code>maxUnavailable: 0</code>, o que acontece no rolling update?', o: ['Todos os Pods são removidos e recriados de uma vez', 'Um Pod novo sobe antes de qualquer antigo ser removido, mantendo a capacidade total', 'O update é cancelado', 'Só um Pod existe por vez'], a: 1, w: 'maxUnavailable: 0 garante que nenhum Pod fique indisponível; maxSurge: 1 permite 1 Pod extra durante a troca. Resultado: atualização sem queda de capacidade.' },
      refs: [doc('Deployments', 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/'), doc('Pods', 'https://kubernetes.io/docs/concepts/workloads/pods/'), doc('Cheat sheet kubectl', 'https://kubernetes.io/docs/reference/kubectl/quick-reference/')]
    },
    {
      slug: 'rede', title: 'Rede: Services, Ingress e Gateway API', level: 2, min: 25, kw: 'service clusterip nodeport loadbalancer ingress gateway api dns',
      goals: ['Escolher o tipo de Service correto', 'Entender o caminho de uma requisição externa até o Pod', 'Diferenciar Ingress de Gateway API'],
      blocks: [
        { t: 'p', x: 'Pods são efêmeros e mudam de IP. Um <b>Service</b> dá um nome e IP estáveis à frente de um conjunto de Pods (selecionados por <i>labels</i>) e faz balanceamento. Dentro do cluster, o DNS resolve <code>api.minha-ns.svc.cluster.local</code>.' },
        { t: 'flow', title: 'Caminho de uma requisição externa', steps: [
          { n: 'Cliente', s: 'https://api.site.com', d: 'O DNS aponta para o IP do balanceador de carga do cluster.' },
          { n: 'Load Balancer', s: 'nuvem', d: 'Service <code>type: LoadBalancer</code> (ou o do controlador de borda) provisiona o LB na nuvem.' },
          { n: 'Ingress / Gateway', s: 'L7: host e path', d: 'Termina TLS e roteia por host/caminho (<code>/api</code> → serviço A, <code>/web</code> → serviço B).' },
          { n: 'Service', s: 'ClusterIP', d: 'IP virtual estável; o kube-proxy distribui entre os Pods saudáveis (os que passam no readinessProbe).' },
          { n: 'Pod', s: 'container', d: 'A requisição finalmente chega à aplicação.' }
        ] },
        { t: 'table', head: ['Tipo de Service', 'Alcance', 'Quando usar'], rows: [
          ['<code>ClusterIP</code> (padrão)', 'Só dentro do cluster', 'Comunicação entre serviços'],
          ['<code>NodePort</code>', 'Porta aberta em todos os nós', 'Testes/labs; raramente em produção'],
          ['<code>LoadBalancer</code>', 'IP externo via nuvem', 'Expor um serviço direto à internet'],
          ['<code>ExternalName</code>', 'Alias DNS', 'Apontar para serviço externo']
        ] },
        { t: 'code', lang: 'yaml', file: 'service-gateway.yaml', x: R`
apiVersion: v1
kind: Service
metadata: { name: api }
spec:
  selector: { app: api }
  ports: [{ port: 80, targetPort: 8000 }]
---
# Gateway API (sucessor do Ingress): papéis separados entre plataforma e aplicação
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata: { name: api }
spec:
  parentRefs: [{ name: gateway-publico }]       # Gateway criado pelo time de plataforma
  hostnames: ["api.site.com"]
  rules:
    - matches: [{ path: { type: PathPrefix, value: /v1 } }]
      backendRefs: [{ name: api, port: 80 }]
` },
        { t: 'callout', k: 'info', x: '<b>Ingress vs Gateway API:</b> o Ingress é uma API estável, porém limitada e muito dependente de anotações de cada controlador. A <b>Gateway API</b> é a evolução oficial (papéis, mais protocolos, portabilidade). Atenção: o projeto comunitário <i>Ingress NGINX</i> teve sua aposentadoria anunciada pelo Kubernetes em 2025 — consulte o blog oficial do Kubernetes e a documentação do controlador que você usa antes de escolher.' }
      ],
      quiz: { q: 'Qual objeto dá um endereço estável a um conjunto de Pods efêmeros?', o: ['ConfigMap', 'Service', 'Namespace', 'Node'], a: 1, w: 'O Service seleciona Pods por label e expõe IP/DNS estáveis com balanceamento. Só Pods "Ready" recebem tráfego.' },
      refs: [doc('Service', 'https://kubernetes.io/docs/concepts/services-networking/service/'), doc('Gateway API', 'https://kubernetes.io/docs/concepts/services-networking/gateway/'), doc('Site da Gateway API', 'https://gateway-api.sigs.k8s.io/'), doc('Ingress', 'https://kubernetes.io/docs/concepts/services-networking/ingress/')]
    },
    {
      slug: 'producao', title: 'Pronto para produção: config, probes, recursos e HPA', level: 2, min: 35, kw: 'configmap secret probes liveness readiness startup requests limits hpa pvc',
      goals: ['Separar configuração do código (ConfigMap/Secret)', 'Configurar probes e requests/limits corretamente', 'Habilitar autoescala horizontal (HPA)'],
      blocks: [
        { t: 'p', x: 'Subir um Pod é fácil; operá-lo bem exige quatro hábitos: <b>configuração externa</b>, <b>health checks</b>, <b>limites de recursos</b> e <b>autoescala</b>.' },
        { t: 'table', head: ['Probe', 'Pergunta', 'Se falhar…'], rows: [
          ['<b>startupProbe</b>', 'Já terminou de iniciar?', 'Segura os outros probes (apps lentos); após o limite, reinicia'],
          ['<b>readinessProbe</b>', 'Pode receber tráfego?', 'Pod sai do Service (não reinicia)'],
          ['<b>livenessProbe</b>', 'Está travado?', 'kubelet reinicia o container']
        ] },
        { t: 'code', lang: 'yaml', file: 'api-producao.yaml', x: R`
apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: ghcr.io/minha-org/api:1.4.0
          ports: [{ containerPort: 8000 }]
          envFrom:
            - configMapRef: { name: api-config }       # configuração não sensível
            - secretRef:    { name: api-secrets }      # sensível (veja aviso abaixo)
          resources:
            requests: { cpu: 200m, memory: 256Mi }     # reserva usada pelo scheduler e pelo HPA
            limits:   { memory: 512Mi }                # limite de memória (evita OOM em cascata)
          readinessProbe:
            httpGet: { path: /ready, port: 8000 }
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /health, port: 8000 }
            initialDelaySeconds: 10
            periodSeconds: 10
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: api }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }
  minReplicas: 3
  maxReplicas: 12
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }
` },
        { t: 'callout', k: 'warn', x: '<b>Secret não é criptografia:</b> por padrão os valores ficam apenas em base64 no etcd. Habilite criptografia em repouso, restrinja o acesso via RBAC e prefira integrar um gerenciador externo (External Secrets, CSI Secret Store, Vault). Nunca versione Secrets em texto no Git (use SOPS/Sealed Secrets).' },
        { t: 'callout', k: 'tip', x: '<b>requests vs limits:</b> <i>requests</i> é o que o scheduler reserva (e base do HPA em % de CPU). Muitos times definem limite de memória mas evitam limite de CPU para não sofrer <i>throttling</i> — avalie com métricas.' },
        { t: 'lab', title: 'Teste os probes', steps: ['Implante a API com readinessProbe apontando para um endpoint que você possa fazer falhar', 'Faça-o falhar e veja o Pod sair do Service (<code>kubectl get endpoints api</code>)', 'Instale o metrics-server no kind e gere carga para ver o HPA escalar (<code>kubectl get hpa -w</code>)'] }
      ],
      quiz: { q: 'Um Pod falhou no readinessProbe. O que acontece?', o: ['O container é reiniciado imediatamente', 'O Pod é removido dos endpoints do Service e deixa de receber tráfego', 'O cluster é desligado', 'O Deployment é apagado'], a: 1, w: 'Readiness controla o tráfego; liveness controla reinício. Falhar readiness tira o Pod de rotação sem reiniciá-lo.' },
      refs: [doc('Probes de liveness/readiness/startup', 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/'), doc('Gerenciamento de recursos de containers', 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/'), doc('HorizontalPodAutoscaler', 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/'), doc('Boas práticas com Secrets', 'https://kubernetes.io/docs/concepts/security/secrets-good-practices/')]
    },
    {
      slug: 'seguranca-gitops', title: 'Segurança, empacotamento e GitOps', level: 3, min: 35, kw: 'rbac networkpolicy pod security helm kustomize gitops argo flux',
      goals: ['Aplicar RBAC, NetworkPolicy e Pod Security Standards', 'Escolher entre Helm e Kustomize', 'Explicar o fluxo GitOps (pull-based)'],
      blocks: [
        { t: 'nest', title: 'Segurança em camadas no cluster', tree: { n: 'Cluster', k: 's', c: [
          { n: 'Quem pode o quê', k: 'b', c: [{ n: 'RBAC', s: 'Roles + Bindings, menor privilégio' }, { n: 'ServiceAccounts', s: 'identidade dos Pods' }] },
          { n: 'O que o Pod pode fazer', k: 'o', c: [{ n: 'Pod Security Standards', s: 'privileged / baseline / restricted' }, { n: 'securityContext', s: 'non-root, sem escalada, FS somente leitura' }] },
          { n: 'Quem fala com quem', k: 'r', c: [{ n: 'NetworkPolicy', s: 'default deny + liberações explícitas' }] },
          { n: 'Cadeia de suprimentos', k: 'g', c: [{ n: 'Imagens assinadas/escaneadas', s: 'Trivy, cosign' }, { n: 'Admission policies', s: 'regras obrigatórias' }] }
        ] } },
        { t: 'code', lang: 'yaml', file: 'seguranca.yaml', x: R`
# 1) Aplicar o perfil "restricted" a um namespace (Pod Security Admission)
apiVersion: v1
kind: Namespace
metadata:
  name: producao
  labels:
    pod-security.kubernetes.io/enforce: restricted
---
# 2) Negar todo tráfego de entrada por padrão
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-ingress, namespace: producao }
spec:
  podSelector: {}
  policyTypes: [Ingress]
---
# 3) Liberar apenas o gateway para falar com a API
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-gateway, namespace: producao }
spec:
  podSelector: { matchLabels: { app: api } }
  ingress:
    - from: [{ namespaceSelector: { matchLabels: { name: gateway } } }]
      ports: [{ port: 8000 }]
---
# 4) securityContext endurecido no container
# (dentro de spec.containers[]):
#   securityContext:
#     runAsNonRoot: true
#     allowPrivilegeEscalation: false
#     readOnlyRootFilesystem: true
#     capabilities: { drop: ["ALL"] }
#     seccompProfile: { type: RuntimeDefault }
` },
        { t: 'callout', k: 'info', x: '<b>NetworkPolicy</b> só tem efeito se o plugin de rede (CNI) do cluster a suportar (ex.: Calico, Cilium).' },
        { t: 'table', head: ['', 'Helm', 'Kustomize'], rows: [
          ['Ideia', 'Gerenciador de pacotes: templates + values (charts)', 'Overlays: patches sobre YAML puro'],
          ['Ponto forte', 'Distribuir/versionar apps; ecossistema de charts', 'Simples, nativo no kubectl (<code>kubectl apply -k</code>)'],
          ['Cuidado', 'Templates complexos ficam difíceis de ler', 'Menos expressivo para lógica condicional']
        ] },
        { t: 'flow', title: 'GitOps (pull-based): Git é a fonte da verdade', steps: [
          { n: 'PR no repo de apps', s: 'código', d: 'Desenvolvedor altera o código; o CI testa e publica a imagem.' },
          { n: 'CI atualiza manifestos', s: 'nova tag', d: 'O pipeline abre um commit/PR no repositório de manifestos com a nova tag da imagem.' },
          { n: 'Merge', s: 'aprovação', d: 'Revisão e merge: a mudança fica auditada no histórico do Git.' },
          { n: 'Argo CD / Flux', s: 'dentro do cluster', d: 'O agente no cluster <b>puxa</b> o estado do Git e compara com o cluster.' },
          { n: 'Sync', s: 'reconcilia', d: 'Aplica as diferenças; se alguém altera algo na mão (drift), o agente detecta e corrige ou alerta.' }
        ] },
        { t: 'callout', k: 'tip', x: 'Vantagens do GitOps: auditoria nativa, rollback = <code>git revert</code>, credenciais do cluster não saem de dentro dele (o CI não precisa de kubeconfig de produção).' }
      ],
      quiz: { q: 'No GitOps pull-based, quem aplica as mudanças no cluster?', o: ['O desenvolvedor, com kubectl local', 'Um agente dentro do cluster (Argo CD/Flux) que sincroniza a partir do Git', 'O navegador do usuário', 'O banco de dados'], a: 1, w: 'O agente observa o repositório e reconcilia o cluster. O CI apenas publica artefatos e atualiza o Git — sem credenciais de produção.' },
      refs: [doc('RBAC', 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/'), doc('Pod Security Standards', 'https://kubernetes.io/docs/concepts/security/pod-security-standards/'), doc('Network Policies', 'https://kubernetes.io/docs/concepts/services-networking/network-policies/'), doc('Helm', 'https://helm.sh/docs/'), doc('Argo CD', 'https://argo-cd.readthedocs.io/'), doc('Princípios do GitOps (OpenGitOps)', 'https://opengitops.dev/')]
    }
  ]
});
