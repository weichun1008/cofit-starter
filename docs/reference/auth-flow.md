# Auth Flow

The starter supports:

- email/password auth through JWT cookies
- LINE user identity through LIFF profile
- anonymous fallback identity through a generated cookie UUID

Auth route handlers live under `src/app/api/auth/*`.

## Identity resolution

The precedence logic is a pure function in `src/app/lib/resolveUserId.js` (no
`next/headers` import, so it is unit-testable — see `test/resolveUserId.test.js`).
`src/app/lib/userId.js` wraps it with the real cookie store.

Resolution order, with the `source` each step reports:

| Order | Cookie | `source` | Trustworthy? |
| --- | --- | --- | --- |
| 1 | `auth_token` (JWT, verified) | `jwt` | Yes — the only trustworthy identity |
| 2 | `line_user_id` (written by LIFF) | `line` | No — not verified by this app |
| 3 | `supplement_user_id` (anonymous) | `anon` | No — `httpOnly: false`, client-writable |
| 4 | none | `generated` | No — a brand new UUID |

A JWT that fails verification falls through to step 2 rather than being trusted.

## Two helpers, two guarantees

| Helper | Behavior | Use for |
| --- | --- | --- |
| `getUserId()` | Always returns an ID, minting a UUID when nothing is present | Demos, prototypes, features with no personal data |
| `getAuthenticatedUserId()` | Returns an ID only for `source === 'jwt'`, otherwise throws `UnauthorizedError` | Any route storing real user data |

`getUserId()` cannot distinguish a real login from a client-supplied ID, because the
anonymous cookie is readable and writable from the browser. That is a deliberate
low-friction choice for prototypes, but using it to guard real user data is how you
ship an IDOR hole. Routes must choose explicitly.

`UnauthorizedError` lives in `src/app/lib/apiError.js`; `toErrorResponse()` maps it to
a 401 (and a `ZodError` to a 400).

## Known limitation

The anonymous cookie is named `supplement_user_id`, inherited from the project this
chassis was extracted from. Renaming it is a one-line change in
`src/app/lib/resolveUserId.js`, but existing anonymous data will no longer match.
