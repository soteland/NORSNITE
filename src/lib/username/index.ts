import { adjectives } from './adjectives'
import { nouns } from './nouns'

export function generateUsername(): string {
  // Retry until we get a combo that fits within 20 chars
  for (let i = 0; i < 50; i++) {
    const adj  = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const num  = Math.floor(Math.random() * 900) + 1
    const name = `${adj}${noun}${num}`
    if (name.length <= 20) return name
  }
  // Fallback: short known combo
  return `Spiller${Math.floor(Math.random() * 9000) + 1000}`
}
