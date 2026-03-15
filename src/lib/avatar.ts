// Shared avatar constants, types, and helpers used by OnboardingPage and ProfilePage

export const EYES = ['variant01','variant02','variant03','variant04','variant05','variant06','variant07','variant08','variant09','variant10','variant11','variant12','variant13','variant14','variant15','variant16','variant17','variant18','variant19','variant20','variant21','variant22','variant23','variant24','variant25','variant26']
export const EYEBROWS = ['variant01','variant02','variant03','variant04','variant05','variant06','variant07','variant08','variant09','variant10','variant11','variant12','variant13','variant14','variant15']
export const MOUTH = ['variant01','variant02','variant03','variant04','variant05','variant06','variant07','variant08','variant09','variant10','variant11','variant12','variant13','variant14','variant15','variant16','variant17','variant18','variant19','variant20','variant21','variant22','variant23','variant24','variant25','variant26','variant27','variant28','variant29','variant30']
export const GLASSES = [null, 'variant01', 'variant02', 'variant03', 'variant04', 'variant05']

export const SKIN_TONES = [
  { label: 'Lys',        hex: 'FDDBB4' },
  { label: 'Medium lys', hex: 'E8AC80' },
  { label: 'Medium',     hex: 'C68642' },
  { label: 'Mørk',       hex: '8D5524' },
  { label: 'Meget mørk', hex: '4A2912' },
]
export const FUN_COLORS = [
  { label: 'Lilla',   hex: 'a855f7' },
  { label: 'Blå',     hex: '3b82f6' },
  { label: 'Grønn',   hex: '22c55e' },
  { label: 'Oransje', hex: 'f97316' },
  { label: 'Rosa',    hex: 'ec4899' },
  { label: 'Cyan',    hex: '06b6d4' },
  { label: 'Gul',     hex: 'eab308' },
  { label: 'Rød',     hex: 'ef4444' },
]

export interface AvatarConfig {
  backgroundColor: string
  eyes: string
  eyebrows: string
  mouth: string
  glasses: string | null
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  backgroundColor: 'E8AC80',
  eyes: 'variant01',
  eyebrows: 'variant01',
  mouth: 'variant15',
  glasses: null,
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

export function randomAvatarConfig(): AvatarConfig {
  const allColors = [...SKIN_TONES, ...FUN_COLORS]
  return {
    backgroundColor: pick(allColors).hex,
    eyes:     pick(EYES),
    eyebrows: pick(EYEBROWS),
    mouth:    pick(MOUTH),
    glasses:  Math.random() < 0.25 ? pick(GLASSES.filter(g => g !== null) as string[]) : null,
  }
}

export function cycleOption<T>(arr: T[], current: T, delta: number): T {
  const idx = arr.indexOf(current)
  return arr[((idx + delta) % arr.length + arr.length) % arr.length]
}
