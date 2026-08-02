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

More seeded employers: `tourism@africa.example`, `hr@banjulfinance.gm`, `careers@kotudigital.gm`, etc.  
More seekers: `mariama@gmail.com`, `omar@gmail.com`, `aisha@gmail.com`, and others in `prisma/seed-data.ts`.

### Profile pictures (Cloudinary)

Profile picture uploads use Cloudinary. Add to `.env` (see `.env.example`):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_AVATAR_FOLDER=jobmatch/avatars
```

Endpoints:

- `POST /api/users/me/avatar` — multipart field `file` (JPEG, PNG, WebP, max 2MB)
- `DELETE /api/users/me/avatar` — remove picture

### Freemium + ModemPay

Premium subscriptions are billed in **GMD** via ModemPay Payment Intents + webhooks.

```env
MODEMPAY_SECRET_KEY=sk_live_...
MODEMPAY_CALLBACK_URL=https://jobmatchgambia.onrender.com/api/billing/webhook/modempay
API_PUBLIC_URL=https://jobmatchgambia.onrender.com
FRONTEND_URL=https://jobmatchgambia.vercel.app
```

**JobMatch does not need a global webhook in the ModemPay dashboard.** Each checkout includes a `callback_url` pointing at:

`https://jobmatchgambia.onrender.com/api/billing/webhook/modempay`

If you share one ModemPay account with **ITCA Hub**, leave the dashboard **Webhooks** URL on ITCA Hub only:

`https://itca-hub-backend-2p7j.onrender.com/api/webhooks/modempay`

Payment events for JobMatch Premium still arrive via `callback_url` on each JobMatch checkout.

| Audience | Monthly | Yearly |
|----------|---------|--------|
| Job seeker | 150 GMD | 1,500 GMD |
| Employer | 500 GMD | 5,000 GMD |
| Training provider | 300 GMD | 3,000 GMD |

**Free vs Premium (MVP gates):**

| Feature | Free | Premium |
|---------|------|---------|
| AI Coach | 5 msgs/day | Unlimited |
| Learning roadmap | Locked | Unlimited |
| Exact match % / skill gaps | Match band only | Full details |
| Personalized course recs | Locked | Included |
| Employer job posts | 2 active | Unlimited |
| AI candidate ranking | Top 3 | Full list |
| Employer analytics | Locked | Included |
| Priority job listing | No | Yes |
| Provider course listings | 2 active | Unlimited + featured |

Training providers register like employers (approval required), manage courses at `/provider`, and upgrade for featured placement.

Demo seed accounts (password `11111111`):

- `premium@gmail.com` — premium job seeker
- `employer@gmail.com` — premium employer (Atlantic Tech)
- `provider@gmail.com` — free training provider (2 courses)

API:

- `GET /api/billing/plans`
- `GET /api/billing/me`
- `POST /api/billing/checkout` `{ interval: "monthly"|"yearly" }`
- `POST /api/billing/confirm` `{ paymentIntentId }`
- `POST /api/billing/webhook/modempay`
- Provider: `GET/POST /api/training/mine`, patch/delete owned courses