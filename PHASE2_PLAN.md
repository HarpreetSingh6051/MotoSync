# Phase 2 — Kixup: Rebrand, Ignition, Super Admin ERP & Live Sync

Sources:
- `E:\download\kixup_rebrand_ignition_splash_mobile_build_guide.md`
- `E:\download\kixup_phase_2_24_7_cloud_database_super_admin_erp_guide.md`
- `E:\download\kixup_super_admin_erp_live_rider_app_sync_preview.md`

The two prototype documents are directionally right but not safe to copy verbatim
(the SQL has a column typo, no RLS on the new tables, an unsafe profile-update path,
and the React preview is a single-file `useState` mock). This plan keeps the product
intent and rebuilds it properly inside the existing architecture.

## Non-negotiables

1. **Demo mode still works with an empty `.env`.** Every Supabase read falls back to
   the seeded platform config; every write still updates local state.
2. **One shared config source.** Plans, flags, exhaust sounds and sponsored campaigns
   live in `useConfigStore`, persisted locally and optionally synced to Supabase.
3. **Live sync without a redeploy.** Admin changes broadcast instantly through
   `BroadcastChannel` (same browser, different tabs) and Supabase Realtime (different
   devices). Rider app reads the same store.
4. **No service-role key in the browser.** Admin writes require a Supabase Auth session
   whose profile `role = 'super_admin'`. RLS enforces it; the client is optimistic.
5. **Entitlement is not self-service in production.** The DB trigger blocks a rider from
   changing `is_pro`, `role`, `status` or `subscription_plan_id`. The demo paywall is
   explicitly a demo; production activation belongs in a payment webhook.

## Workstreams

### A. Brand + ignition (rider app)
- Rename Ride & Roam / PackPulse → **Kixup** across app copy, PWA, Capacitor, Tauri,
  package metadata, share text, GPX creator, AI prompts and watermarks.
- `GoldenHelmetBadge` (gold / silver / club shield) with a rev-pulse on tap; replaces
  the generic Crown for PRO status.
- `bikeAudioEngine.ts` — five synthesized presets (Harley V-twin, Bullet thump, Ninja
  inline-4, Ducati V4, Triumph triple) plus optional real audio assets.
- `IgnitionSplashScreen` — first-launch ignition sequence, sound picker, skip, mute.
- Garage “Startup & sound” card — choose startup note, toggle splash, mute.

### B. Shared platform data
- `src/lib/platformDefaults.ts` — seed plans, flags, sounds, campaigns.
- `src/store/useConfigStore.ts` — persisted config + admin user overrides.
- `src/lib/platformApi.ts` — snake_case ↔ camelCase Supabase mapping.
- `src/lib/configBus.ts` — BroadcastChannel + localStorage fallback.
- `src/hooks/useConfigSync.ts` — cloud pull, Realtime subscription, entitlement sync.
- `src/hooks/useFeatureFlag.ts` — enabled + access + deterministic rollout.
- `supabase/migrations/005_super_admin_erp.sql` — tables, seeds, RLS, audit log,
  realtime publication, privilege-escalation trigger.

### C. Super Admin ERP (`#/admin`)
- Overview: riders, PRO, MRR, live packs, flag/campaign status, sync health.
- Users/CRM: search, plan/role/status filters, grant/revoke PRO, change plan, suspend.
- Plans: full CRUD, INR/USD pricing, badge type, limits, features, popularity.
- Feature flags: toggle, access level, rollout %, create/edit.
- Exhaust vault: preview, add/edit, PRO-only, active.
- Sponsored campaigns: create/edit, region, CPM, impressions/clicks, active.
- Settings: Supabase status, magic-link admin auth, pull config, reset demo config.
- Admin changes appear in the rider app via the shared store and BroadcastChannel.

### D. Rider integration
- Paywall reads live plans; Golden Helmet badge; plan activation writes an override.
- Sponsored feed card reads campaigns + flag.
- OCR, 4K export, intercom, fall-behind alert, SOS, splash and near-me radar respect flags.
- Account suspension banner.
- Share links prefer clean `/r/:id` and `/live/:id`; router accepts clean paths and
  rewrites them to the hash router. `vercel.json` + `public/_redirects` provide SPA
  fallbacks.

### E. Native + cloud docs
- `README.md`: Supabase setup, migration 005, admin bootstrap SQL, Android/iOS builds.
- `supabase/README.md`: cloud database runbook.
- Android/iOS native projects generated when the toolchain is present. APK/AAB build
  still requires Android Studio Otter+, SDK 36 and JDK 21; Tauri build requires Rust.

## Data model (005)

| Table | Purpose |
| --- | --- |
| `subscription_plans` | Pricing, badge, audience, limits, features, subscribers |
| `app_feature_flags` | Runtime modules, access level, rollout percentage |
| `exhaust_sounds` | Startup notes, synth preset, optional audio URL, PRO gate |
| `sponsored_campaigns` | Partner perks, region, CPM, impressions/clicks |
| `admin_audit_log` | Super-admin actions (append-only, RLS super-admin only) |

`profiles` gains `role`, `status`, `subscription_plan_id`, `selected_exhaust_sound`,
`phone`, `last_active_at`.

## Verification gates

- `npm run typecheck`
- `npm run build`
- Demo mode with empty `.env`: all routes, no uncaught exceptions.
- `#/admin` → edit plan/flag/sound/campaign → rider tab reflects it live.
- Splash: first launch, sound select, mute, skip, second launch suppressed.
- 375 px and 1280 px: no horizontal overflow.
- Offline PWA reload still renders the feed.
