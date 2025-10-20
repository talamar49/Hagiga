type Lang = 'en' | 'he';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Import participants',
    tokenLabel: 'JWT token (paste)',
    upload: 'Upload',
    checkStatus: 'Check status',
    fileRequired: 'File is required',
    noEventId: 'No event id provided',
    loginTitle: 'Sign in',
    loginWithGoogle: 'Sign in with Google',
    email: 'Email',
  firstName: 'First name',
  lastName: 'Last name',
    password: 'Password',
    signIn: 'Sign in',
    phoneLabel: 'Phone number',
    namePassword: 'Name & Password',
    noAccount: "Don't have an account?",
    register: 'Register',
  },
  he: {
    title: 'ייבא משתתפים',
    tokenLabel: 'אסימון JWT (הדבק)',
    upload: 'העלה',
    checkStatus: 'בדוק סטטוס',
    fileRequired: 'נדרש קובץ',
    noEventId: 'לא נמסר מזהה אירוע',
    loginTitle: '\u05d4\u05ea\u05d7\u05d1\u05e8\u05d5\u05ea',
    loginWithGoogle: '\u05d4\u05ea\u05d7\u05d1\u05d5\u05ea \u05e2\u05dd \u05d2\u05d5\u05d2\u05dc',
    email: '\u05d0\u05d9\u05de\u05d9\u05dc',
  firstName: '\u05e9\u05dd',
  lastName: '\u05e9\u05dd \u05de\u05e9\u05e4\u05d7\u05d4',
    password: '\u05e1\u05d9\u05e1\u05de\u05d4',
    signIn: '\u05d4\u05ea\u05d7\u05d1\u05e8\u05d5\u05ea',
  phoneLabel: '\u05e4\u05dc\u05d0\u05e4\u05d5\u05df',
  namePassword: '\u05e9\u05dd \u05d5\u05e1\u05d9\u05de\u05d0',
    noAccount: '\u05d0\u05d9\u05e0\u05d5 \u05dc\u05da \u05d7\u05e9\u05d1\u05d5\u05df?',
    register: '\u05d4\u05e8\u05e9\u05de\u05d4',
  }
};

export function t(key: string, lang: Lang = 'en'){
  return translations[lang][key] || translations.en[key] || key;
}

export default { t };
