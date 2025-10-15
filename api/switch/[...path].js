export const config = { runtime: 'edge' };

function rewriteSetCookie(setCookieHeaders) {
  if (!setCookieHeaders) return [];
  const list = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  return list.map((c) => {
    let v = c.replace(/;?\s*Domain=[^;]+/i, '');
    if (/;\s*SameSite=/i.test(v)) v = v.replace(/;\s*SameSite=[^;]+/i, '; SameSite=None');
    else v += '; SameSite=None';
    if (!/;\s*Secure/i.test(v)) v += '; Secure';
    return v;
  });
}

export default async function handler(req) {
  const url = new URL(req.url);
  const upstreamPath = url.pathname.replace(/^\/(api\/)?switch\/?/, '');
  const target = new URL(upstreamPath, 'https://switch-food-explorer.posti.world');

  const headers = new Headers(req.headers);
  headers.set('host', target.host);
  headers.set('origin', 'https://switch-food-explorer.posti.world');
  headers.delete('accept-encoding');

  const init = {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
    redirect: 'manual'
  };

  const upstreamRes = await fetch(target.toString(), init);
  const resHeaders = new Headers(upstreamRes.headers);
  resHeaders.delete('x-frame-options');

  if (resHeaders.has('content-security-policy')) {
    const csp = resHeaders.get('content-security-policy');
    const cleaned = csp.split(';')
      .filter(s => !/^frame-ancestors\s/i.test(s.trim()))
      .join('; ');
    resHeaders.set('content-security-policy', cleaned);
  }

  const setCookie = upstreamRes.headers.getSetCookie?.() || resHeaders.get('set-cookie');
  const rewritten = rewriteSetCookie(setCookie);
  if (rewritten.length) {
    resHeaders.delete('set-cookie');
    rewritten.forEach(v => resHeaders.append('set-cookie', v));
  }

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: resHeaders
  });
}
