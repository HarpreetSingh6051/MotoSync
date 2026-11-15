/**
 * MotoSync Ambient Sound Provider & Hook
 *
 * Ambient audio engine playing procedural engine-hum & electronic ambient loop.
 * License: CC0 1.0 Universal (Public Domain Dedication)
 *
 * Requirements:
 * - Off by default.
 * - Volume at ~25% (0.25) with 500ms smooth fade in / fade out.
 * - Saved preference in AsyncStorage ('motosync_sound_enabled').
 * - Respects iOS silent switch & handles audio interruptions.
 * - AppState handling: pauses when backgrounded/locked, resumes only if previously playing.
 * - Route protection: never plays on /splash or /onboarding.
 * - Handles browser/iOS user-gesture autoplay policies.
 */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { AppState, type AppStateStatus, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio'
import { usePathname, useLocalSearchParams } from 'expo-router'

const STORAGE_KEY = 'motosync_ambient_sound_enabled'
const TARGET_VOLUME = 0.25
const FADE_DURATION_MS = 500
const FADE_STEPS = 10
const FADE_STEP_MS = FADE_DURATION_MS / FADE_STEPS

interface SoundContextValue {
  isPlaying: boolean
  isEnabled: boolean
  play: () => Promise<void>
  pause: () => Promise<void>
  toggle: () => Promise<void>
}

const SoundContext = createContext<SoundContextValue>({
  isPlaying: false,
  isEnabled: false,
  play: async () => {},
  pause: async () => {},
  toggle: async () => {},
})

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const params = useLocalSearchParams<{ sound?: string }>()
  const [isEnabled, setIsEnabled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const playerRef = useRef<AudioPlayer | null>(null)
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wasPlayingBeforeBackground = useRef(false)
  const userHasInteracted = useRef(false)
  const isLoadedRef = useRef(false)

  // Configure Audio Mode on mount
  useEffect(() => {
    const setupAudioMode = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: false,
          interruptionMode: 'duckOthers',
        })
      } catch (err) {
        // Fallback or web environment where setAudioMode is unneeded
      }
    }
    setupAudioMode()
  }, [])

  // Initialize Audio Player
  const getOrCreatePlayer = useCallback((): AudioPlayer | null => {
    if (playerRef.current) return playerRef.current

    try {
      // In Metro / React Native, require maps to asset number or url
      const audioSource = require('@/assets/audio/ambient_loop.wav')
      const player = createAudioPlayer(audioSource)
      player.loop = true
      player.volume = 0
      playerRef.current = player
      isLoadedRef.current = true
      return player
    } catch (err) {
      console.warn('[SoundProvider] Audio player init failed:', err)
      return null
    }
  }, [])

  // Fade Volume Helper
  const fadeVolume = useCallback((targetVol: number, onComplete?: () => void) => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
    }

    const player = playerRef.current
    if (!player) {
      onComplete?.()
      return
    }

    const startVol = player.volume ?? 0
    const volDelta = (targetVol - startVol) / FADE_STEPS
    let currentStep = 0

    fadeIntervalRef.current = setInterval(() => {
      currentStep += 1
      const newVol = Math.max(0, Math.min(1, startVol + volDelta * currentStep))
      try {
        player.volume = newVol
      } catch {}

      if (currentStep >= FADE_STEPS) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
          fadeIntervalRef.current = null
        }
        try {
          player.volume = targetVol
        } catch {}
        onComplete?.()
      }
    }, FADE_STEP_MS)
  }, [])

  // Play with Fade-In
  const playSound = useCallback(async () => {
    // Never play on splash or onboarding
    if (pathname?.includes('/splash') || pathname?.includes('/onboarding')) {
      return
    }

    userHasInteracted.current = true
    const player = getOrCreatePlayer()
    if (!player) return

    try {
      if (!player.playing) {
        player.volume = 0
        player.play()
      }
      setIsPlaying(true)
      setIsEnabled(true)
      await AsyncStorage.setItem(STORAGE_KEY, 'true').catch(() => {})

      fadeVolume(TARGET_VOLUME)
    } catch (err) {
      console.warn('[SoundProvider] Playback error:', err)
    }
  }, [getOrCreatePlayer, fadeVolume, pathname])

  // Pause with Fade-Out
  const pauseSound = useCallback(async () => {
    const player = playerRef.current
    if (!player) {
      setIsPlaying(false)
      return
    }

    setIsPlaying(false)
    fadeVolume(0, () => {
      try {
        player.pause()
      } catch {}
    })
  }, [fadeVolume])

  // User explicit Toggle
  const toggleSound = useCallback(async () => {
    userHasInteracted.current = true
    if (isPlaying) {
      setIsEnabled(false)
      await AsyncStorage.setItem(STORAGE_KEY, 'false').catch(() => {})
      await pauseSound()
    } else {
      await playSound()
    }
  }, [isPlaying, pauseSound, playSound])

  // Restore user preference on mount
  useEffect(() => {
    const checkSavedPref = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY)
        if (saved === 'true') {
          setIsEnabled(true)
          // We mark enabled, but wait for user gesture before autoplaying to comply with web/iOS
        }
      } catch {}
    }
    checkSavedPref()
  }, [])

  // Never allow sound on splash or onboarding
  useEffect(() => {
    if (pathname?.includes('/splash') || pathname?.includes('/onboarding')) {
      if (isPlaying) {
        pauseSound()
      }
    }
  }, [pathname, isPlaying, pauseSound])

  // AppState Background / Foreground Listener
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (isPlaying) {
          wasPlayingBeforeBackground.current = true
          pauseSound()
        } else {
          wasPlayingBeforeBackground.current = false
        }
      } else if (nextAppState === 'active') {
        if (wasPlayingBeforeBackground.current && isEnabled) {
          playSound()
        }
        wasPlayingBeforeBackground.current = false
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => {
      subscription.remove()
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
    }
  }, [isPlaying, isEnabled, pauseSound, playSound])

  // Playback requires the explicit sound control, never a generic screen tap.
  useEffect(() => () => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
    playerRef.current?.remove()
  }, [])

  return (
    <SoundContext.Provider
      value={{
        isPlaying,
        isEnabled,
        play: playSound,
        pause: pauseSound,
        toggle: toggleSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  )
}

export const useSound = () => useContext(SoundContext)
