import { isSpeechMuted, isSfxMuted } from './useMute'

/** Speak text in Norwegian using the Web Speech API (nb-NO). No-op if unsupported or muted. */
export function speak(text: string): void {
  if (!('speechSynthesis' in window)) return
  if (isSpeechMuted()) return
  speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'nb-NO'
  utter.rate = 0.9
  speechSynthesis.speak(utter)
}

/**
 * Speak text and call `onDone` when finished (or immediately if muted/unsupported).
 * Use this when you need to wait for speech before advancing UI.
 */
export function speakThen(text: string, onDone: () => void): void {
  if (!('speechSynthesis' in window) || isSpeechMuted()) {
    onDone()
    return
  }
  speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'nb-NO'
  utter.rate = 0.9
  // Guard: only call onDone once (onend + onerror can both fire on some browsers)
  let called = false
  const done = () => { if (!called) { called = true; onDone() } }
  utter.onend = done
  utter.onerror = done
  // Fallback: iOS Safari sometimes never fires onend — advance after 3 s max
  setTimeout(done, 3000)
  speechSynthesis.speak(utter)
}

// Shared AudioContext — created lazily, reused to avoid browser limits
let ctx: AudioContext | null = null
function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) ctx = new AudioContext()
  // Safari suspends context until a user gesture — resume if needed
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

/** Short "pling" for a correct answer. */
export function playCorrect(): void {
  if (isSfxMuted()) return
  const ac = getAudioCtx()
  if (!ac) return
  const now = ac.currentTime
  // Two sine tones ascending: C5 → E5, short with quick decay
  const freqs = [523.25, 659.25]
  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = now + i * 0.1
    gain.gain.setValueAtTime(0.25, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35)
    osc.start(start)
    osc.stop(start + 0.35)
  })
}

/** Gentle two-tone chime when a round ends. */
export function playRoundDone(): void {
  if (isSfxMuted()) return
  const ac = getAudioCtx()
  if (!ac) return
  const now = ac.currentTime
  // C5 → G5, soft sine bells
  const chimeFreqs = [523.25, 783.99]
  chimeFreqs.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = now + i * 0.18
    gain.gain.setValueAtTime(0.2, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6)
    osc.start(start)
    osc.stop(start + 0.6)
  })
}

/** Triumphant 4-note fanfare for a perfect round. */
export function playPerfect(): void {
  if (isSfxMuted()) return
  const ac = getAudioCtx()
  if (!ac) return
  const now = ac.currentTime
  // C5 → E5 → G5 → C6 ascending fanfare
  const fanfareFreqs = [523.25, 659.25, 783.99, 1046.5]
  fanfareFreqs.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = now + i * 0.13
    gain.gain.setValueAtTime(0.22, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5)
    osc.start(start)
    osc.stop(start + 0.5)
  })
}

export function playWrong(): void {
  if (isSfxMuted()) return
  const ac = getAudioCtx()
  if (!ac) return
  const now = ac.currentTime
  // Detuned sawtooth dropping quickly — classic "fail" tone
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(220, now)
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.3)
  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
  osc.start(now)
  osc.stop(now + 0.35)
}
