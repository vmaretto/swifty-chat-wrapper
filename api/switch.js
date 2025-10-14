import { createProxyMiddleware } from 'http-proxy-middleware';

const target = 'https://switch-food-explorer.posti.world';

const proxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: { '^/api/switch': '' },
  cookieDomainRewrite: { '*': '' },
  onProxyRes(proxyRes) {
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];

    const setCookieHeader = proxyRes.headers['set-cookie'];

    if (setCookieHeader) {
      proxyRes.headers['set-cookie'] = setCookieHeader.map((cookie) => {
        let updatedCookie = cookie.replace(/;\s*SameSite=[^;]*/gi, '');
        updatedCookie = updatedCookie.replace(/;\s*Secure/gi, '');

        if (!/;\s*Secure/i.test(updatedCookie)) {
          updatedCookie = `${updatedCookie}; Secure`;
        }

        if (!/;\s*SameSite=/i.test(updatedCookie)) {
          updatedCookie = `${updatedCookie}; SameSite=None`;
        } else {
          updatedCookie = updatedCookie.replace(/SameSite=[^;]*/i, 'SameSite=None');
        }

        return updatedCookie;
      });
    }
  }
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default function handler(req, res) {
  return new Promise((resolve, reject) => {
    proxy(req, res, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
