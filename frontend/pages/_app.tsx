import '../styles/globals.css';
import React from 'react';
import { ThemeProvider } from '../lib/theme';

export default function App({ Component, pageProps }: any) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
