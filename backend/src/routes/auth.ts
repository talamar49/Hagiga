import { Router } from 'express';
import { User } from '../models';
import jwtLib from '../lib/jwt';
import bcrypt from 'bcrypt';

const router = Router();

// Simple in-memory OTP store for scaffold/demo. Replace with Redis in prod.
const otpStore = new Map<string, { phone: string; code: string; expiresAt: number }>();

function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/otp/request', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  const requestId = Math.random().toString(36).slice(2, 10);
  const code = genCode();
  otpStore.set(requestId, { phone, code, expiresAt: Date.now() + 5 * 60 * 1000 });
  // For now, just log the OTP (no external SMS provider).
  console.log('OTP for', phone, 'is', code);
  // In development, include the code in the response to make testing easier
  const payload: any = { requestId, expiresIn: 300 };
  if (process.env.NODE_ENV !== 'production') payload.debugCode = code;
  res.status(202).json(payload);
});

router.post('/otp/verify', async (req, res) => {
  const { requestId, code } = req.body;
  if (!requestId || !code) return res.status(400).json({ error: 'requestId and code required' });
  const entry = otpStore.get(requestId);
  if (!entry) return res.status(404).json({ error: 'request not found' });
  if (Date.now() > entry.expiresAt) return res.status(410).json({ error: 'expired' });
  if (entry.code !== String(code)) return res.status(401).json({ error: 'invalid code' });
  otpStore.delete(requestId);

  // find or create user
  let user = await User.findOne({ phone: entry.phone });
  if (!user) {
    user = await User.create({ phone: entry.phone, roles: ['participant'] });
  }

  const token = jwtLib.sign({ sub: user._id, roles: user.roles });
  res.json({ token, user: { id: user._id, phone: user.phone, roles: user.roles } });
});

// Email/password registration
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const normalized = String(email).trim().toLowerCase();
  const existing = await User.findOne({ email: normalized });
  if (existing) return res.status(409).json({ error: 'email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email: normalized, passwordHash: hash, firstName, lastName, roles: ['participant', 'host'] });
  const token = jwtLib.sign({ sub: user._id, roles: user.roles });
  res.status(201).json({ token, user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, roles: user.roles } });
});

// Email/password login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwtLib.sign({ sub: user._id, roles: user.roles });
  res.json({ token, user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, roles: user.roles } });
});

// Me endpoint
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
  const token = auth.slice('Bearer '.length);
  const payload = jwtLib.verify(token);
  if (!payload || !payload.sub) return res.status(401).json({ error: 'invalid token' });
  const user = await User.findById(payload.sub).lean();
  if (!user) return res.status(404).json({ error: 'user not found' });
  const u: any = user as any;
  res.json({ id: u._id, email: u.email, firstName: u.firstName, lastName: u.lastName, roles: u.roles });
});

export default router;
