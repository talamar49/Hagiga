export async function uploadCsv(eventId: string, file: File, token: string) {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`/api/proxy/events/${eventId}/participants/import`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`upload failed: ${res.statusText}`);
  return res.json();
}

export async function getImportJob(eventId: string, jobId: string, token: string) {
  const res = await fetch(`/api/proxy/events/${eventId}/imports/${jobId}`);
  if (!res.ok) throw new Error(`status fetch failed: ${res.statusText}`);
  return res.json();
}

export async function saveGuests(eventId: string, guests: any[], token: string) {
  const res = await fetch(`/api/proxy/events/${eventId}/guests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' } as any,
    body: JSON.stringify(guests),
  });
  if (!res.ok) throw new Error(`save failed: ${res.statusText} ${await res.text()}`);
  return res.json();
}

export default { uploadCsv, getImportJob, saveGuests };
