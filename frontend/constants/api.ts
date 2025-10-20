export enum Api {
  // backend base URL (proxied through /api/proxy in Next.js)
  BASE = 'http://localhost:4000/api/v1',
  // proxy prefix used by pages/api/proxy
  PROXY_PREFIX = '/api/proxy'
}

export const proxyPath = (path: string) => `${Api.PROXY_PREFIX}/${path}`;
