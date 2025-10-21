import { useEffect, useState, useCallback } from 'react';
import auth, { User } from './auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await auth.me();
      setUser(u as User);
    } catch (err: any) {
      setUser(null);
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // only run client-side
    refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
  }, []);

  return { user, loading, error, refresh, logout };
}

export default useAuth;
