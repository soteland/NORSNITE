import { adjectives } from './adjectives'
import { nouns } from './nouns'

export function generateUsername(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 900) + 1
  return `${adj}${noun}${num}`
}
