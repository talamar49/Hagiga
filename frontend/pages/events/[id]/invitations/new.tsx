import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Nav from '../../../../components/Nav';
import { useLang } from '../../../../lib/lang';
import { getSimplePageStyles } from '../../../../styles/pages/simplePageStyles';
import Button from '../../../../components/ui/Button';
import { uploadMedia } from '../../../../lib/api';

export default function NewInvitation() {
  const { lang } = useLang();
  const styles = getSimplePageStyles(lang);
  const router = useRouter();
  const { id } = router.query;
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = (f?: File) => {
    if (!f) return setFile(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const doSave = async () => {
    if (!id) return;
    setSaving(true); setError(null);
    try {
      if (file) {
        // upload via API helper which returns media object
        const up = await uploadMedia(String(id), file, text);
        // create invitation by calling backend directly via proxy
        const mediaId = up.media?._id || up.media?.id || up.media?.media?._id;
        const headers: Record<string,string> = { 'Content-Type': 'application/json' };
        const auth = await import('../../../../lib/auth');
        const token = auth.getToken(); if (token) headers['Authorization'] = `Bearer ${token}`;
        const createRes = await fetch(`/api/proxy/events/${id}/invitations`, { method: 'POST', headers, body: JSON.stringify({ text, mediaId }) });
        if (!createRes.ok) throw new Error(await createRes.text());
        // navigate back to invitations index
        router.push(`/events/${id}/invitations`);
      } else {
        const headers: Record<string,string> = { 'Content-Type': 'application/json' };
        const auth = await import('../../../../lib/auth');
        const token = auth.getToken(); if (token) headers['Authorization'] = `Bearer ${token}`;
        const createRes = await fetch(`/api/proxy/events/${id}/invitations`, { method: 'POST', headers, body: JSON.stringify({ text }) });
        if (!createRes.ok) throw new Error(await createRes.text());
        router.push(`/events/${id}/invitations`);
      }
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <Nav />
      <div style={{ maxWidth: 720, margin: '48px auto', padding: 16 }}>
        <h1>{'יצירת הזמנה'}</h1>
        <div style={{ marginTop: 16 }}>
          <input type="file" accept="image/*,video/*" onChange={e => onFile(e.target.files?.[0])} />
        </div>
        {previewUrl && (
          <div style={{ marginTop: 16 }}>
            {file?.type.startsWith('video/') ? (
              <video src={previewUrl} controls style={{ maxWidth: '100%' }} />
            ) : (
              <img src={previewUrl} alt="preview" style={{ maxWidth: '100%' }} />
            )}
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder={'הקלד טקסט להזמנה'} style={{ width: '100%', minHeight: 120 }} />
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <div style={{ marginTop: 16 }}>
          <Button onClick={doSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          <Button variant="ghost" style={{ marginLeft: 12 }} onClick={() => router.push(`/events/${id}/invitations`)}>Cancel</Button>
        </div>
      </div>
    </main>
  );
}
