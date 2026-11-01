/**
 * Exhaust audio facade.
 *
 * The real synthesis lives in `bikeAudioEngine.ts` (five presets, startup
 * sequence, optional real assets). This module keeps the small API used by
 * stories and chat previews: a short V-twin note plus microphone recording.
 */
import {
  isAudioSupported as engineSupported,
  playStartupSound,
} from '@/lib/bikeAudioEngine'

export const isAudioSupported = () => engineSupported()

/** Plays a short engine rev. Resolves when the note has finished. */
export const playExhaustNote = async (durationSec = 4.5, db = 98) => {
  const duration = Math.max(0.8, Math.min(8, durationSec))
  const started = await playStartupSound('harley_vtwin', {
    durationSec: duration,
    decibels: db,
  })
  if (!started) return false
  await new Promise((resolve) => window.setTimeout(resolve, duration * 1000))
  return true
}

/** Records a real microphone clip when permitted; returns null if declined. */
export const recordExhaustNote = async (maxMs = 8000) => {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    return null
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    const chunks: BlobPart[] = []
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    recorder.start()
    const startedAt = Date.now()
    await new Promise((resolve) => window.setTimeout(resolve, maxMs))
    recorder.stop()
    stream.getTracks().forEach((track) => track.stop())
    await new Promise((resolve) => {
      recorder.onstop = () => resolve(null)
      if (recorder.state === 'inactive') resolve(null)
    })
    const blob = new Blob(chunks, { type: 'audio/webm' })
    return {
      url: URL.createObjectURL(blob),
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      size: blob.size,
    }
  } catch {
    return null
  }
}
