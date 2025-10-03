import { NextFunction, Request, Response } from 'express';
import jwtLib from '../lib/jwt';
import { User } from '../models';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
  const token = auth.slice('Bearer '.length);
  const payload = jwtLib.verify(token);
  if (!payload || !payload.sub) return res.status(401).json({ error: 'invalid token' });
  try {
    const user = await User.findById(payload.sub).lean();
    if (!user) return res.status(401).json({ error: 'user not found' });
    // attach user to request
    (req as any).user = user;
    return next();
  } catch (err) {
    return res.status(500).json({ error: 'server error' });
  }
}

export default requireAuth;
