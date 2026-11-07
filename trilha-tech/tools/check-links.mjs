// Verifica se as URLs de referência do curso respondem. Rode na sua máquina/CI (precisa de internet):
//   node tools/check-links.mjs
// Sai com código 1 se alguma URL falhar (404/410/erro de rede). 403/429 viram "aviso" (alguns sites bloqueiam robôs).
import vm from 'node:vm'; import fs from 'node:fs'; import path from 'node:path';
const dir = path.resolve(import.meta.dirname, '../js/data');
const ctx = {}; vm.createContext(ctx); vm.runInContext('var window = this;', ctx);
for (const f of ['_helpers.js', ...fs.readdirSync(dir).filter(f => f !== '_helpers.js' && f.endsWith('.js'))]) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx);
const urls = new Set();
for (const t of ctx.TRACKS) { (t.refs || []).forEach(r => urls.add(r.u)); t.lessons.forEach(l => (l.refs || []).forEach(r => urls.add(r.u))); }
const list = [...urls].filter(u => !u.includes('youtube.com/results')); let bad = 0, warn = 0, i = 0;
async function check(u) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(u, { method, redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'Mozilla/5.0 (link-check)' } });
      if (r.ok) return 'ok'; if ([403, 429].includes(r.status)) return 'warn:' + r.status; if (method === 'GET') return 'bad:' + r.status;
    } catch (e) { if (method === 'GET') return 'bad:' + e.message; }
  }
}
await Promise.all(Array.from({ length: 8 }, async () => { while (i < list.length) { const u = list[i++]; const s = await check(u); if (s.startsWith('bad')) { bad++; console.log('✗', s, u); } else if (s.startsWith('warn')) { warn++; console.log('!', s, u); } } }));
console.log(`${list.length} URLs verificadas — ${bad} com erro, ${warn} com aviso`); process.exit(bad ? 1 : 0);
