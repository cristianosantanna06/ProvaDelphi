// Renderizadores de blocos de conteúdo. Cada bloco: {t:'tipo', ...}
// Tipos: p, h, ul, callout(tip|warn|info|bad), code, table, flow, nest, pipe, bars, lab, sim
(() => {
  'use strict';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = html => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

  /* ---------- realce de sintaxe leve ---------- */
  const KW = {
    python: 'def class return import from as if elif else for while in not and or is None True False with try except raise async await lambda yield pass assert finally',
    js: 'const let var function return import from export if else for while new class async await try catch throw null true false typeof',
    go: 'func package import return if else for range var const type struct interface go defer chan map nil true false',
    sql: 'select from where join left right inner outer on group by order having limit offset insert into values update set delete create table index unique primary key foreign references not null default and or as with distinct union all case when then else end fetch next rows only top output inserted returning conflict do nothing attach use install load copy to alter drop begin commit view count sum avg min max over partition interval',
    hcl: 'resource variable output provider module data locals terraform backend required_providers required_version for_each count depends_on lifecycle dynamic moved import check true false null',
    bash: 'sudo apt brew git docker kubectl terraform redis-cli curl cd ls cat echo export npm pip python duckdb helm gh kind',
    dockerfile: 'from run cmd copy add workdir env expose user entrypoint arg healthcheck label volume as',
    yaml: 'true false null on',
    redis: 'set get setex setnx del expire ttl incr incrby decr hset hget hgetall hincrby lpush rpush lpop rpop lrange llen sadd srem smembers sismember sinter zadd zrange zrevrange zrank zincrby zrem xadd xrange xread xreadgroup xgroup xack publish subscribe pexpire persist exists type scan hscan json.set json.get geoadd geosearch pfadd pfcount setbit getbit bitcount info config monitor ping keys object memory'
  };
  const SETS = {}; Object.keys(KW).forEach(k => SETS[k] = new Set(KW[k].split(' ')));
  const ALIAS = { py: 'python', javascript: 'js', ts: 'js', typescript: 'js', sh: 'bash', shell: 'bash', terraform: 'hcl', tf: 'hcl', yml: 'yaml', docker: 'dockerfile', 'redis-cli': 'redis', tsql: 'sql', cs: 'js', json: 'yaml', toml: 'yaml', text: 'none', ini: 'yaml' };
  function highlight(src, lang0) {
    const lang = ALIAS[lang0] || lang0 || 'none';
    if (lang === 'none') return esc(src);
    const hashC = ['python', 'bash', 'yaml', 'hcl', 'dockerfile'].includes(lang);
    const slashC = ['js', 'go', 'hcl'].includes(lang);
    const dashC = lang === 'sql';
    const parts = [];
    if (hashC) parts.push('(?<![^\\s])#[^\\n]*');
    if (slashC) parts.push('(?<![:/\\w])\\/\\/[^\\n]*');
    if (dashC) parts.push('--[^\\n]*');
    parts.push('(?!)');
    const re = new RegExp('(' + parts.join('|') + ')|("(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\')|(^[ \\t]*(?:- )?[\\w./-]+(?=:\\s|:$))|(\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_][\\w.-]*)', 'gm');
    const set = SETS[lang] || new Set();
    const ci = ['sql', 'dockerfile', 'redis'].includes(lang);
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index)); last = re.lastIndex;
      const t = m[0];
      if (m[1]) out += `<span class="tk-c">${esc(t)}</span>`;
      else if (m[2]) out += `<span class="tk-s">${esc(t)}</span>`;
      else if (m[3] && lang === 'yaml') out += `<span class="tk-y">${esc(t)}</span>`;
      else if (m[4]) out += `<span class="tk-n">${esc(t)}</span>`;
      else if (m[5] && set.has(ci ? t.toLowerCase() : t)) out += `<span class="tk-k">${esc(t)}</span>`;
      else out += esc(t);
    }
    return out + esc(src.slice(last));
  }

  const R = {};
  R.p = b => `<p>${b.x}</p>`;
  R.h = b => `<h3>${b.x}</h3>`;
  R.ul = b => `<ul class="ul">${b.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
  const ICON = { tip: '💡', warn: '⚠️', info: 'ℹ️', bad: '⛔' };
  R.callout = b => `<div class="callout ${b.k || 'info'}"><span class="i">${ICON[b.k || 'info']}</span><div>${b.x}</div></div>`;

  R.code = b => {
    const src = b.x.replace(/\$\\\{/g, () => '${').replace(/^\n/, '').trimEnd();
    const w = el(`<div class="blk"><div class="codewrap"><div class="codebar"><span class="dots"><i></i><i></i><i></i></span><span class="f">${esc(b.file || b.lang || '')}</span><button type="button">Copiar</button></div><pre><code>${highlight(src, b.lang)}</code></pre></div>${b.cap ? `<div class="hint">${b.cap}</div>` : ''}</div>`);
    const btn = w.querySelector('button');
    btn.onclick = async () => {
      try { await navigator.clipboard.writeText(src); } catch { const t = document.createElement('textarea'); t.value = src; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
      btn.textContent = 'Copiado ✓'; setTimeout(() => btn.textContent = 'Copiar', 1400);
    };
    return w;
  };

  R.table = b => `<div class="blk"><div class="tablewrap"><table><thead><tr>${b.head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${b.cap ? `<div class="hint">${b.cap}</div>` : ''}</div>`;

  R.flow = b => {
    const w = el(`<div class="blk"><div class="vis">${b.title ? `<div class="cap">${b.title}</div>` : ''}<div class="flow-row">${b.steps.map((s, i) => `${i ? '<span class="farrow">→</span>' : ''}<button type="button" class="fstep" data-i="${i}"><span class="no">${i + 1}</span><b>${s.n}</b>${s.s ? `<small>${s.s}</small>` : ''}</button>`).join('')}</div><div class="fdetail"></div><div class="hint">👆 Clique em cada etapa para ver o que acontece.</div></div></div>`);
    const det = w.querySelector('.fdetail'), btns = [...w.querySelectorAll('.fstep')];
    const pick = i => { btns.forEach((x, j) => x.classList.toggle('on', i === j)); det.innerHTML = b.steps[i].d || b.steps[i].s || ''; };
    btns.forEach((x, i) => x.onclick = () => pick(i)); pick(0);
    return w;
  };

  const nestHtml = (n, depth = 0) => {
    const kids = n.c || [];
    return `<div class="nest ${n.k ? 'nc-' + n.k : ''} ${kids.length ? '' : 'leaf'}"><div class="nh">${n.n}${n.s ? `<small>${n.s}</small>` : ''}</div>${kids.length ? `<div class="nc">${kids.map(c => nestHtml(c, depth + 1)).join('')}</div>` : ''}</div>`;
  };
  R.nest = b => `<div class="blk"><div class="vis">${b.title ? `<div class="cap">${b.title}</div>` : ''}${nestHtml(b.tree)}${b.cap ? `<div class="hint">${b.cap}</div>` : ''}</div></div>`;

  R.pipe = b => `<div class="blk"><div class="vis">${b.title ? `<div class="cap">${b.title}</div>` : ''}<div class="pipe">${b.stages.map((s, i) => `${i ? '<span class="pa">➜</span>' : ''}<div class="stage"><div class="sh">${s.n}</div>${(s.jobs || []).map(j => typeof j === 'string' ? `<div class="job">${j}</div>` : `<div class="job">${j.n}<small>${j.s || ''}</small></div>`).join('')}</div>`).join('')}</div>${b.cap ? `<div class="hint">${b.cap}</div>` : ''}</div></div>`;

  R.bars = b => {
    const max = Math.max(...b.items.map(i => i.v));
    const w = i => b.log ? Math.max(3, Math.log10(i.v + 1) / Math.log10(max + 1) * 100) : Math.max(2, i.v / max * 100);
    return `<div class="blk"><div class="vis">${b.title ? `<div class="cap">${b.title}</div>` : ''}${b.items.map(i => `<div class="bar"><span>${i.n}</span><span class="t"><i style="width:${w(i)}%;${i.c ? `background:${i.c}` : ''}"></i></span><span class="v">${i.l || i.v + (b.unit || '')}</span></div>`).join('')}${b.cap ? `<div class="hint">${b.cap}</div>` : ''}</div></div>`;
  };

  R.lab = (b, ctx) => {
    const w = el(`<div class="blk"><div class="lab"><h4>🛠️ Mão na massa — ${b.title}</h4>${b.steps.map((s, i) => `<label><input type="checkbox" data-i="${i}"><span>${s}</span></label>`).join('')}</div></div>`);
    w.querySelectorAll('input').forEach(inp => {
      const k = `${ctx.lesson.id}#${b.title}#${inp.dataset.i}`;
      inp.checked = !!ctx.S.lab[k]; inp.closest('label').classList.toggle('chk', inp.checked);
      inp.onchange = () => { if (inp.checked) ctx.S.lab[k] = 1; else delete ctx.S.lab[k]; inp.closest('label').classList.toggle('chk', inp.checked); ctx.save(); };
    });
    return w;
  };

  /* ---------- simuladores ---------- */
  function simPods() {
    const w = el(`<div class="blk"><div class="vis"><div class="cap">Simulador: Deployment + ReplicaSet reconciliando o estado desejado</div>
      <div class="ctrls"><label>replicas desejadas: <input type="range" min="1" max="8" value="3" id="rg"><b id="rv">3</b></label>
      <button class="btn sm" id="kill" type="button">💥 Matar um Pod</button><button class="btn sm ghost" id="upd" type="button">🚀 Atualizar imagem (rolling update)</button></div>
      <div class="sim-pods" id="pods"></div><div class="log" id="log"></div></div></div>`);
    let desired = 3, ver = 1, seq = 0, pods = [];
    const $ = s => w.querySelector(s), podsEl = $('#pods'), logEl = $('#log');
    const log = m => { logEl.innerHTML += `<div>${m}</div>`; logEl.scrollTop = logEl.scrollHeight; };
    const add = () => { const p = { id: 'pod-' + (++seq).toString(36) + Math.random().toString(36).slice(2, 4), ver, st: 'starting' }; pods.push(p); log(`+ ReplicaSet cria <b>${p.id}</b> (image v${ver})`); };
    for (let i = 0; i < 3; i++) { add(); pods[i].st = 'running'; } logEl.innerHTML = '<div># estado inicial: 3 pods rodando</div>';
    const draw = () => { podsEl.innerHTML = pods.map(p => `<div class="pod ${p.st} ${p.ver > 1 ? 'v2' : ''}"><b>${p.id}</b>v${p.ver}<br>${p.st === 'starting' ? 'Pending…' : p.st === 'dying' ? 'Terminating' : 'Running'}</div>`).join(''); };
    function tick() {
      if (!w.isConnected) return clearInterval(iv);
      pods = pods.filter(p => p.st !== 'dying');
      pods.forEach(p => { if (p.st === 'starting') p.st = 'running'; });
      const live = pods.filter(p => p.st !== 'dying');
      const old = live.filter(p => p.ver < ver);
      if (live.length < desired) add();
      else if (old.length && live.length === desired && !live.some(p => p.st === 'starting')) { add(); log('~ rolling update: surge de 1 pod novo'); }
      else if (live.length > desired) { const v = (live.filter(p => p.ver < ver)[0]) || live[live.length - 1]; v.st = 'dying'; log(`- removendo <b>${v.id}</b> (${v.ver < ver ? 'versão antiga' : 'excedente'})`); }
      draw();
    }
    $('#rg').oninput = e => { desired = +e.target.value; $('#rv').textContent = desired; log(`# kubectl scale --replicas=${desired}`); };
    $('#kill').onclick = () => { const l = pods.filter(p => p.st === 'running'); if (!l.length) return; const v = l[Math.floor(Math.random() * l.length)]; v.st = 'dying'; log(`! pod <b>${v.id}</b> morreu (falha de nó/OOM). O controller vai recriar…`); draw(); };
    $('#upd').onclick = () => { ver++; log(`# kubectl set image … → v${ver}. Deployment inicia rolling update`); };
    const iv = setInterval(tick, 900); draw();
    return w;
  }

  function simCache() {
    const w = el(`<div class="blk"><div class="vis"><div class="cap">Simulador: cache-aside com TTL (latências ilustrativas)</div>
      <div class="ctrls"><button class="btn sm" id="req" type="button">📨 Fazer requisição GET /produtos/42</button><button class="btn sm ghost" id="inv" type="button">🧹 Invalidar chave</button>
      <label>TTL: <input type="range" min="3" max="20" value="8" id="ttl"><b id="tv">8s</b></label></div>
      <div class="sim-cache"><div class="box" id="b1">Redis<b id="rs">vazio</b><small id="rt"></small></div><div class="box" id="b2">Resposta<b id="lat">—</b><small id="how"></small></div><div class="box" id="b3">Banco de dados<b id="dbc">0</b><small>consultas feitas</small></div></div>
      <div class="hint" id="ratio">Hit ratio: —</div></div></div>`);
    const $ = s => w.querySelector(s); let exp = 0, hits = 0, miss = 0, dbq = 0, ttl = 8;
    const upd = () => { const left = Math.ceil((exp - Date.now()) / 1000); const has = left > 0; $('#rs').textContent = has ? 'produto:42 ✔' : 'vazio'; $('#rt').textContent = has ? `expira em ${left}s` : ''; if (!w.isConnected) clearInterval(iv); };
    $('#ttl').oninput = e => { ttl = +e.target.value; $('#tv').textContent = ttl + 's'; };
    $('#req').onclick = () => {
      const has = exp > Date.now();
      if (has) { hits++; $('#lat').textContent = '~2 ms'; $('#how').textContent = 'HIT: veio do Redis'; $('#b2').className = 'box hit'; }
      else { miss++; dbq++; exp = Date.now() + ttl * 1000; $('#lat').textContent = '~80 ms'; $('#how').textContent = 'MISS: foi ao banco e gravou no Redis'; $('#b2').className = 'box miss'; }
      $('#dbc').textContent = dbq; $('#ratio').textContent = `Hit ratio: ${Math.round(hits / (hits + miss) * 100)}%  (${hits} hits / ${miss} misses)`; upd();
    };
    $('#inv').onclick = () => { exp = 0; upd(); };
    const iv = setInterval(upd, 500); upd();
    return w;
  }
  R.sim = b => ({ pods: simPods, cache: simCache }[b.id])();

  window.renderBlock = (b, ctx) => {
    const f = R[b.t]; if (!f) return el(`<div class="callout bad">bloco desconhecido: ${esc(b.t)}</div>`);
    const out = f(b, ctx);
    return typeof out === 'string' ? el(out) : out;
  };
  window.esc = esc;
})();
