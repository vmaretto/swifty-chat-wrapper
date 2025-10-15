export const config = { runtime: 'edge' };

// Normalizza Set-Cookie per l’uso in iframe e stesso host del proxy
function rewriteSetCookie(setCookieHeaders) {
  if (!setCookieHeaders) return [];
  const list = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  return list.map((c) => {
    let v = c;
    // rimuovi Domain per legare il cookie all’host del wrapper
    v = v.replace(/;?\s*Domain=[^;]+/i, '');
    // forza SameSite=None
    if (/;\s*SameSite=/i.test(v)) {
      v = v.replace(/;\s*SameSite=[^;]+/i, '; SameSite=None');
    } else {
      v += '; SameSite=None';
    }
    // assicura Secure
    if (!/;\s*Secure/i.test(v)) v += '; Secure';
    return v;
  });
}

export default async function handler(req) {
  const url = new URL(req.url);
  // /api/switch/<...> oppure /switch/<...> (vedi routes)
  const upstreamPath = url.pathname.replace(/^\/(api\/)?switch\/?/, '');
  const target = new URL(upstreamPath || '', 'https://switch-food-explorer.posti.world');
  // ✅ conserva la query string
  target.search = url.search;

  // Forward metodo/body/header “sicuri”, forzando origin host dell’upstream
  const headers = new Headers(req.headers);
  headers.set('host', target.host);
  headers.set('origin', 'https://switch-food-explorer.posti.world');
  headers.delete('accept-encoding'); // evita problemi di compressione

  const init = {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
    redirect: 'manual'
  };

  const upstreamRes = await fetch(target.toString(), init);

  // Clona e filtra/riscrive header
  const resHeaders = new Headers(upstreamRes.headers);

  // Rimuovi blocchi iframe
  resHeaders.delete('x-frame-options');
  if (resHeaders.has('content-security-policy')) {
    const csp = resHeaders.get('content-security-policy');
    const cleaned = csp
      .split(';')
      .map((s) => s.trim())
      .filter((s) => !/^frame-ancestors\s/i.test(s))
      .join('; ');
    resHeaders.set('content-security-policy', cleaned);
  }

  // Riscrivi Set-Cookie per iframe/same-host
  const setCookie = resHeaders.get('set-cookie'); // in Edge standard non c'è getSetCookie()
  const rewritten = rewriteSetCookie(setCookie);
  if (rewritten.length) {
    resHeaders.delete('set-cookie');
    rewritten.forEach((v) => resHeaders.append('set-cookie', v));
  }

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: resHeaders
  });
}
