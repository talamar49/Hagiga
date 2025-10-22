import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { saveGuests } from '../../../lib/api';
import Toast from '../../../components/Toast';
import { t } from '../../../lib/i18n';
import { useTheme } from '../../../lib/theme';
import { Routes } from '../../../constants/routes';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import InlineInput from '../../../components/ui/InlineInput';
import TableCard, { headerCellStyle } from '../../../components/ui/TableCard';
import Nav from '../../../components/Nav';
import { useLang } from '../../../lib/lang';

type Lang = 'en' | 'he';

export default function ImportCsvPage({ params }: any) {
  const router = useRouter();
  const ssrId = params?.id ?? null;
  const [clientEventId, setClientEventId] = useState<string | null>(ssrId);
  const [rows, setRows] = useState<Array<any>>([]);
  const [toastSeverity, setToastSeverity] = useState<'info' | 'success' | 'error' | 'warn'>('info');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const { lang } = useLang();
  const [message, setMessage] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => { if (!clientEventId && router?.query?.id) setClientEventId(String(router.query.id)); }, [router.query, clientEventId]);

  const parseCsvText = (text: string) => text.split(/\r?\n/).filter(Boolean).map(line => line.split(',').map(c => c.trim()));

  // upload/import status and history removed for this view

  const onSaveGuests = async () => {
    if (!rows.length || !clientEventId) return setMessage('nothing to save');
    const payload = rows.map((r: any) => ({ name: r.name, lastName: r.lastname, phoneNumber: r['phone number'], participantsCount: Number(r['num of participants'] || 1) }));
    try {
      // include auth header if available
      let headers: Record<string,string> = { 'Content-Type': 'application/json' };
      try {
        const a = await import('../../../lib/auth');
        const tkn = a.getToken();
        if (tkn) headers['Authorization'] = `Bearer ${tkn}`;
      } catch (_) {}

      const res = await fetch(`/api/proxy/events/${clientEventId}/guests`, { method: 'POST', headers, body: JSON.stringify(payload) });
      if (res.ok) {
        // success -> go to participants page
        router.push(`${Routes.EVENTS}/${clientEventId}/participants`);
        return;
      }

      // handle validation errors (try structured JSON), otherwise show text
      const txt = await res.text();
      let parsed: any = null;
      try { parsed = JSON.parse(txt); } catch (e) { parsed = null; }

      // prepare a copy of rows with existing _errors preserved
      const copy = rows.map(r => ({ ...r, _errors: { ...(r._errors || {}), valid: true } }));

      let didMark = false;
      if (parsed) {
        // Typical shapes handled:
        // { errors: [ { index: 0, errors: { phone: 'invalid' } }, ... ] }
        // { errors: { 0: { phone: 'invalid' }, 1: { name: 'missing' } } }
        if (Array.isArray(parsed.errors)) {
          parsed.errors.forEach((it: any) => {
            const idx = typeof it.index === 'number' ? it.index : (it.row ?? it.r ?? null);
            const errObj = it.errors || it.fieldErrors || it;
            if (typeof idx === 'number' && copy[idx]) {
              copy[idx]._errors = { ...(copy[idx]._errors || {}), ...errObj, valid: false };
              didMark = true;
            }
          });
        } else if (parsed.errors && typeof parsed.errors === 'object') {
          // object keyed by index
          Object.keys(parsed.errors).forEach(k => {
            const idx = Number(k);
            if (!Number.isNaN(idx) && copy[idx]) {
              copy[idx]._errors = { ...(copy[idx]._errors || {}), ...parsed.errors[k], valid: false };
              didMark = true;
            }
          });
        } else if (parsed.fieldErrors && Array.isArray(parsed.fieldErrors)) {
          parsed.fieldErrors.forEach((it: any) => {
            const idx = Number(it.index);
            if (!Number.isNaN(idx) && copy[idx]) {
              copy[idx]._errors = { ...(copy[idx]._errors || {}), ...(it.errors || {}), valid: false };
              didMark = true;
            }
          });
        }
      }

      if (didMark) {
        setRows(copy);
        setMessage(t('saveValidationFailed', lang) || 'Some rows contain errors');
        setToastSeverity('error');
        setToastOpen(true);
      } else {
        // unknown failure: show server text
        setMessage(`Save failed: ${txt}`);
        setToastSeverity('error');
        setToastOpen(true);
      }

    } catch (err: any) {
      const txt = String(err?.message || err);
      setMessage(`Save failed: ${txt}`);
      setToastSeverity('error');
      setToastOpen(true);
    }
  };

  if (!clientEventId) return <main className="container"><Card><h2>{t('title', lang)}</h2><div>No event id</div></Card></main>;

  const validateRow = (r: any) => {
    const errors: any = { valid: true };
    const phone = String(r['phone number'] ?? '').trim();
    const numStr = String(r['num of participants'] ?? '').trim();
    if (!phone) { errors.phone = 'missing'; errors.valid = false; }
    if (numStr !== '') {
      if (!/^\d+$/.test(numStr) || Number(numStr) < 1) { errors.num = 'invalid'; errors.valid = false; }
    }
    return errors;
  };

  const updateRowAt = (index: number, partial: any) => {
    const copy = [...rows];
    copy[index] = { ...copy[index], ...partial };
    copy[index]._errors = validateRow(copy[index]);
    setRows(copy);
  };

  return (
    <main style={{ direction: lang === 'he' ? 'rtl' : 'ltr', width: '100%', padding: 18, boxSizing: 'border-box' }}>
      <Nav />
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{t('ImportParticipants', lang)}</h1>
        </div>

  <Card style={{ marginTop: 12, width: '100%', maxWidth: '100%', margin: '12px auto', padding: 12, boxSizing: 'border-box' }}>
        <input id="csv-file-input" type="file" accept=".csv" style={{ display: 'none' }} onChange={async e => {
          const f = e.target.files?.[0];
          if (!f) {
            setSelectedFileName(null);
            return setRows([]);
          }
          setSelectedFileName(f.name);
          const text = await f.text();
          const parsed = parseCsvText(text);
          // skip header row if present
          const dataRows = parsed.length > 0 ? parsed.slice(1) : [];
          const mapped = dataRows.map((cols: string[]) => {
            const r: any = { name: cols[0] ?? '', lastname: cols[1] ?? '', 'num of participants': cols[2] ?? '', 'phone number': cols[3] ?? '' };
            r._errors = validateRow(r);
            return r;
          });
          setRows(mapped);
        }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button onClick={() => { const el = document.getElementById('csv-file-input') as HTMLInputElement | null; if (el) el.click(); }}>{t('chooseFile', lang) || 'Choose file'}</Button>
          <Button variant="ghost" onClick={() => {
            setRows([]);
            setSelectedFileName(null);
            const el = document.getElementById('csv-file-input') as HTMLInputElement | null;
            if (el) el.value = '';
          }}>{t('clear', lang)}</Button>
          <div style={{ marginLeft: 'auto', color: '#666', fontSize: 12 }}>{selectedFileName ? `${t('fileSelected', lang) || 'Selected:'} ${selectedFileName}` : (rows.length > 0 ? `${rows.length} row(s)` : null)}</div>
        </div>
      </Card>

      {rows.length > 0 && (
      <Card style={{ marginTop: 12, width: '100%', maxWidth: '100%', margin: '12px auto', padding: 12, boxSizing: 'border-box' }}>
          <h3>Preview</h3>
              <TableCard style={{ maxHeight: '640px', minHeight: 120 }}>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' as any, wordBreak: 'break-word', minWidth: 760 }}>
                    <colgroup>
                      <col style={{ width: '220px' }} />
                      <col style={{ width: '180px' }} />
                      <col style={{ width: '140px' }} />
                      <col style={{ width: '260px' }} />
                      <col style={{ width: '120px' }} />
                    </colgroup>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ ...headerCellStyle(lang), width: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('name', lang)}</th>
                  <th style={{ ...headerCellStyle(lang), width: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('lastName', lang) || t('name', lang)}</th>
                  <th style={{ ...headerCellStyle(lang), width: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('numParticipants', lang)}</th>
                  <th style={{ ...headerCellStyle(lang), width: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('phone', lang)}</th>
                  <th style={{ ...headerCellStyle(lang), width: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('actions', lang) || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 12, width: 220, boxSizing: 'border-box' }}>
                      <InlineInput
                        value={r.name}
                        onChange={e => updateRowAt(i, { name: e.target.value })}
                        style={r._errors?.name ? { border: '1px solid #e00', width: 200, boxSizing: 'border-box' } : { width: 200, boxSizing: 'border-box' }}
                      />
                    </td>
                    <td style={{ padding: 12, width: 180, boxSizing: 'border-box' }}>
                      <InlineInput
                        value={r.lastname}
                        onChange={e => updateRowAt(i, { lastname: e.target.value })}
                        style={r._errors?.lastname ? { border: '1px solid #e00', width: 160, boxSizing: 'border-box' } : { width: 160, boxSizing: 'border-box' }}
                      />
                    </td>
                    <td style={{ padding: 12, width: 140, boxSizing: 'border-box' }}>
                      <InlineInput
                        value={r['num of participants']}
                        onChange={e => updateRowAt(i, { ['num of participants']: e.target.value })}
                        style={r._errors?.num ? { border: '1px solid #e00', width: 140, boxSizing: 'border-box' } : { width: 140, boxSizing: 'border-box' }}
                      />
                    </td>
                    <td style={{ padding: 12, width: 260, boxSizing: 'border-box' }}>
                      <InlineInput
                        value={r['phone number']}
                        onChange={e => updateRowAt(i, { ['phone number']: e.target.value })}
                        style={r._errors?.phone ? { border: '1px solid #e00', width: 240, boxSizing: 'border-box', whiteSpace: 'nowrap' } : { width: 240, boxSizing: 'border-box', whiteSpace: 'nowrap' }}
                      />
                    </td>
                    <td style={{ padding: 12, width: 120 }}><Button variant="ghost" onClick={() => { const copy = [...rows]; copy.splice(i, 1); setRows(copy); }}>{t('remove', lang) || 'Remove'}</Button></td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </TableCard>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" onClick={() => { const csv = rows.map(r => `${r.name},${r.lastname},${r['num of participants'] || ''},${r['phone number'] || ''}`).join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `preview_${clientEventId}.csv`; a.click(); URL.revokeObjectURL(url); }}>{t('downloadPreview', lang) || 'Download'}</Button>
              <Button variant="default" onClick={onSaveGuests} disabled={!rows.length || rows.some(r => r._errors && r._errors.valid === false)}>{t('saveGuests', lang) || 'Save Guests'}</Button>
            </div>
            <div style={{ color: '#a00', marginInlineStart: 'auto' }}>{rows.filter(r => r._errors && r._errors.valid === false).length > 0 ? `${rows.filter(r => r._errors && r._errors.valid === false).length} invalid row(s)` : null}</div>
          </div>
        </Card>
      )}

      </div>
      <Toast open={toastOpen} message={message || ''} severity={toastSeverity} />
    </main>
  );
}

export async function getServerSideProps(context: any) {
  const id = context?.params?.id ?? null;
  return { props: { params: { id } } };
}
