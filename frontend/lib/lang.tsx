import React, { createContext, useContext, useEffect, useState } from 'react';

type Lang = 'en' | 'he';

const LangContext = createContext({ lang: 'en' as Lang, setLang: (l: Lang) => {} });

export const LanguageProvider = ({ children }: any) => {
  const [lang, setLang] = useState<Lang>('he');

  useEffect(() => {
    // hydrate from localStorage if available
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
      if (stored === 'en' || stored === 'he') setLang(stored as Lang);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang === 'he' ? 'he' : 'en');
      document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    }
    try {
      localStorage.setItem('lang', lang);
    } catch (e) {}
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);

export default LanguageProvider;
