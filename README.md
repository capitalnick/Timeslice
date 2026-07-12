# TimeSlice

A personal time-tracking PWA. Log your day in **15-minute increments** across
**editable three-level categories** (e.g. `Work › Meetings › Standup`), track
live with a timer, and review **weekly reports** with a per-category breakdown.
Your data syncs privately to your Google account via Firebase.

- **Manual + timer entry** — log a duration in 15-minute steps, or run a live
  timer that rounds to the nearest 15 minutes when you stop it.
- **Three category levels**, fully editable in-app (add, rename, recolour,
  reorder, archive, delete).
- **Weekly view** with day-by-day columns, category drill-down, and CSV export.
- **Installable + offline** — works as a home-screen app; Firestore caches your
  data locally and syncs when you're back online.

## Tech

React 19 · Vite 6 · TypeScript · Tailwind CSS v4 · Firebase (Auth + Firestore) ·
vite-plugin-pwa · deployed on Vercel.

## Prerequisites

- Node.js 20+ and npm
- A Google account (for Firebase and sign-in)

## 1. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) and
   **Add project**.
2. **Build → Authentication → Get started → Sign-in method** and enable
   **Google**.
3. **Build → Firestore Database → Create database** (Production mode is fine —
   rules are included in this repo).
4. **Project settings → General → Your apps → Web (`</>`)** to register a web
   app and copy the config values.

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values from the Firebase web app
config:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

If these are missing the app shows a friendly “Almost there” setup screen
instead of a blank page.

## 3. Install and run

```bash
npm install
npm run gen:icons   # generate PWA PNG icons (one-time; commit the output)
npm run dev         # http://localhost:5173
```

Other scripts:

```bash
npm run typecheck   # tsc project references
npm run build       # type-check + production build to dist/
npm run preview     # preview the production build
```

## 4. Deploy the Firestore security rules

The included `firestore.rules` restrict every document to its owner. Deploy them
with the Firebase CLI:

```bash
npm i -g firebase-tools
firebase login
firebase use your-project
firebase deploy --only firestore:rules
```

## 5. Deploy to Vercel

1. Push this repo to GitHub and **Import** it in Vercel.
2. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
3. Add the six `VITE_FIREBASE_*` variables under **Settings → Environment
   Variables**.
4. Deploy. After you know your production domain, add it under **Firebase →
   Authentication → Settings → Authorized domains** so Google sign-in works.

`vercel.json` already rewrites all routes to `index.html` for the SPA.

## Data model

Firestore, namespaced per user:

```
users/{uid}/categories/{id}   { name, level (1|2|3), parentId, color, order, archived, createdAt }
users/{uid}/entries/{id}      { categoryId, minutes (×15), note, date "yyyy-MM-dd", source, createdAt }
users/{uid}/meta/settings     { weekStartsOn }
users/{uid}/meta/timer        { categoryId, startedAt, note }   // present only while a timer runs
```

## Project structure

```
src/
├── components/   # UI primitives (ui/), track/, categories/, reports/, shell + nav
├── context/      # AuthContext, DataContext (live data + mutations), NavContext
├── services/     # Firestore reads/writes (categories, entries, meta, seed)
├── screens/      # Track, Reports, Categories, Settings, SignIn, SetupNeeded
├── lib/          # pure helpers: time (15-min math), week, tree, report, colors
├── hooks/        # useNow, useInstallPrompt
└── firebase.ts   # Firebase init + offline cache
```
