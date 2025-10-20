import React from 'react';
import Nav from '../components/Nav';
import { useLang } from '../lib/lang';
import { getUserHomeStyles } from '../styles/pages/userHomeStyles';
import { t } from '../lib/i18n';
import { Routes } from '../constants/routes';

// Temporary fake data until backend wiring is added
const fakeUser = { name: 'Yonatan', id: 'u1' };
const fakeConnectedEvents = [
  { id: 'e1', title: 'Bar Mitzvah - Yonatan' },
  { id: 'e2', title: 'Wedding - Sarah & David' }
];
const fakeManagedEvents: Array<{id:string,title:string}> = [];

export default function ConnectedUser() {
  const { lang } = useLang();
  const styles = getUserHomeStyles(lang);

  const hasConnected = fakeConnectedEvents.length > 0;
  const manages = fakeManagedEvents.length > 0;

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <Nav />

      <div style={styles.headerStyle}>
        <div style={styles.welcomeStyle}>{`${t('welcome', lang)}, ${fakeUser.name}`}</div>
        <div>
          <a href={Routes.CREATE_EVENT}><button style={styles.btnStyle}> {t('createEvent', lang)}</button></a>
        </div>
      </div>

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

    </main>
  );
}
