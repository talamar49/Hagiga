import React from 'react';

type Props = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  minWidth?: number;
  maxHeight?: string;
};

const TableCard = React.forwardRef<HTMLDivElement, Props>(function TableCard({ children, style, minWidth = 960, maxHeight }, ref) {
  return (
    <div
      ref={ref}
      style={{
        overflowX: 'auto',
        maxHeight: maxHeight ?? '920px',
        minHeight: '120px',
        border: '1px solid #eee',
        borderRadius: 8,
        boxShadow: '0 1px 8px #eee',
        background: '#fff',
        marginBottom: 8,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-x',
        ...style,
      }}
    >
      {children}
    </div>
  );
});

export function headerCellStyle(lang?: string): React.CSSProperties {
  return { textAlign: lang === 'he' ? 'right' : 'left', padding: 12 };
}

export default TableCard;
