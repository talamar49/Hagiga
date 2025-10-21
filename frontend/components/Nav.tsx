import React from 'react';
import Link from 'next/link';
import { useLang } from '../lib/lang';
import { NAV_LABELS } from '../constants/nav';
import { Routes } from '../constants/routes';
import { useRouter } from 'next/router';
import auth from '../lib/auth';
import useAuth from '../lib/useAuth';

export default function Nav() {
  const { lang, setLang } = useLang();
  const router = useRouter();
  const path = (router.asPath || router.pathname || '').split('?')[0].replace(/\/+$/, '');

  // If we're on /login show Register in header; if on /register show Login.
  // Additionally, when on the home screen we prefer to show Login (so CTA directs users to sign in).
  const isHeb = lang === 'he';

  const isHome = path === '/' || path === '/home_screen';
  const showRegister = path !== '/register' && !isHome;
  const { user, loading, logout } = useAuth();

  function initials(name?: string) {
    if (!name) return '?';
    return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  }

  const hideHomeAndRegister = path === Routes.USER_MAIN_FEED || path.startsWith(`${Routes.USER_MAIN_FEED}/`);

  return (
    <nav style={{ padding: 12, borderBottom: '1px solid #eee', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Language picker block; order controls visual placement. Also set text alignment explicitly. */}
        <div style={{ order: isHeb ? 1 : 2, textAlign: isHeb ? 'left' : 'right' }}>
          <select className="lang-select" aria-label="language" value={lang} onChange={e => setLang(e.target.value as any)}>
            <option value="en">English</option>
            <option value="he">עברית</option>
          </select>
        </div>

        {/* Right block: links + user area */}
  <div style={{ order: isHeb ? 2 : 1, display: 'flex', alignItems: 'center', gap: 12, textAlign: isHeb ? 'right' : 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Logo/home when allowed */}
            {!hideHomeAndRegister && (
              <Link href={Routes.HOME_SCREEN} style={{ marginInlineStart: 12 }}>{isHeb ? NAV_LABELS.home.he : NAV_LABELS.home.en}</Link>
            )}

            {/* Auth links: Register / Login (hidden on connected) */}
            {!hideHomeAndRegister && showRegister && (
              <Link href={Routes.REGISTER} style={{ marginInlineStart: 12 }}>{isHeb ? NAV_LABELS.register.he : NAV_LABELS.register.en}</Link>
            )}
            {!hideHomeAndRegister && !showRegister && (
              <Link href={Routes.LOGIN} style={{ marginInlineStart: 12 }}>{isHeb ? NAV_LABELS.login.he : NAV_LABELS.login.en}</Link>
            )}
          </div>

          {/* User area */}
          {user ? (
            <span style={{ marginInlineStart: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: '#2b6cb0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{initials(user.firstName || user.email)}</div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: isHeb ? 'right' : 'left' }}>
                <div style={{ fontSize: 14 }}>{user.firstName || user.email}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{user.email}</div>
              </div>
              <button onClick={() => { logout(); router.push('/login'); }} style={{ marginInlineStart: 12 }} className="btn">{isHeb ? 'יציאה' : 'Logout'}</button>
            </span>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
