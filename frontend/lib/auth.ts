export type User = { id: string; email?: string; firstName?: string; lastName?: string; roles?: string[] };

const TOKEN_KEY = 'hagiga_token';

export function saveToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}

export async function register(email: string, password: string, firstName?: string, lastName?: string, phone?: string) {
  const res = await fetch('/api/proxy/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, firstName, lastName, phone }) });
  if (!res.ok) {
    const txt = (await res.text()) || res.statusText;
    if (res.status === 409) throw new Error('Email already registered');
    throw new Error(txt);
  }
  return res.json() as Promise<{ token: string; user: User }>;
}

export async function login(email: string, password: string) {
  const res = await fetch('/api/proxy/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  if (!res.ok) {
    const txt = (await res.text()) || res.statusText;
    if (res.status === 401) throw new Error('Invalid email or password');
    throw new Error(txt);
  }
  return res.json() as Promise<{ token: string; user: User }>;
}

export async function me(): Promise<User> {
  const token = getToken();
  const headers: Record<string,string> = {};
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch('/api/proxy/auth/me', { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function requestOtp(phone: string): Promise<{ requestId: string; expiresIn: number }> {
  const res = await fetch('/api/proxy/auth/otp/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
  if (!res.ok) {
    const txt = (await res.text()) || res.statusText;
    throw new Error(txt);
  }
  return res.json();
}

export async function verifyOtp(requestId: string, code: string): Promise<{ token: string; user: User }> {
  const res = await fetch('/api/proxy/auth/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId, code }) });
  if (!res.ok) {
    const txt = (await res.text()) || res.statusText;
    throw new Error(txt);
  }
  return res.json();
}

export default { saveToken, getToken, register, login, me, logout };
