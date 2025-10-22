import React, { useEffect, useState } from 'react';
import Nav from '../../../components/Nav';
import { useLang } from '../../../lib/lang';
import { getSimplePageStyles } from '../../../styles/pages/simplePageStyles';
import { t } from '../../../lib/i18n';
import { useRouter } from 'next/router';
import AuthRoute from '../../../lib/AuthRoute';
import { updateEvent } from '../../../lib/api';
import Toast from '../../../components/Toast';

function SettingsPage() {
  const { lang } = useLang();
  const styles = getSimplePageStyles(lang);
  const router = useRouter();
  const { id } = router.query;
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const a = await import('../../../lib/auth');
        const token = a.getToken();
        const headers: Record<string,string> = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`/api/proxy/events/${id}`, { headers });
        if (!res.ok) throw new Error('failed to load event');
        const data = await res.json();
        const ev = data.event || data;
        setTitle(ev.title || ''); setType(ev.type || ''); setDate(ev.date ? new Date(ev.date).toISOString().slice(0,10) : ''); setDescription(ev.description || '');
      } catch (err: any) {
        setMessage(String(err?.message || err)); setToastOpen(true); setTimeout(() => setToastOpen(false), 3000);
      }
    })();
  }, [id]);

  const onSave = async () => {
    if (!id) return;
    try {
      await updateEvent(String(id), { title, type, date: date || null, description });
      setMessage('Saved'); setToastOpen(true); setTimeout(() => setToastOpen(false), 2000);
      setTimeout(() => router.push(`/events/${id}`), 900);
    } catch (err: any) {
      setMessage(String(err?.message || err)); setToastOpen(true); setTimeout(() => setToastOpen(false), 4000);
    }
  };

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <Nav />
      <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
        <h1>{t('eventSettings', lang)}</h1>
        <div style={{ padding: 16, background: '#f7fafc', borderRadius: 8 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Title
            <input value={title} onChange={e => setTitle(e.target.value)} style={{ display: 'block', width: '100%', padding: 8, marginTop: 6 }} />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>Type
            <input value={type} onChange={e => setType(e.target.value)} style={{ display: 'block', width: '100%', padding: 8, marginTop: 6 }} />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>Date
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ display: 'block', padding: 8, marginTop: 6 }} />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>Description
            <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ display: 'block', width: '100%', padding: 8, marginTop: 6 }} />
          </label>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onSave}>Save</button>
            <button className="btn" onClick={() => router.push(`/events/${id}`)} style={{ background: 'transparent', border: 'none', color: '#4299e1' }}>Cancel</button>
          </div>
        </div>
      </div>
  <Toast open={toastOpen} message={message || ''} severity={message && message.toLowerCase().includes('failed') ? 'error' : 'success'} autoDismiss={3000} />
    </main>
  );
}

export default function ProtectedSettingsPage() {
  return (
    <AuthRoute>
      <SettingsPage />
    </AuthRoute>
  );
}

