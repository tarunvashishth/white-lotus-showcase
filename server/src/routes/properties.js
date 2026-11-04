import { Router } from 'express';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';
import { propertySchema, fieldErrors } from '../validation.js';

const router = Router();

// Whitelist: the sort key from the client is mapped, never interpolated.
const SORTS = {
  newest: 'created_at DESC, id DESC',
  price_asc: 'price ASC, id ASC',
  price_desc: 'price DESC, id DESC',
  size_desc: 'size_sqft DESC, id ASC',
  bedrooms_desc: 'bedrooms DESC, price DESC, id ASC',
};

const COLS = ['name', 'location', 'price', 'size_sqft', 'bedrooms', 'bathrooms', 'description', 'long_description', 'images'];

const escapeLike = (s) => s.replace(/[\\%_]/g, (c) => '\\' + c);
const num = (v) => (v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(404).json({ error: 'Property not found' });
    return null;
  }
  return id;
}

function invalid(res, parsed) {
  return res.status(400).json({ error: 'Validation failed', fields: fieldErrors(parsed.error) });
}

// GET /api/properties?location=&bedrooms=&minPrice=&maxPrice=&q=&sort=
router.get('/', async (req, res) => {
  const { location, bedrooms, minPrice, maxPrice, q, sort } = req.query;
  const where = [];
  const params = [];
  const add = (clause, value) => {
    params.push(value);
    where.push(clause.replaceAll('?', `$${params.length}`));
  };

  if (location) add('location = ?', String(location));
  if (num(bedrooms) !== null) add('bedrooms >= ?', num(bedrooms));
  if (num(minPrice) !== null) add('price >= ?', num(minPrice));
  if (num(maxPrice) !== null) add('price <= ?', num(maxPrice));
  if (q) add("(name ILIKE ? ESCAPE '\\' OR description ILIKE ? ESCAPE '\\')", `%${escapeLike(String(q).slice(0, 100))}%`);

  const order = SORTS[sort] || SORTS.newest;
  const { rows } = await query(
    `SELECT * FROM properties ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${order}`,
    params,
  );
  res.json(rows);
});

router.get('/locations', async (_req, res) => {
  const { rows } = await query('SELECT DISTINCT location FROM properties ORDER BY location');
  res.json(rows.map((r) => r.location));
});

router.get('/:id', async (req, res) => {
  const id = parseId(req, res);
  if (!id) return;
  const { rows } = await query('SELECT * FROM properties WHERE id = $1', [id]);
  if (!rows[0]) return res.status(404).json({ error: 'Property not found' });
  res.json(rows[0]);
});

router.post('/', requireAdmin, async (req, res) => {
  const parsed = propertySchema.safeParse(req.body);
  if (!parsed.success) return invalid(res, parsed);
  const { rows } = await query(
    `INSERT INTO properties (${COLS.join(', ')}) VALUES (${COLS.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
    COLS.map((c) => parsed.data[c]),
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', requireAdmin, async (req, res) => {
  const id = parseId(req, res);
  if (!id) return;
  const parsed = propertySchema.safeParse(req.body);
  if (!parsed.success) return invalid(res, parsed);
  const { rows } = await query(
    `UPDATE properties SET ${COLS.map((c, i) => `${c} = $${i + 1}`).join(', ')}, updated_at = now()
     WHERE id = $${COLS.length + 1} RETURNING *`,
    [...COLS.map((c) => parsed.data[c]), id],
  );
  if (!rows[0]) return res.status(404).json({ error: 'Property not found' });
  res.json(rows[0]);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const id = parseId(req, res);
  if (!id) return;
  const { rowCount } = await query('DELETE FROM properties WHERE id = $1', [id]); // inquiries cascade
  if (!rowCount) return res.status(404).json({ error: 'Property not found' });
  res.status(204).end();
});

export default router;
