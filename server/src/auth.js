import jwt from 'jsonwebtoken';
import { timingSafeEqual } from 'node:crypto';

const secret = () => process.env.JWT_SECRET || 'dev-only-secret';

export function passwordMatches(input) {
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || 'changeme');
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
