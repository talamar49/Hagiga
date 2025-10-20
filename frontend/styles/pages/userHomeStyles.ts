export function getUserHomeStyles(lang: 'en' | 'he'){
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const containerStyle: React.CSSProperties = { padding: 24, direction: dir };
  const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 };
  const welcomeStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700, textAlign: dir === 'rtl' ? 'right' : 'left' };
  const btnStyle: React.CSSProperties = { padding: '8px 12px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };
  const sectionStyle: React.CSSProperties = { marginTop: 16 };
  const listStyle: React.CSSProperties = { listStyle: 'none', padding: 0, margin: 0 };
  const listItem: React.CSSProperties = { padding: '8px 12px', border: '1px solid #eee', borderRadius: 6, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

  return { containerStyle, headerStyle, welcomeStyle, btnStyle, sectionStyle, listStyle, listItem };
}
