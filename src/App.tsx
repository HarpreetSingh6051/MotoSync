import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link2, Radio, ShieldAlert, WifiOff } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { BottomDock } from '@/components/BottomDock'
import { PaywallModal } from '@/components/PaywallModal'
import { ToastHost } from '@/components/ToastHost'
import { IgnitionSplashScreen } from '@/components/splash/IgnitionSplashScreen'
import { FeedPage } from '@/pages/FeedPage'
import { channels, currentUserId } from '@/lib/mockData'
import { isGeminiConfigured } from '@/lib/gemini'
import { dataMode } from '@/lib/supabase'
import { navigate, useRoute } from '@/lib/router'
import { cx } from '@/lib/format'
import { useAppStore } from '@/store/useAppStore'
import { useConfigStore } from '@/store/useConfigStore'
import { useConfigSync } from '@/hooks/useConfigSync'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

// Heavy secondary screens are split out so the feed stays the fast path.
const RideDetailPage = lazy(() =>
  import('@/pages/RideDetailPage').then((m) => ({ default: m.RideDetailPage })),
)
const LiveRidePage = lazy(() =>
  import('@/pages/LiveRidePage').then((m) => ({ default: m.LiveRidePage })),
)
const ClubsDirectoryPage = lazy(() =>
  import('@/pages/ClubsDirectoryPage').then((m) => ({ default: m.ClubsDirectoryPage })),
)
const PackChatPage = lazy(() =>
  import('@/pages/PackChatPage').then((m) => ({ default: m.PackChatPage })),
)
const CreateReelOrRidePage = lazy(() =>
  import('@/pages/CreateReelOrRidePage').then((m) => ({
    default: m.CreateReelOrRidePage,
  })),
)
const GarageAndProfilePage = lazy(() =>
  import('@/pages/GarageAndProfilePage').then((m) => ({
    default: m.GarageAndProfilePage,
  })),
)

const PageFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-crimson-500" />
      <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
        Warming the engine
      </span>
    </div>
  </div>
)

const titles: Record<string, string> = {
  feed: 'Feed',
  ride: 'Ride details',
  live: 'Live pack radar',
  clubs: 'Clubs',
  chat: 'Pack chat',
  create: 'Create',
  garage: 'Garage',
  admin: 'Super Admin ERP',
}

export const App = () => {
  useConfigSync()

  const route = useRoute()
  const unread = channels.reduce((sum, channel) => sum + channel.unread, 0)
  const splashFlag = useFeatureFlag('ignition_splash_sound')
  const startupSoundId = useAppStore((state) => state.startupSoundId)
  const setStartupSound = useAppStore((state) => state.setStartupSound)
  const muted = useAppStore((state) => state.muted)
  const toggleMuted = useAppStore((state) => state.toggleMuted)
  const isPro = useAppStore((state) => state.isPro)
  const openPaywall = useAppStore((state) => state.openPaywall)
  const sounds = useConfigStore((state) => state.sounds)
  const accountStatus = useConfigStore(
    (state) => state.overrides[currentUserId]?.status ?? 'active',
  )
  const [splashOpen, setSplashOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      useAppStore.getState().splashEnabled &&
      !window.sessionStorage.getItem('kixup.splash.seen')
    )
  })

  const showSplash =
    splashOpen && splashFlag.available && !route.familyView

  const closeSplash = () => {
    window.sessionStorage.setItem('kixup.splash.seen', '1')
    setSplashOpen(false)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = `${titles[route.name] ?? 'Kixup'} · Kixup`
  }, [route.name, route.rideId, route.channelId])

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-70">
        <div className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-crimson-500/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[380px] w-[520px] rounded-full bg-cyber-500/[0.05] blur-[120px]" />
      </div>

      <TopBar active={route.name} />

      {accountStatus !== 'active' ? (
        <div className="mx-auto mt-3 w-full max-w-6xl px-4 sm:px-6">
          <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/[0.08] px-4 py-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <div>
              <p className="text-xs font-semibold text-rose-200">
                {accountStatus === 'banned' ? 'Account banned' : 'Account suspended'}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-white/45">
                A Kixup super admin has paused this rider account. Writes and live
                broadcasts are disabled until it is restored.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-40 pt-4 sm:px-6 sm:pt-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${route.name}-${route.rideId ?? route.channelId ?? ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Suspense fallback={<PageFallback />}>
              {route.name === 'feed' ? <FeedPage /> : null}
              {route.name === 'ride' && route.rideId ? (
                <RideDetailPage rideId={route.rideId} />
              ) : null}
              {route.name === 'live' && route.rideId ? (
                <LiveRidePage rideId={route.rideId} familyView={route.familyView} />
              ) : null}
              {route.name === 'clubs' ? <ClubsDirectoryPage /> : null}
              {route.name === 'chat' ? <PackChatPage channelId={route.channelId} /> : null}
              {route.name === 'create' ? <CreateReelOrRidePage /> : null}
              {route.name === 'garage' ? <GarageAndProfilePage /> : null}
              {route.name === 'notfound' ? (
                <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                  <p className="font-display text-6xl font-bold text-white/10">404</p>
                  <h1 className="mt-3 font-display text-xl font-semibold text-white">
                    Wrong turn, rider
                  </h1>
                  <p className="mt-1.5 text-xs text-white/40">
                    That route is not on the map. Let’s get you back to the pack.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/feed')}
                    className="mt-4 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
                  >
                    Back to feed
                  </button>
                </div>
              ) : null}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-28 sm:px-6">
        <div className="flex flex-col gap-3 border-t border-white/[0.06] py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/25">
            <span className="font-display text-xs font-black tracking-[0.08em] text-white/50">
              KIX<span className="text-amber-300/70">UP</span>
            </span>
            <span className="hidden h-3 w-px bg-white/10 sm:block" />
            <span>© {new Date().getFullYear()} Kixup</span>
            <a href="#/clubs" className="transition hover:text-white/45">
              Clubs
            </a>
            <a href="#/create" className="transition hover:text-white/45">
              Create
            </a>
            <a href="#/garage" className="transition hover:text-white/45">
              Garage
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cx(
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-medium',
                dataMode === 'live'
                  ? 'border-pack-500/25 bg-pack-500/[0.06] text-pack-400'
                  : 'border-amber-400/20 bg-amber-400/[0.05] text-amber-300/80',
              )}
            >
              {dataMode === 'live' ? <Radio className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
              {dataMode === 'live' ? 'Supabase live' : 'Seeded demo data'}
            </span>
            <span
              className={cx(
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-medium',
                isGeminiConfigured
                  ? 'border-cyber-400/25 bg-cyber-500/[0.06] text-cyber-300'
                  : 'border-white/10 bg-white/[0.03] text-white/30',
              )}
            >
              <Link2 className="h-2.5 w-2.5" />
              {isGeminiConfigured ? 'Gemini connected' : 'Demo AI'}
            </span>
          </div>
        </div>
      </footer>

      <BottomDock active={route.name} unreadCount={unread} />
      <PaywallModal />
      <ToastHost />

      <AnimatePresence>
        {showSplash ? (
          <IgnitionSplashScreen
            sounds={sounds}
            selectedSoundId={startupSoundId}
            onSelect={setStartupSound}
            onEnter={closeSplash}
            onSkip={closeSplash}
            muted={muted}
            onToggleMuted={toggleMuted}
            isPro={isPro}
            onUpgrade={() => {
              closeSplash()
              openPaywall(
                'Unlock the Ducati, Ninja and Triumph startup notes with Kixup PRO.',
              )
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

