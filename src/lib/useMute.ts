import { useState, useEffect } from 'react'

const SPEECH_KEY = 'norsnite-mute-speech'
const SFX_KEY    = 'norsnite-mute-sfx'

export function useMute() {
  const [speechMuted, setSpeechMuted] = useState(() => {
    const v = localStorage.getItem(SPEECH_KEY)
    return v !== null ? v === 'true' : true  // default: speech OFF
  })
  const [sfxMuted, setSfxMuted] = useState(() => localStorage.getItem(SFX_KEY) === 'true')

  useEffect(() => { localStorage.setItem(SPEECH_KEY, String(speechMuted)) }, [speechMuted])
  useEffect(() => { localStorage.setItem(SFX_KEY,    String(sfxMuted))    }, [sfxMuted])

  return {
    speechMuted,
    sfxMuted,
    toggleSpeech: () => setSpeechMuted(m => !m),
    toggleSfx:    () => setSfxMuted(m => !m),
    // Legacy: keep a single `muted` for any code that checks both
    muted: speechMuted && sfxMuted,
  }
}

/** Called directly by speech.ts — no React needed */
export function isSpeechMuted(): boolean {
  const v = localStorage.getItem(SPEECH_KEY)
  return v !== null ? v === 'true' : true  // default: speech OFF
}

export function isSfxMuted(): boolean {
  return localStorage.getItem(SFX_KEY) === 'true'
}

/** @deprecated use isSpeechMuted() / isSfxMuted() */
export function isMuted(): boolean {
  return isSpeechMuted()
}
