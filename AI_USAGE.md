# AI usage

Tool: Claude Code, used for the whole build. I started from the assignment PDF, asked for a spec first (`SPEC.md`), approved it, then had the code built to it one piece at a time.

## Task prompts

These are the instructions each piece of work was built from, written out per task. They are condensed from `SPEC.md`, not a verbatim chat log.

1. **Spec.** Read the assignment and write a spec covering stack, API, data model, validation rules, pages, acceptance criteria and what is out of scope.
2. **Database.** Write a PostgreSQL schema for properties and inquiries with `CHECK` constraints (positive price and size, non-empty text), an inquiry foreign key that cascades on delete, and a migrate script. Add a seed script with 8 Bengaluru properties and 2 inquiries.
3. **API.** Build an Express API: list properties with location, minimum bedrooms, price range, search and sort filters; get one; create, update and delete behind admin auth; a public inquiry endpoint; an admin inquiry list joined with the property name. Validate with zod and return per-field errors. Use parameterised SQL and map sort keys from a fixed list.
4. **Auth.** Add a login endpoint that checks a shared password from env and returns an 8-hour JWT, and middleware that guards the admin routes.
5. **Tests.** Write integration tests against a separate Postgres database for auth, validation, CRUD, filters and sort, inquiry creation and listing, and cascade delete.
6. **Listings page.** Build a React grid of property cards with search, location, bedrooms, price range and sort. Keep filters in the URL. Show loading skeletons, an empty state and an error state with retry.
7. **Detail page.** Show a gallery, specs and description, with an inquiry form that shows server validation errors next to each field and a confirmation after sending.
8. **Admin.** Build a login page, a dashboard with properties and inquiries tabs, delete with confirmation, and one shared add/edit form. Redirect to login without a token.
9. **Docs.** Write the README with setup steps, design decisions and next steps, then shorten the docs and remove filler.

## Follow-up corrections

- A blank Bedrooms field was being saved as 0. Reject blank numeric fields and add a test.
- The first version of that fix broke the price validation. The tests caught it and the helper was reworked.
- Remove the AI co-author line from the commit messages.

## What the AI did not do

Push to GitHub, deploy, or manually test edit and delete through the UI.
