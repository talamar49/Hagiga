import React from 'react';
import Nav from '../components/Nav';
import { useLang } from '../lib/lang';
import { getUserHomeStyles } from '../styles/pages/userHomeStyles';
import { t } from '../lib/i18n';
import { Routes } from '../constants/routes';

// Real user will be loaded from backend
import { useEffect, useState } from 'react';
import auth from '../lib/auth';
import AuthRoute from '../lib/AuthRoute';

const fakeConnectedEvents = [
  { id: 'e1', title: 'Bar Mitzvah - Yonatan' },
  { id: 'e2', title: 'Wedding - Sarah & David' }
];
const fakeManagedEvents: Array<{id:string,title:string}> = [];

function UserMainFeed() {
  const { lang } = useLang();
  const styles = getUserHomeStyles(lang);
  const [userName, setUserName] = useState<string | null>(null);
  const router = require('next/router').useRouter();
  useEffect(() => {
    auth.me().then(u => {
      setUserName(u.firstName ? `${u.firstName}${u.lastName ? ' ' + u.lastName : ''}` : (u.email || ''))
    }).catch(() => {
      setUserName(null);
      router.push('/login');
    });
  }, []);

  const hasConnected = fakeConnectedEvents.length > 0;
  const manages = fakeManagedEvents.length > 0;

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <Nav />

      <header style={{ ...styles.headerStyle, padding: 16, background: '#f7fafc', borderRadius: 8 }}>
        <div style={styles.welcomeStyle}>{`${t('welcome', lang)}${userName ? ', ' + userName : ''}`}</div>
        <div>
          <a href={Routes.CREATE_EVENT}><button style={styles.btnStyle}> {t('createEvent', lang)}</button></a>
        </div>
      </header>

      <section style={styles.sectionStyle}>
  <h3>{t('connectedEventsTitle', lang)}</h3>
        {hasConnected ? (
          <ul style={styles.listStyle}>
            {fakeConnectedEvents.map(ev => (
              <li key={ev.id} style={styles.listItem}>
                <div>{ev.title}</div>
                <div><a href={`${Routes.EVENTS}/${ev.id}`}>{t('open', lang)}</a></div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="muted">{t('noConnected', lang)}</div>
        )}
      </section>

      <section style={styles.sectionStyle}>
        <h3>{t('managedEventsTitle', lang)}</h3>
        {manages ? (
          <ul style={styles.listStyle}>
            {fakeManagedEvents.map(ev => (
              <li key={ev.id} style={styles.listItem}>
                <div>{ev.title}</div>
                <div><a href={`${Routes.EVENTS}/${ev.id}`}>{t('manage', lang)}</a></div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="muted">{t('noManaged', lang)}</div>
        )}
      </section>

      <footer style={{ marginTop: 32, paddingTop: 12, borderTop: '1px solid #eee', color: '#666' }}>
        <div style={{ textAlign: 'center' }}>
          Hagiga — manage your events • <a href="/">Help</a>
        </div>
      </footer>
    </main>
  );
}

export default function ProtectedUserMainFeed() {
  return (
    <AuthRoute>
      <UserMainFeed />
    </AuthRoute>
  );
}
