# Kujuana Mobile (Native + Live API)

This mobile app is a native Expo app with real backend integration.

## What is live

- Auth session via `/auth/login` and `/auth/me`
- Profile via `/profile/me`
- Matches via `/matches` (+ respond actions)
- Subscription via `/subscriptions/me`
- Settings persistence via `/profile/me` patch (`settings` object)

## Environment

Create `apps/mobile/.env`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_WEB_URL=http://localhost:3000
```

For physical devices, point to a reachable LAN IP (not localhost):

```bash
EXPO_PUBLIC_API_URL=http://192.168.x.x:4000/api/v1
EXPO_PUBLIC_WEB_URL=http://192.168.x.x:3000
```

## Run

```bash
pnpm --filter mobile start
```

Open the app in Expo Go and sign in with an existing Kujuana account.
If you do not have an account yet, use the in-app `Create account` flow on the login screen.
