# Kujuana Mobile

Production mobile client for Kujuana built with Expo Router and TypeScript.

## Scope

The app mirrors your web + API platform with native UX:

- Auth: register, login, email verification, secure session persistence
- Onboarding: full 7-screen flow (plan, basic, background, photos, vision, preferences, review)
- Matches: list + detail + accept/decline + priority request
- Billing: tier selection + payment initiation + gateway handoff
- Profile + settings: completeness snapshot, subscription controls, notifications maintenance

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

## App Store preparation checklist

1. Update identifiers in `apps/mobile/app.json`:
- `ios.bundleIdentifier`
- `android.package`
- `expo.extra.eas.projectId`

2. Replace brand assets:
- `assets/icon.png`
- `assets/adaptive-icon.png`
- `assets/splash-icon.png`
- `assets/favicon.png`

3. Configure EAS:

```bash
cd apps/mobile
eas build:configure
eas build --profile production --platform ios
eas build --profile production --platform android
eas submit --platform ios --latest
eas submit --platform android --latest
```

4. Confirm production API URL in mobile env.
