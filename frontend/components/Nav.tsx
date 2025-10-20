import React from 'react';
import Link from 'next/link';
import { useLang } from '../lib/lang';
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
                <Link href="/login" style={{ marginInlineStart: 12 }}>{isHeb ? 'התחברות / הרשמה' : 'Sign in / Register'}</Link>
              ) : (
                <>
                  <Link href="/home_screen" style={{ marginInlineStart: 12 }}>{isHeb ? 'דף הבית' : 'Home'}</Link>
                  {showRegister ? (
                    <Link href="/register" style={{ marginInlineStart: 12 }}>{isHeb ? 'הרשמה' : 'Register'}</Link>
                  ) : (
                    <Link href="/login" style={{ marginInlineStart: 12 }}>{isHeb ? 'התחברות' : 'Login'}</Link>
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
                <Link href="/login" style={{ marginInlineStart: 12 }}>{isHeb ? 'התחברות / הרשמה' : 'Sign in / Register'}</Link>
              ) : (
                <>
                  <Link href="/home_screen" style={{ marginInlineStart: 12 }}>{isHeb ? 'דף הבית' : 'Home'}</Link>
                  {showRegister ? (
                    <Link href="/register" style={{ marginInlineStart: 12 }}>{isHeb ? 'הרשמה' : 'Register'}</Link>
                  ) : (
                    <Link href="/login" style={{ marginInlineStart: 12 }}>{isHeb ? 'התחברות' : 'Login'}</Link>
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
