// Helpers globais usados pelos arquivos de conteúdo.
// R  : String.raw  -> use em blocos de código (preserva "\" ; escreva "$\{" no lugar de "${").
// doc/vid/yt : referências para a seção "Para aprofundar" de cada lição.
window.R = String.raw;
window.TRACKS = [];
window.doc = (l, u, n) => ({ k: 'doc', l, u, n });
window.vid = (l, u, n) => ({ k: 'video', l, u, n });
window.yt = (q, n) => ({ k: 'video', l: 'YouTube — busca: ' + q, u: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q), n: n || 'Busca curada: ordene por relevância e prefira canais oficiais/conferências.' });
