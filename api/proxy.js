import { createProxyMiddleware } from 'http-proxy-middleware';

export default createProxyMiddleware({
  target: 'https://switch-food-explorer.posti.world',
  changeOrigin: true,
  pathRewrite: { '^/switch': '' },
  cookieDomainRewrite: { '*': '' },
  onProxyReq(proxyReq, req) {
    proxyReq.setHeader('Origin', 'https://switch-food-explorer.posti.world');
  },
  onProxyRes(proxyRes) {
    const cookies = proxyRes.headers['set-cookie'];
    if (cookies) {
      proxyRes.headers['set-cookie'] = cookies.map(cookie =>
        cookie.replace(/; ?Secure/gi, '').replace(/; ?SameSite=Lax/gi, '; SameSite=None; Secure')
      );
    }
  },
});
