import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

export function sign(payload: object, opts?: jwt.SignOptions) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d', ...(opts || {}) });
}

export function verify(token: string) {
  try {
    return jwt.verify(token, SECRET) as any;
  } catch (err) {
    return null;
  }
}

export default { sign, verify };
