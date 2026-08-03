# Environment Variables

| Name | Required | Purpose |
| --- | --- | --- |
| `POSTGRES_URL` | No | Neon / Vercel Postgres connection. Empty uses in-memory fallback. |
| `JWT_SECRET` | Production yes | Email auth JWT signing secret. |
| `GEMINI_API_KEY` | No | Enables `/api/analyze`. |
| `LINE_CHANNEL_ACCESS_TOKEN` | No | Enables LINE push notification. |
| `NEXT_PUBLIC_LIFF_ID_EXAMPLE` | No | Example module LIFF route. |
