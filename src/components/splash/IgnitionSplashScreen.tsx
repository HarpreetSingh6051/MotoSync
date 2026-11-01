import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Flame, Lock, SkipForward, Volume2, VolumeX, Zap } from 'lucide-react'
import type { ExhaustSound } from '@/types'
import { playStartupSound } from '@/lib/bikeAudioEngine'
import { cx } from '@/lib/format'

type Phase = 'idle' | 'starting' | 'ready'

export const IgnitionSplashScreen = ({
  sounds,
  selectedSoundId,
  onSelect,
  onEnter,
  onSkip,
  muted,
  onToggleMuted,
  isPro,
  onUpgrade,
}: {
  sounds: ExhaustSound[]
  selectedSoundId: string
  onSelect: (id: string) => void
  onEnter: () => void
  onSkip: () => void
  muted: boolean
  onToggleMuted: () => void
  isPro: boolean
  onUpgrade: () => void
}) => {
  const [phase, setPhase] = useState<Phase>('idle')
  const timer = useRef<number | null>(null)
  const activeSounds = useMemo(() => sounds.filter((sound) => sound.isActive), [sounds])
  const selected =
    activeSounds.find((sound) => sound.id === selectedSoundId) ?? activeSounds[0]

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  const start = () => {
    if (phase === 'ready') {
      onEnter()
      return
    }
    if (phase === 'starting') return
    setPhase('starting')
    if (selected) {
      void playStartupSound(selected.synthPreset, {
        muted,
        audioUrl: selected.audioUrl,
        decibels: selected.decibels,
      })
    }
    timer.current = window.setTimeout(() => setPhase('ready'), 2200)
  }

  const pick = (sound: ExhaustSound) => {
    if (sound.isProOnly && !isPro) {
      onUpgrade()
      return
    }
    onSelect(sound.id)
    void playStartupSound(sound.synthPreset, {
      muted,
      audioUrl: sound.audioUrl,
      decibels: sound.decibels,
    })
  }

  const needle = phase === 'starting' ? 74 : phase === 'ready' ? 10 : -112

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label="Kixup ignition"
      className="fixed inset-0 z-[120] overflow-y-auto bg-ink-950"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-18%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-amber-400/[0.12] blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[420px] w-[620px] rounded-full bg-crimson-500/[0.12] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[380px] w-[520px] rounded-full bg-cyber-500/[0.09] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(circle at 50% 40%, black, transparent 72%)',
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-5 sm:px-8 sm:py-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10">
              <Flame className="h-4 w-4 text-amber-300" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-white/45">
              Kixup ignition
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleMuted}
              aria-label={muted ? 'Unmute ignition sound' : 'Mute ignition sound'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/60 transition hover:border-white/20 hover:text-white"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 text-[11px] font-semibold text-white/55 transition hover:border-white/20 hover:text-white"
            >
              <SkipForward className="h-3.5 w-3.5" />
              Skip
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center sm:py-10">
          <div className="relative mb-6 flex h-52 w-52 items-center justify-center sm:h-64 sm:w-64">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-3 rounded-full border border-amber-400/15" />
            <div className="absolute inset-0 rounded-full bg-amber-400/[0.06] blur-2xl" />
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="tach-arc" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" />
                  <stop offset="55%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F43F5E" />
                </linearGradient>
              </defs>
              <circle
                cx="100"
                cy="100"
                r="82"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="6"
              />
              <circle
                cx="100"
                cy="100"
                r="82"
                fill="none"
                stroke="url(#tach-arc)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="360 520"
                strokeDashoffset="0"
                opacity={phase === 'idle' ? 0.35 : 0.95}
                style={{ transition: 'opacity 600ms ease' }}
              />
              {Array.from({ length: 9 }).map((_, index) => {
                const angle = -112 + index * 28
                return (
                  <line
                    key={index}
                    x1="100"
                    y1="16"
                    x2="100"
                    y2={index % 2 === 0 ? 27 : 23}
                    stroke={index > 6 ? '#F43F5E' : 'rgba(255,255,255,0.35)'}
                    strokeWidth={index % 2 === 0 ? 2.5 : 1.5}
                    strokeLinecap="round"
                    transform={`rotate(${angle} 100 100)`}
                  />
                )
              })}
            </svg>

            <div
              className="absolute left-1/2 top-1/2 h-[74px] w-[3px] origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-gradient-to-t from-amber-300 to-crimson-400 shadow-[0_0_18px_rgba(251,191,36,0.65)]"
              style={{
                transform: `translate(-50%, -100%) rotate(${needle}deg)`,
                transformOrigin: '50% 100%',
                transition:
                  phase === 'starting'
                    ? 'transform 1200ms cubic-bezier(0.16, 1, 0.3, 1)'
                    : 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
            <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full border border-white/10 bg-ink-950/80 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:h-28 sm:w-28">
              <p className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
                KIX<span className="text-amber-300">UP</span>
              </p>
              <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.24em] text-white/35">
                {phase === 'ready' ? 'Ready' : phase === 'starting' ? 'Cranking' : 'Ignition'}
              </p>
            </div>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300/80">
            Kickstands up. Pack connected.
          </p>
          <h1 className="mt-3 max-w-lg font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Wake the machine.
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-crimson-300 to-cyber-300 bg-clip-text text-transparent">
              Then find your pack.
            </span>
          </h1>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-white/45 sm:text-sm">
            Pick your startup note. The first rev is on us — every sound is synthesized
            in your browser.
          </p>

          <div className="mt-6 w-full max-w-xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                Startup sound
              </p>
              <p className="text-[9px] text-white/25">
                {activeSounds.length} notes · {muted ? 'muted' : 'live audio'}
              </p>
            </div>

            {activeSounds.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {activeSounds.map((sound) => {
                  const locked = sound.isProOnly && !isPro
                  const active = selected?.id === sound.id
                  return (
                    <button
                      key={sound.id}
                      type="button"
                      onClick={() => pick(sound)}
                      className={cx(
                        'relative rounded-2xl border px-3 py-3 text-left transition',
                        active
                          ? 'border-amber-400/50 bg-amber-400/[0.09] shadow-[0_0_24px_-10px_rgba(251,191,36,0.55)]'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-white/35">
                          {sound.brand}
                        </span>
                        {locked ? (
                          <Lock className="h-3 w-3 shrink-0 text-amber-300/70" />
                        ) : active ? (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-ink-950">
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 truncate text-[11px] font-semibold text-white">
                        {sound.name}
                      </p>
                      <p className="mt-0.5 truncate text-[9px] text-white/35">
                        {sound.engineConfiguration} · {sound.decibels} dB
                      </p>
                      {locked ? (
                        <span className="mt-1.5 inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-amber-300/80">
                          <Lock className="h-2.5 w-2.5" /> PRO
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/40">
                No startup sounds are active. The Super Admin can add one in the ERP.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={start}
            disabled={phase === 'starting'}
            className={cx(
              'group flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl text-sm font-bold transition',
              phase === 'ready'
                ? 'bg-gradient-to-r from-amber-300 to-orange-400 text-ink-950 shadow-[0_14px_40px_-14px_rgba(251,191,36,0.9)] hover:from-amber-200 hover:to-orange-300'
                : 'bg-gradient-to-r from-crimson-500 to-rose-500 text-white shadow-[0_14px_40px_-14px_rgba(244,63,94,0.9)] hover:from-crimson-400 hover:to-rose-400',
              phase === 'starting' && 'cursor-wait opacity-80',
            )}
          >
            {phase === 'ready' ? (
              <>
                Enter Kixup <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </>
            ) : phase === 'starting' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Engine catching…
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" /> Start the engine
              </>
            )}
          </button>
          <p className="text-center text-[9px] leading-relaxed text-white/25">
            {muted
              ? 'Audio is muted. Tap the speaker to hear the rev.'
              : 'Synthesized in your browser · no audio files downloaded.'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
