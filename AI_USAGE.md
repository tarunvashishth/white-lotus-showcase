# AI usage

I used Claude Code throughout.

- Planning: wrote the plan in `SPEC.md` first (API, data model, validation rules, what to leave out), then built to it.
- Code: generated the Express API, SQL schema and seed, React pages and tests, one commit per piece.
- Review: ran the tests against a real Postgres database and clicked through the app. That caught a bug where a blank Bedrooms field was saved as 0, which I fixed and added a test for.
