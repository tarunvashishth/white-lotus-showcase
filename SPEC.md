# Spec: Property Showcase & Inquiry Manager

Source: White Lotus Group full-stack assignment. Built to this document.

## Goal

A tool where buyers browse and filter luxury properties in Bengaluru and send inquiries, and the sales team (admin) manages listings and reads inquiries.

## Stack

- Frontend: React (Vite), Tailwind, React Router
- Backend: Node, Express, `pg` with plain SQL, zod for validation
- Database: PostgreSQL, schema in `server/db/schema.sql`
- Admin auth: one shared password (`ADMIN_PASSWORD`) returning an 8-hour JWT. It protects property writes and the inquiry list.
- Prices in INR, stored as `BIGINT`, shown as ₹ Cr / ₹ L. Images are URLs, no uploads.

## API

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/properties` | no | Filters: `location`, `bedrooms` (minimum), `minPrice`, `maxPrice`, `q`. Sort: `newest`, `price_asc`, `price_desc`, `size_desc`, `bedrooms_desc` |
| GET | `/api/properties/locations` | no | Distinct locations |
| GET | `/api/properties/:id` | no | 404 if missing |
| POST | `/api/properties` | admin | 201, or 400 with per-field errors |
| PUT | `/api/properties/:id` | admin | |
| DELETE | `/api/properties/:id` | admin | Deletes its inquiries too |
| POST | `/api/properties/:id/inquiries` | no | 201, 400, or 404 |
| GET | `/api/inquiries` | admin | Includes the property name |
| POST | `/api/auth/login` | no | `{ password }` returns `{ token }` |

Errors: `{ "error": string, "fields"?: { [field]: string } }`.

## Validation

- Property: name, location and short description required. Price and size are positive whole numbers. Bedrooms 0 to 30. Images must be valid URLs.
- Inquiry: name and message required, valid email, phone of 7 to 20 digits (spaces, `+`, `-`, `()` allowed).
- Blank numeric fields are rejected, not treated as 0.

## Pages

- `/`: property grid with search, location, bedrooms, price range and sort. Loading, empty and error states.
- `/properties/:id`: details, gallery, inquiry form with inline errors and a success message.
- `/admin/login`, `/admin`: properties table (add, edit, delete with confirmation) and inquiries table.
- `/admin/properties/new`, `/admin/properties/:id/edit`: one shared form.

## Acceptance criteria

1. `GET /api/properties?bedrooms=4&sort=price_asc` returns only properties with 4+ bedrooms, cheapest first.
2. Creating a property with price 0 or negative returns 400 with a `price` error and stores nothing. Without a token it returns 401.
3. Deleting a property removes its inquiries. Deleting it again returns 404.
4. A valid inquiry is stored against the right property and shows in the admin inquiries table with that property's name.
5. An invalid inquiry returns 400 with per-field errors and stores nothing.
6. `GET /api/inquiries` returns 401 without a token.
7. The listing page shows loading, empty and error states.
8. No horizontal page scroll at 375px width.
9. After `createdb`, `.env`, `migrate`, `seed` and `npm run dev`, the app works with 8 seeded properties.

## Out of scope

Inquiry status, email notifications, image upload, pagination, multiple admin users, deployment.
