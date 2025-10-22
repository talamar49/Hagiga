import React from 'react';
import { useLang } from '../../lib/lang';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  style?: React.CSSProperties;
};

export default function InlineInput({ className, style, ...rest }: Props) {
  const { lang } = useLang();
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const textAlign = lang === 'he' ? 'right' : 'left';

  return (
    <input
      {...rest}
      dir={dir}
      className={className}
      style={{
        ...(style || {}),
        border: '1px solid #ccc',
        borderRadius: 6,
        padding: '6px 8px',
        outline: 'none',
        background: '#fff',
        color: '#222',
        boxShadow: '0 1px 0 rgba(0,0,0,0.02)',
        fontSize: 14,
        height: 34,
        textAlign,
        direction: dir,
        whiteSpace: 'nowrap',
      }}
    />
  );
}
