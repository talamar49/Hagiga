import React from 'react';
import useAuth from './useAuth';
import { useRouter } from 'next/router';

export function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return null;
  return <>{children}</>;
}

export default AuthRoute;
