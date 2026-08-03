# Add a Module

The starter follows the pattern: platform chassis plus feature modules.

## Steps

1. Copy `src/app/(services)/example` to `src/app/(services)/<module>`.
2. Copy `src/app/api/items` to `src/app/api/<resource>`.
3. Add table and CRUD functions in `src/app/lib/db.js`.
4. Add i18n strings in `src/app/lib/i18n/*.json`.
5. Register the module in `src/app/api/setup/route.js`.
6. Add navigation or LIFF route in `src/app/lib/config.js`.
7. Update `docs/reference/module-map.md`.

Keep product-specific logic inside the module. Avoid changing the chassis unless the change benefits all future projects.
