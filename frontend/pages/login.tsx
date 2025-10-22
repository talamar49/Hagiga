import React, { useState } from 'react';
import Nav from '../components/Nav';
import Link from 'next/link';
import { t } from '../lib/i18n';
import { useLang } from '../lib/lang';
import { getLoginStyles } from '../styles/pages/loginStyles';
import { login as apiLogin, saveToken, requestOtp } from '../lib/auth';
import { Routes } from '../constants/routes';
import { useRouter } from 'next/router';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

export default function LoginPage() {
  const { lang } = useLang();
  const [mode, setMode] = useState<'creds' | 'phone'>('creds');
  const styles = getLoginStyles(lang);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const form = e.target as HTMLFormElement;
      const fd = new FormData(form as any);
      const modeVal = mode;
      if (modeVal === 'creds') {
        const email = String(fd.get('email') || '').trim();
        const password = String(fd.get('password') || '').trim();
        if (!email) {
          setError(lang === 'he' ? 'נדרש אימייל' : 'Email is required');
          setLoading(false);
          return;
        }
        if (!password) {
          setError(lang === 'he' ? 'נדרש סיסמה' : 'Password is required');
          setLoading(false);
          return;
        }
        const res = await apiLogin(email, password);
  saveToken(res.token);
  router.push(Routes.USER_MAIN_FEED);
      } else {
        const phone = String(fd.get('phone') || '').trim();
        if (!phone) {
          setError(lang === 'he' ? 'נדרש מספר פלאפון' : 'Phone number is required');
          setLoading(false);
          return;
        }
        const otpRes = await requestOtp(phone);
        // navigate to OTP verification page with requestId in query
        router.push(`/otp_verify?requestId=${encodeURIComponent(otpRes.requestId)}`);
      }
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'} lang={lang === 'he' ? 'he' : 'en'}>
      <Nav />
          <div className="container" style={styles.outerContainer}>
            <div style={styles.headerWrap}>
              <h1 style={styles.titleStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>{t('loginTitle', lang)}</h1>
            </div>

            <Card>
              <form name="loginForm" style={{ padding: 8 }} onSubmit={onSubmit}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'flex-start' }} role="tablist" aria-label="login modes">
                  <Button type="button" onClick={() => setMode('creds')} aria-pressed={mode === 'creds'} className={mode === 'creds' ? 'active' : ''}>{t('namePassword', lang)}</Button>
                  <Button variant="ghost" type="button" onClick={() => setMode('phone')} aria-pressed={mode === 'phone'} className={mode === 'phone' ? 'active' : ''}>{t('phoneLabel', lang)}</Button>
                </div>

                {mode === 'creds' ? (
                  <>
                    <Input name="email" id="email" dir="ltr" type="email" placeholder="you@example.com" label={t('email', lang)} />
                    <Input name="password" id="password" dir="ltr" type="password" placeholder={t('passwordPlaceholder', lang)} label={t('password', lang)} />
                  </>
                ) : (
                  <Input name="phone" id="phone" dir="ltr" type="tel" placeholder={lang === 'he' ? 'פלאפון' : '+972 50 000 0000'} label={t('phoneLabel', lang)} />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button disabled={loading} type="submit">{loading ? '...' : t('signIn', lang)}</Button>
                    <Button type="button" variant="ghost" aria-label={t('loginWithGoogle', lang)} style={{ borderColor: '#db4437', color: 'var(--text)' }}>{t('loginWithGoogle', lang)}</Button>
                  </div>

                  <div style={{ marginLeft: 'auto' }} className="muted">
                    {t('noAccount', lang)} <Link href="/register">{t('register', lang)}</Link>
                  </div>
                </div>
                {error ? <div style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</div> : null}
              </form>
            </Card>
          </div>
    </main>
  );
}
