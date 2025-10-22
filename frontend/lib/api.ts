export async function uploadCsv(eventId: string, file: File, token?: string) {
  const form = new FormData();
  form.append('file', file);

  // include Authorization header when token exists (either passed in or from auth module)
  let headers: Record<string, string> | undefined;
  try {
    const a = await import('./auth');
    const stored = a.getToken();
    const t = token ?? stored;
  if (t) headers = { Authorization: `Bearer ${t}` };
  } catch (e) {
    // ignore
  }

  const res = await fetch(`/api/proxy/events/${eventId}/participants/import`, {
    method: 'POST',
    headers,
    body: form,
  });
  if (!res.ok) throw new Error(`upload failed: ${res.statusText}`);
  return res.json();
}

export async function getImportJob(eventId: string, jobId: string, token?: string) {
  let headers: Record<string, string> | undefined;
  try {
    const a = await import('./auth');
    const stored = a.getToken();
    const t = token ?? stored;
  if (t) headers = { Authorization: `Bearer ${t}` };
  } catch (e) {
    // ignore
  }

  const res = await fetch(`/api/proxy/events/${eventId}/imports/${jobId}`, { headers });
  if (!res.ok) throw new Error(`status fetch failed: ${res.statusText}`);
  return res.json();
}

export async function getImportJobs(eventId: string, token?: string) {
  let headers: Record<string, string> | undefined;
  try {
    const a = await import('./auth');
    const stored = a.getToken();
    const t = token ?? stored;
    if (t) headers = { Authorization: `Bearer ${t}` };
  } catch (e) {}
  const res = await fetch(`/api/proxy/events/${eventId}/imports`, { headers });
  if (!res.ok) throw new Error(`list imports failed: ${res.statusText}`);
  return res.json();
}

export async function getImportJobErrors(eventId: string, jobId: string, token?: string) {
  let headers: Record<string, string> | undefined;
  try {
    const a = await import('./auth');
    const stored = a.getToken();
    const t = token ?? stored;
    if (t) headers = { Authorization: `Bearer ${t}` };
  } catch (e) {}
  const res = await fetch(`/api/proxy/events/${eventId}/imports/${jobId}/errors`, { headers });
  if (!res.ok) throw new Error(`errors fetch failed: ${res.statusText}`);
  const blob = await res.blob();
  return blob;
}

export async function saveGuests(eventId: string, guests: any[], token?: string) {
  let headers: Record<string, string> = { 'Content-Type': 'application/json' } as any;
  try {
    const a = await import('./auth');
    const stored = a.getToken();
    const t = token ?? stored;
    if (t) headers['Authorization'] = `Bearer ${t}`;
  } catch (e) {
    // ignore
  }

  const res = await fetch(`/api/proxy/events/${eventId}/guests`, {
    method: 'POST',
    headers,
    body: JSON.stringify(guests),
  });
  if (!res.ok) {
    const text = await res.text();
    const err: any = new Error(`save failed: ${res.statusText} ${text}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function createEvent(payload: { title: string; type: string; date?: string; description?: string }) {
  // include Authorization header when token exists
  let headers: Record<string,string> = { 'Content-Type': 'application/json' };
  try {
    const a = await import('./auth');
    const token = a.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch (e) {
    // ignore
  }
  const res = await fetch('/api/proxy/events', { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`create event failed: ${res.statusText} ${await res.text()}`);
  return res.json();
}

export async function updateEvent(eventId: string, payload: { title?: string; type?: string; date?: string | null; description?: string }) {
  let headers: Record<string,string> = { 'Content-Type': 'application/json' };
  try {
    const a = await import('./auth');
    const token = a.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch (e) {}
  const res = await fetch(`/api/proxy/events/${eventId}`, { method: 'PATCH', headers, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`update event failed: ${res.statusText} ${await res.text()}`);
  return res.json();
}

export async function uploadMedia(eventId: string, file: File, caption?: string) {
  const form = new FormData();
  form.append('file', file);
  if (caption) form.append('caption', caption);
  try {
    const a = await import('./auth');
    const token = a.getToken();
    const headers: Record<string,string> | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;
    // POST multipart directly to backend to avoid Next proxy multipart forwarding issues
    const backendUrl = (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? `http://localhost:4000/api/v1/events/${eventId}/media` : `/api/proxy/events/${eventId}/media`;
    const res = await fetch(backendUrl, { method: 'POST', headers, body: form } as any);
    if (!res.ok) throw new Error(`upload media failed: ${res.statusText} ${await res.text()}`);
    return res.json();
  } catch (e) {
    throw e;
  }
}

export async function listInvitations(eventId: string) {
  let headers: Record<string,string> | undefined;
  try { const a = await import('./auth'); const token = a.getToken(); if (token) headers = { Authorization: `Bearer ${token}` }; } catch (e) {}
  const res = await fetch(`/api/proxy/events/${eventId}/invitations`, { headers } as any);
  if (!res.ok) throw new Error(`list invitations failed: ${res.statusText}`);
  return res.json();
}

export async function deleteInvitation(eventId: string, invitationId: string) {
  let headers: Record<string,string> = {};
  try { const a = await import('./auth'); const token = a.getToken(); if (token) headers['Authorization'] = `Bearer ${token}`; } catch (e) {}
  const res = await fetch(`/api/proxy/events/${eventId}/invitations/${invitationId}`, { method: 'DELETE', headers } as any);
  if (!(res.ok || res.status === 204)) throw new Error(`delete failed: ${res.status} ${await res.text()}`);
  return res;
}

export async function createInvitation(eventId: string, payload: { text?: string; mediaUrl?: string; mediaType?: string; file?: File }) {
  try {
    // if file provided, upload first
    if (payload.file) {
      const up = await uploadMedia(eventId, payload.file as File, payload.text);
      return { invitation: up.media }; // backend media route currently returns media; we also have invitation POST that can accept mediaUrl but to keep it simple we returned media
    }
    let headers: Record<string,string> = { 'Content-Type': 'application/json' };
    try { const a = await import('./auth'); const token = a.getToken(); if (token) headers['Authorization'] = `Bearer ${token}`; } catch (e) {}
    const res = await fetch(`/api/proxy/events/${eventId}/invitations`, { method: 'POST', headers, body: JSON.stringify({ text: payload.text, mediaUrl: payload.mediaUrl, mediaType: payload.mediaType }) });
    if (!res.ok) throw new Error(`create invitation failed: ${res.statusText} ${await res.text()}`);
    return res.json();
  } catch (e) {
    throw e;
  }
}

export default { uploadCsv, getImportJob, getImportJobs, getImportJobErrors, saveGuests, createEvent, updateEvent };
