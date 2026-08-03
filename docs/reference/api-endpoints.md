# API Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/setup` | Create starter tables and seed modules. |
| `GET /api/modules` | List active modules. |
| `GET /api/hq/modules` | Admin module list. |
| `PATCH /api/hq/modules/:id` | Toggle/update a module. |
| `POST /api/analyze` | Optional Gemini analysis endpoint. |
| `POST /api/notify` | Optional LINE notification endpoint. |
| `/api/auth/*` | Email and session auth. |
| `/api/items` | Starter example CRUD. |
