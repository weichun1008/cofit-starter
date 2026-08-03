# Add a Module

The starter follows the pattern: platform chassis plus feature modules.

## Steps

1. Copy `src/app/(services)/example` to `src/app/(services)/<module>`. This brings
   `page.js`, `schema.js`, `error.js`, and `loading.js` along with it — keep all four.
2. Copy `src/app/api/items` to `src/app/api/<resource>`.
3. Rewrite `schema.js` for your fields. The API and the form share it, so validation
   rules cannot drift apart.
4. Add table and CRUD functions in `src/app/lib/db.js`.
5. Add i18n strings in `src/app/lib/i18n/*.json`.
6. Register the module in `src/app/api/setup/route.js`.
7. Add navigation or LIFF route in `src/app/lib/config.js`.
8. Update `docs/reference/module-map.md`.

## API route conventions

Every domain route does three things:

1. Validate input with `schema.parse()` — it throws, and the catch turns it into a 400.
2. Resolve the caller with `getUserId()` (lenient) or `getAuthenticatedUserId()` (strict).
3. Wrap the handler in `try/catch` and hand errors to `toErrorResponse()`.

## Which user-identity helper?

| Helper | Behavior | Use for |
| --- | --- | --- |
| `getUserId()` | Always returns an ID, minting a fresh UUID when nothing is present | Demos, prototypes, anything without personal data |
| `getAuthenticatedUserId()` | Only trusts a verified JWT, throws `UnauthorizedError` otherwise | Anything storing real user data |

The lenient helper cannot tell a real login from a client-supplied ID, so treating it as
an identity guard is how you get an IDOR hole. See the header comment in
`src/app/lib/userId.js`.

Keep product-specific logic inside the module. Avoid changing the chassis unless the change benefits all future projects.
