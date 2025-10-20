import { Ui } from '../../constants/ui';

export function getHomeStyles(lang: 'en' | 'he') {
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const containerStyle: React.CSSProperties = {
    direction: dir,
    fontFamily: 'Helvetica, Arial, sans-serif',
    padding: 0,
    margin: 0,
    color: '#222',
    lineHeight: 1.4,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #eee',
    background: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 64,
    margin: '12px 0 8px',
    fontWeight: 700,
    lineHeight: 1,
    textAlign: dir === 'rtl' ? 'right' : 'left',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 20,
    color: '#555',
    marginBottom: 16,
    textAlign: dir === 'rtl' ? 'right' : 'left',
  };

  const heroImageStyle: React.CSSProperties = {
    width: '100%',
    maxHeight: 480,
    objectFit: 'cover',
    display: 'block',
    borderRadius: 8,
  };

  const mainStyle: React.CSSProperties = {
    padding: '32px 24px',
    maxWidth: 1100,
    margin: '0 auto',
  };

  const footerStyle: React.CSSProperties = {
    borderTop: '1px solid #eee',
    padding: 24,
    background: '#fff',
  };

  return {
    containerStyle,
    headerStyle,
    logoStyle,
    titleStyle,
    subtitleStyle,
    heroImageStyle,
    mainStyle,
    footerStyle,
  };
}
