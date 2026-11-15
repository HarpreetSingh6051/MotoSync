# Rider integration

The app now opens directly at Home. `/splash` redirects there as well. No startup voice/ignition prompt or sound on arbitrary screen taps remains. Ambient audio can only start through its explicit control in the opt-in prototype.

Default mode uses real authenticated backend feeds. Sign in with an existing rider account; administrators have separate identities. Native sessions persist through AsyncStorage, refresh tokens follow app foreground state, and changing identity clears the query cache. Empty results stay empty, failures expose Retry, and list reads refresh only through explicit controls. Every feed is paginated.

Home lists announcements and rides; Discover lists groups and opens chat; Pack lists memberships/RSVPs; Splits displays recorded expenses. Group joins/leaves, ride RSVP/cancellation and chat are server-backed. Admin-created groups, rides and announcements use the same tables. Feature maintenance/disabled states are enforced by the backend.

Original visual prototypes remain available only with `EXPO_PUBLIC_DEMO_MODE=true` and are visibly labeled Demo. Their sample data is never used as fallback for a live API failure. Radar/intercom, settlements and receipt scanning are unavailable in live mode, rather than simulated as completed actions.

## Environment

Copy `.env.example` to ignored `.env.local` and set `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Only public Supabase credentials belong here. Rebuild after changes; Expo substitutes these values at bundle time.

- Browser on the API computer: `http://localhost:4000/api/v1`
- Android emulator: `http://10.0.2.2:4000/api/v1`
- Physical device: use the API computer's reachable LAN address.
- Production: `https://moto-sync-be.vercel.app/api/v1`

Authentication HTTP calls also use this backend URL. No hard-coded production fallback exists. Missing configuration displays a setup state.

## Checks

- `npm run typecheck`
- `npm test` (API request contract, authentication, empty/error responses and no fallback)
- `npm run build` (web static export)
- `npx expo install --check`
- `npx expo export --platform android --platform ios --output-dir dist-native --max-workers 2` (native JS/assets, not APK/IPA compilation)
- Backend `scripts/test-rider-live.mjs --allow-fixtures` verifies the shared live API/database flows with private fixtures.

Physical-device/emulator navigation, touch/keyboard handling and screenshots at 360/390/430 widths still need UI acceptance. Successful bundle exports do not substitute for these checks. Existing-account login works; signup/recovery and push notification delivery are not included in this phase.
