import { useState, useEffect } from 'react'

const SPEECH_KEY = 'norsnite-mute-speech'
const SFX_KEY    = 'norsnite-mute-sfx'

export function useMute() {
  const [speechMuted, setSpeechMuted] = useState(() => localStorage.getItem(SPEECH_KEY) === 'true')
  const [sfxMuted,    setSfxMuted]    = useState(() => localStorage.getItem(SFX_KEY) === 'true')

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
  return localStorage.getItem(SPEECH_KEY) === 'true'
}

export function isSfxMuted(): boolean {
  return localStorage.getItem(SFX_KEY) === 'true'
}

/** @deprecated use isSpeechMuted() / isSfxMuted() */
export function isMuted(): boolean {
  return isSpeechMuted()
}
