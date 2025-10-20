import { Ui } from '../../constants/ui';

export function getLoginStyles(lang: 'en' | 'he') {
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const containerStyle: React.CSSProperties = { padding: 20, direction: dir };

  const outerContainer: React.CSSProperties = { maxWidth: 620, margin: '0 auto' };

  const headerWrap: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' };

  const titleStyle: React.CSSProperties = { margin: 0, textAlign: dir === 'rtl' ? 'right' : 'left' };

  const cardStyle: React.CSSProperties = { marginTop: 12 };

  const formStyle: React.CSSProperties = { maxWidth: 520, margin: '0 auto' };

  const toggleWrap: React.CSSProperties = { display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 };

  const buttonGroup: React.CSSProperties = { display: 'inline-flex', gap: 8 };

  const actionsWrap: React.CSSProperties = { textAlign: 'center', paddingTop: 8 };

  return {
    containerStyle,
    outerContainer,
    headerWrap,
    titleStyle,
    cardStyle,
    formStyle,
    toggleWrap,
    buttonGroup,
    actionsWrap,
  };
}
