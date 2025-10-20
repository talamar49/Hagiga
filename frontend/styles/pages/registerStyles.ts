export function getRegisterStyles(lang: 'en' | 'he'){
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const containerStyle: React.CSSProperties = { padding: 24, direction: dir };
  const outerContainer: React.CSSProperties = { maxWidth: 640, margin: '0 auto' };
  const headerWrap: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' };
  const titleStyle: React.CSSProperties = { margin: 0, textAlign: dir === 'rtl' ? 'right' : 'left' };
  const mutedStyle: React.CSSProperties = { textAlign: dir === 'rtl' ? 'right' : 'left' };
  const cardStyle: React.CSSProperties = { marginTop: 12 };
  const formStyle: React.CSSProperties = { maxWidth: 520, marginLeft: 'auto' };
  const fieldStyle: React.CSSProperties = { marginBottom: 12, textAlign: dir === 'rtl' ? 'right' : 'left' };
  const centerText: React.CSSProperties = { textAlign: 'center', marginTop: 12 };

  return {
    containerStyle,
    outerContainer,
    headerWrap,
    titleStyle,
    mutedStyle,
    cardStyle,
    formStyle,
    fieldStyle,
    centerText,
  };
}
