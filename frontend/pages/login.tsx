import React, { useState } from 'react';
import Nav from '../components/Nav';
import Link from 'next/link';
import { t } from '../lib/i18n';
import { useLang } from '../lib/lang';

export default function LoginPage() {
  const { lang } = useLang();
  const [mode, setMode] = useState<'creds' | 'phone'>('creds');

  return (
    <main style={{ padding: 20 }} dir={lang === 'he' ? 'rtl' : 'ltr'} lang={lang === 'he' ? 'he' : 'en'}>
      <Nav />
      <div className="container" style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <h1 style={{ margin: 0 }} dir={lang === 'he' ? 'rtl' : 'ltr'}>{t('loginTitle', lang)}</h1>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          

          <hr style={{ margin: '16px 0' }} />

          <form style={{ maxWidth: 520, margin: '0 auto' }} onSubmit={e => e.preventDefault()}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ display: 'inline-flex', gap: 8 }} role="tablist" aria-label="login modes">
                <button type="button" className="btn" onClick={() => setMode('creds')} aria-pressed={mode === 'creds'} style={mode === 'creds' ? { fontWeight: 600 } : {}}>{t('namePassword', lang)}</button>
                <button type="button" className="btn" onClick={() => setMode('phone')} aria-pressed={mode === 'phone'} style={mode === 'phone' ? { fontWeight: 600 } : {}}>{t('phoneLabel', lang)}</button>
              </div>
            </div>
            {mode === 'creds' ? (
              <>
                <div style={{ marginBottom: 12, textAlign: lang === 'he' ? 'right' : 'left' }}>
                  <label htmlFor="email">{t('email', lang)}</label>
                  <input id="email" dir="ltr" type="email" placeholder="you@example.com" style={{ width: '100%', padding: 10 }} />
                </div>
                <div style={{ marginBottom: 12, textAlign: lang === 'he' ? 'right' : 'left' }}>
                  <label htmlFor="password">{t('password', lang)}</label>
                  <input id="password" dir="ltr" type="password" placeholder="••••••••" style={{ width: '100%', padding: 10 }} />
                </div>
              </>
            ) : (
              <div style={{ marginBottom: 12, textAlign: lang === 'he' ? 'right' : 'left' }}>
                <label htmlFor="phone">{t('phoneLabel', lang)}</label>
                <input id="phone" dir="ltr" type="tel" placeholder={lang === 'he' ? '\u05e0\u05de\u05e8' : '+972 50 000 0000'} style={{ width: '100%', padding: 10 }} />
              </div>
            )}
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
              <div style={{ display: 'inline-flex', gap: 8 }}>
                <button type="submit" className="btn" dir={lang === 'he' ? 'rtl' : 'ltr'}>{t('signIn', lang)}</button>
                <button type="button" className="btn" style={{ background: '#DB4437' }} aria-label={t('loginWithGoogle', lang)} dir={lang === 'he' ? 'rtl' : 'ltr'}>{t('loginWithGoogle', lang)}</button>
              </div>
              <div style={{ marginTop: 8 }} className="muted">
                {t('noAccount', lang)} <Link href="/register">{t('register', lang)}</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
