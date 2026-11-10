/**
 * MotoSync Ambient Sound Generator
 * Generates assets/audio/ambient_loop.wav
 *
 * Sound Profile: Deep motorcycle twin-cylinder engine hum + futuristic electronic synth ambient drone.
 * License: CC0 1.0 Universal (Public Domain Dedication)
 * Procedurally synthesized for the MotoSync native mobile app.
 */
import fs from 'fs'
import path from 'path'

const SAMPLE_RATE = 32000
const DURATION_SEC = 8
const NUM_CHANNELS = 2
const BYTES_PER_SAMPLE = 2 // 16-bit
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION_SEC

const buffer = Buffer.alloc(44 + TOTAL_SAMPLES * NUM_CHANNELS * BYTES_PER_SAMPLE)

// RIFF Header
buffer.write('RIFF', 0)
buffer.writeUInt32LE(36 + TOTAL_SAMPLES * NUM_CHANNELS * BYTES_PER_SAMPLE, 4)
buffer.write('WAVE', 8)
buffer.write('fmt ', 12)
buffer.writeUInt32LE(16, 16) // Subchunk1Size (16 for PCM)
buffer.writeUInt16LE(1, 20)  // AudioFormat (1 for PCM)
buffer.writeUInt16LE(NUM_CHANNELS, 22)
buffer.writeUInt32LE(SAMPLE_RATE, 24)
buffer.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * BYTES_PER_SAMPLE, 28) // ByteRate
buffer.writeUInt16LE(NUM_CHANNELS * BYTES_PER_SAMPLE, 32) // BlockAlign
buffer.writeUInt16LE(16, 34) // BitsPerSample
buffer.write('data', 36)
buffer.writeUInt32LE(TOTAL_SAMPLES * NUM_CHANNELS * BYTES_PER_SAMPLE, 40)

let offset = 44

for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const t = i / SAMPLE_RATE
  const loopT = (i / TOTAL_SAMPLES) * (2 * Math.PI)

  // 1. Engine twin-cylinder idle pulse (approx 12 Hz firing rate, 42 Hz fundamental)
  const pulse = 0.6 + 0.4 * Math.sin(12 * 2 * Math.PI * t)
  const engineFund = Math.sin(42 * 2 * Math.PI * t) * pulse
  const engineSub = 0.5 * Math.sin(21 * 2 * Math.PI * t)
  const engineHarmonic = 0.35 * Math.sin(84 * 2 * Math.PI * t) * (0.8 + 0.2 * Math.cos(24 * 2 * Math.PI * t))

  // 2. Electronic synth drone (detuned airy pad)
  const padL = 0.25 * Math.sin(256 * 2 * Math.PI * t) + 0.15 * Math.sin(384 * 2 * Math.PI * t + 0.5)
  const padR = 0.25 * Math.sin(258 * 2 * Math.PI * t + 0.2) + 0.15 * Math.sin(382 * 2 * Math.PI * t + 0.8)

  // 3. Cyberpunk subtle movement (LFO filter modulation)
  const lfo = 0.85 + 0.15 * Math.sin(loopT)

  // Combine channels with loop windowing to ensure 0 pop at loop boundary
  let leftSample = (engineFund * 0.45 + engineSub * 0.3 + engineHarmonic * 0.2 + padL * 0.25) * lfo
  let rightSample = (engineFund * 0.45 + engineSub * 0.3 + engineHarmonic * 0.2 + padR * 0.25) * lfo

  // Fade in first 200 samples and fade out last 200 samples seamlessly
  const edgeSamples = 400
  if (i < edgeSamples) {
    const factor = i / edgeSamples
    leftSample *= factor
    rightSample *= factor
  } else if (i > TOTAL_SAMPLES - edgeSamples) {
    const factor = (TOTAL_SAMPLES - i) / edgeSamples
    leftSample *= factor
    rightSample *= factor
  }

  // Soft limiter to prevent any clipping
  const clamp = (v) => Math.max(-0.95, Math.min(0.95, v))
  const intLeft = Math.round(clamp(leftSample) * 32767)
  const intRight = Math.round(clamp(rightSample) * 32767)

  buffer.writeInt16LE(intLeft, offset)
  offset += 2
  buffer.writeInt16LE(intRight, offset)
  offset += 2
}

const outDir = path.resolve('assets/audio')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

const outPath = path.join(outDir, 'ambient_loop.wav')
fs.writeFileSync(outPath, buffer)

console.log(`Generated ambient loop audio: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`)
