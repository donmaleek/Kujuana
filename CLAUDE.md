# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kujuana is a **premium intentional dating platform** for Kenya and global markets. It is a **pnpm + Turborepo monorepo** with three apps and four shared packages.

**Subscription tiers**: Standard (free), Priority (pay-per-match), VIP (monthly curated)

## Commands

All commands run from the repo root unless noted.

### Root-level (runs across all workspaces via Turborepo)
```bash
pnpm dev          # Start all apps in parallel
pnpm build        # Build all workspaces
pnpm lint         # Lint all workspaces
pnpm test         # Test all workspaces
pnpm typecheck    # Type-check all workspaces
pnpm format       # Prettier format all TS/TSX/JSON/MD files
```

### API (`apps/api`)
```bash
pnpm --filter api dev              # tsx watch src/server.ts
pnpm --filter api test             # Run all Jest tests
pnpm --filter api test:unit        # Unit tests only (tests/unit/)
pnpm --filter api test:integration # Integration tests only (tests/integration/)
pnpm --filter api test:watch       # Watch mode
pnpm --filter api typecheck
```

### Web (`apps/web`)
```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web typecheck
```

### Database utilities
```bash
pnpm seed              # Seed the database (infra/scripts/seed.ts)
pnpm ensure-indexes    # Create MongoDB Atlas Search indexes
```

## Architecture

### Monorepo structure
```
apps/
  api/      # Express.js REST API (Node 20, TypeScript)
  web/      # Next.js 14 App Router (React 18, Tailwind, shadcn/ui)
  mobile/   # React Native (Expo SDK 51, Expo Router v3)
packages/
  shared/   # Zod schemas, enums, TypeScript types, constants
  scoring/  # Weighted matching algorithm (5 dimensions, 100-pt scale)
  config/   # Shared ESLint, Prettier, tsconfig
  ui/       # Shared React component library
```

### API layer (`apps/api/src/`)

Standard layered architecture:

| Layer | Directory | Role |
|---|---|---|
| Routes | `routes/` | Express route definitions |
| Controllers | `controllers/` | Request/response handling |
| Services | `services/` | Business logic |
| Repositories | `repositories/` | Data access (Mongoose) |
| Models | `models/` | Mongoose schemas |
| Middleware | `middleware/` | auth, role, privacy, rateLimit, session, tier, validate, error |
| Workers | `workers/` | BullMQ queue consumers |
| Jobs | `jobs/` | Cron jobs (match scheduling, subscription expiry) |

Entry points: `server.ts` (HTTP server + graceful shutdown) → `app.ts` (Express factory + middleware stack).

### Web routing (`apps/web/app/`)

Route groups with Next.js middleware enforcing auth/profile state:
- `(marketing)/` — public, no auth
- `(auth)/` — register, login, verify-email, password reset
- `(onboarding)/` — auth required, profile not yet completed (6-step wizard)
- `(dashboard)/` — auth + completed profile required
- `(admin)/` — admin/matchmaker roles only

### Authentication

Dual JWT: 15-minute access token + 30-day rotating refresh token. Refresh tokens stored in MongoDB (max 5 per user). Token reuse triggers full session wipe. Mobile uses `expo-secure-store`; web uses httpOnly cookies (`SameSite=Strict`).

### Matching engine

Three BullMQ queues: Standard (nightly batch), Priority (instant, pay-per-match), VIP (curated by matchmaker). Scoring in `packages/scoring/`: Relationship Goals 30% + Partner Values 25% + Lifestyle 20% + Preferences 15% + Emotional Readiness 10% = 100 pts. Hard deal-breakers applied as non-negotiable filters before scoring.

### Payments

- **Kenya**: M-Pesa STK Push (Daraja API) + Pesapal v3 (cards)
- **Global**: Flutterwave v3
- All webhooks verified with HMAC-SHA256. Idempotency keys prevent double-crediting.

### File storage

Private Cloudinary (never public). Signed time-expiring URLs (1-hour validity). Max 3 photos, min 400×400 px, max 10 MB.

### Security

AES-256-GCM encrypts sensitive VIP fields (health status, income, race preference). Zod validates all route inputs. `packages/shared/` is the single source of truth for schemas used by both API and frontends.

## Key conventions

- **Validation**: Always use Zod schemas from `packages/shared/` for cross-app contracts; add API-specific schemas in `apps/api/src/` only when needed locally.
- **Repositories**: All database access goes through `repositories/`, not directly in services or controllers.
- **Worker jobs**: BullMQ workers in `workers/` are only consumers; job producers live in services or controllers.
- **Encrypted fields**: Any new sensitive VIP fields must use the AES-256-GCM utilities in `apps/api/src/utils/`.
- **TypeScript strict mode** is enabled across all packages.
