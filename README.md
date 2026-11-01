# MotoSync Rider App

The React 19 + TypeScript + Vite + Tailwind mobile and web application for MotoSync (Pack Connected. Ride in Sync).

## Features
- **Live Pack Radar & Map**: Real-time GPS radar tracking for Sunday rides, fall-behind alerts, and SOS beacons.
- **Digital Garage**: Exhaust sound vault (Harley V-Twin, Bullet thump, Ninja inline-4, Ducati V4, Triumph triple) and AI receipt OCR tank splits.
- **Clubs & Pack Chat**: Club lounges, multi-club hosting, and voice intercom bridging.
- **AI Reel Studio**: 4K / 1080p AI ride reel cuts with telemetry overlays and instant share links (`/r/:id` and `/live/:id`).
- **Road Captain PRO**: Golden Helmet PRO badges, paywall modal, and dynamic feature flags synced live with Supabase.

## Setup & Development

```bash
npm install
npm run dev        # Vite dev server on port 5173
npm run typecheck  # TypeScript check
npm run build      # Typecheck + production build
```

## Production Deployment (Vercel / Netlify / Cloudflare)
1. Fork or push this repository to GitHub.
2. Link the repository to your hosting provider (Vercel / Netlify).
3. Set the environment variables in your hosting dashboard:
   - `VITE_SUPABASE_URL=https://hxsifqmspboitoqnkvwj.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`
   - `VITE_APP_URL=https://your-rider-domain.com`
4. Deploy! SPA routing rewrites should point all requests to `index.html`.
