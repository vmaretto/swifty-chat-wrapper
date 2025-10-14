import { runProxy, config } from './proxyHandler.js';

export { config };

export default async function handler(req, res) {
  await runProxy(req, res);
}
