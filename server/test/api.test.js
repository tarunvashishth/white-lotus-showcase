// Integration tests against a real Postgres database (default: whitelotus_test, created on demand).
// Run: npm test
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';

const TEST_DB = process.env.TEST_DATABASE_URL || 'postgres://localhost:5432/whitelotus_test';
process.env.DATABASE_URL = TEST_DB;
process.env.ADMIN_PASSWORD = 'test-pass';
process.env.JWT_SECRET = 'test-secret';

let server, base, pool, token;

const api = async (path, { method = 'GET', body, auth } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(auth ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
};

const prop = (over = {}) => ({
  name: 'Test Villa', location: 'Indiranagar', price: 10000000, size_sqft: 2000, bedrooms: 3, bathrooms: 3,
  description: 'Short blurb', long_description: 'Long text', images: ['https://example.com/a.jpg'], ...over,
});

before(async () => {
  const url = new URL(TEST_DB);
  const admin = new pg.Client({ connectionString: TEST_DB.replace(url.pathname, '/postgres') });
  await admin.connect();
  const dbName = url.pathname.slice(1);
  if (!(await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])).rowCount) {
    await admin.query(`CREATE DATABASE "${dbName}"`);
  }
  await admin.end();

  const { readFileSync } = await import('node:fs');
  pool = new pg.Pool({ connectionString: TEST_DB });
  await pool.query(readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'));

  const { createApp } = await import('../src/app.js');
  server = createApp().listen(0);
  base = `http://localhost:${server.address().port}`;
  token = (await api('/api/auth/login', { method: 'POST', body: { password: 'test-pass' } })).json.token;
});

beforeEach(() => pool.query('TRUNCATE inquiries, properties RESTART IDENTITY CASCADE'));

after(async () => {
  server.close();
  await pool.end();
  const { pool: appPool } = await import('../src/db.js');
  await appPool.end();
});

// protects=only admins can mutate; fails_when=a missing/wrong token is accepted; no_claim=token expiry
test('auth: wrong password is rejected and writes require a token', async () => {
  assert.equal((await api('/api/auth/login', { method: 'POST', body: { password: 'nope' } })).status, 401);
  assert.equal((await api('/api/properties', { method: 'POST', body: prop() })).status, 401);
  assert.equal((await api('/api/inquiries')).status, 401);
});

// protects=server-side price validation; fails_when=0/negative/non-numeric price inserts a row; no_claim=client UI checks
test('create: invalid price returns 400 with fields.price and stores nothing', async () => {
  for (const price of [0, -5, 'abc']) {
    const r = await api('/api/properties', { method: 'POST', auth: true, body: prop({ price }) });
    assert.equal(r.status, 400);
    assert.ok(r.json.fields.price, `price=${price} should have a field error`);
  }
  const empty = await api('/api/properties', { method: 'POST', auth: true, body: prop({ name: '  ' }) });
  assert.ok(empty.json.fields.name);
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM properties')).rows[0].n, 0);
});

// protects=full CRUD lifecycle; fails_when=update/delete hit wrong row or leave it behind; no_claim=concurrency
test('CRUD: create, read, update, delete, then 404', async () => {
  const created = await api('/api/properties', { method: 'POST', auth: true, body: prop() });
  assert.equal(created.status, 201);
  const id = created.json.id;
  assert.equal(created.json.price, 10000000); // BIGINT returned as a number

  assert.equal((await api(`/api/properties/${id}`)).json.name, 'Test Villa');
  const upd = await api(`/api/properties/${id}`, { method: 'PUT', auth: true, body: prop({ name: 'Renamed' }) });
  assert.equal(upd.json.name, 'Renamed');

  assert.equal((await api(`/api/properties/${id}`, { method: 'DELETE', auth: true })).status, 204);
  assert.equal((await api(`/api/properties/${id}`)).status, 404);
  assert.equal((await api(`/api/properties/${id}`, { method: 'DELETE', auth: true })).status, 404);
  assert.equal((await api('/api/properties/abc')).status, 404);
});

// protects=filter + sort contract (spec AC1); fails_when=wrong rows or order; no_claim=large-data performance
test('list: bedrooms>=4 with price_asc, location and search filters', async () => {
  const add = (o) => api('/api/properties', { method: 'POST', auth: true, body: prop(o) });
  await add({ name: 'A', bedrooms: 5, price: 300 });
  await add({ name: 'B', bedrooms: 4, price: 100 });
  await add({ name: 'C', bedrooms: 2, price: 50, location: 'Hebbal' });
  await add({ name: '100% Odd_Name', bedrooms: 4, price: 200 });

  const r = await api('/api/properties?bedrooms=4&sort=price_asc');
  assert.deepEqual(r.json.map((p) => p.name), ['B', '100% Odd_Name', 'A']);
  assert.deepEqual((await api('/api/properties?location=Hebbal')).json.map((p) => p.name), ['C']);
  assert.deepEqual((await api('/api/properties?q=' + encodeURIComponent('100%'))).json.map((p) => p.name), ['100% Odd_Name']);
  assert.deepEqual((await api('/api/properties?minPrice=150&maxPrice=250')).json.map((p) => p.name), ['100% Odd_Name']);
  assert.deepEqual((await api('/api/properties/locations')).json, ['Hebbal', 'Indiranagar']);
});

// protects=inquiry capture + admin visibility (spec AC4/5/6); fails_when=bad data stored or linked to wrong property; no_claim=email delivery
test('inquiries: valid is stored and listed with property name; invalid is rejected', async () => {
  const { json: p } = await api('/api/properties', { method: 'POST', auth: true, body: prop({ name: 'Linked Villa' }) });
  const ok = await api(`/api/properties/${p.id}/inquiries`, {
    method: 'POST', body: { name: 'Asha', email: 'asha@example.com', phone: '+91 98450 11223', message: 'Hello' },
  });
  assert.equal(ok.status, 201);

  const bad = await api(`/api/properties/${p.id}/inquiries`, { method: 'POST', body: { name: '', email: 'nope', phone: 'x', message: '' } });
  assert.equal(bad.status, 400);
  assert.deepEqual(Object.keys(bad.json.fields).sort(), ['email', 'message', 'name', 'phone']);
  assert.equal((await api('/api/properties/9999/inquiries', { method: 'POST', body: { name: 'A', email: 'a@b.co', phone: '1234567', message: 'm' } })).status, 404);

  const list = await api('/api/inquiries', { auth: true });
  assert.equal(list.json.length, 1);
  assert.equal(list.json[0].property_name, 'Linked Villa');
});

// protects=cascade delete (spec AC3); fails_when=orphaned inquiries remain or FK blocks delete; no_claim=soft-delete
test('delete property cascades to its inquiries', async () => {
  const { json: p } = await api('/api/properties', { method: 'POST', auth: true, body: prop() });
  await api(`/api/properties/${p.id}/inquiries`, {
    method: 'POST', body: { name: 'Asha', email: 'asha@example.com', phone: '+91 98450 11223', message: 'Hi' },
  });
  await api(`/api/properties/${p.id}`, { method: 'DELETE', auth: true });
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM inquiries')).rows[0].n, 0);
});
