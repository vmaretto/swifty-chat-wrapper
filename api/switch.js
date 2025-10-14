import { createProxyMiddleware } from 'http-proxy-middleware';
import { parse } from 'url';

const proxy = createProxyMiddleware({
  target: 'https://switch-food-explorer.posti.world',
  changeOrigin: true,
  pathRewrite: { '^/api/switch': '' },
  cookieDomainRewrite: { '*': '' },
  onProxyRes(proxyRes) {
    const cookies = proxyRes.headers['set-cookie'];
    if (cookies) {
      proxyRes.headers['set-cookie'] = cookies.map((cookie) =>
        cookie.replace(/; ?Secure/gi, '').replace(/; ?SameSite=Lax/gi, '; SameSite=None; Secure')
      );
    }
  },
});

export default function handler(req, res) {
  const parsedUrl = parse(req.url, true);
  req.url = parsedUrl.path;
  proxy(req, res, (err) => {
    if (err) {
      res.statusCode = 500;
      res.end(`Proxy error: ${err.message}`);
    }
  });
}
