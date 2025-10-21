import React, { useState } from 'react';
import Nav from '../components/Nav';
import Link from 'next/link';
import { useLang } from '../lib/lang';
import { getRegisterStyles } from '../styles/pages/registerStyles';
import { register as apiRegister, saveToken } from '../lib/auth';
import { useRouter } from 'next/router';
import { Routes } from '../constants/routes';

export default function RegisterPage() {
  const { lang } = useLang();
  const styles = getRegisterStyles(lang);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form as any);
    const firstName = String(fd.get('firstName') || '').trim();
    const lastName = String(fd.get('lastName') || '').trim();
    const email = String(fd.get('email') || '').trim();
  const phone = String(fd.get('phone') || '').trim();
    const password = String(fd.get('password') || '').trim();
    const confirm = String(fd.get('confirmPassword') || '').trim();

    // Client-side validation
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
    // Phone is required for registration (frontend validation only)
    if (!phone) {
      setError(lang === 'he' ? 'נדרש מספר פלאפון' : 'Phone number is required');
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError(lang === 'he' ? 'הסיסמאות לא תואמות' : 'Passwords do not match');
      setLoading(false);
      return;
    }
    try {
  const res = await apiRegister(email, password, firstName, lastName, phone);
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
      <div className="container" style={styles.outerContainer}>
        <div style={styles.headerWrap}>
          <h1 style={styles.titleStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>{lang === 'he' ? 'הרשמה' : 'Register'}</h1>
        </div>
        <p className="muted" style={styles.mutedStyle}>{lang === 'he' ? 'הרשמה/י באמצעות חשבון גוגל או מלא/י את הטופס' : 'Register using Google or complete the form'}</p>

        <div className="card" style={styles.cardStyle}>

          <hr style={{ margin: '16px 0' }} />

          <form name="registerForm" style={styles.formStyle} onSubmit={onSubmit}>
            <div style={styles.fieldStyle}>
                <label>{lang === 'he' ? 'שם' : 'First name'}</label>
                <input name="firstName" dir={lang === 'he' ? 'rtl' : 'ltr'} type="text" placeholder={lang === 'he' ? 'שם' : 'First name'} style={{ width: '100%', padding: 10 }} />
              </div>
              <div style={styles.fieldStyle}>
                <label>{lang === 'he' ? 'שם משפחה' : 'Last name'}</label>
                <input name="lastName" dir={lang === 'he' ? 'rtl' : 'ltr'} type="text" placeholder={lang === 'he' ? 'שם משפחה' : 'Last name'} style={{ width: '100%', padding: 10 }} />
            </div>
            <div style={styles.fieldStyle}>
              <label>{lang === 'he' ? 'פלאפון' : 'Phone'}</label>
              <input name="phone" dir="ltr" type="tel" placeholder={lang === 'he' ? '+972 50-123-4567' : '+1 555-555-0123'} style={{ width: '100%', padding: 10 }} />
            </div>
            <div style={styles.fieldStyle}>
              <label>{lang === 'he' ? 'אימייל' : 'Email'}</label>
              <input name="email" dir="ltr" type="email" placeholder="you@example.com" style={{ width: '100%', padding: 10 }} />
            </div>
            <div style={styles.fieldStyle}>
              <label>{lang === 'he' ? 'סיסמה' : 'Password'}</label>
              <input name="password" dir="ltr" type="password" placeholder="••••••••" style={{ width: '100%', padding: 10 }} />
            </div>
            <div style={styles.fieldStyle}>
              <label>{lang === 'he' ? 'אימות סיסמה' : 'Confirm password'}</label>
              <input name="confirmPassword" dir="ltr" type="password" placeholder={lang === 'he' ? 'חזור על הסיסמה' : 'Confirm password'} style={{ width: '100%', padding: 10 }} />
            </div>

            <div style={{ textAlign: lang === 'he' ? 'right' : 'left', paddingTop: 8 }}>
                <div style={{ display: 'inline-flex', gap: 8 }}>
                <button disabled={loading} type="submit" className="btn">{loading ? (lang === 'he' ? 'טוען...' : 'Loading...') : (lang === 'he' ? 'הרשמה' : 'Register')}</button>
                <button type="button" className="btn" style={{ background: '#DB4437' }}>{lang === 'he' ? 'הרשמה עם גוגל' : 'Register with Google'}</button>
              </div>
            </div>
            {error ? <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div> : null}
          </form>

          <p style={styles.centerText}>
            {lang === 'he' ? 'כבר יש לך חשבון?' : "Already have an account?"} <Link href="/login">{lang === 'he' ? 'התחבר/י' : 'Sign in'}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
