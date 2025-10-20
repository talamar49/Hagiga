export function getSimplePageStyles(lang: 'en' | 'he'){
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const containerStyle: React.CSSProperties = { padding: 24, direction: dir };
  const mainStyle: React.CSSProperties = { padding: 24 };
  return { containerStyle, mainStyle };
}
