import React, { useEffect, useState } from 'react';

export default function Toast({ message, open, severity = 'info', autoDismiss = 3000 }: { message?: string; open: boolean; severity?: 'info' | 'success' | 'error' | 'warn'; autoDismiss?: number }) {
  const [visible, setVisible] = useState(open && !!message);

  useEffect(() => {
    setVisible(open && !!message);
  }, [open, message]);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), autoDismiss);
    return () => clearTimeout(t);
  }, [visible, autoDismiss]);

  if (!visible || !message) return null;

  const bg = severity === 'error' ? '#e53e3e' : severity === 'success' ? '#2f855a' : severity === 'warn' ? '#d69e2e' : '#111';

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, background: bg, color: 'white', padding: '12px 16px', borderRadius: 8, zIndex: 9999 }}>
      {message}
    </div>
  );
}
