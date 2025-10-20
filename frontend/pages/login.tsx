import React, { useState } from 'react';
import Nav from '../components/Nav';
import Link from 'next/link';
import { t } from '../lib/i18n';
import { useLang } from '../lib/lang';
import { getLoginStyles } from '../styles/pages/loginStyles';

export default function LoginPage() {
  const { lang } = useLang();
  const [mode, setMode] = useState<'creds' | 'phone'>('creds');
  const styles = getLoginStyles(lang);

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'} lang={lang === 'he' ? 'he' : 'en'}>
      <Nav />
      <div className="container" style={styles.outerContainer}>
        <div style={styles.headerWrap}>
          <h1 style={styles.titleStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>{t('loginTitle', lang)}</h1>
        </div>

        <div className="card" style={styles.cardStyle}>
          <hr style={{ margin: '16px 0' }} />

          <form style={styles.formStyle} onSubmit={e => e.preventDefault()}>
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
                  <input id="email" dir="ltr" type="email" placeholder="you@example.com" style={{ width: '100%', padding: 10 }} />
                </div>
                <div style={{ marginBottom: 12, textAlign: lang === 'he' ? 'right' : 'left' }}>
                  <label htmlFor="password">{t('password', lang)}</label>
                  <input id="password" dir="ltr" type="password" placeholder={t('passwordPlaceholder', lang)} style={{ width: '100%', padding: 10 }} />
                </div>
              </>
            ) : (
              <div style={{ marginBottom: 12, textAlign: lang === 'he' ? 'right' : 'left' }}>
                <label htmlFor="phone">{t('phoneLabel', lang)}</label>
                <input id="phone" dir="ltr" type="tel" placeholder={lang === 'he' ? '\u05e0\u05de\u05e8' : '+972 50 000 0000'} style={{ width: '100%', padding: 10 }} />
              </div>
            )}

            <div style={styles.actionsWrap}>
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
