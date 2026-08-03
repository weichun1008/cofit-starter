# CLAUDE.md

This file is the source of truth for Claude Code / Gemini CLI / Codex when working on this repo.

> Cofit Starter is the lightweight LINE / Web multi-module chassis for new Cofit prototypes and small apps.

## Communication

- Use Traditional Chinese for product discussion and handoff notes.
- Use concise English names for code identifiers, file names, branches, commits, and schemas.
- Do not commit or push unless explicitly asked.
- Do not use `--no-verify`.

## Starter Philosophy

- Keep this repo lightweight and easy to copy.
- Do not turn this starter into a heavy monorepo by default.
- Preserve optional integrations: missing env vars should disable features instead of breaking local startup.
- Keep the chassis stable: auth, DB fallback, user identity, LIFF, i18n, AI analyze endpoint, LINE notify, module system.
- Add product-specific logic as modules, not as changes to the chassis.

## Module Pattern

New feature equals:

1. A page under `src/app/(services)/<module>`, with `schema.js`, `error.js`, and
   `loading.js` alongside it.
2. Matching API routes under `src/app/api/<resource>`.
3. Domain table and CRUD helpers in `src/app/lib/db.js`.
4. i18n entries in `src/app/lib/i18n/*.json`.
5. Module registration in `src/app/api/setup/route.js`.
6. Navigation / LIFF config in `src/app/lib/config.js`.

## API Route Rules

- Validate every request body with a zod schema from the module's `schema.js`.
  Never trust an unvalidated `await request.json()`.
- Keep one schema per domain shared by the API and the form, so validation rules
  cannot drift apart.
- Wrap handlers in `try/catch` and return `toErrorResponse(error)` from
  `src/app/lib/apiError.js`. Do not hand-roll status codes for auth or validation errors.
- Pick the right identity helper from `src/app/lib/userId.js`:
  - `getUserId()` is lenient and always returns an ID. Demos and prototypes only.
  - `getAuthenticatedUserId()` only trusts a verified JWT. Required for any route
    that stores real user data.
  - The lenient helper cannot distinguish a real login from a client-supplied ID.
    Treating it as an identity guard is how you ship an IDOR hole.

## Documentation Rules

Update documentation when changing related behavior:

| Change | Update |
| --- | --- |
| New module | `docs/how-to/add-a-module.md`, `docs/reference/module-map.md` |
| API endpoint | `docs/reference/api-endpoints.md` |
| Auth or user identity flow | `docs/reference/auth-flow.md` |
| Env vars | `.env.example`, `docs/reference/env-vars.md` |
| Architecture change | `docs/explanation/architecture-overview.md` |

## Engineering Rules

- Run `npm run lint`, `npm test`, and `npm run build` before claiming code is verified.
  CI runs the same three on every PR.
- This starter intentionally uses npm + JavaScript for lower setup friction. There is
  no TypeScript and no `type-check` script — do not add a placeholder script that
  always exits 0, because CI would then report a green check for work it never did.
- Tests are required for the chassis (`src/app/lib/*`) and optional for domain modules.
  A chassis bug is inherited by every downstream project; module code is throwaway
  prototype work and should stay fast to write.
- The chassis data layer has two paths (in-memory and Postgres). Any change to one
  must keep the other behaviorally identical, and needs a test in `test/db.test.js`.
- Promote a downstream project to `create-cofit-repo` monorepo only when it needs independent backend, worker, shared packages, or e2e release gates.

## Git Rules

- Use PRs for changes to `main`.
- Prefer conventional commits: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`.
- Keep PRs focused.
