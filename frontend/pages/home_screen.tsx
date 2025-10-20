import React from 'react';
import Nav from '../components/Nav';
import { useLang } from '../lib/lang';
import { getHomeStyles } from '../styles/pages/homeScreenStyles';

export default function HomeScreen() {
  const { lang } = useLang();
  const styles = getHomeStyles(lang);

  return (
    <div style={styles.containerStyle}>
      <Nav />

      <main style={styles.mainStyle}>
        <div style={{ marginTop: 8 }}>
          <h1 style={styles.titleStyle}>{lang === 'he' ? 'חגיגה' : 'Hagiga'}</h1>
          <div style={styles.subtitleStyle}>{lang === 'he' ? 'לעשות סדר בכל השמחה' : 'Organize all your celebrations'}</div>
        </div>

        <div style={{ marginTop: 16 }}>
          <img src="/hero.jpg" alt="חגיגה" style={styles.heroImageStyle} />
        </div>

        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 22, marginBottom: 12, textAlign: styles.titleStyle.textAlign as any }}>מה אפשר לעשות כאן?</h2>
          <p style={{ color: '#444' }}>
            פלטפורמה לייצור רשימות מוזמנים, העלאת קבצי CSV, וייבוא אורחים. זוהי תבנית התחלתית שנועדה להמחיש מבנה ותצורה.
          </p>
        </section>

        <div style={{ height: 300 }} />
      </main>

      <footer style={styles.footerStyle}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: (lang === 'he' ? 'right' : 'left') }}>
            <strong>חגיגה</strong>
            <div style={{ color: '#666' }}>© {new Date().getFullYear()} כל הזכויות שמורות</div>
          </div>
          <div style={{ textAlign: (lang === 'he' ? 'left' : 'right') }}>
            <a href="#">תנאים</a>
            <span style={{ margin: '0 8px' }}>|</span>
            <a href="#">מדיניות פרטיות</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
