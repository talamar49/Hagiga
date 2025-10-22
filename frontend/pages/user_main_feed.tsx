import React from 'react';
import Nav from '../components/Nav';
import { useLang } from '../lib/lang';
import { getUserHomeStyles } from '../styles/pages/userHomeStyles';
import { t } from '../lib/i18n';
import { Routes } from '../constants/routes';
import { useEffect, useState } from 'react';
import auth from '../lib/auth';
import AuthRoute from '../lib/AuthRoute';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface EventItem {
  _id: string;
  title: string;
  type: string;
  date?: string;
}

function UserMainFeed() {
  const { lang } = useLang();
  const styles = getUserHomeStyles(lang);
  const [userName, setUserName] = useState<string | null>(null);
  const [managedEvents, setManagedEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = require('next/router').useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const u = await auth.me();
        setUserName(u.firstName ? `${u.firstName}${u.lastName ? ' ' + u.lastName : ''}` : (u.email || ''));
        
        // Fetch user's events
        const token = auth.getToken();
        const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch('/api/proxy/events', { headers });
        if (res.ok) {
          const data = await res.json();
          setManagedEvents(data.events || []);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
        setUserName(null);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const manages = managedEvents.length > 0;

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <Nav />

      <header style={{ ...styles.headerStyle, padding: 16 }}>
        <div style={styles.welcomeStyle}>{`${t('welcome', lang)}${userName ? ', ' + userName : ''}`}</div>
        <div>
          <a href={Routes.CREATE_EVENT}><Button>{t('createEvent', lang)}</Button></a>
        </div>
      </header>

      <section style={styles.sectionStyle}>
        <h3>{t('eventsYouRun', lang)}</h3>
        {loading ? (
          <div className="muted">{t('loading', lang)}</div>
        ) : manages ? (
          <ul style={styles.listStyle}>
            {managedEvents.map(ev => (
              <li key={ev._id} style={styles.listItem}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{ev.title}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {ev.type} {ev.date ? `• ${new Date(ev.date).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <div><a href={`${Routes.EVENTS}/${ev._id}`}>{t('manage', lang)}</a></div>
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
