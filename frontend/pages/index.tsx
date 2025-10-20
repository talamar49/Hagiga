import React from 'react';
import { useLang } from '../lib/lang';
import { getSimplePageStyles } from '../styles/pages/simplePageStyles';

export default function Home() {
  const { lang } = useLang();
  const styles = getSimplePageStyles(lang);
  return (
    <main style={styles.containerStyle}>
      <h1>Hagiga</h1>
      <p>Frontend scaffold. Connects to backend at /api/v1</p>
      <p>
        <a href="/home_screen">Open app</a>
      </p>
    </main>
  );
}
