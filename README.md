# Kujuana — Dating with Intention 💍

> Premium matchmaking platform for Kenya and global markets. Three-tier system: Standard (free), Priority (pay-per-match), and VIP (monthly curated). Built as a full-stack monorepo with web, mobile, and API.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![React Native](https://img.shields.io/badge/React_Native-Expo_51-0175C2?logo=expo)](https://expo.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://cloud.mongodb.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-Private-red)](#)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Apps](#apps)
   - [API — apps/api](#api--appsapi)
   - [Web — apps/web](#web--appsweb)
   - [Mobile — apps/mobile](#mobile--appsmobile)
8. [Database](#database)
9. [Matching Engine](#matching-engine)
10. [Subscription Tiers](#subscription-tiers)
11. [Payment Integration](#payment-integration)
12. [API Reference](#api-reference)
13. [Authentication](#authentication)
14. [File Uploads](#file-uploads)
15. [Admin & Matchmaker Portal](#admin--matchmaker-portal)
16. [Testing](#testing)
17. [Deployment](#deployment)
18. [CI/CD](#cicd)
19. [Security](#security)
20. [Contributing](#contributing)

---

## Overview

Kujuana (`/ku-jua-na/` — Swahili: *to know each other*) is a premium intentional dating platform serving Kenya and the global diaspora. Unlike swipe-based apps, Kujuana operates on a **curated matchmaking model** where compatibility is algorithmically scored and human matchmakers review VIP introductions.

### Core Features

- **Three-tier matching system**: Standard (free/slow), Priority (instant/paid), VIP (curated/monthly)
- **Six-step onboarding**: Basic details → Background & lifestyle → Photos → Relationship vision → Matching preferences → Plan selection
- **Compatibility engine**: Weighted scoring across relationship goals, values, lifestyle, preferences, and emotional readiness
- **Kenya-first payments**: M-Pesa STK Push via Daraja API, Pesapal, Flutterwave for global
- **Privacy-first photos**: Private Cloudinary storage, signed time-expiring URLs, never publicly accessible
- **VIP sensitive handling**: AES-256-GCM field-level encryption for health status, income, and other confidential details
- **Admin/matchmaker portal**: Queue management, manual introductions, member oversight

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     KUJUANA PLATFORM                     │
│                                                         │
│   ┌──────────────┐    ┌──────────────────────────────┐  │
│   │  React Native │    │        Next.js 14 Web        │  │
│   │  Expo SDK 51  │    │   (App Router + Tailwind)    │  │
│   │  Expo Router  │    │                              │  │
│   └──────┬───────┘    └──────────────┬───────────────┘  │
│          │                           │                   │
│          └──────────────┬────────────┘                   │
│                         │ HTTPS / REST                   │
│                         ▼                               │
│          ┌──────────────────────────────┐               │
│          │    Express.js API (Node 20)   │               │
│          │    TypeScript · BullMQ        │               │
│          │    Rate Limiting · JWT Auth   │               │
│          └──┬───────────┬───────────┬──┘               │
│             │           │           │                   │
│             ▼           ▼           ▼                   │
│    ┌──────────────┐ ┌───────┐ ┌──────────┐             │
│    │ MongoDB Atlas │ │ Redis │ │Cloudinary│             │
│    │  + Atlas      │ │Upstash│ │ Private  │             │
│    │    Search     │ │BullMQ │ │ Photos   │             │
│    └──────────────┘ └───────┘ └──────────┘             │
│                                                         │
│    Payments: M-Pesa Daraja · Pesapal · Flutterwave      │
│    Email: Resend · Notifications: Expo Push API         │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend Web** | Next.js (App Router) + TypeScript | 14.x |
| **Web Styling** | Tailwind CSS + shadcn/ui | 3.x |
| **Web State** | Zustand + TanStack Query | v4 / v5 |
| **Mobile** | React Native + Expo | SDK 51 |
| **Mobile Navigation** | Expo Router | v3 |
| **Backend** | Node.js + Express.js + TypeScript | 20.x / 4.x |
| **Database** | MongoDB Atlas + Mongoose ODM | 8.x |
| **Cache / Queue** | Redis (Upstash) + BullMQ | 5.x |
| **Auth** | JWT (access + refresh) + bcryptjs | — |
| **Validation** | Zod | 3.x |
| **File Storage** | Cloudinary | 2.x |
| **Payments (Kenya)** | Pesapal v3 + M-Pesa Daraja API | — |
| **Payments (Global)** | Flutterwave | v3 |
| **Email** | Resend + React Email | 3.x |
| **Testing** | Vitest + Supertest + Testing Library | 1.x |
| **Monorepo** | pnpm workspaces + Turborepo | — |
| **Deploy Web** | Vercel | — |
| **Deploy API** | Railway | — |
| **Deploy Mobile** | Expo EAS Build + EAS Submit | — |
| **CI/CD** | GitHub Actions | — |

---

## Project Structure

```
kujuana/
├── apps/
│   ├── api/                    # Express.js REST API
│   ├── web/                    # Next.js 14 web platform
│   └── mobile/                 # React Native / Expo app
├── packages/
│   ├── shared/                 # Types, Zod schemas, constants
│   ├── ui/                     # Shared React component library
│   └── config/                 # ESLint, Prettier, tsconfig base
├── .github/
│   └── workflows/
│       ├── api.yml
│       ├── web.yml
│       └── mobile.yml
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── .env.example
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **pnpm** >= 9.x (`npm install -g pnpm`)
- **MongoDB Atlas** account (M10+ cluster recommended for production, M0 free tier for dev)
- **Upstash Redis** account
- **Cloudinary** account
- **Expo CLI** (for mobile): `npm install -g expo-cli eas-cli`

### Installation

```bash
# Clone the repository
git clone https://github.com/kujuana/platform.git
cd kujuana

# Install all dependencies (all workspaces)
pnpm install

# Copy environment files
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
cp .env.example apps/mobile/.env
```

### Running in Development

```bash
# Run all apps simultaneously (recommended)
pnpm dev

# Or run individually
pnpm --filter api dev         # API on http://localhost:4000
pnpm --filter web dev         # Web on http://localhost:3000
pnpm --filter mobile start    # Expo dev server
```

### Building for Production

```bash
# Build all packages and apps
pnpm build

# Build a specific app
pnpm --filter api build
pnpm --filter web build
```

---

## Environment Variables

Create `.env` files in each app directory. All required variables are listed below.

```bash
# ── DATABASE ──────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/kujuana?retryWrites=true&w=majority
REDIS_URL=rediss://<token>@<host>.upstash.io:6379

# ── AUTHENTICATION ────────────────────────────────────
JWT_ACCESS_SECRET=<min-64-char-random-string>
JWT_REFRESH_SECRET=<different-min-64-char-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# ── CLOUDINARY (Photo Storage) ────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_PRIVATE_FOLDER=kujuana/private-photos

# ── PAYMENTS: PESAPAL ─────────────────────────────────
PESAPAL_CONSUMER_KEY=your-key
PESAPAL_CONSUMER_SECRET=your-secret
PESAPAL_IPN_URL=https://api.kujuana.com/api/v1/payments/pesapal/webhook

# ── PAYMENTS: M-PESA DARAJA ───────────────────────────
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://api.kujuana.com/api/v1/payments/mpesa/callback

# ── PAYMENTS: FLUTTERWAVE ────────────────────────────
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxx
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret

# ── EMAIL ─────────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=hello@kujuana.com

# ── ENCRYPTION (VIP sensitive fields) ────────────────
# 32-byte hex string — generate with: openssl rand -hex 32
AES_ENCRYPTION_KEY=your-32-byte-hex-key

# ── ADMIN ─────────────────────────────────────────────
ADMIN_INVITE_SECRET=bootstrap-secret-for-first-admin

# ── FRONTEND (Next.js — prefix NEXT_PUBLIC_) ─────────
NEXT_PUBLIC_API_URL=https://api.kujuana.com/api/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD=your-cloud-name

# ── MOBILE (Expo — prefix EXPO_PUBLIC_) ──────────────
EXPO_PUBLIC_API_URL=https://api.kujuana.com/api/v1
EXPO_PUBLIC_PUSH_PROJECT_ID=your-expo-project-id
```

> **Security note**: Never commit `.env` files. Rotate `JWT_ACCESS_SECRET` and `AES_ENCRYPTION_KEY` using your secret manager (Railway Secrets, Vercel Environment Variables, GitHub Secrets).

---

## Apps

### API — apps/api

Express.js REST API serving both the web and mobile clients.

```
apps/api/src/
├── config/          # db, redis, cloudinary, bullmq, env
├── models/          # Mongoose schemas (User, Profile, Match, Subscription, Payment)
├── routes/          # Route declarations
├── controllers/     # Request handlers
├── services/        # Business logic (matching, payment, email, upload)
├── middleware/       # auth, tier-gate, rate-limit, validate, error
├── workers/         # BullMQ workers (standard, priority, vip match)
├── jobs/            # Cron jobs (match schedule, subscription expiry)
├── utils/           # jwt, hash, matchScore, paginate, crypto, phone
├── app.ts           # Express app factory
└── server.ts        # HTTP server entry + worker bootstrap
```

**Start API (dev):**
```bash
cd apps/api
pnpm dev
# Runs on http://localhost:4000
# BullMQ workers start automatically
```

**Key middleware stack** (applied in order in `app.ts`):

```
cors → helmet → morgan → json → rateLimiter → routes → errorHandler
```

---

### Web — apps/web

Next.js 14 App Router with full SSR, RSC, and edge middleware for auth guards.

```
apps/web/app/
├── (marketing)/     # Public: landing, pricing
├── (auth)/          # register, login, verify-email, forgot/reset password
├── (onboarding)/    # 6-step wizard: plan → basic → background → photos → vision → preferences
├── (dashboard)/     # matches, profile edit, subscription, settings
└── (admin)/         # matchmaker queue, member list, match management
```

**Route groups and their guards** (`middleware.ts`):

| Route Group | Auth Required | Profile Required | Roles |
|---|---|---|---|
| `(marketing)` | No | No | — |
| `(auth)` | No | No | — |
| `(onboarding)` | Yes | No | user |
| `(dashboard)` | Yes | Yes (completed) | user |
| `(admin)` | Yes | — | admin, matchmaker |

**Start web (dev):**
```bash
cd apps/web
pnpm dev
# Runs on http://localhost:3000
```

---

### Mobile — apps/mobile

React Native app using Expo SDK 51 and Expo Router v3. Mirrors web structure with native-optimized UX.

```
apps/mobile/app/
├── (auth)/          # Welcome screen, register, login
├── (onboarding)/    # plan, basic-details, background, photos, relationship-vision, preferences
└── (tabs)/          # matches, profile, upgrade, settings
    └── match/[id]   # Full-screen match detail
```

**Running on device:**
```bash
cd apps/mobile

# iOS simulator
pnpm ios

# Android emulator
pnpm android

# Physical device (Expo Go)
pnpm start
# Scan QR code with Expo Go app
```

**Building for App Store / Play Store:**
```bash
# Development build
eas build --profile development --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

**Key native permissions required** (`app.json`):

```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "Upload your profile photos",
      "NSPhotoLibraryUsageDescription": "Select photos from your library",
      "NSLocationWhenInUseUsageDescription": "Improve local match suggestions"
    }
  },
  "android": {
    "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE", "ACCESS_FINE_LOCATION"]
  }
}
```

---

## Database

**MongoDB Atlas M10** minimum for production (dedicated cluster, Atlas Search, auto-scaling).

### Collections

| Collection | Purpose |
|---|---|
| `users` | Auth credentials, role, refresh token store |
| `profiles` | Complete dating profiles — all 6 form sections |
| `matches` | Match records with compatibility scores |
| `matchrequests` | Priority match job queue tracking |
| `subscriptions` | Tier, credits, VIP add-ons, expiry |
| `payments` | Full transaction ledger with gateway refs |

### Atlas Search Index

Create a search index on the `profiles` collection for text-based matching:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "idealPartnerDescription": { "type": "string", "analyzer": "lucene.english" },
      "lifeVision":              { "type": "string", "analyzer": "lucene.english" },
      "personalityTraits":       { "type": "string" },
      "lifestyle":               { "type": "string" },
      "occupation":              { "type": "string" }
    }
  }
}
```

### Recommended Indexes

```js
// users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true })

// profiles
db.profiles.createIndex({ userId: 1 }, { unique: true })
db.profiles.createIndex({ "location.coordinates": "2dsphere" })
db.profiles.createIndex({ isActive: 1, gender: 1 })

// matches
db.matches.createIndex({ users: 1 })
db.matches.createIndex({ "users": 1, status: 1 })
db.matches.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })  // TTL

// payments
db.payments.createIndex({ reference: 1 }, { unique: true })
db.payments.createIndex({ idempotencyKey: 1 }, { unique: true })
```

---

## Matching Engine

The compatibility engine lives in `apps/api/src/utils/matchScore.ts` and `apps/api/src/services/matching.service.ts`.

### Scoring Algorithm

All weights sum to 100. Scores are computed as floats 0–1 per dimension, then multiplied by weight.

```
Final Score (0-100) =
  (Relationship Goals Score  × 30) +
  (Partner Values Score      × 25) +
  (Lifestyle Score           × 20) +
  (Preferences Score         × 15) +
  (Emotional Readiness Score × 10)
```

| Dimension | Weight | How Calculated |
|---|---|---|
| Relationship Goals | 30 | Direct enum match → 1.0, compatible adjacent → 0.6, mismatch → 0.0 |
| Partner Values | 25 | Jaccard similarity: `|intersection| / |union|` of value arrays |
| Lifestyle | 20 | Overlap ratio of lifestyle arrays |
| Preferences | 15 | Age in range (0.5) + country match (0.3) + religion match (0.2) |
| Emotional Readiness | 10 | Readiness state compatibility matrix |

**VIP bonus**: personality deep-match adds up to 5 bonus points on top of base score (capped at 100).

**Non-negotiable filter**: Any hard deal-breaker violation between two profiles results in immediate exclusion — score is never computed.

### Queue Architecture

| Tier | Worker | Priority | Processing |
|---|---|---|---|
| Standard | `standardMatch.worker.ts` | Low | Nightly BullMQ cron — 02:00 EAT |
| Priority | `priorityMatch.worker.ts` | Highest | Instant — job dispatched on credit purchase |
| VIP | `vipMatch.worker.ts` | High | Top-5 candidates → matchmaker review queue |

---

## Subscription Tiers

### Standard — Free

- Compatibility-based matching, batch processed nightly
- Up to 3 concurrent active matches
- Basic age + country filters
- Email notification on new match
- No credits, no expiry

### Priority — Pay-per-match

| Bundle | Price (KES) | Credits |
|---|---|---|
| Single match | 500 | 1 |
| 5-pack | 2,000 | 5 |
| 10-pack | 3,500 | 10 |

- Instant processing — highest BullMQ priority
- Compatibility guaranteed, chemistry is not
- Credits are atomic — deducted on job dispatch, not on match creation
- M-Pesa STK Push preferred; card via Pesapal/Flutterwave

### VIP — KES 10,000/month

- Unlimited curated matches monthly
- Dedicated matchmaker attention
- Human review before every introduction
- Full add-on suite unlocked:

| Add-on Key | Description |
|---|---|
| `location_filtering` | Hyper-local or specific city/region targeting |
| `strict_age_filtering` | Exact age range enforcement (±1 year) |
| `personality_preference` | Deep personality archetype matching |
| `international_search` | Match outside your country |
| `religious_filtering` | Faith-specific filtering |
| `confidential_details` | Health status, sensitive info — encrypted |
| `income_bracket` | Income range compatibility |
| `race_preference` | Race/ethnicity preference (encrypted) |
| `highly_specific_criteria` | Custom criteria — matchmaker handled |

---

## Payment Integration

### Flow Overview

```
User selects plan
       │
       ▼
POST /api/v1/payments/initiate
       │
       ├── Kenya user + M-Pesa → Daraja STK Push → User confirms on phone
       ├── Kenya user + Card   → Pesapal checkout URL → Redirect
       └── Global user         → Flutterwave checkout URL → Redirect
                │
                ▼
        Payment Gateway IPN/Webhook
                │
        POST /payments/<gateway>/webhook
                │
        HMAC signature verification
                │
        Idempotency key check
                │
        Update Payment record → status: 'completed'
                │
        creditSubscription() → add tier/credits
                │
        emailService.sendReceipt()
```

### M-Pesa STK Push Flow

```bash
# 1. Initiate — server calls Daraja API
POST /api/v1/payments/initiate
{ "method": "mpesa", "phone": "+254712345678", "purpose": "priority_single" }

# 2. Frontend polls status every 3 seconds (90s max)
GET /api/v1/payments/:reference/status

# 3. Daraja callback hits your server
POST /api/v1/payments/mpesa/callback
# → Server updates Payment record, credits user
```

### Idempotency

Every payment record stores an `idempotencyKey` derived from `SHA-256(userId + purpose + timeBucket)`. Duplicate IPN callbacks from gateways are safe — upsert by key prevents double-crediting.

---

## API Reference

Base URL: `https://api.kujuana.com/api/v1`

All authenticated routes require: `Authorization: Bearer <access_token>`

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account |
| POST | `/auth/login` | Public | Login, receive token pair |
| POST | `/auth/refresh` | Public | Rotate refresh token |
| POST | `/auth/logout` | JWT | Invalidate refresh token |
| POST | `/auth/verify-email` | Public | Confirm email address |
| POST | `/auth/forgot-password` | Public | Send reset email |
| POST | `/auth/reset-password` | Public | Set new password |

### Onboarding

| Method | Path | Description |
|---|---|---|
| GET | `/onboarding/progress` | Get current step + saved data |
| POST | `/onboarding/step/:n` | Save step (n = 1–6) |
| POST | `/onboarding/submit` | Finalize profile, activate |

### Profile

| Method | Path | Description |
|---|---|---|
| GET | `/profile/me` | Full profile + completeness score |
| PUT | `/profile/me` | Update any section |
| PATCH | `/profile/photos` | Add/remove/reorder photos (max 3) |

### Matches

| Method | Path | Tier Gate | Description |
|---|---|---|---|
| GET | `/matches` | — | Paginated match history |
| GET | `/matches/:id` | — | Single match + score breakdown |
| POST | `/matches/request` | Priority \| VIP | Trigger instant match (deducts 1 credit) |
| PATCH | `/matches/:id/respond` | — | accept \| decline |

### Subscriptions

| Method | Path | Description |
|---|---|---|
| GET | `/subscriptions/me` | Current plan, credits, add-ons |
| POST | `/subscriptions/upgrade` | Initiate upgrade → payment |
| POST | `/subscriptions/add-on` | Enable VIP add-on (VIP only) |
| POST | `/subscriptions/cancel` | Cancel auto-renew |

### Payments

| Method | Path | Description |
|---|---|---|
| POST | `/payments/initiate` | Start payment (returns STK push or redirect URL) |
| GET | `/payments/:ref/status` | Poll payment status |
| POST | `/payments/pesapal/webhook` | Pesapal IPN (HMAC verified) |
| POST | `/payments/flutterwave/webhook` | Flutterwave IPN (HMAC verified) |
| POST | `/payments/mpesa/callback` | Daraja STK callback |

### Upload

| Method | Path | Description |
|---|---|---|
| POST | `/upload/photos` | Upload photo to Cloudinary (signed) |
| DELETE | `/upload/photos/:publicId` | Remove photo |

### Admin

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/admin/queue` | matchmaker | VIP + Priority pending match queue |
| POST | `/admin/matches/:id/introduce` | matchmaker | Trigger introduction + attach note |
| GET | `/admin/members` | admin | Full member list with filters |
| GET | `/admin/members/:id` | admin | Member profile (full, private view) |
| GET | `/admin/stats` | admin | Revenue, matches made, active users |

### Error Response Format

All errors return a consistent shape:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect",
    "statusCode": 401
  }
}
```

---

## Authentication

Kujuana uses a **dual-token JWT strategy** with token rotation.

### Token Lifecycle

```
Register/Login
      │
      ▼
access_token  (15 min expiry)  — stored in memory / httpOnly cookie
refresh_token (30 day expiry)  — stored in httpOnly cookie + DB
      │
      │ access_token expires
      ▼
POST /auth/refresh
      │ validates refresh_token against DB array
      │ issues new pair, rotates refresh_token in DB
      ▼
New token pair issued
```

- **Access tokens**: Short-lived (15m), stateless JWT, verified via `auth.middleware.ts`
- **Refresh tokens**: Long-lived (30d), stored in DB array (max 5 per user), rotation on each use
- **Token theft detection**: If a refresh token is reused after rotation, all tokens for that user are invalidated
- **Mobile storage**: `expo-secure-store` (encrypted native keychain), never `AsyncStorage`
- **Web storage**: `httpOnly` cookies to prevent XSS, `SameSite=Strict`

---

## File Uploads

All profile photos are **private** — never publicly accessible.

### Upload Flow

```
Client requests signed upload params
        │
        ▼
GET /upload/photos/signature     ← server generates Cloudinary signed params
        │
        ▼
Client POSTs directly to Cloudinary with signature
        │
        ▼
Cloudinary stores in private folder: kujuana/private-photos/<userId>/
        │
        ▼
Client sends publicId back to server
        │
        ▼
PATCH /profile/photos            ← server saves publicId to profile
```

### Accessing Photos

When a match is introduced, the API generates a **time-expiring signed URL** (1-hour validity) for each photo. Photos are never served from a public CDN URL.

```typescript
// Server-side signed URL generation
const signedUrl = cloudinary.url(photo.publicId, {
  sign_url: true,
  type: 'authenticated',
  expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
});
```

### Constraints

- Maximum **3 photos** per profile
- Minimum photo size: 400×400px
- Accepted formats: JPEG, PNG, WebP
- Max file size: 10MB (Cloudinary transform to 2MB on upload)

---

## Admin & Matchmaker Portal

The admin portal is accessible at `/admin` on the web platform (role-gated).

### Roles

| Role | Permissions |
|---|---|
| `admin` | Full access: all members, stats, revenue, billing, system config |
| `matchmaker` | Match queue, member profiles (read), introductions, notes |
| `user` | Own profile and matches only |

### Matchmaker Workflow

1. **Queue view** (`/admin/queue`) — Lists all pending VIP matches sorted by wait time
2. **Review** — View both candidate profiles side-by-side (all details including VIP-encrypted fields)
3. **Annotate** — Write a personal introduction note (visible to both users on introduction)
4. **Introduce** — Trigger `POST /admin/matches/:id/introduce` — sends email + push notification to both users
5. **Track** — Monitor acceptance/decline rates per matchmaker

### Bootstrapping First Admin

```bash
# On first deployment, create the initial admin account:
curl -X POST https://api.kujuana.com/api/v1/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "<ADMIN_INVITE_SECRET from env>",
    "email": "admin@kujuana.com",
    "password": "strong-password"
  }'
```

---

## Testing

### Running Tests

```bash
# All tests across all workspaces
pnpm test

# API unit + integration tests
pnpm --filter api test

# Web component tests
pnpm --filter web test

# Watch mode
pnpm --filter api test:watch

# Coverage report
pnpm --filter api test:coverage
```

### Test Structure

```
apps/api/tests/
├── unit/
│   ├── matchScore.test.ts         # Scoring algorithm edge cases
│   ├── hash.test.ts               # bcrypt helpers
│   └── crypto.test.ts             # AES encryption/decryption
└── integration/
    ├── auth.test.ts               # Register, login, refresh, logout flows
    ├── onboarding.test.ts         # All 6 steps + submission
    ├── profile.test.ts            # CRUD + completeness score
    ├── match.test.ts              # Match creation, scoring, respond
    └── payment.test.ts            # Webhook processing, idempotency
```

### Integration Test Setup

Tests use **mongodb-memory-server** for an in-memory MongoDB instance — no real Atlas connection needed for testing.

```typescript
// tests/setup.ts
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})
```

---

## Deployment

### API — Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Deploy
railway up

# Environment variables — set via Railway dashboard or CLI
railway variables set MONGODB_URI=...
railway variables set JWT_ACCESS_SECRET=...
# ... all other variables
```

**Dockerfile** (`apps/api/Dockerfile`):

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm --filter api build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

### Web — Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (from repo root)
vercel

# Production deployment
vercel --prod
```

Set all `NEXT_PUBLIC_*` environment variables in the Vercel dashboard under Project → Settings → Environment Variables.

### Mobile — EAS

```bash
# Configure EAS project (first time)
eas build:configure

# Build profiles in eas.json:
# development → internal distribution (TestFlight / internal track)
# preview → QR code shareable builds
# production → App Store / Play Store

eas build --profile production --platform ios
eas build --profile production --platform android

# Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest
```

---

## CI/CD

### GitHub Actions Pipelines

**API** (`.github/workflows/api.yml`):
```
push to main/develop →
  pnpm install →
  pnpm lint →
  pnpm --filter api test →
  docker build →
  Railway deploy (main branch only)
```

**Web** (`.github/workflows/web.yml`):
```
push/PR →
  pnpm install →
  pnpm --filter web type-check →
  pnpm --filter web test →
  Vercel deploy (preview on PR, production on main)
```

**Mobile** (`.github/workflows/mobile.yml`):
```
push to main →
  eas build --profile preview --platform all (non-blocking)
push tag v*.*.* →
  eas build --profile production --platform all →
  eas submit --platform all
```

### Turborepo Caching

Turborepo caches `build` and `test` task outputs. On CI, remote caching is enabled via `TURBO_TOKEN` and `TURBO_TEAM` env vars, dramatically reducing CI times on unchanged packages.

---

## Security

### Summary of Security Measures

| Area | Measure |
|---|---|
| **Passwords** | bcrypt, cost factor 12 |
| **JWT** | Short-lived access (15m) + rotating refresh (30d), revocation list |
| **Photo access** | Cloudinary `authenticated` type, signed URLs (1h expiry), no public CDN |
| **VIP sensitive fields** | AES-256-GCM encrypted at application layer before MongoDB write |
| **Webhooks** | HMAC-SHA256 signature verification on all IPN endpoints |
| **Rate limiting** | Redis sliding window: 5 req/s (auth), 100 req/min (API) per IP/user |
| **Input validation** | Zod schemas on every route — no raw `req.body` trust |
| **HTTP security** | Helmet.js: CSP, HSTS, X-Frame-Options, etc. |
| **CORS** | Allowlist of known origins only |
| **Token theft** | Refresh token reuse → full session wipe for that user |
| **Payments** | Idempotency keys, HMAC-verified webhooks, no card data touches server |
| **MongoDB** | Atlas IP allowlist, least-privilege DB user, Atlas encryption at rest |

### Reporting Vulnerabilities

Please do not file public GitHub issues for security vulnerabilities. Email `security@kujuana.com` with a detailed description. We aim to respond within 48 hours.

---

## Contributing

This is a private commercial repository. Access is granted on a need-to-know basis.

### Branching Strategy

```
main          → production deployments
develop       → integration branch, staging deployments
feature/*     → new features (branch from develop)
fix/*         → bug fixes (branch from develop)
hotfix/*      → urgent production fixes (branch from main)
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add email verification on register
fix(matching): correct Jaccard score for empty value arrays
chore(deps): upgrade mongoose to 8.x
docs(api): update payment webhook endpoint docs
```

### Pull Request Checklist

- [ ] All tests pass (`pnpm test`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] New features have corresponding tests
- [ ] Environment variable changes are reflected in `.env.example`
- [ ] README updated if API or architecture changed

---

## Build Roadmap

| Sprint | Focus | Key Deliverables |
|---|---|---|
| Sprint 1 | Foundation | Monorepo setup, shared types, auth (register/login/refresh), User + Profile models |
| Sprint 2 | Onboarding | All 6 steps (API + web + mobile), photo upload, plan selection, profile completeness |
| Sprint 3 | Matching Core | Scoring engine, BullMQ workers, Match model, matches API, score visualization |
| Sprint 4 | Payments | M-Pesa STK, Pesapal, Flutterwave, webhooks, subscription crediting, credit system |
| Sprint 5 | Admin + VIP | Matchmaker dashboard, VIP queue, introduction flow, field encryption, add-ons |
| Sprint 6 | Polish + Launch | Push notifications, email templates, rate limiting, CI/CD, App Store submission |

---

## License

Copyright © 2024–2025 Kujuana Ltd. All rights reserved.

This codebase is proprietary and confidential. Unauthorized copying, distribution, or disclosure of any part of this software, via any medium, is strictly prohibited without prior written permission from Kujuana Ltd.

---

<div align="center">
  <strong>kujuana.com</strong> — Dating with Intention 💍<br>
  <sub>Built with ❤️ in Nairobi, Kenya</sub>
</div>
