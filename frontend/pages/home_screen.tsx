import React from 'react';
import Nav from '../components/Nav';
import { useLang } from '../lib/lang';

export default function HomeScreen() {
  const { lang } = useLang();
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const containerStyle: React.CSSProperties = {
    direction: dir,
    fontFamily: 'Helvetica, Arial, sans-serif',
    padding: 0,
    margin: 0,
    color: '#222',
    lineHeight: 1.4,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #eee',
    background: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 64,
    margin: '12px 0 8px',
    fontWeight: 700,
    lineHeight: 1,
    textAlign: dir === 'rtl' ? 'right' : 'left',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 20,
    color: '#555',
    marginBottom: 16,
    textAlign: dir === 'rtl' ? 'right' : 'left',
  };

  const heroImageStyle: React.CSSProperties = {
    width: '100%',
    maxHeight: 480,
    objectFit: 'cover',
    display: 'block',
    borderRadius: 8,
  };

  return (
    <div style={containerStyle}>
      <Nav />

      <main style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginTop: 8 }}>
          <h1 style={titleStyle}>{lang === 'he' ? 'חגיגה' : 'Hagiga'}</h1>
          <div style={subtitleStyle}>{lang === 'he' ? 'לעשות סדר בכל השמחה' : 'Organize all your celebrations'}</div>
        </div>

        <div style={{ marginTop: 16 }}>
          <img src="/hero.jpg" alt="חגיגה" style={heroImageStyle} />
        </div>

        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 22, marginBottom: 12, textAlign: dir === 'rtl' ? 'right' : 'left' }}>מה אפשר לעשות כאן?</h2>
          <p style={{ color: '#444' }}>
            פלטפורמה לייצור רשימות מוזמנים, העלאת קבצי CSV, וייבוא אורחים. זוהי תבנית התחלתית שנועדה להמחיש מבנה ותצורה.
          </p>
        </section>

        <div style={{ height: 300 }} />
      </main>

      <footer style={{ borderTop: '1px solid #eee', padding: 24, background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
            <strong>חגיגה</strong>
            <div style={{ color: '#666' }}>© {new Date().getFullYear()} כל הזכויות שמורות</div>
          </div>
          <div style={{ textAlign: dir === 'rtl' ? 'left' : 'right' }}>
            <a href="#">תנאים</a>
            <span style={{ margin: '0 8px' }}>|</span>
            <a href="#">מדיניות פרטיות</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
