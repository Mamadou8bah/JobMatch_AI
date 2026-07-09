# JobMatch AI — Mobile App (Job Seekers)

React Native / Expo mobile app for **job seekers**, with a clean green Stitch-inspired UI.

## Screens

| Area | Screens |
|------|---------|
| Auth | Onboarding, Login, Register, Forgot password, Upload resume |
| Main tabs | Home, Messages, AI Coach, Profile |
| Jobs | Job detail, Apply, Saved jobs, Companies |
| Career | Applications (with filters), Training, Explore hub |
| Other | Notifications |

## Features

- Onboarding flow for first-time users
- Home feed with AI-ranked jobs, search, save jobs, featured companies
- Job detail with match score, skills gap, course recommendations
- Apply with optional cover letter
- Applications tracker with status filters (All / Shortlisted / Interviews)
- Employer messaging
- AI career coach chat (persisted)
- Training courses + AI learning roadmap
- Profile editing, CV upload, skills management
- Notifications
- Sign-out confirmation

## Setup

```bash
cd mobile-app
npm install
npm start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

## Backend API

Production API (default in `services/api.js`):

`https://jobmatchgambia.onrender.com/api`

Override for local development:

```bash
# Windows PowerShell
$env:EXPO_PUBLIC_API_URL="http://YOUR_IP:3000/api"
npm start
```

- Android emulator: `http://10.0.2.2:3000/api`
- iOS simulator: `http://localhost:3000/api`
- Physical device: use your computer's LAN IP

## Project structure

```
mobile-app/
  app/              Expo Router screens
  components/       Shared UI (JobCard, ScreenHeader, etc.)
  hooks/            useSavedJobs
  context/          Auth provider
  services/         API + AsyncStorage
  constants/        Theme tokens
  assets/           App icon + splash
```

## Design

- Light green palette (`#1B6B45`) on `#F4F6F5` background
- White rounded cards with match rings
- Floating pill bottom navigation (Home, Messages, AI Bot, Profile)

---

## Deployment: EAS Update + EAS Build (free tier)

### Current setup

| Mode | Status |
|------|--------|
| **Development** | Expo Go (`npm start` + QR scan) |
| **Production OTA** | Configured — needs one-time EAS link + first APK build |

**Expo Go does not receive EAS Updates.** OTA only works on a **standalone APK/AAB** built with `expo-updates` (included in this project).

Native changes (new native modules, permissions, SDK upgrade, icon/splash) require a **new build**, not just `eas update`.

### One-time setup

```bash
npm install -g eas-cli
eas login
cd mobile-app
eas init          # links project → writes projectId into app.config.js
```

Create an [Expo access token](https://expo.dev/accounts/[account]/settings/access-tokens) and add it to GitHub:

**Repository → Settings → Secrets → `EXPO_TOKEN`**

### First production APK (required before OTA)

```bash
cd mobile-app
npm run eas:build:android
```

Or trigger **EAS Build (Android APK)** from GitHub Actions (manual workflow).

Download the APK from the Expo dashboard and distribute via Firebase App Distribution, Uptodown, or direct install.

### Push JavaScript updates (OTA)

After the first APK is installed on devices:

```bash
npm run eas:update
```

Or push to `main` — GitHub Actions runs `eas update` automatically when `mobile-app/` changes.

### Workflow summary

```
JS/UI changes only          →  git push main  →  EAS Update  →  users get update
Native changes (permissions, SDK, new modules)  →  eas build  →  new APK
```

### npm scripts

| Script | Command |
|--------|---------|
| `npm run eas:init` | Link project to Expo |
| `npm run eas:update` | OTA to `production` branch |
| `npm run eas:update:preview` | OTA to `preview` branch |
| `npm run eas:build:android` | Production APK |
| `npm run eas:build:android:preview` | Preview/internal APK |

### Files

- `eas.json` — build profiles (`development`, `preview`, `production`) + update channels
- `app.config.js` — runtime version + EAS Update URL
- `.github/workflows/eas-update.yml` — auto OTA on push to `main`
- `.github/workflows/eas-build-android.yml` — manual APK build
