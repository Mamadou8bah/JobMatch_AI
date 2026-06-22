# JobMatch AI — Mobile App (Job Seekers)

React Native / Expo mobile app for **job seekers only**, with a glassmorphism UI inspired by modern job-search apps.

## Features

- Splash screen + auth (login / register)
- Home feed with AI-ranked job cards, search, save jobs
- Applications tracker
- Employer messaging
- Explore hub (training + AI coach)
- Profile editing
- Notifications
- Job detail + apply with cover letter
- AI career coach chat
- AI learning roadmap + training courses
- Demo mode (works without backend)

## Demo login

- **Email:** `bah@gmail.com`
- **Password:** `11111111`

## Setup

```bash
cd mobile-app
npm install
npm start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

## Backend API

Set your API URL before starting:

```bash
# Windows PowerShell
$env:EXPO_PUBLIC_API_URL="http://YOUR_IP:3000/api"
npm start
```

- Android emulator: `http://10.0.2.2:3000/api`
- iOS simulator: `http://localhost:3000/api`
- Physical device: use your computer's LAN IP

If the backend is unavailable, demo login still works with local mock data.

## Project structure

```
mobile-app/
  app/              Expo Router screens
  components/       Glass UI + job cards
  context/          Auth provider
  services/         API + demo mode
  constants/        Theme tokens
  assets/           App icon + splash
```

## Design

- Soft blue gradient background
- Frosted glass search/header elements
- Floating pill bottom navigation
- White rounded job cards with match scores and CTA buttons
