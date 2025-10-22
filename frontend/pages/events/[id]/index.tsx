import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Nav from '../../../components/Nav';
import { useLang } from '../../../lib/lang';
import { getSimplePageStyles } from '../../../styles/pages/simplePageStyles';
import { t } from '../../../lib/i18n';
import { Routes } from '../../../constants/routes';
import ConfirmModal from '../../../components/ConfirmModal';
import Toast from '../../../components/Toast';
import AuthRoute from '../../../lib/AuthRoute';

interface EventData {
  _id: string;
  title: string;
  type: string;
  date?: string;
  description?: string;
}

function EventMainPage() {
  const { lang } = useLang();
  const styles = getSimplePageStyles(lang);
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!id) return;
    
    // Fetch event details (improved error messages)
    const fetchEvent = async () => {
      const fetchUrl = `/api/proxy/events/${id}`;
      try {
  const auth = await import('../../../lib/auth');
  const token = auth.getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(fetchUrl, { headers });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          if (res.status === 401) {
            // redirect to login for unauthenticated users
            router.push('/login');
            return;
          }
          throw new Error(`Failed to fetch event ${fetchUrl}: ${res.status} ${res.statusText} ${text}`);
        }
        const data = await res.json();
        setEvent(data.event || data);
      } catch (err: any) {
        setError(String(err.message || err));
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>
        <Nav />
        <div style={{ textAlign: 'center', padding: 32 }}>
          {t('loading', lang)}
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>
        <Nav />
        <div style={{ textAlign: 'center', padding: 32, color: 'crimson' }}>
          {error || t('eventNotFound', lang)}
        </div>
      </main>
    );
  }

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <Nav />
      <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
        <h1>{event.title}</h1>
        <div style={{ marginBottom: 24, color: '#666' }}>
          <div>{t('eventType', lang)}: {event.type}</div>
          {event.date && <div>{t('eventDate', lang)}: {new Date(event.date).toLocaleDateString()}</div>}
          {event.description && <div style={{ marginTop: 8 }}>{event.description}</div>}
        </div>

        <section style={{ marginBottom: 24 }}>
          <h2>{t('eventFeatures', lang)}</h2>
          
          <div style={{ 
            display: 'grid', 
            gap: '16px', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' 
          }}>
            <div style={{ 
              padding: 16, 
              border: '1px solid #ddd', 
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
              onClick={() => router.push(`${Routes.EVENTS}/${id}/participants`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3 style={{ marginTop: 0 }}>{t('manageParticipants', lang)}</h3>
              <p style={{ color: '#666', fontSize: 14 }}>
                {t('manageParticipantsDesc', lang)}
              </p>
            </div>

            <div style={{ 
              padding: 16, 
              border: '1px solid #ddd', 
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
              onClick={() => router.push(`${Routes.EVENTS}/${id}/settings`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3 style={{ marginTop: 0 }}>{t('eventSettings', lang)}</h3>
              <p style={{ color: '#666', fontSize: 14 }}>
                {t('eventSettingsDesc', lang)}
              </p>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 32 }}>
          <h2>{t('addParticipants', lang)}</h2>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap',
            marginTop: 16 
          }}>
            <button 
              className="btn"
              onClick={() => router.push(`${Routes.EVENTS}/${id}/import`)}
              style={{ padding: '12px 24px' }}
            >
              {t('importFromCSV', lang)}
            </button>
            <button 
              className="btn"
              onClick={() => router.push(`${Routes.EVENTS}/${id}/participants/add`)}
              style={{ padding: '12px 24px', background: '#48bb78', borderColor: '#48bb78' }}
            >
              {t('addManually', lang)}
            </button>
          </div>
        </section>

        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={() => router.push(Routes.USER_MAIN_FEED)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#4299e1', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              ← {t('backToEvents', lang)}
            </button>
            <button
              className="btn"
              style={{ background: '#e53e3e', borderColor: '#e53e3e', color: 'white' }}
              onClick={() => setShowConfirm(true)}
            >
              {t('removeEvent', lang) || 'Remove event'}
            </button>
            <ConfirmModal
              open={showConfirm}
              title={t('confirmDeleteEvent', lang) || 'Delete this event?'}
              message={t('confirmDeleteEventMsg', lang) || 'This will permanently delete the event and its participants.'}
              onCancel={() => setShowConfirm(false)}
              onConfirm={async () => {
                setShowConfirm(false);
                try {
                  const auth = await import('../../../lib/auth');
                  const token = auth.getToken();
                  const headers: Record<string, string> = {};
                      if (token) headers['Authorization'] = `Bearer ${token}`;
                  const res = await fetch(`/api/proxy/events/${id}`, { method: 'DELETE', headers });
                  if (res.status === 204) {
                        setToast('Event deleted');
                        setTimeout(() => router.push(Routes.USER_MAIN_FEED), 900);
                  } else {
                    const txt = await res.text();
                        setToast(`delete failed: ${res.status} ${txt}`);
                        setTimeout(() => setToast(''), 3000);
                  }
                } catch (err: any) {
                      setToast(String(err.message || err));
                      setTimeout(() => setToast(''), 3000);
                }
              }}
            />
            <Toast open={!!toast} message={toast} severity={toast.toLowerCase().includes('failed') || toast.toLowerCase().includes('error') ? 'error' : 'success'} autoDismiss={2500} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProtectedEventMainPage() {
  return (
    <AuthRoute>
      <EventMainPage />
    </AuthRoute>
  );
}
