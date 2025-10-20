import React from 'react';
import Nav from '../components/Nav';
import Link from 'next/link';
import { useLang } from '../lib/lang';

export default function RegisterPage() {
  const { lang } = useLang();
  return (
    <main style={{ padding: 24 }} dir={lang === 'he' ? 'rtl' : 'ltr'} lang={lang === 'he' ? 'he' : 'en'}>
      <Nav />
      <div className="container" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <h1 style={{ margin: 0 }} dir={lang === 'he' ? 'rtl' : 'ltr'}>{lang === 'he' ? 'הרשמה' : 'Register'}</h1>
        </div>
        <p className="muted" style={{ textAlign: lang === 'he' ? 'right' : 'left' }}>{lang === 'he' ? 'הרשם/י באמצעות חשבון גוגל או מלא/י את הטופס' : 'Register using Google or complete the form'}</p>

        <div className="card" style={{ marginTop: 12 }}>

          <hr style={{ margin: '16px 0' }} />

          <form style={{ maxWidth: 520, marginLeft: 'auto' }}>
            <div style={{ marginBottom: 12, textAlign: lang === 'he' ? 'right' : 'left' }}>
                <label>{lang === 'he' ? '\u05e9\u05dd' : 'First name'}</label>
                <input dir={lang === 'he' ? 'rtl' : 'ltr'} type="text" placeholder={lang === 'he' ? '\u05e9\u05dd' : 'First name'} style={{ width: '100%', padding: 10 }} />
              </div>
              <div style={{ marginBottom: 12, textAlign: lang === 'he' ? 'right' : 'left' }}>
                <label>{lang === 'he' ? '\u05e9\u05dd \u05de\u05e9\u05e4\u05d7\u05d4' : 'Last name'}</label>
                <input dir={lang === 'he' ? 'rtl' : 'ltr'} type="text" placeholder={lang === 'he' ? '\u05e9\u05dd \u05de\u05e9\u05e4\u05d7\u05d4' : 'Last name'} style={{ width: '100%', padding: 10 }} />
            </div>
            <div style={{ marginBottom: 12, textAlign: lang === 'he' ? 'right' : 'left' }}>
              <label>{lang === 'he' ? 'אימייל' : 'Email'}</label>
              <input dir="ltr" type="email" placeholder="you@example.com" style={{ width: '100%', padding: 10 }} />
            </div>
            <div style={{ marginBottom: 12, textAlign: lang === 'he' ? 'right' : 'left' }}>
              <label>{lang === 'he' ? 'סיסמה' : 'Password'}</label>
              <input dir="ltr" type="password" placeholder="••••••••" style={{ width: '100%', padding: 10 }} />
            </div>
            <div style={{ marginBottom: 12, textAlign: lang === 'he' ? 'right' : 'left' }}>
              <label>{lang === 'he' ? 'אימות סיסמה' : 'Confirm password'}</label>
              <input dir="ltr" type="password" placeholder={lang === 'he' ? 'חזור על הסיסמה' : 'Confirm password'} style={{ width: '100%', padding: 10 }} />
            </div>

            <div style={{ textAlign: lang === 'he' ? 'right' : 'left', paddingTop: 8 }}>
              <div style={{ display: 'inline-flex', gap: 8 }}>
                <button type="submit" className="btn">{lang === 'he' ? 'הרשמה' : 'Register'}</button>
                <button type="button" className="btn" style={{ background: '#DB4437' }}>{lang === 'he' ? 'הירשם/י עם גוגל' : 'Register with Google'}</button>
              </div>
            </div>
          </form>

          <p style={{ textAlign: 'center', marginTop: 12 }}>
            {lang === 'he' ? 'כבר יש לך חשבון?' : "Already have an account?"} <Link href="/login">{lang === 'he' ? 'התחברות' : 'Sign in'}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
