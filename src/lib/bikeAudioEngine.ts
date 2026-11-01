import type { ExhaustPreset } from '@/types'

/**
 * Kixup ignition / exhaust engine.
 *
 * Everything is synthesized with WebAudio so the app has a real startup note
 * with zero audio assets. If the Super Admin supplies an `audioUrl` for a
 * sound, that asset is tried first and synthesis is the fallback.
 */

interface PlayOptions {
  muted?: boolean
  audioUrl?: string
  durationSec?: number
  decibels?: number
}

interface PresetConfig {
  base: number
  top: number
  harmonics: number[]
  types: OscillatorType[]
  lope: number
  duration: number
  filter: number
  noise: number
  rattle?: boolean
}

const presets: Record<ExhaustPreset, PresetConfig> = {
  harley_vtwin: {
    base: 46,
    top: 128,
    harmonics: [1, 2, 3],
    types: ['sawtooth', 'square', 'sawtooth'],
    lope: 7.6,
    duration: 2.9,
    filter: 720,
    noise: 0.32,
  },
  bullet_thump: {
    base: 38,
    top: 92,
    harmonics: [1, 2],
    types: ['triangle', 'square'],
    lope: 3.2,
    duration: 3.1,
    filter: 460,
    noise: 0.4,
  },
  ninja_inline4: {
    base: 155,
    top: 920,
    harmonics: [1, 2, 3, 4],
    types: ['sawtooth', 'square', 'sawtooth', 'triangle'],
    lope: 0,
    duration: 2.4,
    filter: 2600,
    noise: 0.12,
  },
  ducati_v4: {
    base: 88,
    top: 540,
    harmonics: [1, 2, 3, 4],
    types: ['sawtooth', 'square', 'sawtooth', 'square'],
    lope: 11,
    duration: 2.6,
    filter: 1500,
    noise: 0.3,
    rattle: true,
  },
  triumph_triple: {
    base: 118,
    top: 660,
    harmonics: [1, 2, 3],
    types: ['sawtooth', 'triangle', 'square'],
    lope: 0,
    duration: 2.6,
    filter: 1800,
    noise: 0.18,
  },
}

let context: AudioContext | null = null
let activeSources: Array<OscillatorNode | AudioBufferSourceNode> = []
let activeNodes: AudioNode[] = []
let activeAudio: HTMLAudioElement | null = null

const getContext = () => {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!context) context = new Ctor()
  return context
}

export const isAudioSupported = () => Boolean(getContext())

export const unlockAudio = async () => {
  const ctx = getContext()
  if (ctx && ctx.state === 'suspended') await ctx.resume()
}

const stopActive = () => {
  activeSources.forEach((source) => {
    try {
      source.stop()
    } catch {
      /* already stopped */
    }
    try {
      source.disconnect()
    } catch {
      /* noop */
    }
  })
  activeNodes.forEach((node) => {
    try {
      node.disconnect()
    } catch {
      /* noop */
    }
  })
  activeSources = []
  activeNodes = []

  if (activeAudio) {
    activeAudio.pause()
    activeAudio.src = ''
    activeAudio = null
  }
}

export const stopAllSounds = () => stopActive()

const playAsset = (url: string, muted: boolean) =>
  new Promise<boolean>((resolve) => {
    if (typeof Audio === 'undefined') {
      resolve(false)
      return
    }

    const audio = new Audio(url)
    audio.preload = 'auto'
    audio.volume = muted ? 0 : 0.7
    let settled = false
    let timer = 0

    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      resolve(ok)
    }

    timer = window.setTimeout(() => {
      if (!settled) {
        audio.pause()
        finish(false)
      }
    }, 1600)

    audio.addEventListener(
      'canplaythrough',
      () => {
        activeAudio = audio
        void audio
          .play()
          .then(() => {
            audio.onended = () => {
              if (activeAudio === audio) activeAudio = null
            }
            finish(true)
          })
          .catch(() => finish(false))
      },
      { once: true },
    )
    audio.addEventListener('error', () => finish(false), { once: true })
    audio.load()
  })

const makeNoiseBuffer = (
  ctx: AudioContext,
  duration: number,
  kind: 'low' | 'high',
) => {
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0

  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1
    if (kind === 'low') {
      last = (last + 0.02 * white) / 1.02
      data[index] = last * 3.4
    } else {
      data[index] = white * 0.55
    }
  }

  return buffer
}

