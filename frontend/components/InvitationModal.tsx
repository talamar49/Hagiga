import React, { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  invitation: any;
  onClose: () => void;
  onSave: (inv: any) => void;
};

export default function InvitationModal({ open, invitation, onClose, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(invitation?.text || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setText(invitation?.text || '');
    setEditing(false);
    setLoading(true);
  }, [invitation?._id]);

  if (!open || !invitation) return null;

  const getSrc = () => {
    const key = (invitation.media as any)?.storageKey;
    let src = key ? `/api/proxy/media/${key}` : String(invitation.media?.url || '');
    if (!key && src) {
      if (src.includes('://minio')) src = src.replace('://minio', '://localhost');
      if (src.startsWith('/')) src = `http://localhost:4000${src}`;
    }
    return src;
  };

  const src = getSrc();

  return (
    <div
      onClick={() => onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '94%', maxWidth: 1000, background: '#fff', borderRadius: 10, overflow: 'hidden', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
          <div style={{ fontWeight: 700 }}>Invitation</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {src && (
              <a className="btn" href={src} target="_blank" rel="noreferrer">
                Open
              </a>
            )}
            {src && (
              <a className="btn" href={src} download>
                Download
              </a>
            )}
            <button className="btn" onClick={() => onClose()}>
              Close
            </button>
          </div>
        </div>

        <div style={{ flex: '1 1 auto', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {src ? (
            (invitation.media as any)?.type === 'video' ? (
              <video src={src} controls style={{ maxHeight: '78vh', maxWidth: '100%' }} onLoadedData={() => setLoading(false)} onError={() => setLoading(false)} />
            ) : (
              <img src={src} alt="invitation" style={{ maxHeight: '78vh', maxWidth: '100%', objectFit: 'contain' }} onLoad={() => setLoading(false)} onError={() => setLoading(false)} />
            )
          ) : (
            <div style={{ color: '#888', padding: 40 }}>No media</div>
          )}

          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading…</div>
          )}
        </div>

        <div style={{ padding: 16, borderTop: '1px solid #eee', overflowY: 'auto' }}>
          {editing ? (
            <textarea value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%', minHeight: 120 }} />
          ) : (
            <div style={{ fontWeight: 700, fontSize: 18, whiteSpace: 'pre-wrap' }}>{invitation.text}</div>
          )}
        </div>

        <div style={{ padding: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {editing ? (
            <>
              <button className="btn" onClick={() => { setEditing(false); setText(invitation.text); }}>Cancel</button>
              <button className="btn" style={{ background: '#3182ce', borderColor: '#3182ce', color: 'white' }} onClick={() => onSave({ ...invitation, text })}>Save</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => onClose()}>Close</button>
              <button className="btn" style={{ marginLeft: 8 }} onClick={() => setEditing(true)}>Edit</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

