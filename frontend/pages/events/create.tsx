import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function EventsCreateRedirect(){
  const router = useRouter();
  useEffect(()=>{ router.replace('/events/register_event'); }, []);
  return null;
}
