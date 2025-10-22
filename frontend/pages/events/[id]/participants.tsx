import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Nav from '../../../components/Nav';
import { useLang } from '../../../lib/lang';
import { getSimplePageStyles } from '../../../styles/pages/simplePageStyles';
import { t } from '../../../lib/i18n';
import { Routes } from '../../../constants/routes';
import AuthRoute from '../../../lib/AuthRoute';
import ConfirmModal from '../../../components/ConfirmModal';
import Toast from '../../../components/Toast';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import InlineInput from '../../../components/ui/InlineInput';
import TableCard, { headerCellStyle } from '../../../components/ui/TableCard';

type PieChartProps = {
  arrived: number;
  notArrived: number;
  size?: number;
  innerRadius?: number;
  lang?: string;
};

const PieChart: React.FC<PieChartProps> = ({ arrived, notArrived, size = 150, innerRadius = 40, lang }) => {
  const total = arrived + notArrived;
  const radius = (size - 8) / 2; // leave padding for stroke
  const circumference = 2 * Math.PI * radius;
  const arrivedFraction = total === 0 ? 0 : arrived / total;
  const arrivedLength = circumference * arrivedFraction;
  const notArrivedLength = circumference - arrivedLength;

  // Stroke dasharray: [arrivedLength, notArrivedLength]
  const strokeWidth = 12;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Arrived ${arrived}, not arrived ${notArrived}`}>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        {/* Background ring */}
        <circle r={radius} fill="transparent" stroke="#eee" strokeWidth={strokeWidth} />
        {/* arrived arc */}
        <circle
          r={radius}
          fill="transparent"
          stroke={arrived > 0 ? 'var(--success, #237a3b)' : '#ddd'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arrivedLength} ${notArrivedLength}`}
          strokeDashoffset={-circumference / 4} // start at top (12 o'clock)
          transform="rotate(-90)"
        />
        {/* inner circle to make donut */}
        <circle r={innerRadius} fill="#fff" stroke="transparent" />
        {/* center text */}
        <text x="0" y="-6" textAnchor="middle" style={{ fontSize: 14, fontWeight: 600, fill: '#333' }}>{total}</text>
  <text x="0" y="14" textAnchor="middle" style={{ fontSize: 11, fill: '#666' }}>{t('total', (lang as any) || 'en')}</text>
      </g>
    </svg>
  );
};

