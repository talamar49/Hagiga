type Lang = 'en' | 'he';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Import participants',
    tokenLabel: 'JWT token (paste)',
    upload: 'Upload',
    checkStatus: 'Check status',
    fileRequired: 'File is required',
    noEventId: 'No event id provided',
  },
  he: {
    title: 'ייבא משתתפים',
    tokenLabel: 'אסימון JWT (הדבק)',
    upload: 'העלה',
    checkStatus: 'בדוק סטטוס',
    fileRequired: 'נדרש קובץ',
    noEventId: 'לא נמסר מזהה אירוע',
  }
};

export function t(key: string, lang: Lang = 'en'){
  return translations[lang][key] || translations.en[key] || key;
}

export default { t };
