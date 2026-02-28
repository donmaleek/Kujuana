# Kujuana Mobile

Production Expo mobile client that mirrors the Kujuana web experience:

- Same luxury purple/gold palette
- Same typography direction (`Cormorant Garamond` display + `Jost` body)
- Same core flow: auth, onboarding, plan selection, payment gate, profile, matchmaking
- Admin console support for `admin`, `manager`, and `matchmaker` roles

## Scope

- Auth: register, login, email verification, secure session persistence
- Onboarding: full 7-step flow with paid-plan payment enforcement before submission
- Matches: list + detail + accept/decline + priority request
- Billing: Paystack/Pesapal/Flutterwave initiation + status polling
- Profile + settings: completeness snapshot, subscription controls, sign-out
- Admin mobile views: dashboard, queue, members, audit

## Stack

- Expo SDK 54
- React Native 0.81
- Expo Router
- Zustand + expo-secure-store
- TanStack Query
- Zod + shared schemas from `@kujuana/shared`

## Environment

Create `apps/mobile/.env`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_PUSH_PROJECT_ID=replace-with-project-id
```

## Commands

From repo root:

```bash
pnpm --filter mobile start
pnpm --filter mobile android
pnpm --filter mobile ios
pnpm --filter mobile typecheck
pnpm --filter mobile lint
```

## View The App Immediately

If LAN mode does not show on your phone, use tunnel mode:

```bash
EXPO_USE_LOCAL_NGROK=1 pnpm --filter mobile start -- --tunnel
```

Then open the `exp://...exp.direct` URL shown in terminal in Expo Go.

### Required UI dependencies

```bash
npx expo install expo-linear-gradient @expo/vector-icons expo-image-picker
```

## Build Downloadable APK

1. Install EAS CLI and login:

```bash
pnpm dlx eas-cli --version
pnpm dlx eas-cli login
```

2. Set real project id in `apps/mobile/app.json`:

- `expo.extra.eas.projectId`

3. Build APK (internal/preview):

```bash
cd apps/mobile
pnpm dlx eas-cli build --platform android --profile preview
```

4. Download artifact:

- Open the build URL printed by EAS
- Download the generated `.apk`

### Production AAB (Play Store)

```bash
cd apps/mobile
pnpm dlx eas-cli build --platform android --profile production
```

This generates `.aab` for Play Store submission.

## Release Checklist

1. Update identifiers in `apps/mobile/app.json`:
- `ios.bundleIdentifier`
- `android.package`
- `expo.extra.eas.projectId`

2. Replace brand assets:
- `assets/icon.png`
- `assets/adaptive-icon.png`
- `assets/splash-icon.png`
- `assets/favicon.png`

3. Confirm production API URL in mobile env.
