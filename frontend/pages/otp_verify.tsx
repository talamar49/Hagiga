import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import { Routes } from '../constants/routes';
import { useLang } from '../lib/lang';
import { getSimplePageStyles } from '../styles/pages/simplePageStyles';
import { verifyOtp, saveToken } from '../lib/auth';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function OtpVerifyPage(){
  const { lang } = useLang();
  const styles = getSimplePageStyles(lang);
  const router = useRouter();
  const { requestId: qRequestId } = router.query as { requestId?: string };
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!qRequestId) return;
  }, [qRequestId]);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    setError(null);
    if (!qRequestId) {
      setError(lang === 'he' ? 'בקשה חסרה' : 'Missing request id');
      return;
    }
    if (!code) {
      setError(lang === 'he' ? 'נא להזין קוד' : 'Please enter code');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(String(qRequestId), code);
  saveToken(res.token);
  router.push(Routes.USER_MAIN_FEED);
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'} lang={lang === 'he' ? 'he' : 'en'}>
      <Nav />
      <div style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
        <h1 style={{ fontSize: 22 }}>{lang === 'he' ? 'אימות קוד' : 'Verify code'}</h1>
        <p className="muted">{lang === 'he' ? 'הזן את הקוד שנשלח למספר הטלפון' : 'Enter the code sent to your phone'}</p>
        <Card>
          <form onSubmit={onSubmit}>
            <Input value={code} onChange={e => setCode(e.target.value)} inputMode="numeric" placeholder={lang === 'he' ? 'קוד' : 'Code'} />
            <div style={{ marginTop: 12 }}>
              <Button type="submit" disabled={loading}>{loading ? (lang === 'he' ? 'טוען...' : 'Loading...') : (lang === 'he' ? 'אמת' : 'Verify')}</Button>
            </div>
            {error ? <div style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</div> : null}
          </form>
        </Card>
      </div>
    </main>
  );
}
