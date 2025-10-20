import '../styles/globals.css';
import React from 'react';
import { ThemeProvider } from '../lib/theme';
import { LanguageProvider } from '../lib/lang';

export default function App({ Component, pageProps }: any) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </ThemeProvider>
  );
}
