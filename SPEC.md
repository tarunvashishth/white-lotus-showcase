# SPEC: White Lotus "Property Showcase & Inquiry Manager"

Source: `Full_Stack_Developer_Assignment.pdf` (Senior Software Developer, Full Stack). Status: **DRAFT, awaiting approval**.

## Context
White Lotus Group's sales team needs an internal tool to showcase luxury Bengaluru properties to buyers, manage listings, and capture buyer inquiries. Evaluated on code quality, full-stack competence, product sense (validation, empty and loading states), AI-tool judgment, README clarity, and scope management. A small, working core beats breadth.

## Current State
Greenfield. Empty repo (verified 2026-11-04). Local PostgreSQL 16 running, database `whitelotus` exists, Node v24.

## Decisions (made, not open)
| Topic | Decision | Rationale |
|---|---|---|
| Frontend | React + Vite, Tailwind v4, React Router | Allowed stack, fastest to responsive UI |
| Backend | Node + Express, `pg` (no ORM), zod validation | Plain SQL keeps schema explicit and reviewable |
| DB | PostgreSQL, `server/db/schema.sql` applied by `npm run migrate` | Matches their stack |
| Admin auth | Single `ADMIN_PASSWORD` env var, login returns 8h JWT; protects property writes + inquiry list | Cheap, closes the open-admin hole, no user table |
| Currency | INR, stored as BIGINT rupees, displayed as ₹ Cr / ₹ L | Bengaluru market |
| Images | `TEXT[]` of URLs, seeded with stock URLs, no uploads | Time limit |
| Filtering | Server-side query params | Real API design, not client hacks |
| Git | Small commits per slice on `feat/property-showcase`; history never squashed | PDF requirement |

## API
All errors: `{ "error": string, "fields"?: { [field]: string } }`.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/properties` | no | Query: `location`, `bedrooms` (min), `minPrice`, `maxPrice`, `q`, `sort` in `newest, price_asc, price_desc, size_desc, bedrooms_desc` |
| GET | `/api/properties/locations` | no | Distinct locations for the filter dropdown |
| GET | `/api/properties/:id` | no | 404 if missing or non-numeric |
| POST | `/api/properties` | admin | 201, 400 with `fields` on invalid |
| PUT | `/api/properties/:id` | admin | Full replace of editable fields |
| DELETE | `/api/properties/:id` | admin | 204; inquiries cascade |
| POST | `/api/properties/:id/inquiries` | no | 201, 400, 404 |
| GET | `/api/inquiries` | admin | Joined with property name, newest first |
| POST | `/api/auth/login` | no | `{password}` → `{token}`; 401 on mismatch |

## Data model
`server/db/schema.sql`: `properties` (name, location, price>0, size_sqft>0, bedrooms>=0, bathrooms, description<=300, long_description, images[], timestamps) and `inquiries` (property_id FK ON DELETE CASCADE, name, email, phone, message, created_at). CHECK constraints mirror API validation so bad data cannot enter by any path.

## Validation rules
Property: name, location, short description required (trimmed, non-empty); price and size positive integers; bedrooms integer 0-30; each image a valid URL. Inquiry: name, message required; email valid format; phone 7-20 chars of digits, spaces, `+()-`. The server is the source of truth; the client shows the server's per-field messages and does light pre-checks.

## UI
- `/` Listings: responsive card grid, filter bar (location, min bedrooms, price range, search), sort select, loading skeletons, empty state with "clear filters", error state with retry.
- `/properties/:id` Detail: image gallery, specs, long description, inquiry form (inline field errors, success confirmation, disabled while submitting), 404 state.
- `/admin/login`, `/admin` Dashboard with tabs **Properties** (table, edit, delete with confirm) and **Inquiries** (table showing property, buyer, contact, message, date; empty state), `/admin/properties/new` and `/admin/properties/:id/edit` share one form component.
- Admin routes redirect to login without a valid token; a 401 clears the token.

## Acceptance criteria
1. `GET /api/properties?bedrooms=4&sort=price_asc` returns only properties with bedrooms >= 4, ascending by price.
2. `POST /api/properties` with `price: -5` or `price: 0` returns 400 with `fields.price` and inserts no row; with no token it returns 401.
3. `DELETE /api/properties/:id` removes the property and its inquiries; a second call returns 404.
4. A valid inquiry on `/properties/:id` is stored with the correct `property_id` and appears in the admin Inquiries tab with that property's name.
5. An invalid inquiry (bad email, empty name) returns 400 with per-field messages shown beside the inputs; nothing is stored.
6. `GET /api/inquiries` returns 401 without a valid admin token.
7. Listings page shows skeletons while loading, an empty state when filters match nothing, and an error state when the API is down.
8. Layout has no horizontal scroll at 375px width.
9. Fresh clone: README steps (`createdb`, `.env`, `migrate`, `seed`, `npm run dev`) yield a working app with 8 seeded properties.
10. Each backend test states `protects / fails_when / no_claim`.

## Testing plan
| Layer | What | Count |
|---|---|---|
| Unit | zod schemas (price, email, phone, required) | +6 |
| Integration (API, real Postgres test run via `node --test` + supertest-style fetch) | filters/sort, CRUD, auth gate, inquiry create + list, cascade delete | +8 |
| Manual E2E in browser | buyer journey, admin journey, 375px width | 2 flows |

## Files
`SPEC.md`, `README.md`, `AI_USAGE.md`, `server/{package.json,.env.example,db/{schema.sql,migrate.js,seed.js},src/{index.js,app.js,db.js,auth.js,validation.js,routes/*},test/*}`, `client/{vite.config.js,src/{main.jsx,App.jsx,api.js,lib/format.js,pages/*,components/*}}`.

## Build order and commits
1 spec → 2 server scaffold + schema + seed → 3 properties API + validation → 4 auth + inquiries API → 5 API tests → 6 client scaffold + listings → 7 detail + inquiry form → 8 admin login/dashboard/forms → 9 README + AI_USAGE → verify. One commit per step.

## Rollback
Greenfield: delete the folder; `dropdb whitelotus`.

## Out of scope
Inquiry status/assignment, email notifications, image upload, pagination, multiple admin users/roles, deployment (bonus), i18n.

## Effort (approx.)
2h API + schema, 1h tests, 3h client, 0.5h docs, 0.5h verification.
