import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Nav from '../../../components/Nav';
import { useLang } from '../../../lib/lang';
import { getSimplePageStyles } from '../../../styles/pages/simplePageStyles';
import { t } from '../../../lib/i18n';
import Button from '../../../components/ui/Button';
import { listInvitations, deleteInvitation } from '../../../lib/api';
import InvitationModal from '../../../components/InvitationModal';
import ConfirmModal from '../../../components/ConfirmModal';

interface InvitationItem {
  _id: string;
  text?: string;
  media?: { url?: string; type?: string } | null;
  createdAt?: string;
}

export default function InvitationsIndex() {
  const { lang } = useLang();
  const styles = getSimplePageStyles(lang);
  const router = useRouter();
  const { id } = router.query;
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<InvitationItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res: any = await listInvitations(String(id));
      setInvitations(res.invitations || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [id]);

  const onSave = async (updated: InvitationItem) => {
    try {
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      const auth = await import('../../../lib/auth');
      const token = auth.getToken(); if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/proxy/events/${id}/invitations/${updated._id}`, { method: 'PATCH', headers, body: JSON.stringify({ text: updated.text }) });
      if (!res.ok) throw new Error(await res.text());
      setSelected(null);
      await refresh();
    } catch (e) { console.error('save failed', e); }
  };

  const confirmDelete = (invId: string) => {
    setDeletingId(invId);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!id || !deletingId) return;
    try {
      await deleteInvitation(String(id), deletingId);
      setConfirmOpen(false);
      // if the deleted one is open in modal, close it
      if (selected && selected._id === deletingId) setSelected(null);
      setDeletingId(null);
      await refresh();
    } catch (e) {
      console.error('delete failed', e);
      alert('מחיקה נכשלה');
    }
  };

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <Nav />
      <div style={{ maxWidth: 720, margin: '24px auto', padding: 16, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{'ניהול הזמנות'}</h1>
          <Button onClick={() => router.push(`${router.asPath}/new`)} style={{ padding: '8px 16px' }}>{'יצירת הזמנה'}</Button>
        </div>
        <p style={{ color: '#666' }}>{'כאן ניתן ליצור ולנהל הזמנות לאירוע'}</p>

        <div style={{ marginTop: 24 }}>
          {loading ? (
            <div>Loading...</div>
          ) : invitations.length === 0 ? (
            <div style={{ color: '#666', padding: 32 }}>No invitations yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              {invitations.map(inv => (
                  <div key={inv._id} style={{ width: '100%', maxWidth: 600, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', position: 'relative' }} onClick={() => setSelected(inv)}>
                    <div style={{ position: 'relative' }}>
                      {inv.media?.url && (() => {
                        const raw = String(inv.media.url || '');
                        let src = raw;
                        const key = (inv.media as any)?.storageKey;
                        let srcFinal = key ? `/api/proxy/media/${key}` : src;
                        if (!key) {
                          if (srcFinal.includes('://minio')) srcFinal = srcFinal.replace('://minio', '://localhost');
                          if (srcFinal.startsWith('/')) srcFinal = `http://localhost:4000${srcFinal}`;
                        }
                        if (inv.media?.type === 'video') return <video src={srcFinal} controls style={{ width: '100%', display: 'block' }} />;
                        return <img src={srcFinal} alt="invitation" style={{ width: '100%', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.6'; }} />;
                      })()}
                      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', color: 'white' }}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{inv.text}</div>
                      </div>
                      {/* delete button top-right */}
                      <button onClick={(e) => { e.stopPropagation(); confirmDelete(inv._id); }} style={{ position: 'absolute', top: 8, right: 8, zIndex: 3, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}>מחק</button>
                    </div>
                    <div style={{ padding: 8, color: '#888', fontSize: 12 }}>{new Date(inv.createdAt || '').toLocaleString()}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      {selected && <InvitationModal open={!!selected} invitation={selected} onClose={() => setSelected(null)} onSave={onSave} />}
      <ConfirmModal title={'מחיקה'} message={'אתה בטוח שברצונך למחוק את ההזמנה?'} open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={doDelete} />
    </main>
  );
}
