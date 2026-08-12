# locked.in mobile

Expo SDK 54 and React Native prototype for locked.in, a social workout challenge app.

## Requirements

- Node.js 20 or newer
- npm
- Expo Go or an iOS/Android simulator

## Local development

```bash
npm install
npm start
```

Other useful commands:

```bash
npm run ios
npm run android
npm run web
npm run lint
npm run typecheck
```

## Environment variables

Copy `.env.example` to `.env.local` when backend configuration is added. Expo exposes variables prefixed with `EXPO_PUBLIC_` to the application bundle, so never place private or service-role keys in them.

## Project layout

- `app/` — Expo Router screens
- `components/` — reusable presentation components
- `data/` — temporary typed mock data
- `hooks/` — shared React hooks
- `assets/` — application icons and splash assets

Product and database design notes live in the repository-level `docs/` directory.
