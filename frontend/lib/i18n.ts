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
  passwordPlaceholder: '••••••••',
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
    loginTitle: 'התחברות',
    loginWithGoogle: 'התחברות עם גוגל',
    email: 'אימייל',
    firstName: 'שם',
    lastName: 'שם משפחה',
    password: 'סיסמה',
  passwordPlaceholder: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
    signIn: 'התחברות',
    phoneLabel: 'פלאפון',
    namePassword: 'שם וסיסמא',
    noAccount: 'אין לך חשבון?',
    register: 'הרשמה',
  }
};

export function t(key: string, lang: Lang = 'en'){
  return translations[lang][key] || translations.en[key] || key;
}

export default { t };