const synthStartup = (
  ctx: AudioContext,
  preset: ExhaustPreset,
  options: PlayOptions,
) => {
  const config = presets[preset]
  const duration = Math.max(1.2, Math.min(6, options.durationSec ?? config.duration))
  const volume = Math.min(
    0.24,
    0.07 + ((options.decibels ?? 98) - 88) * 0.0065,
  )
  const now = ctx.currentTime

  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -18
  compressor.knee.value = 22
  compressor.ratio.value = 6
  compressor.attack.value = 0.003
  compressor.release.value = 0.25
  compressor.connect(ctx.destination)

  const master = ctx.createGain()
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(volume, now + 0.12)
  master.gain.setValueAtTime(volume, now + duration * 0.76)
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  master.connect(compressor)

  const shaper = ctx.createWaveShaper()
  const curve = new Float32Array(1024)
  for (let index = 0; index < curve.length; index += 1) {
    const x = (index / (curve.length - 1)) * 2 - 1
    curve[index] = Math.tanh(x * 2.5)
  }
  shaper.curve = curve
  shaper.connect(master)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(config.filter * 0.7, now)
  filter.frequency.linearRampToValueAtTime(config.filter, now + duration * 0.34)
  filter.frequency.linearRampToValueAtTime(config.filter * 0.72, now + duration)
  filter.Q.value = 1.2
  filter.connect(shaper)

  activeNodes.push(compressor, master, shaper, filter)

  // Starter crank — a short mechanical grind before the engine catches.
  const starter = ctx.createBufferSource()
  starter.buffer = makeNoiseBuffer(ctx, 0.42, 'high')
  const starterFilter = ctx.createBiquadFilter()
  starterFilter.type = 'bandpass'
  starterFilter.frequency.value = 1800
  starterFilter.Q.value = 0.8
  const starterGain = ctx.createGain()
  starterGain.gain.setValueAtTime(0.0001, now)
  starterGain.gain.exponentialRampToValueAtTime(0.13, now + 0.03)
  starterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
  starter.connect(starterFilter)
  starterFilter.connect(starterGain)
  starterGain.connect(master)
  starter.start(now)
  starter.stop(now + 0.42)
  activeSources.push(starter)
  activeNodes.push(starterFilter, starterGain)

  // Engine harmonics with a throttle blip.
  config.harmonics.forEach((harmonic, index) => {
    const osc = ctx.createOscillator()
    osc.type = config.types[index % config.types.length]

    const start = Math.max(20, config.base * harmonic)
    const peak = Math.max(24, config.top * harmonic * 0.82)
    osc.frequency.setValueAtTime(start, now)
    osc.frequency.exponentialRampToValueAtTime(peak, now + duration * 0.32)
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, start * 1.08),
      now + duration * 0.74,
    )
    osc.frequency.exponentialRampToValueAtTime(start, now + duration)

    const gain = ctx.createGain()
    gain.gain.value = index === 0 ? 0.62 : 0.18 / index
    osc.connect(gain)
    gain.connect(filter)
    osc.start(now)
    osc.stop(now + duration + 0.05)
    activeSources.push(osc)
    activeNodes.push(gain)
  })

  // V-twin / V4 lope.
  if (config.lope > 0) {
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = config.lope
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = volume * 0.24
    lfo.connect(lfoGain)
    lfoGain.connect(master.gain)
    lfo.start(now)
    lfo.stop(now + duration)
    activeSources.push(lfo)
    activeNodes.push(lfoGain)
  }

  // Intake / exhaust noise.
  const noise = ctx.createBufferSource()
  noise.buffer = makeNoiseBuffer(ctx, duration, config.rattle ? 'high' : 'low')
  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = config.rattle ? 'highpass' : 'lowpass'
  noiseFilter.frequency.value = config.rattle ? 2200 : 220
  const noiseGain = ctx.createGain()
  noiseGain.gain.value = config.noise
  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(master)
  noise.start(now)
  noise.stop(now + duration)
  activeSources.push(noise)
  activeNodes.push(noiseFilter, noiseGain)

  // Inline-4 / triple top-end whine.
  if (preset === 'ninja_inline4' || preset === 'triumph_triple') {
    const whine = ctx.createOscillator()
    whine.type = 'sine'
    whine.frequency.setValueAtTime(preset === 'ninja_inline4' ? 1200 : 900, now)
    whine.frequency.exponentialRampToValueAtTime(
      preset === 'ninja_inline4' ? 3200 : 2100,
      now + duration * 0.45,
    )
    whine.frequency.exponentialRampToValueAtTime(
      preset === 'ninja_inline4' ? 1500 : 1000,
      now + duration,
    )
    const whineGain = ctx.createGain()
    whineGain.gain.value = 0.035
    whine.connect(whineGain)
    whineGain.connect(master)
    whine.start(now)
    whine.stop(now + duration)
    activeSources.push(whine)
    activeNodes.push(whineGain)
  }

  return true
}

/**
 * Plays a full ignition note. Resolves as soon as audio starts so the splash
 * animation can run in parallel.
 */
export const playStartupSound = async (
  preset: ExhaustPreset,
  options: PlayOptions = {},
) => {
  const ctx = getContext()
  if (!ctx) return false
  if (options.muted) return true

  await ctx.resume()
  stopActive()

  if (options.audioUrl) {
    const played = await playAsset(options.audioUrl, false)
    if (played) return true
  }

  return synthStartup(ctx, preset, options)
}

export const previewExhaustSound = (
  sound: { synthPreset: ExhaustPreset; audioUrl?: string; decibels?: number },
  muted = false,
) =>
  playStartupSound(sound.synthPreset, {
    muted,
    audioUrl: sound.audioUrl,
    decibels: sound.decibels,
  })
