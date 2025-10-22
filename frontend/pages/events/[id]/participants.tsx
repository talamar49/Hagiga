import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Nav from '../../../components/Nav';
import { useLang } from '../../../lib/lang';
import { getSimplePageStyles } from '../../../styles/pages/simplePageStyles';
import { t } from '../../../lib/i18n';
import { Routes } from '../../../constants/routes';
import AuthRoute from '../../../lib/AuthRoute';
import ConfirmModal from '../../../components/ConfirmModal';
import Toast from '../../../components/Toast';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

function ParticipantsPage() {
  const { lang } = useLang();
  const styles = getSimplePageStyles(lang);
  const router = useRouter();
  const { id } = router.query;
  const [participants, setParticipants] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const fetchParticipants = async () => {
      try {
  const auth = await import('../../../lib/auth');
  const token = auth.getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/proxy/events/${id}/participants`, { headers });
        if (res.ok) {
          const data = await res.json();
          setParticipants(data.participants || []);
        }
      } catch (err) {
        console.error('Failed to fetch participants', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [id]);

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <Nav />
      <div style={{ maxWidth: 960, margin: '24px auto', padding: 16 }}>
        <h1>{t('manageParticipants', lang)}</h1>

        <div style={{ marginBottom: 24 }}>
          <Button onClick={() => router.push(`${Routes.EVENTS}/${id}/import_csv`)}>{t('importFromCSV', lang)}</Button>
          <Button onClick={() => router.push(`${Routes.EVENTS}/${id}/participants/add`)} style={{ marginLeft: 12, background: 'var(--success)', borderColor: 'var(--success)' }}>{t('addManually', lang)}</Button>
          <Button onClick={() => router.push(`${Routes.EVENTS}/${id}/invitations`)} style={{ marginLeft: 12 }}>{'ניהול הזמנה לאירוע'}</Button>
        </div>

        {loading ? (
          <div>{t('loading', lang)}</div>
        ) : participants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#666' }}>
            {t('noParticipants', lang)}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ textAlign: lang === 'he' ? 'right' : 'left', padding: 12 }}>
                    {t('name', lang)}
                  </th>
                  <th style={{ textAlign: lang === 'he' ? 'right' : 'left', padding: 12 }}>
                    {t('phone', lang)}
                  </th>
                  <th style={{ textAlign: lang === 'he' ? 'right' : 'left', padding: 12 }}>
                    {t('numParticipants', lang)}
                  </th>
                </tr>
              </thead>
              <tbody>
                    {participants.map((p, idx) => (
                      <tr key={p._id || idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: 12 }}>
                          {editingIdx === idx ? (
                            <input value={editingRow.name} onChange={e => setEditingRow({ ...editingRow, name: e.target.value })} />
                          ) : (
                            <>{p.name} {p.lastname}</>
                          )}
                        </td>
                        <td style={{ padding: 12 }}>
                          {editingIdx === idx ? (
                            <input value={editingRow.phone} onChange={e => setEditingRow({ ...editingRow, phone: e.target.value })} />
                          ) : (
                            <>{p.phone || p.phoneNumber || p['phone number'] || ''}</>
                          )}
                        </td>
                        <td style={{ padding: 12 }}>
                          {editingIdx === idx ? (
                            <input type="number" value={editingRow.numAttendees || editingRow.participantsCount || 1} onChange={e => setEditingRow({ ...editingRow, numAttendees: Number(e.target.value) })} style={{ width: 80 }} />
                          ) : (
                            <>{p.numAttendees || p.numParticipants || p.participantsCount || p['num of participants'] || 1}</>
                          )}
                        </td>
                        <td style={{ padding: 12 }}>
                          {editingIdx === idx ? (
                            <>
                              <Button onClick={async () => {
                                try {
                                  const auth = await import('../../../lib/auth');
                                  const token = auth.getToken();
                                  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                  if (token) headers['Authorization'] = `Bearer ${token}`;
                                  const res = await fetch(`/api/proxy/events/${id}/participants/${p._id}`, { method: 'PATCH', headers, body: JSON.stringify(editingRow) });
                                  if (!res.ok) throw new Error(await res.text());
                                  const data = await res.json();
                                  const copy = [...participants]; copy[idx] = data.participant; setParticipants(copy);
                                  setEditingIdx(null); setEditingRow(null);
                                  setToastMsg('Saved'); setTimeout(() => setToastMsg(''), 3000);
                                } catch (err: any) {
                                  setToastMsg(String(err?.message || err)); setTimeout(() => setToastMsg(''), 4000);
                                }
                              }}>Save</Button>
                              <Button variant="ghost" style={{ marginLeft: 8 }} onClick={() => { setEditingIdx(null); setEditingRow(null); }}>Cancel</Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => { setEditingIdx(idx); setEditingRow({ name: p.name, phone: p.phone || p.phoneNumber || p['phone number'], numAttendees: p.numAttendees || p.numParticipants || p.participantsCount }); }}>Edit</Button>
                              <Button style={{ marginLeft: 8 }} onClick={async () => {
                                try {
                                  const auth = await import('../../../lib/auth');
                                  const token = auth.getToken();
                                  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                  if (token) headers['Authorization'] = `Bearer ${token}`;
                                  const newStatus = p.status === 'checked_in' ? 'invited' : 'checked_in';
                                  const res = await fetch(`/api/proxy/events/${id}/participants/${p._id}`, { method: 'PATCH', headers, body: JSON.stringify({ status: newStatus }) });
                                  if (!res.ok) throw new Error(await res.text());
                                  const d = await res.json();
                                  const copy = [...participants]; copy[idx] = d.participant; setParticipants(copy);
                                  setToastMsg(newStatus === 'checked_in' ? 'Checked in' : 'Checked out'); setTimeout(() => setToastMsg(''), 2000);
                                } catch (err: any) {
                                  setToastMsg(String(err?.message || err)); setTimeout(() => setToastMsg(''), 3000);
                                }
                              }}>{p.status === 'checked_in' ? 'Uncheck' : 'Check-in'}</Button>
                              <Button style={{ marginLeft: 8, background: 'var(--danger)', borderColor: 'var(--danger)', color: 'white' }} onClick={() => { setConfirmOpen(true); setConfirmTarget(p._id); }}>Delete</Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <button 
            onClick={() => router.push(`${Routes.EVENTS}/${id}`)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#4299e1', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ← {t('backToEvent', lang)}
          </button>
        </div>
        <ConfirmModal open={confirmOpen} title={t('confirmDeleteParticipant', lang) || 'Delete participant?'} message={t('confirmDeleteParticipantMsg', lang) || 'This will permanently remove this participant.'} onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }} onConfirm={async () => {
          if (!confirmTarget) return setConfirmOpen(false);
          try {
            const auth = await import('../../../lib/auth');
            const token = auth.getToken();
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`/api/proxy/events/${id}/participants/${confirmTarget}`, { method: 'DELETE', headers });
            if (res.status === 204) {
              setParticipants(participants.filter(p => String(p._id) !== String(confirmTarget)));
              setToastMsg('Deleted'); setTimeout(() => setToastMsg(''), 2000);
            } else {
              const txt = await res.text();
              setToastMsg(`delete failed: ${res.status} ${txt}`); setTimeout(() => setToastMsg(''), 4000);
            }
          } catch (err: any) {
            setToastMsg(String(err?.message || err)); setTimeout(() => setToastMsg(''), 4000);
          } finally {
            setConfirmOpen(false); setConfirmTarget(null);
          }
        }} />
  <Toast open={!!toastMsg} message={toastMsg} severity={toastMsg.toLowerCase().includes('failed') || toastMsg.toLowerCase().includes('error') ? 'error' : 'success'} autoDismiss={2500} />
      </div>
    </main>
  );
}

export default function ProtectedParticipantsPage() {
  return (
    <AuthRoute>
      <ParticipantsPage />
    </AuthRoute>
  );
}
