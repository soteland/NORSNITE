import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import { adventurerNeutral } from '@dicebear/collection'
import type { Options as AdventurerOptions } from '@dicebear/adventurer-neutral'
import type { AvatarConfig } from '@/lib/avatar'

export default function AvatarPreview({ config, size = 160 }: { config: AvatarConfig; size?: number }) {
  const svg = useMemo(() => {
    type EyeVar   = NonNullable<AdventurerOptions['eyes']>[0]
    type BrowVar  = NonNullable<AdventurerOptions['eyebrows']>[0]
    type MouthVar = NonNullable<AdventurerOptions['mouth']>[0]
    type GlassVar = NonNullable<AdventurerOptions['glasses']>[0]
    const options: AdventurerOptions = {
      backgroundColor: [config.backgroundColor],
      eyes:            [config.eyes as EyeVar],
      eyebrows:        [config.eyebrows as BrowVar],
      mouth:           [config.mouth as MouthVar],
      glassesProbability: config.glasses ? 100 : 0,
      ...(config.glasses ? { glasses: [config.glasses as GlassVar] } : {}),
    }
    return createAvatar(adventurerNeutral, options).toString()
  }, [config])

  return (
    <div
      style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
