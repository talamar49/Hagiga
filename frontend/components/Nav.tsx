import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '../lib/lang';
import { t } from '../lib/i18n';
import { NAV_LABELS } from '../constants/nav';
import { Routes } from '../constants/routes';
import { useRouter } from 'next/router';
import auth from '../lib/auth';
import useAuth from '../lib/useAuth';
import Button from './ui/Button';

export default function Nav() {
  const { lang, setLang } = useLang();
  const router = useRouter();
  const path = (router.asPath || router.pathname || '').split('?')[0].replace(/\/+$/, '');

  // If we're on /login show Register in header; if on /register show Login.
  // Additionally, when on the home screen we prefer to show Login (so CTA directs users to sign in).
  const isHeb = lang === 'he';

  const isHome = path === '/' || path === '/home_screen';
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number } | null>(null);

  // (no per-page redirects here) — avatar will take user to their main feed

  function initials(name?: string) {
    if (!name) return '?';
    return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  }

  const hideHomeAndRegister = path === Routes.USER_MAIN_FEED || path.startsWith(`${Routes.USER_MAIN_FEED}/`);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!(e.target instanceof Node)) return;
      const inWrapper = wrapperRef.current && wrapperRef.current.contains(e.target);
      const inMenu = menuRef.current && menuRef.current.contains(e.target);
      if (!inWrapper && !inMenu) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  // compute menu position anchored to avatar button when opening
  useEffect(() => {
    function compute() {
      if (!menuOpen) return setMenuPos(null);
      if (!avatarRef.current || !wrapperRef.current) return;
      const btnRect = avatarRef.current.getBoundingClientRect();
      const wrapRect = wrapperRef.current.getBoundingClientRect();
      // center menu under avatar icon
      const centerX = btnRect.left - wrapRect.left + btnRect.width / 2;
      const top = btnRect.top - wrapRect.top + btnRect.height + 6;
      setMenuPos({ left: Math.round(centerX), top: Math.round(top) });
    }
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [menuOpen, lang]);

  // menuStyle: open inward depending on language/layout
  const menuStyle: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      position: 'absolute',
      top: 56,
      background: 'linear-gradient(180deg,#7c3aed 0%,#06b6d4 100%)',
      color: '#fff',
      borderRadius: 8,
      boxShadow: '0 12px 36px rgba(2,6,23,0.6)',
      padding: 8,
      minWidth: 160,
      zIndex: 1100,
    };
    // If Hebrew (RTL) the avatar tends to be on the left; open the menu to the right of the avatar
    if (isHeb) {
      return { ...base, left: 'calc(100% + 8px)' };
    }
    // LTR: avatar on the right; open the menu to the left of the avatar
    return { ...base, right: 'calc(100% + 8px)' };
  })();

  return (
    <nav style={{ padding: 8, borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: 0, background: 'var(--bg, white)', boxShadow: '0 1px 6px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button className="nav-home" onClick={() => router.push(Routes.HOME_SCREEN)} style={{ fontWeight: 700, fontSize: 15, padding: '8px 12px', borderRadius: 8 }}>
            <span className="icon" aria-hidden style={{ marginRight: 8 }}>🏠</span>
            <span className="label">{isHeb ? NAV_LABELS.home.he : NAV_LABELS.home.en}</span>
          </Button>
          <div />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!user && !isHome && (
            <div style={{ display: 'flex', gap: 12 }}>
              <Link href={Routes.REGISTER}>{isHeb ? NAV_LABELS.register.he : NAV_LABELS.register.en}</Link>
              <Link href={Routes.LOGIN}>{isHeb ? NAV_LABELS.login.he : NAV_LABELS.login.en}</Link>
            </div>
          )}

          <select className="lang-select" aria-label="language" value={lang} onChange={e => setLang(e.target.value as any)} style={{ padding: '6px 8px' }}>
            <option value="en">EN</option>
            <option value="he">HE</option>
          </select>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }} ref={wrapperRef}>
              <button ref={avatarRef} aria-haspopup="true" aria-expanded={menuOpen} aria-label="user-menu" onClick={() => setMenuOpen(s => !s)} style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--accent-solid, #2b6cb0)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                {initials(user.firstName || user.email)}
              </button>
              {menuOpen ? (
                <div ref={menuRef} role="menu" aria-label="User menu" style={{ position: 'absolute', left: menuPos ? `${menuPos.left}px` : undefined, top: menuPos ? `${menuPos.top}px` : undefined, transform: 'translateX(-50%)', background: 'linear-gradient(180deg,#7c3aed 0%,#06b6d4 100%)', color: '#fff', borderRadius: 8, boxShadow: '0 12px 36px rgba(2,6,23,0.6)', padding: 8, minWidth: 160, zIndex: 1100 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Link href="/user" role="menuitem" style={{ padding: '8px 10px', borderRadius: 6, display: 'block', color: 'inherit', textDecoration: 'none' }}>{t('profile', lang)}</Link>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '4px 0' }} />
                    <Link href={Routes.USER_MAIN_FEED} role="menuitem" style={{ padding: '8px 10px', borderRadius: 6, display: 'block', color: 'inherit', textDecoration: 'none' }}>{t('myEvents', lang)}</Link>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '4px 0' }} />
                    <button role="menuitem" onClick={() => { logout(); setMenuOpen(false); router.push('/login'); }} style={{ padding: '8px 10px', borderRadius: 6, border: 'none', background: 'transparent', textAlign: isHeb ? 'right' : 'left', cursor: 'pointer', color: 'inherit' }}>{t('logout', lang)}</button>
                  </div>
                </div>
              ) : null}
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: isHeb ? 'right' : 'left' }}>
                <div style={{ fontSize: 14 }}>{user.firstName || user.email}</div>
                <div style={{ fontSize: 12, color: 'var(--muted, #fff)' }}>{user.email}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
