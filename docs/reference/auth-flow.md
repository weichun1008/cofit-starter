# Auth Flow

The starter supports:

- email/password auth through JWT cookies
- LINE user identity through LIFF profile
- anonymous fallback identity through a generated cookie UUID

User identity is resolved in `src/app/lib/userId.js`.

Auth route handlers live under `src/app/api/auth/*`.
