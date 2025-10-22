import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Nav from '../../../../components/Nav';
import { useLang } from '../../../../lib/lang';
import { getSimplePageStyles } from '../../../../styles/pages/simplePageStyles';
import { t } from '../../../../lib/i18n';
import { Routes } from '../../../../constants/routes';
import AuthRoute from '../../../../lib/AuthRoute';
import Toast from '../../../../components/Toast';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';

function AddParticipantPage() {
  const { lang } = useLang();
  const styles = getSimplePageStyles(lang);
  const router = useRouter();
  const { id } = router.query;

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [count, setCount] = useState<number>(1);
  const [message, setMessage] = useState<string>('');
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const onSave = async () => {
    // basic validation
    if (!name.trim()) {
      setMessage('name required'); setToastOpen(true); return;
    }
    if (!phone.trim()) {
      setMessage('phone required'); setToastOpen(true); return;
    }

    try {
      setSaving(true);
      const auth = await import('../../../../lib/auth');
      const token = auth.getToken();
      if (!token) {
        setMessage('Please login to add participants'); setToastOpen(true);
        setTimeout(() => { setToastOpen(false); router.push('/login'); }, 900);
        return;
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/proxy/events/${id}/guests`, {
        method: 'POST', headers, body: JSON.stringify([{ name, lastName, phone, participantsCount: count }])
      });

      if (res.status === 401) {
        setMessage('Session expired, redirecting to login'); setToastOpen(true);
        setTimeout(() => { setToastOpen(false); router.push('/login'); }, 900);
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || res.statusText);
      }

      setMessage('Saved'); setToastOpen(true);
      setTimeout(() => setToastOpen(false), 1400);
      // navigate back to participants list
      setTimeout(() => router.push(`${Routes.EVENTS}/${id}/participants`), 600);
    } catch (err: any) {
      setMessage(String(err?.message || err)); setToastOpen(true);
      setTimeout(() => setToastOpen(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <Nav />
      <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
        <h1>{t('addManually', lang)}</h1>

        <Card>
          <div style={{ padding: 24, marginTop: 8 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <label>
                {t('name', lang)}
                <Input value={name} onChange={e => setName(e.target.value)} style={{ display: 'block', width: '100%', padding: 8, marginTop: 6 }} />
              </label>
              <label>
                {t('lastname', lang)}
                <Input value={lastName} onChange={e => setLastName(e.target.value)} style={{ display: 'block', width: '100%', padding: 8, marginTop: 6 }} />
              </label>
              <label>
                {t('phone', lang)}
                <Input value={phone} onChange={e => setPhone(e.target.value)} style={{ display: 'block', width: '100%', padding: 8, marginTop: 6 }} />
              </label>
              <label>
                {t('numParticipants', lang)}
                <Input type="number" value={count} min={1} onChange={e => setCount(Number(e.target.value))} style={{ width: 120, padding: 8, marginTop: 6 }} />
              </label>

              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <Button onClick={onSave} disabled={saving}>{t('save', lang)}</Button>
                <Button variant="ghost" onClick={() => router.push(`${Routes.EVENTS}/${id}`)} style={{ marginLeft: 8 }}>{t('backToEvent', lang)}</Button>
              </div>
            </div>
          </div>
        </Card>

        <div style={{ marginTop: 24 }}>
          <Button variant="ghost" onClick={() => router.push(`${Routes.EVENTS}/${id}`)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)' }}>{`← ${t('backToEvent', lang)}`}</Button>
        </div>

        <Toast open={toastOpen} message={message || ''} severity={(message || '').toLowerCase().includes('required') || (message || '').toLowerCase().includes('failed') ? 'error' : 'success'} autoDismiss={3500} />
      </div>
    </main>
  );
}

export default function ProtectedAddParticipantPage() {
  return (
    <AuthRoute>
      <AddParticipantPage />
    </AuthRoute>
  );
}
