import React from 'react';
import Nav from '../components/Nav';
import { useLang } from '../lib/lang';
import { getSimplePageStyles } from '../styles/pages/simplePageStyles';

export default function OrganizerDashboard() {
  const { lang } = useLang();
  const styles = getSimplePageStyles(lang);
  return (
    <main style={styles.containerStyle}>
      <Nav />
      <h1>Organizer Dashboard</h1>
      <p>Placeholder dashboard for event organizers.</p>
    </main>
  );
}
