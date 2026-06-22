# JobMatch AI — Backend

NestJS API with Prisma and PostgreSQL.

## Database setup

Configure the connection in `.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/jobmatch?schema=public"
SEED_ON_STARTUP=true
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to create or update the platform admin on each seed run (including startup). The password hash is refreshed whenever the env value changes.

### First-time schema

```bash
npm install
npm run db:setup
```

This runs `prisma generate`, `db push`, and a one-off seed.

### Auto-seed on backend start

Every time the backend starts, it **re-runs an idempotent seed** (upserts demo data). This is enabled by default (`SEED_ON_STARTUP=true`). Set `SEED_ON_STARTUP=false` only if you want to skip seeding.

Seeded data includes:

| Entity | Count (approx.) |
|--------|-----------------|
| Users | 23 (1 admin from env, 8 employers, 14 job seekers) |
| Jobs | 25 (published, draft, pending, closed, rejected) |
| Applications | 28 |
| Training courses | 21 |
| Notifications | 21 |
| Chat threads & messages | 7 threads, 16 messages |
| Coach messages | 10 (career coach history for demo seekers) |
| Audit logs | 9 |

### Run the API

```bash
npm run start:dev
```

API: `http://localhost:3000/api`  
Swagger: `http://localhost:3000/api/docs`

### Demo logins (password `11111111` unless noted)

| Role | Email |
|------|-------|
| Admin | Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in env (upserted on each seed) |
| Employer | employer@gmail.com (Atlantic Tech) |
| Job seeker | bah@gmail.com |
| Job seeker | fatou@gmail.com |
| Pending employer | pending@company.gm (awaiting approval) |

More seeded employers: `tourism@gambia.gm`, `hr@banjulfinance.gm`, `careers@kotudigital.gm`, etc.  
More seekers: `mariama@gmail.com`, `omar@gmail.com`, `aisha@gmail.com`, and others in `prisma/seed-data.ts`.
