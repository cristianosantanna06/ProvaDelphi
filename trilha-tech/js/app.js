(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = window.esc;
  const TR = window.TRACKS.slice().sort((a, b) => a.order - b.order);
  const LEVELS = [
    { n: 1, t: 'Fundamentos', d: 'A base de tudo: versionar, empacotar, escrever código limpo e trabalhar em time.' },
    { n: 2, t: 'Construção', d: 'Construir serviços e dados: APIs, cache, SQL e analítico.' },
    { n: 3, t: 'Automação', d: 'Entregar com segurança e repetição: CI/CD e infraestrutura como código.' },
    { n: 4, t: 'Plataforma', d: 'Operar em escala: orquestração, GitOps, observabilidade.' }
  ];
  const LV_NAME = { 1: 'Iniciante', 2: 'Intermediário', 3: 'Avançado' };

  /* ---------- índice ---------- */
  const ALL = [];
  TR.forEach(t => t.lessons.forEach((l, i) => { l.track = t; l.idx = i; l.id = t.id + '-' + (l.slug || i + 1); ALL.push(l); }));
  const byId = Object.fromEntries(ALL.map(l => [l.id, l]));
  const tById = Object.fromEntries(TR.map(t => [t.id, t]));

  /* ---------- progresso (localStorage) ---------- */
  const KEY = 'trilha-tech:v1';
  const DEF = { done: {}, quiz: {}, lab: {}, last: null, theme: null };
  let S = (() => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return { ...DEF }; } })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* modo privado */ } };
  const pct = t => Math.round(t.lessons.filter(l => S.done[l.id]).length / t.lessons.length * 100);
  const doneCount = () => ALL.filter(l => S.done[l.id]).length;
  const xp = () => doneCount() * 20 + Object.values(S.quiz).filter(v => v === 1).length * 10 + Object.keys(S.lab).length * 2;
  const mins = list => list.reduce((a, l) => a + (l.min || 10), 0);
  const nextLesson = () => ALL.find(l => !S.done[l.id]) || null;
  const roadmapNext = () => {
    const order = ['git', 'docker', 'eng', 'actions', 'apis', 'redis', 'dados', 'terraform', 'k8s'];
    for (const id of order) { const t = tById[id]; const l = t && t.lessons.find(x => !S.done[x.id]); if (l) return l; }
    return null;
  };

  /* ---------- tema ---------- */
  const applyTheme = () => {
    const t = S.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = t;
  };
  applyTheme();
  $('#theme').onclick = () => { S.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; save(); applyTheme(); };

  /* ---------- helpers de UI ---------- */
  const ring = (p, c = 'var(--brand)', size = 64) => {
    const r = 26, C = 2 * Math.PI * r;
    return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 64 64" role="img" aria-label="${p}% concluído"><circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--panel2)" stroke-width="7"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C * p / 100} ${C}" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">${p}%</text></svg>`;
  };
  const trackCard = t => `<a class="card tcard" style="--c:${t.color}" href="#/t/${t.id}"><div class="row"><span class="em">${t.icon}</span><div><h3>${t.title}</h3><span class="badge">Nível ${t.level} · ${LEVELS[t.level - 1].t}</span></div></div><p>${t.desc}</p><div class="pbar"><i style="width:${pct(t)}%"></i></div><div class="meta"><span>${t.lessons.filter(l => S.done[l.id]).length}/${t.lessons.length} lições</span><span>⏱ ${Math.round(mins(t.lessons) / 60 * 10) / 10} h</span><span>${pct(t)}%</span></div></a>`;

  function setCrumbs(parts) { $('#crumbs').innerHTML = parts.map(([t, h]) => h ? `<a href="${h}">${t}</a>` : `<b style="color:var(--ink)">${t}</b>`).join(' › '); }
  function renderXp() { $('#xp').innerHTML = `<span class="chip">⭐ <b>${xp()}</b> XP</span><span class="chip">✅ <b>${doneCount()}/${ALL.length}</b></span>`; }

  function renderNav(active) {
    let h = `<a class="nv-i ${active === 'home' ? 'on' : ''}" href="#/"><span class="ic">🏠</span>Painel</a><a class="nv-i ${active === 'road' ? 'on' : ''}" href="#/roadmap"><span class="ic">🗺️</span>Roadmap</a><a class="nv-i ${active === 'res' ? 'on' : ''}" href="#/recursos"><span class="ic">📚</span>Biblioteca oficial</a><div class="nv-h">Trilhas</div>`;
    TR.forEach(t => {
      const open = active === t.id;
      h += `<a class="nv-i ${open ? 'on' : ''}" style="--c:${t.color}" href="#/t/${t.id}"><span class="ic">${t.icon}</span>${t.title}<span class="pc">${pct(t)}%</span></a>`;
      if (open) h += `<div class="nv-l">${t.lessons.map(l => `<a href="#/l/${l.id}" class="${S.done[l.id] ? 'done' : ''} ${location.hash === '#/l/' + l.id ? 'on' : ''}"><i>${S.done[l.id] ? '✓' : '○'}</i>${l.title}</a>`).join('')}</div>`;
    });
    $('#nav').innerHTML = h;
  }

  /* ---------- views ---------- */
  function viewHome() {
    setCrumbs([['Painel']]);
    const nx = roadmapNext() || nextLesson();
    const total = ALL.length, d = doneCount(), p = Math.round(d / total * 100);
    const last = S.last && byId[S.last];
    $('#view').innerHTML = `
      <section class="hero"><div style="flex:1;min-width:260px"><h1>Do código à produção.</h1><p>Uma trilha visual e evolutiva — de Git e Docker até Kubernetes, Terraform, Redis, APIs seguras, DuckDB/DuckLake, Clean Code e métodos ágeis. Cada lição tem diagramas interativos, código real, prática e quiz, sempre apontando para a fonte oficial.</p>
        <a class="btn" href="#/l/${(nx || ALL[0]).id}">${d ? '▶ Continuar: ' : '▶ Começar: '}${(nx || ALL[0]).title}</a> ${last && last !== nx ? `<a class="btn ghost" href="#/l/${last.id}">↩ Última lição</a>` : ''}</div>
        <div style="background:#ffffff22;border-radius:16px;padding:16px;display:flex;gap:16px;align-items:center">${ring(p, '#fff', 84)}<div><b style="font-size:1.3rem">${d}/${total}</b><br><span style="opacity:.85">lições concluídas</span></div></div></section>
      <div class="grid g4" style="margin-top:18px">
        <div class="card stat"><b>${TR.length}</b><span>trilhas</span></div><div class="card stat"><b>${total}</b><span>lições</span></div>
        <div class="card stat"><b>${Math.round(mins(ALL) / 60)} h</b><span>de conteúdo estimado</span></div><div class="card stat"><b>${xp()}</b><span>XP acumulado</span></div></div>
      <h2>Como estudar (método sugerido)</h2>
      <div class="grid g4">
        <div class="card"><b>1 · Veja</b><p style="margin:.3em 0 0;color:var(--mut)">Diagrama interativo antes do texto: crie o modelo mental.</p></div>
        <div class="card"><b>2 · Leia</b><p style="margin:.3em 0 0;color:var(--mut)">Conceito curto + código comentado. Sem decorar.</p></div>
        <div class="card"><b>3 · Faça</b><p style="margin:.3em 0 0;color:var(--mut)">Laboratório "mão na massa" em ≤ 30 min.</p></div>
        <div class="card"><b>4 · Teste</b><p style="margin:.3em 0 0;color:var(--mut)">Quiz + fonte oficial para aprofundar.</p></div></div>
      <h2>Suas trilhas</h2><div class="grid g3">${TR.map(trackCard).join('')}</div>
      <h2>Mapa de evolução</h2>${roadHtml()}`;
  }

  function roadHtml() {
    return `<div class="road">${LEVELS.map(lv => `<div class="lvl"><div class="lvl-h"><b>Nível ${lv.n}</b>${lv.t}<br><small>${lv.d}</small></div><div class="lvl-t">${TR.filter(t => t.level === lv.n).map(t => `<a style="--c:${t.color}" href="#/t/${t.id}"><span>${t.icon}</span>${t.title}<span class="chip">${pct(t)}%</span></a>`).join('')}</div></div>`).join('')}</div>`;
  }

  function viewRoadmap() {
    setCrumbs([['Painel', '#/'], ['Roadmap']]);
    const order = ['git', 'docker', 'eng', 'actions', 'apis', 'redis', 'dados', 'terraform', 'k8s'];
    $('#view').innerHTML = `<h1>Roadmap de evolução</h1><p class="lead">Dois jeitos de percorrer: pela <b>ordem recomendada</b> (cada trilha apoia a próxima) ou por <b>nível</b>. A trilha de Engenharia (Clean Code, testes, ágil) deve andar em paralelo com todas as outras.</p>
      <h2>Ordem recomendada</h2><div class="grid" style="gap:10px">${order.map((id, i) => { const t = tById[id]; return `<a class="card tcard" style="--c:${t.color};flex-direction:row;align-items:center;gap:14px" href="#/t/${t.id}"><b style="font-size:1.4rem;width:34px">${i + 1}</b><span class="em">${t.icon}</span><div style="flex:1"><h3>${t.title}</h3><div class="meta"><span>${t.why}</span></div></div><div style="width:120px"><div class="pbar"><i style="width:${pct(t)}%"></i></div></div></a>`; }).join('')}</div>
      <h2>Por nível</h2>${roadHtml()}
      <h2>Projeto-âncora sugerido</h2><div class="card"><p style="margin-top:0">Construa uma <b>API de pedidos</b> ao longo do curso: repositório no GitHub (Git) → container (Docker) → CI com testes (Actions) → API FastAPI com Postgres/SQL Server + cache Redis (APIs/Redis) → relatórios analíticos em DuckDB/DuckLake (Dados) → infra com Terraform → deploy em Kubernetes com probes e HPA. No final você terá um portfólio completo, ponta a ponta.</p></div>`;
  }

  function viewTrack(t) {
    setCrumbs([['Painel', '#/'], [t.title]]);
    const nx = t.lessons.find(l => !S.done[l.id]) || t.lessons[0];
    $('#view').innerHTML = `<div style="--c:${t.color}"><span class="badge">Nível ${t.level} · ${LEVELS[t.level - 1].t}</span><h1>${t.icon} ${t.title}</h1><p class="lead">${t.long || t.desc}</p>
      <div class="grid g4" style="margin:16px 0"><div class="card stat"><b>${t.lessons.length}</b><span>lições</span></div><div class="card stat"><b>${Math.round(mins(t.lessons) / 60 * 10) / 10} h</b><span>estimadas</span></div><div class="card stat"><b>${pct(t)}%</b><span>concluído</span></div><div class="card"><a class="btn" href="#/l/${nx.id}">▶ ${pct(t) ? 'Continuar' : 'Começar'}</a></div></div>
      ${t.prereq ? `<div class="callout info"><span class="i">🧭</span><div><b>Pré-requisitos:</b> ${t.prereq}</div></div>` : ''}
      <h2>Lições</h2><div class="lesson-list">${t.lessons.map((l, i) => `<a class="card li ${S.done[l.id] ? 'done' : ''}" href="#/l/${l.id}"><span class="n">${S.done[l.id] ? '✓' : i + 1}</span><div><h4>${l.title}</h4><small>${LV_NAME[l.level || 1]} · ⏱ ${l.min || 10} min${S.quiz[l.id] === 1 ? ' · 🎯 quiz ok' : ''}</small></div><span class="go">→</span></a>`).join('')}</div>
      ${t.refs ? `<h2>Fontes oficiais da trilha</h2><div class="refs">${t.refs.map(refHtml).join('')}</div>` : ''}</div>`;
  }

  const refHtml = r => `<a class="ref" href="${r.u}" target="_blank" rel="noopener noreferrer"><span class="k">${r.k === 'video' ? '🎬' : '📖'}</span><div><b>${esc(r.l)}</b>${r.n ? `<small>${esc(r.n)}</small>` : ''}</div></a>`;

  function viewLesson(l) {
    const t = l.track; S.last = l.id; save();
    setCrumbs([['Painel', '#/'], [t.title, '#/t/' + t.id], [l.title]]);
    const prev = ALL[ALL.indexOf(l) - 1], next = ALL[ALL.indexOf(l) + 1];
    const v = $('#view'); v.innerHTML = '';
    const root = document.createElement('div'); root.style.setProperty('--c', t.color); v.appendChild(root);
    root.innerHTML = `<span class="badge">${t.icon} ${t.title} · lição ${l.idx + 1}/${t.lessons.length}</span><h1>${l.title}</h1><div class="meta"><span>${LV_NAME[l.level || 1]}</span><span>⏱ ${l.min || 10} min</span></div>
      <div class="goal"><b>🎯 Ao final você será capaz de:</b><ul>${l.goals.map(g => `<li>${g}</li>`).join('')}</ul></div>`;
    const ctx = { lesson: l, S, save: () => { save(); renderXp(); } };
    l.blocks.forEach(b => root.appendChild(window.renderBlock(b, ctx)));
    if (l.quiz) root.appendChild(quizEl(l));
    if (l.refs && l.refs.length) { const d = document.createElement('div'); d.innerHTML = `<h2>📎 Para aprofundar (fontes oficiais e vídeos)</h2><div class="refs">${l.refs.map(refHtml).join('')}</div>`; root.appendChild(d); }
    const nav = document.createElement('div'); nav.className = 'lnav';
    nav.innerHTML = `${prev ? `<a class="btn ghost" href="#/l/${prev.id}">← ${prev.title}</a>` : '<span></span>'}<button class="btn ${S.done[l.id] ? 'ghost' : 'ok'}" id="fin">${S.done[l.id] ? '↺ Marcar como não concluída' : '✔ Concluir lição (+20 XP)'}</button>${next ? `<a class="btn" href="#/l/${next.id}">${next.title} →</a>` : '<span></span>'}`;
    root.appendChild(nav);
    $('#fin').onclick = () => {
      if (S.done[l.id]) delete S.done[l.id]; else S.done[l.id] = Date.now();
      save(); renderXp(); renderNav(t.id);
      if (S.done[l.id] && next) location.hash = '#/l/' + next.id; else route();
    };
  }

  function quizEl(l) {
    const q = l.quiz, w = document.createElement('div'); w.className = 'blk quiz';
    w.innerHTML = `<h3>🧠 Teste rápido</h3><p>${q.q}</p>${q.o.map((o, i) => `<label class="opt"><input type="radio" name="q" value="${i}"><span>${o}</span></label>`).join('')}<button class="btn sm" id="chk" type="button">Verificar</button><div class="why" hidden></div>`;
    const why = w.querySelector('.why');
    const prior = S.quiz[l.id];
    const show = (i) => {
      const ok = i === q.a;
      w.querySelectorAll('.opt').forEach((lab, j) => { lab.classList.toggle('right', j === q.a); lab.classList.toggle('wrong', j === i && !ok); lab.querySelector('input').disabled = true; });
      why.hidden = false; why.innerHTML = (ok ? '✅ <b>Correto!</b> ' : '❌ <b>Quase.</b> ') + q.w;
    };
    w.querySelector('#chk').onclick = () => {
      const sel = w.querySelector('input:checked'); if (!sel) return;
      const i = +sel.value; show(i);
      if (S.quiz[l.id] !== 1) S.quiz[l.id] = i === q.a ? 1 : 0;
      save(); renderXp(); w.querySelector('#chk').disabled = true;
    };
    if (prior === 1) { w.querySelectorAll('input')[q.a].checked = true; show(q.a); w.querySelector('#chk').disabled = true; }
    return w;
  }

  function viewRes() {
    setCrumbs([['Painel', '#/'], ['Biblioteca oficial']]);
    const seen = new Map();
    ALL.forEach(l => (l.refs || []).concat(l.track.refs || []).forEach(r => { if (!seen.has(r.u)) seen.set(r.u, { ...r, track: l.track }); }));
    const items = [...seen.values()];
    $('#view').innerHTML = `<h1>📚 Biblioteca de fontes oficiais</h1><p class="lead">Todas as referências usadas no curso, agrupadas por trilha. Documentação oficial é a fonte da verdade — confira sempre a versão atual.</p>
      <div class="filters" id="fl"><button data-f="all" class="on">Tudo</button><button data-f="doc">📖 Documentação</button><button data-f="video">🎬 Vídeos</button></div><div id="rl"></div>`;
    const draw = f => { $('#rl').innerHTML = TR.map(t => { const it = items.filter(i => i.track === t && (f === 'all' || i.k === f)); return it.length ? `<h2>${t.icon} ${t.title}</h2><div class="refs">${it.map(refHtml).join('')}</div>` : ''; }).join(''); };
    draw('all');
    $('#fl').onclick = e => { const b = e.target.closest('button'); if (!b) return; $('#fl').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); draw(b.dataset.f); };
  }

  /* ---------- roteador ---------- */
  function route() {
    const h = location.hash.replace(/^#\/?/, '').split('/');
    document.body.classList.remove('menu');
    let active = 'home';
    try {
      if (h[0] === 'l' && byId[h[1]]) { active = byId[h[1]].track.id; renderNav(active); viewLesson(byId[h[1]]); }
      else if (h[0] === 't' && tById[h[1]]) { active = h[1]; renderNav(active); viewTrack(tById[h[1]]); }
      else if (h[0] === 'roadmap') { active = 'road'; renderNav(active); viewRoadmap(); }
      else if (h[0] === 'recursos') { active = 'res'; renderNav(active); viewRes(); }
      else { renderNav('home'); viewHome(); }
    } catch (e) { console.error(e); $('#view').innerHTML = `<div class="callout bad"><span class="i">⛔</span><div>Erro ao renderizar: ${esc(e.message)}</div></div>`; }
    renderXp(); window.scrollTo(0, 0); $('#main').focus({ preventScroll: true });
  }
  addEventListener('hashchange', route);

  /* ---------- busca, menu, configurações ---------- */
  const q = $('#q'), qres = $('#qres');
  q.addEventListener('input', () => {
    const s = q.value.trim().toLowerCase(); if (s.length < 2) { qres.hidden = true; return; }
    const hit = ALL.filter(l => (l.title + ' ' + l.track.title + ' ' + (l.kw || '') + ' ' + l.goals.join(' ')).toLowerCase().includes(s)).slice(0, 10);
    qres.innerHTML = hit.length ? hit.map(l => `<a href="#/l/${l.id}"><b>${l.title}</b><br><small>${l.track.icon} ${l.track.title}</small></a>`).join('') : '<a><small>Nada encontrado</small></a>';
    qres.hidden = false;
  });
  document.addEventListener('click', e => { if (!e.target.closest('.search')) qres.hidden = true; else if (e.target.closest('#qres a[href]')) { qres.hidden = true; q.value = ''; } });
  document.addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); } });
  $('#burger').onclick = () => document.body.classList.toggle('menu');
  $('#scrim').onclick = () => document.body.classList.remove('menu');
  $('#cfg').onclick = () => {
    const d = $('#dlg');
    d.innerHTML = `<h3 style="margin-top:0">⚙ Seu progresso</h3><p style="color:var(--mut);font-size:14px">O progresso fica salvo apenas neste navegador. Exporte para fazer backup ou levar para outro dispositivo.</p><textarea id="pj" spellcheck="false">${esc(JSON.stringify(S))}</textarea><div class="ctrls"><button class="btn sm" id="imp">Importar</button><button class="btn sm ghost" id="rst">Zerar tudo</button><button class="btn sm ghost" id="cl">Fechar</button></div>`;
    d.showModal();
    $('#cl', d).onclick = () => d.close();
    $('#imp', d).onclick = () => { try { S = Object.assign({}, DEF, JSON.parse($('#pj', d).value)); save(); d.close(); route(); } catch { alert('JSON inválido'); } };
    $('#rst', d).onclick = () => { if (confirm('Apagar todo o progresso?')) { S = { ...DEF, theme: S.theme }; save(); d.close(); route(); } };
  };
  route();
})();