function ParticipantsPage() {
  const { lang } = useLang();
  const styles = getSimplePageStyles(lang);
  const router = useRouter();
  const { id } = router.query;
  const [participants, setParticipants] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [editingCell, setEditingCell] = useState<{ idx: number; field: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showNewRow, setShowNewRow] = useState(false);
  const [newRow, setNewRow] = useState<{ name?: string; lastName?: string; phone?: string; numAttendees?: number }>({ numAttendees: 1 });
  const [addingNew, setAddingNew] = useState(false);
  const [newRowErrors, setNewRowErrors] = useState<Record<string, string>>({});
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchParticipants = async () => {
      try {
  const auth = await import('../../../lib/auth');
  const token = auth.getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/proxy/events/${id}/participants`, { headers });
        if (res.ok) {
          const data = await res.json();
          setParticipants(data.participants || []);
        }
      } catch (err) {
        console.error('Failed to fetch participants', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [id]);

  // focus the inline input when editingCell changes without scrolling the container
  useEffect(() => {
    if (!editingCell) return;
    const el = document.getElementById(`inline-input-${editingCell.idx}-${editingCell.field}`) as HTMLInputElement | null;
    if (el) {
      try {
        // preventScroll avoids jumping the scroll position
        el.focus({ preventScroll: true } as FocusOptions);
        if (el.select) el.select();
      } catch (e) {
        // fallback
        el.focus();
      }
    }
  }, [editingCell]);

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <Nav />
      <div style={{ maxWidth: 960, margin: '24px auto', padding: 16 }}>
  <h1>{t('manageParticipants', lang)}</h1>
        {/* Summary with pie chart */}
        <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {/** compute totals **/}
          {(() => {
            const totalParticipants = participants.reduce((sum, p) => sum + (Number(p.numAttendees || p.participantsCount || p.numAttendees || 1) || 0), 0);
            const arrived = participants.reduce((sum, p) => {
              const checked = Number(p.checkedCount ?? 0) || 0;
              if (checked > 0) return sum + checked;
              if (p.status === 'checked_in') return sum + (Number(p.numAttendees || p.participantsCount || 1) || 0);
              return sum;
            }, 0);
            const notArrived = Math.max(0, totalParticipants - arrived);
            return (
              <>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <PieChart arrived={arrived} notArrived={notArrived} size={120} innerRadius={36} lang={lang} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ color: '#333' }}>
                      <strong>{t('totalParticipants', lang) || 'Total participants:'}</strong>{' '}{totalParticipants}
                    </div>
                    <div style={{ color: 'var(--success, #237a3b)' }}>
                      <strong>{t('totalArriving', lang) || 'Arriving:'}</strong>{' '}{arrived}
                    </div>
                    <div style={{ color: '#666' }}>
                      <strong>{t('notArrived', lang) || 'Not arrived:'}</strong>{' '}{notArrived}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 12, height: 12, background: 'var(--success, #237a3b)', borderRadius: 3 }} />
                    <div style={{ fontSize: 13 }}>{t('arrived', lang) || 'Arrived'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 12, height: 12, background: '#ddd', borderRadius: 3 }} />
                    <div style={{ fontSize: 13 }}>{t('notArrived', lang) || 'Not arrived'}</div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
        <div style={{ height: 24 }} />
        <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button onClick={() => {
            setShowNewRow(s => !s);
            // after showing, focus the add-row name input and scroll the container to top
            setTimeout(() => {
              const nameEl = document.getElementById('add-row-name') as HTMLInputElement | null;
              if (nameEl) {
                try { nameEl.focus({ preventScroll: true } as FocusOptions); nameEl.select(); } catch (e) { nameEl.focus(); }
              }
              if (tableContainerRef.current) tableContainerRef.current.scrollTop = 0;
            }, 50);
          }} style={{ marginLeft: 0, background: 'var(--soft-success, #e6f4ea)', borderColor: 'transparent', color: 'var(--success, #237a3b)' }} aria-label="add-participant">{t('add', lang) || 'Add'}</Button>
          <div style={{ marginLeft: 'auto' }}>
          <Button variant="ghost" onClick={() => router.push(`${Routes.EVENTS}/${id}/import_csv`)}>{t('importFromCSV', lang)}</Button>

          <Button variant="ghost" onClick={() => setConfirmDeleteAllOpen(true)} style={{ color: 'var(--danger, #c53030)' }}>{t('deleteAll', lang) || 'Delete all'}</Button>
          </div>
        </div>
        {loading ? (
          <div>{t('loading', lang)}</div>
        ) : (
          <TableCard ref={tableContainerRef} style={{ maxHeight: '920px', minHeight: '220px' }}>
            <table style={{ minWidth: 960, width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={headerCellStyle(lang)}>{t('firstName', lang) || t('name', lang)}</th>
                    <th style={headerCellStyle(lang)}>{t('lastName', lang) || t('name')}</th>
                    <th style={headerCellStyle(lang)}>{t('phone', lang)}</th>
                    <th style={headerCellStyle(lang)}>{t('numParticipants', lang)}</th>
                    <th style={headerCellStyle(lang)}>{t('arrived', lang)}</th>
                    <th style={{ textAlign: 'center', padding: 12, width: 96 }}>{t('actions', lang) || t('deleted', lang)}</th>
                  </tr>
                </thead>
              <tbody>
                    {/* inline add-row at top */}
                    {showNewRow ? (
                      <tr style={{ borderBottom: '1px solid #eee', background: '#fafafa' }}>
                        <td style={{ padding: 12 }}>
                          <Input id="add-row-name" placeholder={t('name', lang)} aria-label={t('name', lang)} value={newRow.name ?? ''} onChange={e => setNewRow({ ...newRow, name: e.target.value })} style={{ border: newRowErrors.name ? '1px solid #e53e3e' : undefined }} />
                          {newRowErrors.name ? <div style={{ color: '#e53e3e', fontSize: 12 }}>{newRowErrors.name}</div> : null}
                        </td>
                        <td style={{ padding: 12 }}>
                          <Input id="add-row-lastName" placeholder={t('lastName', lang) || 'Last name'} aria-label={t('lastName', lang)} value={newRow.lastName ?? ''} onChange={e => setNewRow({ ...newRow, lastName: e.target.value })} style={{ border: newRowErrors.lastName ? '1px solid #e53e3e' : undefined }} />
                          {newRowErrors.lastName ? <div style={{ color: '#e53e3e', fontSize: 12 }}>{newRowErrors.lastName}</div> : null}
                        </td>
                        <td style={{ padding: 12 }}>
                          <Input id="add-row-phone" placeholder={t('phone', lang)} aria-label={t('phone', lang)} value={newRow.phone ?? ''} onChange={e => setNewRow({ ...newRow, phone: e.target.value })} style={{ border: newRowErrors.phone ? '1px solid #e53e3e' : undefined }} />
                          {newRowErrors.phone ? <div style={{ color: '#e53e3e', fontSize: 12 }}>{newRowErrors.phone}</div> : null}
                        </td>
                        <td style={{ padding: 12 }}>
                          <Input id="add-row-num" type="number" placeholder={t('numParticipants', lang)} aria-label={t('numParticipants', lang)} value={newRow.numAttendees ?? '' as any} onChange={e => setNewRow({ ...newRow, numAttendees: Number(e.target.value) || 0 })} style={{ width: 80, border: newRowErrors.numAttendees ? '1px solid #e53e3e' : undefined }} />
                          {newRowErrors.numAttendees ? <div style={{ color: '#e53e3e', fontSize: 12 }}>{newRowErrors.numAttendees}</div> : null}
                        </td>
                        <td style={{ padding: 12 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                              <Button disabled={!newRow.name || !newRow.phone || addingNew} onClick={async () => {
                                if (!id) return;
                                if (!newRow.name) return setToastMsg(t('nameRequired', lang) || 'Name is required');
                                if (!newRow.phone) return setToastMsg(t('phoneRequired', lang) || 'Phone is required');
                                setAddingNew(true);
                                try {
                                  const auth = await import('../../../lib/auth');
                                  const token = auth.getToken();
                                  if (!token) {
                                    setToastMsg(t('pleaseLogin', lang) || 'Please login to add participants');
                                    setTimeout(() => { setToastMsg(''); router.push('/login'); }, 900);
                                    return;
                                  }
                                  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                  if (token) headers['Authorization'] = `Bearer ${token}`;
                                  // backend accepts guest creation at /events/:id/guests (array payload)
                                  const guestPayload = [{
                                    name: newRow.name,
                                    lastName: newRow.lastName,
                                    phoneNumber: newRow.phone,
                                    participantsCount: Number(newRow.numAttendees) || 1,
                                  }];
                                  const res = await fetch(`/api/proxy/events/${id}/guests`, { method: 'POST', headers, body: JSON.stringify(guestPayload) });
                                  if (res.status === 401) {
                                    setToastMsg(t('sessionExpired', lang) || 'Session expired, please login');
                                    setTimeout(() => { setToastMsg(''); router.push('/login'); }, 900);
                                    return;
                                  }
                                  if (res.ok) {
                                    // refresh participants list from backend so mirrored participants are shown
                                    try {
                                      const listRes = await fetch(`/api/proxy/events/${id}/participants`, { headers });
                                      if (listRes.ok) {
                                        const data = await listRes.json();
                                        setParticipants(data.participants || []);
                                      }
                                    } catch (e) {
                                      // ignore refresh error but proceed
                                    }
                                    setNewRow({ numAttendees: 1 }); setShowNewRow(false); setToastMsg(t('added', lang) || 'Added'); setTimeout(() => setToastMsg(''), 2000);
                                  } else {
                                    const txt = await res.text();
                                    setToastMsg(`${t('addFailed', lang)} ${res.status} ${txt}`);
                                  }
                                } catch (err: any) {
                                  setToastMsg(String(err?.message || err));
                                } finally {
                                  setAddingNew(false);
                                }
                              }}>{t('add', lang) || 'Add'}</Button>
                            <Button variant="ghost" onClick={() => { setShowNewRow(false); setNewRow({ numAttendees: 1 }); }}>{t('cancel', lang) || 'Cancel'}</Button>
                          </div>
                        </td>
                        <td style={{ padding: 12 }} />
                      </tr>
                    ) : null}

                    {participants.length === 0 && !showNewRow ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#666' }}>{t('noParticipants', lang)}</td></tr>
                    ) : null}

                    {participants.map((p, idx) => (
                      <tr key={p._id || idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: 12 }} onClick={() => { setEditingCell({ idx, field: 'name' }); setEditingRow({ ...p }); }}>
                            {editingCell && editingCell.idx === idx && editingCell.field === 'name' ? (
                                <InlineInput
                                  placeholder={t('name', lang)}
                                  aria-label={t('name', lang)}
                                  id={`inline-input-${idx}-name`}
                                  value={editingRow?.name ?? ''}
                                  onChange={e => setEditingRow({ ...editingRow, name: e.target.value })}
                                  onBlur={async () => {
                                    try {
                                      const auth = await import('../../../lib/auth');
                                      const token = auth.getToken();
                                      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                      if (token) headers['Authorization'] = `Bearer ${token}`;
                                      const res = await fetch(`/api/proxy/events/${id}/participants/${p._id}`, { method: 'PATCH', headers, body: JSON.stringify({ name: editingRow.name }) });
                                      if (res.ok) {
                                        const d = await res.json();
                                        const copy = [...participants]; copy[idx] = d.participant; setParticipants(copy);
                                      }
                                    } catch (err: any) { setToastMsg(String(err?.message || err)); setTimeout(() => setToastMsg(''), 4000); }
                                    finally { setEditingCell(null); setEditingRow(null); }
                                  }}
                                  onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                  style={{ width: 180 }}
                                />
                              ) : (
                                <span style={{ cursor: 'pointer' }}>{p.name}</span>
                              )}
                          </td>
                          <td style={{ padding: 12 }} onClick={() => { setEditingCell({ idx, field: 'lastName' }); setEditingRow({ ...p }); }}>
                            {editingCell && editingCell.idx === idx && editingCell.field === 'lastName' ? (
                              <InlineInput
                                placeholder={t('lastName', lang) || 'Last name'}
                                aria-label={t('lastName', lang)}
                                id={`inline-input-${idx}-lastName`}
                                value={editingRow?.lastName ?? ''}
                                onChange={e => setEditingRow({ ...editingRow, lastName: e.target.value })}
                                onBlur={async () => {
                                  try {
                                    const auth = await import('../../../lib/auth');
                                    const token = auth.getToken();
                                    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                    if (token) headers['Authorization'] = `Bearer ${token}`;
                                    const res = await fetch(`/api/proxy/events/${id}/participants/${p._id}`, { method: 'PATCH', headers, body: JSON.stringify({ lastName: editingRow.lastName }) });
                                    if (res.ok) {
                                      const d = await res.json();
                                      const copy = [...participants]; copy[idx] = d.participant; setParticipants(copy);
                                    }
                                  } catch (err: any) { setToastMsg(String(err?.message || err)); setTimeout(() => setToastMsg(''), 4000); }
                                  finally { setEditingCell(null); setEditingRow(null); }
                                }}
                                onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                style={{ width: 180 }}
                              />
                            ) : (
                              <span style={{ cursor: 'pointer' }}>{p.lastName || ''}</span>
                            )}
                          </td>
                          <td style={{ padding: 12 }} onClick={() => { setEditingCell({ idx, field: 'phone' }); setEditingRow({ ...p }); }}>
                            {editingCell && editingCell.idx === idx && editingCell.field === 'phone' ? (
                              <InlineInput
                                placeholder={t('phone', lang)}
                                aria-label={t('phone', lang)}
                                  id={`inline-input-${idx}-phone`}
                                value={editingRow?.phone ?? ''}
                                onChange={e => setEditingRow({ ...editingRow, phone: e.target.value })}
                                onBlur={async () => {
                                  try {
                                    const auth = await import('../../../lib/auth');
                                    const token = auth.getToken();
                                    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                    if (token) headers['Authorization'] = `Bearer ${token}`;
                                    const res = await fetch(`/api/proxy/events/${id}/participants/${p._id}`, { method: 'PATCH', headers, body: JSON.stringify({ phone: editingRow.phone }) });
                                    if (res.ok) {
                                      const d = await res.json();
                                      const copy = [...participants]; copy[idx] = d.participant; setParticipants(copy);
                                    }
                                  } catch (err: any) { setToastMsg(String(err?.message || err)); setTimeout(() => setToastMsg(''), 4000); }
                                  finally { setEditingCell(null); setEditingRow(null); }
                                }}
                                onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                style={{ width: 160 }}
                              />
                            ) : (
                              <span style={{ cursor: 'pointer' }}>{p.phone || ''}</span>
                            )}
                          </td>
                          <td style={{ padding: 12 }}>
                            {editingCell && editingCell.idx === idx && editingCell.field === 'numAttendees' ? (
                              <InlineInput
                                type="number"
                                placeholder={t('numParticipants', lang)}
                                aria-label={t('numParticipants', lang)}
                                  id={`inline-input-${idx}-numAttendees`}
                                value={editingRow?.numAttendees ?? (editingRow?.participantsCount ?? 1)}
                                onChange={e => setEditingRow({ ...editingRow, numAttendees: Number(e.target.value) })}
                                onBlur={async () => {
                                  try {
                                    const auth = await import('../../../lib/auth');
                                    const token = auth.getToken();
                                    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                    if (token) headers['Authorization'] = `Bearer ${token}`;
                                    const res = await fetch(`/api/proxy/events/${id}/participants/${p._id}`, { method: 'PATCH', headers, body: JSON.stringify({ numAttendees: Number(editingRow.numAttendees) }) });
                                    if (res.ok) {
                                      const d = await res.json();
                                      const copy = [...participants]; copy[idx] = d.participant; setParticipants(copy);
                                    }
                                  } catch (err: any) { setToastMsg(String(err?.message || err)); setTimeout(() => setToastMsg(''), 4000); }
                                  finally { setEditingCell(null); setEditingRow(null); }
                                }}
                                onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                style={{ width: 80 }}
                              />
                            ) : (
                              <span style={{ cursor: 'pointer' }} onClick={() => { setEditingCell({ idx, field: 'numAttendees' }); setEditingRow({ ...p }); }}>{p.numAttendees || p.numParticipants || p.participantsCount || p['num of participants'] || 1}</span>
                            )}
                          </td>
                          <td style={{ padding: 12 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <div>
                                {/* <label style={{ display: 'block', fontSize: 12, color: '#666' }}>{t('checkedCount', lang) || 'Checked'}</label> */}
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <InlineInput
                                    type="number"
                                    id={`inline-input-${idx}-checkedCount`}
                                    value={Math.min(
                                      (p.checkedCount ?? p.numAttendees ?? p.participantsCount ?? p.numAttendees) || 0,
                                      Number(p.numAttendees || p.participantsCount || p.numAttendees || 1)
                                    )}
                                    min={0}
                                    max={Number(p.numAttendees || p.participantsCount || p.numAttendees || 1)}
                                    onChange={e => {
                                      let val = Number(e.target.value) || 0;
                                      const max = Number(p.numAttendees || p.participantsCount || p.numAttendees || 1);
                                      if (val > max) val = max;
                                      if (val < 0) val = 0;
                                      const copy = [...participants];
                                      // If checkedCount reaches max, auto-update status to checked_in
                                      copy[idx] = {
                                        ...copy[idx],
                                        checkedCount: val,
                                        // use 'no_arrived' for zero to match backend semantics
                                        status: val === max ? 'checked_in' : (val > 0 ? 'partial' : 'no_arrived'),
                                      };
                                      setParticipants(copy);
                                    }}
                                    style={{ width: 80 }}
                                    onBlur={async () => {
                                      try {
                                        const val = Math.min(Number(participants[idx].checkedCount || 0), Number(participants[idx].numAttendees || participants[idx].participantsCount || 1) || 1);
                                        const status = val === Number(participants[idx].numAttendees || participants[idx].participantsCount || 1) ? 'checked_in' : (val > 0 ? 'partial' : 'no_arrived');
                                        const auth = await import('../../../lib/auth');
                                        const token = auth.getToken();
                                        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                        if (token) headers['Authorization'] = `Bearer ${token}`;
                                        const res = await fetch(`/api/proxy/events/${id}/participants/${p._id}`, {
                                          method: 'PATCH',
                                          headers,
                                          body: JSON.stringify({ checkedCount: val, status, numAttendees: Number(p.numAttendees || p.participantsCount || 1) })
                                        });
                                        if (res.ok) {
                                          const d = await res.json();
                                          const copy = [...participants]; copy[idx] = d.participant; setParticipants(copy);
                                          setToastMsg(status === 'checked_in' ? (t('checkedIn', lang) || 'Checked in') : t('updated', lang) || 'Updated');
                                          setTimeout(() => setToastMsg(''), 2000);
                                        }
                                      } catch (err: any) { setToastMsg(String(err?.message || err)); setTimeout(() => setToastMsg(''), 3000); }
                                    }}
                                    onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                  />
                                </div>
                              <div>
                                {/* <label style={{ display: 'block', fontSize: 12, color: '#666' }}>{t('status', lang) || 'Status'}</label> */}
                                <div>{(() => {
                                  // map internal status values to translated labels (support both possible zero-status spellings)
                                  const s = p.status;
                                  if (s === 'checked_in') return t('checkedIn', lang) || 'Checked in';
                                  if (s === 'partial') return t('partial', lang) || 'Partial';
                                  if (s === 'no_arrived' || s === 'not_arrived') return t('notArrived', lang) || 'Not arrived';
                                  return s || '—';
                                })()}</div>
                              </div>
                              </div>
                              {/* delete button moved to its own column */}
                            </div>
                          </td>
                          <td style={{ padding: 12, textAlign: 'center' }}>
                            <Button style={{ background: 'var(--soft-danger, #fff3f2)', borderColor: 'transparent', color: 'var(--danger, #c53030)' }} onClick={() => { setConfirmOpen(true); setConfirmTarget(p._id); }} aria-label={t('delete', lang)}>{t('delete', lang) || 'Delete'}</Button>
                          </td>
                      </tr>
                    ))}
                    {/* inline add-row */}
                    
              </tbody>
            </table>
          </TableCard>
        )}
        <div style={{ marginTop: 32 }}>
          <Button variant="ghost" onClick={() => router.push(`${Routes.EVENTS}/${id}`)} style={{ background: 'transparent', border: 'none', color: 'var(--primary, #4299e1)', textDecoration: 'underline' }} aria-label={t('backToEvent', lang)}>
            ← {t('backToEvent', lang)}
          </Button>
        </div>
        <ConfirmModal open={confirmOpen} title={t('confirmDeleteParticipant', lang) || 'Delete participant?'} message={t('confirmDeleteParticipantMsg', lang) || 'This will permanently remove this participant.'} onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }} onConfirm={async () => {
          if (!confirmTarget) return setConfirmOpen(false);
          try {
            const auth = await import('../../../lib/auth');
            const token = auth.getToken();
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`/api/proxy/events/${id}/participants/${confirmTarget}`, { method: 'DELETE', headers });
            if (res.status === 204) {
              setParticipants(participants.filter(p => String(p._id) !== String(confirmTarget)));
              setToastMsg(t('deleted', lang) || 'Deleted'); setTimeout(() => setToastMsg(''), 2000);
            } else {
              const txt = await res.text();
              setToastMsg(`delete failed: ${res.status} ${txt}`); setTimeout(() => setToastMsg(''), 4000);
            }
          } catch (err: any) {
            setToastMsg(String(err?.message || err)); setTimeout(() => setToastMsg(''), 4000);
          } finally {
            setConfirmOpen(false); setConfirmTarget(null);
          }
        }} />
        <ConfirmModal open={confirmDeleteAllOpen} title={t('confirmDeleteAll', lang) || 'Delete all participants?'} message={t('confirmDeleteAllMsg', lang) || 'This will permanently remove all participants for this event.'} onCancel={() => { setConfirmDeleteAllOpen(false); }} onConfirm={async () => {
          setDeletingAll(true);
          try {
            const auth = await import('../../../lib/auth');
            const token = auth.getToken();
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            // try backend bulk delete endpoint first
            const res = await fetch(`/api/proxy/events/${id}/participants`, { method: 'DELETE', headers });
            if (res.status === 204 || res.ok) {
              setParticipants([]);
              setToastMsg(t('deletedAll', lang) || 'Deleted all'); setTimeout(() => setToastMsg(''), 2000);
            } else {
              // fallback: delete sequentially
              for (const p of participants) {
                await fetch(`/api/proxy/events/${id}/participants/${p._id}`, { method: 'DELETE', headers });
              }
              setParticipants([]);
              setToastMsg(t('deletedAll', lang) || 'Deleted all'); setTimeout(() => setToastMsg(''), 2000);
            }
          } catch (err: any) {
            setToastMsg(String(err?.message || err)); setTimeout(() => setToastMsg(''), 4000);
          } finally {
            setConfirmDeleteAllOpen(false);
            setDeletingAll(false);
          }
        }} />
  <Toast open={!!toastMsg} message={toastMsg} severity={toastMsg.toLowerCase().includes('failed') || toastMsg.toLowerCase().includes('error') ? 'error' : 'success'} autoDismiss={2500} />
      </div>
    </main>
  );
}

export default function ProtectedParticipantsPage() {
  return (
    <AuthRoute>
      <ParticipantsPage />
    </AuthRoute>
  );
}
