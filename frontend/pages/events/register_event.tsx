import React, { useState } from 'react';
import Nav from '../../components/Nav';
import { useLang } from '../../lib/lang';
import { getSimplePageStyles } from '../../styles/pages/simplePageStyles';
import { createEvent } from '../../lib/api';
import { useRouter } from 'next/router';
import { Routes } from '../../constants/routes';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const EVENT_TYPES = ['wedding','festival','standup','concert'];

export default function RegisterEventPage(){
  const { lang } = useLang();
  const styles = getSimplePageStyles(lang);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState(EVENT_TYPES[0]);
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    setError(null);
    if (!title || !type) {
      setError('title and type are required');
      return;
    }
    setLoading(true);
    try {
      const res = await createEvent({ title, type, date: date || undefined, description: description || undefined });
      const id = res.id || (res.event && res.event._id);
      if (!id) throw new Error('no id returned');
      // redirect to event main page
      router.push(`${Routes.EVENTS}/${id}`);
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.containerStyle} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <Nav />
      <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
        <h1>{lang === 'he' ? 'רישום אירוע' : 'Register Event'}</h1>
        <Card>
          <form onSubmit={onSubmit}>
            <Input label={lang === 'he' ? 'כותרת' : 'Title'} value={title} onChange={e=>setTitle(e.target.value)} />
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 6 }}>{lang === 'he' ? 'סוג' : 'Type'}</label>
              <select value={type} onChange={e=>setType(e.target.value)} style={{ width: '100%', padding: 8 }}>
                {EVENT_TYPES.map(t=> <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6 }}>{lang === 'he' ? 'תאריך (אופציונלי)' : 'Date (optional)'}</label>
                <Input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ padding: 8, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6 }}>{lang === 'he' ? 'תיאור (אופציונלי)' : 'Description (optional)'}</label>
                <Input value={description} onChange={e=>setDescription(e.target.value)} style={{ padding: 8, width: '100%' }} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Button className="" type="submit" disabled={loading}>{loading ? '...' : (lang === 'he' ? 'צור אירוע' : 'Create Event')}</Button>
            </div>
            {error ? <div style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</div> : null}
          </form>
        </Card>
      </div>
    </main>
  );
}
