import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { uploadCsv, getImportJob, getImportJobs, getImportJobErrors, saveGuests } from '../../../lib/api';
import Toast from '../../../components/Toast';
import { t } from '../../../lib/i18n';
import { useTheme } from '../../../lib/theme';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

type Lang = 'en' | 'he';

export default function ImportCsvPage({ params }: any) {
  const router = useRouter();
  const ssrId = params?.id ?? null;
  const [clientEventId, setClientEventId] = useState<string | null>(ssrId);
  const [rows, setRows] = useState<Array<any>>([]);
  const [jobs, setJobs] = useState<Array<any>>([]);
  const [status, setStatus] = useState<any>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [message, setMessage] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const pollRef = useRef<number | null>(null);
  const { theme } = useTheme();

  useEffect(() => { if (!clientEventId && router?.query?.id) setClientEventId(String(router.query.id)); }, [router.query, clientEventId]);
  useEffect(() => () => { if (pollRef.current) window.clearInterval(pollRef.current); }, []);

  const parseCsvText = (text: string) => text.split(/\r?\n/).filter(Boolean).map(line => line.split(',').map(c => c.trim()));

  const loadJobs = async () => { if (!clientEventId) return; try { const res = await getImportJobs(clientEventId); setJobs(res.jobs || []); } catch (e) { console.error(e); } };
  useEffect(() => { if (clientEventId) loadJobs(); }, [clientEventId]);

  const downloadErrorRows = async (jobId: string) => { if (!clientEventId || !jobId) return; try { const blob = await getImportJobErrors(clientEventId, jobId); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `errors_${jobId}.csv`; a.click(); URL.revokeObjectURL(url); } catch (e) { console.error(e); } };

  const onUpload = async () => {
    if (!rows.length || !clientEventId) { setMessage('no data'); setToastOpen(true); return; }
    try {
      const csv = rows.map(r => `${r.name || ''},${r.lastname || ''},${r['num of participants'] || ''},${r['phone number'] || ''}`).join('\n');
      const f = new File([new Blob([csv], { type: 'text/csv' })], 'import.csv');
      const res = await uploadCsv(clientEventId, f);
      const id = res.importJobId;
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = window.setInterval(async () => { try { const r = await getImportJob(clientEventId, id); setStatus(r.job); if (r.job?.status !== 'processing') { if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; } loadJobs(); } } catch (e) { console.error(e); } }, 1500);
    } catch (e: any) { setMessage(String(e?.message || e)); setToastOpen(true); }
  };

  const onSaveGuests = async () => { if (!rows.length || !clientEventId) return setMessage('nothing to save'); try { const payload = rows.map((r: any) => ({ name: r.name, lastName: r.lastname, phoneNumber: r['phone number'], participantsCount: Number(r['num of participants'] || 1) })); await saveGuests(clientEventId, payload); setMessage('saved'); setToastOpen(true); loadJobs(); } catch (e: any) { setMessage(String(e?.message || e)); setToastOpen(true); } };

  if (!clientEventId) return <main className="container"><Card><h2>{t('title', lang)}</h2><div>No event id</div></Card></main>;

  return (
    <main className="container" style={{ direction: lang === 'he' ? 'rtl' : 'ltr' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Import Guests — {clientEventId}</h1>
        <div>
          <select value={lang} onChange={e => setLang(e.target.value as Lang)}><option value="en">EN</option><option value="he">HE</option></select>
        </div>
      </div>

      <Card style={{ marginTop: 12 }}>
        <input type="file" accept=".csv" onChange={async e => { const f = e.target.files?.[0]; if (!f) return setRows([]); const text = await f.text(); const parsed = parseCsvText(text); setRows(parsed.map((cols: string[]) => ({ name: cols[0] ?? '', lastname: cols[1] ?? '', 'num of participants': cols[2] ?? '', 'phone number': cols[3] ?? '' }))); }} />
        <div style={{ marginTop: 12 }}>
          <Button variant="ghost" onClick={() => setRows([])}>{t('clear', lang) || 'Clear'}</Button>
          <Button variant="ghost" onClick={() => { const csv = rows.map(r => `${r.name},${r.lastname},${r['num of participants'] || ''},${r['phone number'] || ''}`).join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `preview_${clientEventId}.csv`; a.click(); URL.revokeObjectURL(url); }}>{t('downloadPreview', lang) || 'Download'}</Button>
        </div>
      </Card>

      {rows.length > 0 && (
        <Card style={{ marginTop: 12 }}>
          <h3>Preview</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 800, width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={{ textAlign: 'left', padding: 6 }}>Name</th><th style={{ textAlign: 'left', padding: 6 }}>Lastname</th><th style={{ textAlign: 'left', padding: 6 }}>Num</th><th style={{ textAlign: 'left', padding: 6 }}>Phone</th><th style={{ textAlign: 'left', padding: 6 }}>Actions</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: 6 }}><input value={r.name} onChange={e => { const copy = [...rows]; copy[i] = { ...copy[i], name: e.target.value }; setRows(copy); }} /></td>
                    <td style={{ padding: 6 }}><input value={r.lastname} onChange={e => { const copy = [...rows]; copy[i] = { ...copy[i], lastname: e.target.value }; setRows(copy); }} /></td>
                    <td style={{ padding: 6 }}><input value={r['num of participants']} onChange={e => { const copy = [...rows]; copy[i] = { ...copy[i], 'num of participants': e.target.value }; setRows(copy); }} style={{ width: 80 }} /></td>
                    <td style={{ padding: 6 }}><input value={r['phone number']} onChange={e => { const copy = [...rows]; copy[i] = { ...copy[i], 'phone number': e.target.value }; setRows(copy); }} /></td>
                    <td style={{ padding: 6 }}><Button variant="ghost" onClick={() => { const copy = [...rows]; copy.splice(i, 1); setRows(copy); }}>Remove</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={onUpload} disabled={!rows.length}>{t('upload', lang)}</Button>
            <Button onClick={onSaveGuests}>Save to backend</Button>
          </div>
        </Card>
      )}

      <Toast open={toastOpen} message={message || ''} />

      {status && (
        <Card style={{ marginTop: 12 }}>
          <h3>Import status</h3>
          <div>State: {status.status}</div>
          <div>Success: {status.successCount ?? 0} Failures: {status.failureCount ?? 0}</div>
          {status.failureCount > 0 && <Button onClick={() => downloadErrorRows(status._id)}>Download errors</Button>}
        </Card>
      )}

      <Card style={{ marginTop: 12 }}>
        <h3>Import history</h3>
        {jobs.length === 0 ? <div>No imports</div> : (
          <table style={{ width: '100%' }}>
            <thead><tr><th>When</th><th>Status</th><th>Rows</th><th>Actions</th></tr></thead>
            <tbody>{jobs.map(j => <tr key={String(j._id)}><td>{new Date(j.createdAt).toLocaleString()}</td><td>{j.status}</td><td>{j.totalRows ?? '—'}</td><td>{j.failureCount > 0 && <Button onClick={() => downloadErrorRows(j._id)}>Download</Button>}</td></tr>)}</tbody>
          </table>
        )}
      </Card>
    </main>
  );
}

export async function getServerSideProps(context: any) {
  const id = context?.params?.id ?? null;
  return { props: { params: { id } } };
}
