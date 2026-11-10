# MotoSync Rider Mobile App

Official mobile application for MotoSync (**Pack Connected. Ride in Sync**). Built natively with Expo SDK 58, React Native 0.88, React 19, and Expo Router.

## Tech Stack & Architecture
- **Framework**: Expo SDK 58 (React Native 0.88 + React 19 + TypeScript)
- **Routing**: Expo Router (typed file-based routes in `app/(tabs)`)
- **Animation & Physics**: `react-native-reanimated` 4 + `react-native-gesture-handler`
- **Audio Engine**: `expo-audio` with procedural CC0 ambient motorcycle hum and exhaust synthesizer
- **Design System**: True black (`#000000`), electric blue (`#10B1FB`), neon violet (`#8B5CF6`), Space Grotesk + Inter
- **Data Layer**: TanStack Query 5 + Supabase Client with graceful offline mock fallback

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local Expo development server (port 8081)
npx expo start

# Platform specific:
npm run web      # Web preview in browser
npm run android  # Android emulator / connected device
npm run ios      # iOS simulator
```

## Environment Variables
Copy `.env.example` to `.env.local`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

## Build & Release
```bash
# TypeScript verification (0 errors required)
npm run typecheck

# Web / PWA export
npm run build:web

# Standalone Android APK (EAS Build)
eas build -p android --profile preview
```
