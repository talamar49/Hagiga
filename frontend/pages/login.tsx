import React, { useState } from 'react';
import Nav from '../components/Nav';
import Link from 'next/link';
import { t } from '../lib/i18n';
import { useLang } from '../lib/lang';
import { getLoginStyles } from '../styles/pages/loginStyles';
import { login as apiLogin, saveToken, requestOtp } from '../lib/auth';
import { Routes } from '../constants/routes';
import { useRouter } from 'next/router';

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

        <div className="card" style={styles.cardStyle}>
          <hr style={{ margin: '16px 0' }} />

          <form name="loginForm" style={styles.formStyle} onSubmit={onSubmit}>
            <div style={styles.toggleWrap}>
              <div style={styles.buttonGroup} role="tablist" aria-label="login modes">
                <button type="button" className="btn" onClick={() => setMode('creds')} aria-pressed={mode === 'creds'} style={mode === 'creds' ? { fontWeight: 600 } : {}}>{t('namePassword', lang)}</button>
                <button type="button" className="btn" onClick={() => setMode('phone')} aria-pressed={mode === 'phone'} style={mode === 'phone' ? { fontWeight: 600 } : {}}>{t('phoneLabel', lang)}</button>
              </div>
            </div>

            {mode === 'creds' ? (
              <>
                <div style={{ marginBottom: 12, textAlign: lang === 'he' ? 'right' : 'left' }}>
                  <label htmlFor="email">{t('email', lang)}</label>
                  <input name="email" id="email" dir="ltr" type="email" placeholder="you@example.com" style={{ width: '100%', padding: 10 }} />
                </div>
                <div style={{ marginBottom: 12, textAlign: lang === 'he' ? 'right' : 'left' }}>
                  <label htmlFor="password">{t('password', lang)}</label>
                  <input name="password" id="password" dir="ltr" type="password" placeholder={t('passwordPlaceholder', lang)} style={{ width: '100%', padding: 10 }} />
                </div>
              </>
            ) : (
              <div style={{ marginBottom: 12, textAlign: lang === 'he' ? 'right' : 'left' }}>
                <label htmlFor="phone">{t('phoneLabel', lang)}</label>
                <input name="phone" id="phone" dir="ltr" type="tel" placeholder={lang === 'he' ? 'פלאפון' : '+972 50 000 0000'} style={{ width: '100%', padding: 10 }} />
              </div>
            )}

            <div style={styles.actionsWrap}>
                <div style={{ display: 'inline-flex', gap: 8 }}>
                <button disabled={loading} type="submit" className="btn" dir={lang === 'he' ? 'rtl' : 'ltr'}>{loading ? '...' : t('signIn', lang)}</button>
                <button type="button" className="btn" style={{ background: '#DB4437' }} aria-label={t('loginWithGoogle', lang)} dir={lang === 'he' ? 'rtl' : 'ltr'}>{t('loginWithGoogle', lang)}</button>
              </div>
              <div style={{ marginTop: 8 }} className="muted">
                {t('noAccount', lang)} <Link href="/register">{t('register', lang)}</Link>
              </div>
            </div>
            {error ? <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div> : null}
          </form>
        </div>
      </div>
    </main>
  );
}
