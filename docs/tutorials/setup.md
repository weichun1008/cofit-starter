# Local Setup

## Requirements

- Node.js 24
- npm
- Git

## Steps

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open <http://localhost:3000>.

`POSTGRES_URL` can stay empty for local prototype work. The starter uses in-memory fallback when Postgres is not configured.
