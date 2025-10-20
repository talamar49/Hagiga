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
    welcome: 'Welcome',
    createEvent: 'Create event',
    connectedEventsTitle: 'Events connected to you',
    managedEventsTitle: 'Events you manage',
    open: 'Open',
    manage: 'Manage',
    noConnected: "You don't have events",
    noManaged: "You don't manage any events",
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
    firstName: 'שם פרטי',
    lastName: 'שם משפחה',
    password: 'סיסמה',
    passwordPlaceholder: '••••••••',
    signIn: 'התחברות',
    phoneLabel: 'פלאפון',
    namePassword: 'שם וסיסמה',
    welcome: 'ברוך הבא',
    createEvent: 'צור אירוע',
    connectedEventsTitle: 'אירועים שמחוברים אליך',
    managedEventsTitle: 'אירועים שאתה מנהל',
    open: 'פתח',
    manage: 'נהל',
    noConnected: 'אין לך אירועים',
    noManaged: 'אין לך אירועים שאתה מנהל',
    noAccount: 'אין לך חשבון?',
    register: 'הרשמה',
  }
};

export function t(key: string, lang: Lang = 'en'){
  return translations[lang][key] || translations.en[key] || key;
}

export default { t };
