# AI usage

Tool: Claude Code, used for the whole build.

## Prompts

1. Attached the assignment PDF with no other text.
2. "use spec driven development"
3. "decide whats best" (in reply to Claude's questions about admin auth, stack, currency, scope and git)
4. "Approve, build" (after reviewing `SPEC.md`)
5. "claude as author should be not there and no AI SLOP in code and in .mds"
6. "in ai usage add the prompts and actions took by AI."

## What the AI did

**Planning**
- Read the assignment PDF and asked questions about admin auth, stack, currency, images, scope and git.
- Chose the stack and the cuts when asked to decide, and wrote them into `SPEC.md` (API, validation rules, pages, acceptance criteria, out of scope). I reviewed and approved it before any code.

**Backend**
- Wrote `server/db/schema.sql`, the migrate and seed scripts, the Express app, property and inquiry routes, zod validation and the shared-password JWT auth.
- Wrote 6 integration tests that run against a separate Postgres database.

**Frontend**
- Scaffolded Vite with Tailwind and React Router.
- Wrote the listings page with filters and sort kept in the URL, the detail page with the inquiry form, admin login, the dashboard with properties and inquiries tables, and the add/edit form.

**Checking**
- Ran the tests and drove the running app in a browser: filters and sort, inquiry validation and submit, admin login redirect, the inquiry list, add-form validation, and a 375px mobile width.
- Found that a blank Bedrooms field was saved as 0. Fixed it and added a test.
- Fixed a first version of that fix that broke `.positive()` on the price field; the tests caught it.

**Git and docs**
- Made the commits in small steps, then rewrote the commit messages to remove the AI co-author line.
- Wrote `README.md` and this file, then shortened all three docs after the request to remove filler.

Not done by the AI: pushing to GitHub, deployment, and manually testing edit and delete in the UI.
