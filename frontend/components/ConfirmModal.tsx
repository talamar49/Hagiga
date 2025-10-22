import React from 'react';

export default function ConfirmModal({ title, message, open, onCancel, onConfirm }: any) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'white', padding: 20, borderRadius: 8, maxWidth: 520, width: '90%' }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <div style={{ margin: '12px 0' }}>{message}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn" style={{ background: '#e53e3e', borderColor: '#e53e3e', color: 'white' }} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
