import '../styles/globals.css';
import React from 'react';
import { ThemeProvider } from '../lib/theme';
import { LanguageProvider } from '../lib/lang';

export default function App({ Component, pageProps }: any) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="app-shell">
          <div className="card container">
            <Component {...pageProps} />
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
