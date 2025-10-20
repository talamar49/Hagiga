import React, { createContext, useContext, useEffect, useState } from 'react';
import { StorageKeys } from '../constants/keys';
import { Lang as LangEnum, DEFAULT_LANG } from '../constants/lang';

type Lang = 'en' | 'he';

const LangContext = createContext({ lang: DEFAULT_LANG as Lang, setLang: (l: Lang) => {} });

export const LanguageProvider = ({ children }: any) => {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG as Lang);

  useEffect(() => {
    // hydrate from localStorage if available
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(StorageKeys.LANG) : null;
      if (stored === LangEnum.EN || stored === LangEnum.HE) setLang(stored as Lang);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang === LangEnum.HE ? LangEnum.HE : LangEnum.EN);
      document.documentElement.setAttribute('dir', lang === LangEnum.HE ? 'rtl' : 'ltr');
    }
    try {
      localStorage.setItem(StorageKeys.LANG, lang);
    } catch (e) {}
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);

export default LanguageProvider;
