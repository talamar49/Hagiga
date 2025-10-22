import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  // backend routes are mounted under /api/v1
  const backendUrl = `http://localhost:4000/api/v1/${Array.isArray(path) ? path.join('/') : path}`;

  try {
    const headers: Record<string, string> = {};
    // forward authorization if present
  if (req.headers.authorization) headers['Authorization'] = String(req.headers.authorization);
    // forward content-type if present so backend can parse JSON
    if (req.headers['content-type']) headers['content-type'] = String(req.headers['content-type']);

    // Build body for fetch: if JSON, stringify the parsed body; otherwise pass through raw body when available
    let body: any = undefined;
    const method = (req.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const ct = (req.headers['content-type'] || '').toString();
      if (ct.includes('application/json')) {
        body = req.body ? JSON.stringify(req.body) : undefined;
      } else {
        // For non-json content-types (like multipart/form-data), try to forward the raw body buffer if present from Next
        body = (req as any).body || undefined;
      }
    }

    const fetchRes = await fetch(backendUrl, { method: method as any, headers, body });
  const contentType = fetchRes.headers.get('content-type') || 'text/plain';
  const text = await fetchRes.text();
  res.setHeader('content-type', contentType);
  res.status(fetchRes.status).send(text);
  } catch (err: any) {
    res.status(500).json({ error: String(err.message) });
  }
}
