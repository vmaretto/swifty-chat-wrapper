import { createProxyMiddleware } from 'http-proxy-middleware';

/**
 * Proxy verso Switch Food Explorer per consentire l’embedding in iframe
 * e mantenere la sessione autenticata anche cross-domain.
 *
 * - Rimuove gli header X-Frame-Options e CSP
 * - Riscrive SameSite e Secure nei cookie
 * - Segue i redirect (es. login → recipe-creation)
 * - Gestisce lo streaming nativo di HTML, JS, CSS e immagini
 */
const proxy = createProxyMiddleware({
  target: 'https://switch-food-explorer.posti.world',
  changeOrigin: true,
  followRedirects: true,
  selfHandleResponse: false,
  pathRewrite: { '^/api/switch': '' },
  cookieDomainRewrite: { '*': '' },
  onProxyRes: (proxyRes) => {
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];

    if (proxyRes.headers['content-type']?.includes('text/html')) {
      proxyRes.headers['cache-control'] = 'no-store';
    }

    if (proxyRes.headers['set-cookie']) {
      proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map((cookie) => {
        let updated = cookie
          .replace(/;?\s*SameSite=Lax/gi, '')
          .replace(/;?\s*SameSite=Strict/gi, '')
          .replace(/;?\s*SameSite=None/gi, '')
          .replace(/;?\s*Secure/gi, '');

        return `${updated}; SameSite=None; Secure`;
      });
    }
  }
});

const handler = (req, res) =>
  new Promise((resolve, reject) => {
    const url = new URL(req.url, 'http://localhost');
    const pathSegments = url.searchParams.getAll('path');

    if (pathSegments.length > 0) {
      url.searchParams.delete('path');
      const rewrittenPath = pathSegments.join('/');
      const remainingSearch = url.searchParams.toString();
      req.url = `/${rewrittenPath}${remainingSearch ? `?${remainingSearch}` : ''}`;
    }

    proxy(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
      } else {
        resolve(result);
      }
    });
  });

export default handler;

export const config = {
  api: { bodyParser: false }
};
