import { Router } from 'express';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';
import { inquirySchema, fieldErrors } from '../validation.js';

// Public: buyer submits an inquiry for one property.
export const propertyInquiries = Router({ mergeParams: true });

propertyInquiries.post('/', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(404).json({ error: 'Property not found' });

  const parsed = inquirySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', fields: fieldErrors(parsed.error) });

  const exists = await query('SELECT 1 FROM properties WHERE id = $1', [id]);
  if (!exists.rowCount) return res.status(404).json({ error: 'Property not found' });

  const { name, email, phone, message } = parsed.data;
  const { rows } = await query(
    'INSERT INTO inquiries (property_id, name, email, phone, message) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at',
    [id, name, email, phone, message],
  );
  res.status(201).json(rows[0]);
});

// Admin: list all inquiries with the property each relates to.
const router = Router();

router.get('/', requireAdmin, async (_req, res) => {
  const { rows } = await query(
    `SELECT i.id, i.property_id, p.name AS property_name, i.name, i.email, i.phone, i.message, i.created_at
     FROM inquiries i JOIN properties p ON p.id = i.property_id
     ORDER BY i.created_at DESC, i.id DESC`,
  );
  res.json(rows);
});

export default router;
