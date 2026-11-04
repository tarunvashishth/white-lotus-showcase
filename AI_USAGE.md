# AI usage

**Tool:** Claude Code (Claude Sonnet 5.5), used throughout.

## How it was used
- **Spec first.** I had Claude interrogate the assignment and produce [SPEC.md](SPEC.md) (decisions, API, data model, acceptance criteria, scope cuts) before any code was written. The spec was reviewed and approved before building.
- **Scaffolding and implementation.** Claude generated the Express API, SQL schema and seed, the React pages and the integration tests, following the spec, one slice per commit.
- **Verification.** Tests were run against a real Postgres database, and the app was driven in a browser: filters/sort, inquiry validation and submit, admin login redirect, inquiry list, and add-form validation.

## Where the generated code was reviewed and corrected
- **Zod v4 behaviour.** An initial `coerce.number` turned a blank Bedrooms field into `0`, silently accepting it. Found while testing the admin form; fixed by treating blank/null as missing, with a regression assertion in the tests.
- **Helper typing.** The first fix broke `.positive()` chaining (a preprocess wrapper has no number methods); the tests caught it and the helper was restructured.
- **Search escaping.** `ILIKE` wildcards (`%`, `_`) in user search text are escaped and covered by a test.
- **Scope.** Nice-to-haves (inquiry status, uploads, pagination, deployment) were deliberately left out and listed in the README.

## Things I'd want to be able to explain in a walkthrough
Why validation lives on the server with DB constraints as a backstop; why filters are server-side query params and kept in the URL; how the shared-password JWT works and its limits; why `BIGINT` prices are parsed to numbers; and the cascade-delete behaviour of inquiries.
