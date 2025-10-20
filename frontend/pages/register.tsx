import React from 'react';
import Nav from '../components/Nav';
import Link from 'next/link';
import { useLang } from '../lib/lang';
import { getRegisterStyles } from '../styles/pages/registerStyles';

export default function RegisterPage() {
  const { lang } = useLang();
  const styles = getRegisterStyles(lang);
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

          <form style={styles.formStyle}>
            <div style={styles.fieldStyle}>
                <label>{lang === 'he' ? 'שם' : 'First name'}</label>
                <input dir={lang === 'he' ? 'rtl' : 'ltr'} type="text" placeholder={lang === 'he' ? 'שם' : 'First name'} style={{ width: '100%', padding: 10 }} />
              </div>
              <div style={styles.fieldStyle}>
                <label>{lang === 'he' ? 'שם משפחה' : 'Last name'}</label>
                <input dir={lang === 'he' ? 'rtl' : 'ltr'} type="text" placeholder={lang === 'he' ? 'שם משפחה' : 'Last name'} style={{ width: '100%', padding: 10 }} />
            </div>
            <div style={styles.fieldStyle}>
              <label>{lang === 'he' ? 'אימייל' : 'Email'}</label>
              <input dir="ltr" type="email" placeholder="you@example.com" style={{ width: '100%', padding: 10 }} />
            </div>
            <div style={styles.fieldStyle}>
              <label>{lang === 'he' ? 'סיסמה' : 'Password'}</label>
              <input dir="ltr" type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" style={{ width: '100%', padding: 10 }} />
            </div>
            <div style={styles.fieldStyle}>
              <label>{lang === 'he' ? 'אימות סיסמה' : 'Confirm password'}</label>
              <input dir="ltr" type="password" placeholder={lang === 'he' ? 'חזור על הסיסמה' : 'Confirm password'} style={{ width: '100%', padding: 10 }} />
            </div>

            <div style={{ textAlign: lang === 'he' ? 'right' : 'left', paddingTop: 8 }}>
              <div style={{ display: 'inline-flex', gap: 8 }}>
                <button type="submit" className="btn">{lang === 'he' ? 'הרשמה' : 'Register'}</button>
                <button type="button" className="btn" style={{ background: '#DB4437' }}>{lang === 'he' ? 'הרשמה עם גוגל' : 'Register with Google'}</button>
              </div>
            </div>
          </form>

          <p style={styles.centerText}>
            {lang === 'he' ? 'כבר יש לך חשבון?' : "Already have an account?"} <Link href="/login">{lang === 'he' ? 'התחבר/י' : 'Sign in'}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
