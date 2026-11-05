import jwt from 'jsonwebtoken';
import { timingSafeEqual } from 'node:crypto';

const isProd = () => process.env.NODE_ENV === 'production' || !!process.env.NETLIFY;

// Dev falls back to throwaway values; production must set both env vars explicitly.
const secret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (isProd()) throw new Error('JWT_SECRET is not set');
  return 'dev-only-secret';
};

export function passwordMatches(input) {
  const password = process.env.ADMIN_PASSWORD || (isProd() ? '' : 'changeme');
  if (!password) return false;
  const expected = Buffer.from(password);
  const given = Buffer.from(String(input));
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export const signToken = () => jwt.sign({ role: 'admin' }, secret(), { expiresIn: '8h' });

export function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  try {
    if (jwt.verify(token, secret()).role === 'admin') return next();
  } catch {
    // invalid or expired: fall through to 401
  }
  res.status(401).json({ error: 'Admin authentication required' });
}
