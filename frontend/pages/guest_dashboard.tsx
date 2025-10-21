import React from 'react';
import Nav from '../components/Nav';
import { useLang } from '../lib/lang';
import { getSimplePageStyles } from '../styles/pages/simplePageStyles';
import { useEffect } from 'react';
import auth from '../lib/auth';
import { useRouter } from 'next/router';
import AuthRoute from '../lib/AuthRoute';

export function GuestDashboard() {
  const { lang } = useLang();
  const styles = getSimplePageStyles(lang);
  const router = useRouter();
  useEffect(() => {
    auth.me().catch(() => router.push('/login'));
  }, []);
  return (
    <main style={styles.containerStyle}>
      <Nav />
      <h1>Guest Dashboard</h1>
      <p>Placeholder dashboard for event guests.</p>
    </main>
  );
}

export function ProtectedGuestDashboard() {
  return (
    <AuthRoute>
      <GuestDashboard />
    </AuthRoute>
  );
}

export default ProtectedGuestDashboard;
