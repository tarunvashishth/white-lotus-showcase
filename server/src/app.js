import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import properties from './routes/properties.js';
import inquiries, { propertyInquiries } from './routes/inquiries.js';
import { loginSchema, fieldErrors } from './validation.js';
import { passwordMatches, signToken } from './auth.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.post('/api/auth/login', (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', fields: fieldErrors(parsed.error) });
    if (!passwordMatches(parsed.data.password)) return res.status(401).json({ error: 'Incorrect password' });
    res.json({ token: signToken() });
  });

  app.use('/api/properties/:id/inquiries', propertyInquiries);
  app.use('/api/properties', properties);
  app.use('/api/inquiries', inquiries);

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  // Malformed JSON bodies -> 400; anything else is logged and returned as 500.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  });

  return app;
}
