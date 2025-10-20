import React from 'react';
import Link from 'next/link';
import { useLang } from '../lib/lang';
import { NAV_LABELS } from '../constants/nav';
import { Routes } from '../constants/routes';
import { useRouter } from 'next/router';

export default function Nav() {
  const { lang, setLang } = useLang();
  const router = useRouter();
  const path = router.pathname || '';

  // If we're on /login show Register in header; if on /register show Login; otherwise default to Register.
  const showRegister = path === '/login' || path !== '/register';
  const isHeb = lang === 'he';

  const isHome = path === '/' || path === '/home_screen';

  return (
    <nav style={{ padding: 12, borderBottom: '1px solid #eee', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {lang === 'he' ? (
          <>
            <div>
              {isHome ? (
                <Link href={Routes.LOGIN} style={{ marginInlineStart: 12 }}>{isHeb ? NAV_LABELS.signInRegister.he : NAV_LABELS.signInRegister.en}</Link>
              ) : (
                <>
                  <Link href={Routes.HOME_SCREEN} style={{ marginInlineStart: 12 }}>{isHeb ? NAV_LABELS.home.he : NAV_LABELS.home.en}</Link>
                  {showRegister ? (
                    <Link href={Routes.REGISTER} style={{ marginInlineStart: 12 }}>{isHeb ? NAV_LABELS.register.he : NAV_LABELS.register.en}</Link>
                  ) : (
                    <Link href={Routes.LOGIN} style={{ marginInlineStart: 12 }}>{isHeb ? NAV_LABELS.login.he : NAV_LABELS.login.en}</Link>
                  )}
                </>
              )}
            </div>
            <div>
              <select className="lang-select" aria-label="language" value={lang} onChange={e => setLang(e.target.value as any)}>
                <option value="en">English</option>
                <option value="he">עברית</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <select className="lang-select" aria-label="language" value={lang} onChange={e => setLang(e.target.value as any)}>
                <option value="en">English</option>
                <option value="he">עברית</option>
              </select>
            </div>
            <div>
              {isHome ? (
                <Link href={Routes.LOGIN} style={{ marginInlineStart: 12 }}>{isHeb ? NAV_LABELS.signInRegister.he : NAV_LABELS.signInRegister.en}</Link>
              ) : (
                <>
                  <Link href={Routes.HOME_SCREEN} style={{ marginInlineStart: 12 }}>{isHeb ? NAV_LABELS.home.he : NAV_LABELS.home.en}</Link>
                  {showRegister ? (
                    <Link href={Routes.REGISTER} style={{ marginInlineStart: 12 }}>{isHeb ? NAV_LABELS.register.he : NAV_LABELS.register.en}</Link>
                  ) : (
                    <Link href={Routes.LOGIN} style={{ marginInlineStart: 12 }}>{isHeb ? NAV_LABELS.login.he : NAV_LABELS.login.en}</Link>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
