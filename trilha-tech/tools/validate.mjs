// Valida estrutura do conteúdo e lista as URLs. Uso: node tools/validate.mjs [--urls]
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path';
const dir = path.resolve(import.meta.dirname, '../js/data');
const ctx = { window: {} }; ctx.window.window = ctx.window; vm.createContext(ctx);
const run = f => vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8').replace(/^window\./gm, ''), ctx, { filename: f });
// helpers definem window.*; executar com "window" como global
vm.runInContext('var window = this; var TRACKS;', ctx);
for (const f of ['_helpers.js', ...fs.readdirSync(dir).filter(f => f !== '_helpers.js' && f.endsWith('.js'))]) {
  vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
}
const T = ctx.TRACKS; let errs = 0; const urls = new Map();
const bad = m => { console.error('ERRO:', m); errs++; };
const BLK = new Set(['p', 'h', 'ul', 'callout', 'code', 'table', 'flow', 'nest', 'pipe', 'bars', 'lab', 'sim']);
const ids = new Set();
for (const t of T) {
  for (const k of ['id', 'order', 'level', 'icon', 'color', 'title', 'desc', 'why', 'lessons']) if (t[k] == null) bad(`${t.id}: falta ${k}`);
  (t.refs || []).forEach(r => urls.set(r.u, t.id));
  t.lessons.forEach((l, i) => {
    const id = `${t.id}-${l.slug || i + 1}`; if (ids.has(id)) bad('id duplicado ' + id); ids.add(id);
    for (const k of ['title', 'goals', 'blocks', 'quiz', 'refs']) if (!l[k]) bad(`${id}: falta ${k}`);
    l.blocks.forEach((b, j) => {
      if (!BLK.has(b.t)) bad(`${id}#${j}: bloco ${b.t}`);
      if (b.t === 'code' && (!b.x || /\$\{/.test(b.x))) bad(`${id}#${j}: code vazio ou com \${ cru`);
      if (b.t === 'table') b.rows.forEach(r => { if (r.length !== b.head.length) bad(`${id}#${j}: linha de tabela com ${r.length} colunas, esperado ${b.head.length}`); });
    });
    const q = l.quiz; if (q && (q.a < 0 || q.a >= q.o.length)) bad(`${id}: quiz.a inválido`);
    (l.refs || []).forEach(r => { if (!/^https:\/\//.test(r.u)) bad(`${id}: url ${r.u}`); urls.set(r.u, id); });
  });
}
const n = T.reduce((a, t) => a + t.lessons.length, 0);
console.log(`${T.length} trilhas, ${n} lições, ${urls.size} URLs únicas, ${errs} erros`);
if (process.argv.includes('--urls')) fs.writeFileSync(process.argv[process.argv.indexOf('--urls') + 1] || '/dev/stdout', [...urls.keys()].join('\n') + '\n');
process.exit(errs ? 1 : 0);
