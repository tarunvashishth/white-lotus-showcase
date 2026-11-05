# Property Showcase & Inquiry Manager

Internal tool for White Lotus Group's sales team. Buyers browse and filter luxury properties and send inquiries. Admins add, edit and delete listings and read the inquiries.

Stack: React (Vite) + Tailwind, Node/Express, PostgreSQL (plain SQL via `pg`).

Live: https://white-lotus-showcase.netlify.app (admin at `/admin`)

## Setup

Needs Node 20+ and a local PostgreSQL.

```bash
createdb whitelotus

# backend, terminal 1
cd server
cp .env.example .env
npm install
npm run migrate    # applies db/schema.sql
npm run seed       # demo data (replaces existing rows)
npm run dev        # http://localhost:4000

# frontend, terminal 2
cd client
npm install
npm run dev        # http://localhost:5173, proxies /api to :4000
```

Admin is at `/admin`. The password is `ADMIN_PASSWORD` in `server/.env` (`changeme` by default).

Tests: `cd server && npm test`. They use a separate `whitelotus_test` database, created on first run (override with `TEST_DATABASE_URL`).

## Deployment

Netlify serves the built React app and runs the Express API as a single serverless function (`netlify/functions/api.mjs`, wired up in `netlify.toml`). The database is Postgres on Supabase, reached through its connection pooler. Set `DATABASE_URL`, `ADMIN_PASSWORD` and `JWT_SECRET` as Netlify environment variables. In production the API refuses to log anyone in if the last two are missing. Apply `server/db/schema.sql` to the database first. If the database is on Supabase, enable row-level security on both tables and connect with a dedicated role.

## API

| Method | Path | Auth |
|---|---|---|
| GET | `/api/properties?location&bedrooms&minPrice&maxPrice&q&sort` | no |
| GET | `/api/properties/locations`, `/api/properties/:id` | no |
| POST | `/api/properties` | admin |
| PUT, DELETE | `/api/properties/:id` | admin |
| POST | `/api/properties/:id/inquiries` | no |
| GET | `/api/inquiries` | admin |
| POST | `/api/auth/login` | no |

Errors look like `{ "error": "...", "fields": { "price": "..." } }`. The schema is in `server/db/schema.sql`. The plan this was built from is in `SPEC.md`.

## Design decisions

Validation lives on the server (zod) and the database `CHECK` constraints back it up; the forms show the server's per-field messages. Filtering and sorting are query parameters handled in SQL, and the listing page keeps them in the URL so a filtered view can be shared. Sort keys are looked up from a fixed map, never put into the query.

Admin auth is one shared password that returns an 8-hour JWT. It protects the write endpoints and the inquiry list without building user accounts. The cost is no per-user identity, no rate limiting on login, and the token lives in `localStorage`.

Prices are whole rupees in a `BIGINT`, shown as ₹ Cr / ₹ L. Images are URLs, not uploads.

## With more time

- Real admin accounts, login rate limiting, cookie sessions
- Image uploads, pagination
- Inquiry status and notes, email notification, spam protection
- Frontend and end-to-end tests, CI
- Deployment
