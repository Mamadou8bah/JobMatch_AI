# JobMatch AI — Backend

NestJS API with Prisma and PostgreSQL.

## Database setup

Configure the connection in `.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/jobmatch?schema=public"
SEED_ON_STARTUP=true
```

### First-time schema

```bash
npm install
npm run db:setup
```

This runs `prisma generate`, `db push`, and a one-off seed.

### Auto-seed on backend start

Every time you run `npm run start:dev`, the backend **re-runs an idempotent seed** (upserts demo data). Set `SEED_ON_STARTUP=false` in production.

Seeded data includes:

| Entity | Count (approx.) |
|--------|-----------------|
| Users | 24 (2 admins, 8 employers, 14 job seekers) |
| Jobs | 25 (published, draft, pending, closed, rejected) |
| Applications | 28 |
| Training courses | 21 |
| Notifications | 15 |
| Chat threads & messages | 3 threads, 7 messages |
| Audit logs | 6 |

### Run the API

```bash
npm run start:dev
```

API: `http://localhost:3000/api`  
Swagger: `http://localhost:3000/api/docs`

### Demo logins (password `11111111` unless noted)

| Role | Email |
|------|-------|
| Admin | admin@jobmatch.ai (`Admin12345!`) or admin@gmail.com |
| Employer | employer@gmail.com (Atlantic Tech) |
| Job seeker | bah@gmail.com |
| Job seeker | fatou@gmail.com |
| Pending employer | pending@company.gm (awaiting approval) |

More seeded employers: `tourism@gambia.gm`, `hr@banjulfinance.gm`, `careers@kotudigital.gm`, etc.  
More seekers: `mariama@gmail.com`, `omar@gmail.com`, `aisha@gmail.com`, and others in `prisma/seed-data.ts`.
