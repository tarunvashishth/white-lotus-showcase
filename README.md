# White Lotus: Property Showcase & Inquiry Manager

A small full-stack tool for a luxury-real-estate sales team: buyers browse and filter properties and send inquiries; the sales team (admin) manages listings and reads inquiries in a dashboard.

**Stack:** React (Vite) + Tailwind v4 · Node/Express · PostgreSQL. No ORM, plain SQL via `pg`.
The build was driven by [SPEC.md](SPEC.md), which lists the decisions, API, acceptance criteria and scope.

## Run it locally

Prerequisites: Node 20+, PostgreSQL running locally.

```bash
# 1. database
createdb whitelotus

# 2. backend (terminal 1)
cd server
cp .env.example .env        # adjust DATABASE_URL / ADMIN_PASSWORD if needed
npm install
npm run migrate             # applies db/schema.sql (idempotent)
npm run seed                # 8 demo properties + 2 inquiries (resets data)
npm run dev                 # http://localhost:4000

# 3. frontend (terminal 2)
cd client
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :4000)
```

- Public site: <http://localhost:5173>
- Admin: <http://localhost:5173/admin>, password is `ADMIN_PASSWORD` from `server/.env` (default `changeme`).

### Tests

```bash
cd server && npm test
```

Integration tests run against a real Postgres database, `whitelotus_test`, which they create on demand (override with `TEST_DATABASE_URL`). Your dev data is untouched. Each test carries a `protects / fails_when / no_claim` comment.

## Features

- **Listings:** card grid, search, location, min bedrooms, price range (₹ Cr), sort. Filters live in the URL, so a filtered view is shareable. Loading skeletons, empty and error states.
- **Detail page:** gallery, specs, description, and an inquiry form (name, email, phone, message) with inline server-side validation messages and a success state.
- **Admin:** password login; properties table with add / edit / delete (confirmation); inquiries table showing which property each relates to.
- **Validation:** one rule set (zod) enforced on the server, mirrored by DB `CHECK` constraints. The UI renders the server's per-field messages.

## API summary

| Method | Path | Auth |
|---|---|---|
| GET | `/api/properties` (`location, bedrooms, minPrice, maxPrice, q, sort`) | – |
| GET | `/api/properties/locations`, `/api/properties/:id` | – |
| POST / PUT / DELETE | `/api/properties`, `/api/properties/:id` | admin |
| POST | `/api/properties/:id/inquiries` | – |
| GET | `/api/inquiries` | admin |
| POST | `/api/auth/login` | – |

Errors are `{ "error": "...", "fields": { "price": "..." } }`. Schema: [server/db/schema.sql](server/db/schema.sql).

## Architecture and trade-offs

The backend is a thin Express API with zod validation at the edge and parameterised SQL (sort keys are whitelisted, never interpolated), and the database `CHECK` constraints are a second line of defence. Filtering and sorting happen server-side so the API is useful beyond this one UI. Admin auth is a single shared password that returns a short-lived JWT: it keeps the write endpoints and the inquiry data protected without building user management, but it is not real identity (no per-user audit trail, no rate limiting, the token sits in `localStorage`). Prices are stored as whole rupees in a `BIGINT` and formatted as ₹ Cr / ₹ L in the UI. Images are URLs rather than uploads, to stay inside the time limit. The client is deliberately light: React Router, a small `useFetch` hook, and Tailwind, with no state library.

## What I'd do next

- Real admin accounts (hashed passwords, roles, login rate limiting) and httpOnly-cookie sessions.
- Image upload to object storage; pagination or infinite scroll for large catalogues.
- Inquiry workflow: status (new / contacted / closed), assignment, notes, email notification to sales, spam protection (honeypot / CAPTCHA).
- Component and end-to-end tests (Playwright) for the UI, and CI running lint + tests.
- Deployment (for example Render for API + Postgres, Vercel for the client), with the API URL configurable via env.
