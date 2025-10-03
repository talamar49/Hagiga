import { Router } from 'express';
import { User } from '../models';
import jwtLib from '../lib/jwt';

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
  // TODO: integrate Twilio/SMS provider
  console.log('OTP for', phone, 'is', code);
  res.status(202).json({ requestId, expiresIn: 300 });
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

export default router;
