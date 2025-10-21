import React, { useState, useEffect } from 'react';
import { uploadCsv, getImportJob } from '../../../lib/api';
import { t } from '../../../lib/i18n';
import { useTheme } from '../../../lib/theme';
import { useRouter } from 'next/router';
import { saveGuests } from '../../../lib/api';

type Lang = 'en' | 'he';

export default function ImportPage({ params }: any) {
  // params may be undefined during SSR in some Next.js setups, so guard with optional chaining.
  const router = useRouter();
  const ssrId = params?.id ?? null;
  const [clientEventId, setClientEventId] = useState<string | null>(ssrId);

  useEffect(() => {
    // router.query.id becomes available on the client after hydration — use it as a fallback.
    if (!clientEventId && router?.query?.id) {
      setClientEventId(String(router.query.id));
    }
  }, [router.query, clientEventId]);
  const [file, setFile] = useState<File | null>(null);
  const [participants, setParticipants] = useState<Array<any>>([]);
  const [status, setStatus] = useState<any>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>('en');
  const { theme, setTheme } = useTheme();

  // Simple CSV parser (handles basic comma separated rows, trims quotes)
  function parseCsvText(text: string) {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length === 0) return [];
    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    // normalize headers (remove spaces)
    const headers = rawHeaders.map(h => h.replace(/\s+/g, ' ').trim());
    const rows = lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = cols[idx] ?? '';
      });
      return obj;
    });
    return rows;
  }

  function serializeCsv(rows: Array<any>, headers: string[]) {
    const esc = (v: any) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const lines = [headers.join(',')];
    for (const r of rows) {
      const vals = headers.map(h => esc(r[h] ?? ''));
      lines.push(vals.join(','));
    }
    return lines.join('\n');
  }


  function validateRow(row: any) {
    // Expected keys (normalized): name, lastname, num of participants, phone number
    const errors: Record<string, string> = {};
    if (!row['name'] || String(row['name']).trim() === '') errors['name'] = 'required';
    if (!row['lastname'] || String(row['lastname']).trim() === '') errors['lastname'] = 'required';
    const numRaw = String(row['num of participants'] ?? '').trim();
    if (numRaw === '' || isNaN(Number(numRaw)) || Number(numRaw) < 1) errors['num of participants'] = 'invalid';

    const phoneRaw = String(row['phone number'] ?? '').trim();
    if (phoneRaw !== '' && !/^0\d{9}$/.test(phoneRaw) || !phoneRaw) errors['phone number'] = 'invalid';
    return errors;
  }

  const onUpload = async () => {
    // When user clicks upload-to-server, serialize current participants state to CSV and send
    if (!participants || participants.length === 0) return alert(t('fileRequired', 'en'));
    try {
      // derive headers from participants union (preserve expected order)
      const headers = ['name', 'lastname', 'num of participants', 'phone number'];
      const csvText = serializeCsv(participants, headers);
      const blob = new Blob([csvText], { type: 'text/csv' });
      const uploadFile = new File([blob], 'upload.csv', { type: 'text/csv' });
  const res = await uploadCsv(eventId, uploadFile, '');
      setJobId(res.importJobId);
      setStatus({ status: 'queued' });
    } catch (err: any) {
      alert(String(err.message));
    }
  };

  const poll = async () => {
    if (!jobId) return;
    try {
  const res = await getImportJob(eventId, jobId, '');
      setStatus(res.job);
    } catch (err: any) {
      console.error(err);
    }
  };

  const hasDuplicatePhoneNumbers = (guests: any[]) => {
    const phoneNumbers = new Set<string>();
    for (const guest of guests) {
        const phoneNumber = guest['phone number'];
        if (phoneNumbers.has(phoneNumber)) {
            return true;
        }
        phoneNumbers.add(phoneNumber);
    }
    return false;
}

  const onSaveGuests = async () => {
    const eventId = clientEventId;
    if (!participants || participants.length === 0)  return alert('no guests to save');
    if (hasDuplicatePhoneNumbers(participants)) return alert('duplicate phone numbers in guests');
    try {
      // basic client-side validation: ensure name exists and phone when required
      const requirePhone = participants.length > 1;
      for (const p of participants) {
        if (!p['name'] || String(p['name']).trim() === '') return alert('name required for each guest');
        if (requirePhone && (!p['phone number'] || String(p['phone number']).trim() === '')) return alert('phone required when multiple guests');
      }
      // call backend
    const res = await saveGuests(eventId, participants, '');
      alert(`saved ${res.insertedCount} guests`);
    } catch (err: any) {
      alert(String(err.message));
    }
  };

  if (!clientEventId) {
    return (
      <main className="container" style={{ direction: lang === 'he' ? 'rtl' : 'ltr' }}>
        <div className="card">
          <h2>{t('title', lang)}</h2>
          <p>{t('noEventId', lang) || 'No event id provided.'}</p>
        </div>
      </main>
    );
  }

  const eventId = clientEventId;

  return (
    <main className="container" style={{ direction: lang === 'he' ? 'rtl' : 'ltr' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{t('title', lang)} — {eventId}</h1>
        <div className="row">
          <select value={lang} onChange={e => setLang(e.target.value as Lang)} aria-label="language">
            <option value="en">English</option>
            <option value="he">עברית</option>
          </select>
          <button className="btn" style={{ marginLeft: 8 }} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        {/* token input removed while auth is disabled */}

        <div className="row" style={{ marginTop: 12 }}>
          <div className="col">
            <input type="file" accept=".csv" onChange={async e => {
              const f = e.target.files?.[0] || null;
              setFile(f);
              if (!f) return setParticipants([]);
              try {
                const text = await f.text();
                const rows = parseCsvText(text);
                // ensure keys exist for expected headers
                const normalized = rows.map((r: any) => ({
                  'name': r['name'] ?? r['firstName'] ?? r['firstname'] ?? r['first name'] ?? '',
                  'lastname': r['lastname'] ?? r['lastName'] ?? r['last name'] ?? r['surname'] ?? '',
                  'num of participants': r['num of participants'] ?? r['num'] ?? r['guests'] ?? r['num_of_participants'] ?? '',
                  'phone number': r['phone number'] ?? r['phone'] ?? r['phoneNumber'] ?? '',
                }));
                setParticipants(normalized);
              } catch (err) {
                console.error('csv parse error', err);
                alert('failed to read file');
              }
            }} />
          </div>
          <div>
            <button className="btn" onClick={onUpload}>{t('upload', lang)}</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={poll}>{t('checkStatus', lang)}</button>
        </div>

        {/* Participants preview and edit table */}
        {participants && participants.length > 0 && (
      <div className="card" style={{ marginTop: 12 }}>
            <h3 style={{ marginTop: 0 }}>Preview / Edit</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 6 }}>Name</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Lastname</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Num</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Phone</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, idx) => {
                    const errs = validateRow(p);
                    return (
                      <tr key={idx}>
                        <td style={{ padding: 6 }}>
                          <input value={p['name'] || ''} onChange={e => {
                            const copy = [...participants]; copy[idx] = { ...copy[idx], 'name': e.target.value }; setParticipants(copy);
                          }} style={{ width: 220, padding: 6, border: errs['name'] ? '1px solid red' : undefined }} />
                        </td>
                        <td style={{ padding: 6 }}>
                          <input value={p['lastname'] || ''} onChange={e => {
                            const copy = [...participants]; copy[idx] = { ...copy[idx], 'lastname': e.target.value }; setParticipants(copy);
                          }} style={{ width: 220, padding: 6, border: errs['lastname'] ? '1px solid red' : undefined }} />
                        </td>
                        <td style={{ padding: 6 }}>
                          <input value={p['num of participants'] || ''} onChange={e => {
                            const copy = [...participants]; copy[idx] = { ...copy[idx], 'num of participants': e.target.value }; setParticipants(copy);
                          }} style={{ width: 80, padding: 6, border: errs['num of participants'] ? '1px solid red' : undefined }} />
                        </td>
                        <td style={{ padding: 6 }}>
                          <input value={p['phone number'] || ''} onChange={e => {
                            const copy = [...participants]; copy[idx] = { ...copy[idx], 'phone number': e.target.value }; setParticipants(copy);
                          }} style={{ width: 160, padding: 6, border: errs['phone number'] ? '1px solid red' : undefined }} />
                        </td>
                        <td style={{ padding: 6 }}>
                          <button className="btn" onClick={() => { const copy = [...participants]; copy.splice(idx, 1); setParticipants(copy); }}>Remove</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={onSaveGuests}>Save to backend</button>
            </div>
          </div>
        )}

        {status && (
          <pre style={{ marginTop: 12, overflowX: 'auto' }}>{JSON.stringify(status, null, 2)}</pre>
        )}
      </div>
    </main>
  );
}

// Ensure the event id is available during server-side rendering.
// This makes the page render the full import UI for crawlers and direct requests.
export async function getServerSideProps(context: any) {
  const id = context?.params?.id ?? null;
  if (!id) return { notFound: true };
  return {
    redirect: {
      destination: `/events/${id}/imports`,
      permanent: false,
    },
  };
}
