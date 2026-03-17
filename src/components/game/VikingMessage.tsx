import { useRef } from 'react'
import viking01 from '/images/viking-01.png'
import viking02 from '/images/viking-02.png'
import viking03 from '/images/viking-03.png'
import viking04 from '/images/viking-04.png'
import viking05 from '/images/viking-05.png'
import viking06 from '/images/viking-06.png'

const VIKINGS = [viking01, viking02, viking03, viking04, viking05, viking06]

const MESSAGES = {
    perfect: [
        { headline: '✨ Perfekt runde!', sub: 'Du er en ekte stave-helt!' },
        { headline: '🌟 Imponerende!', sub: 'Alle svar riktige — viking-style!' },
        { headline: '🏆 KNALLBRA!', sub: 'Ingen feil — du er uslåelig!' },
        { headline: '⚡ Wow!', sub: 'Perfekt score! Du lyser som Bifrost!' },
        { headline: '🎯 Bullseye!', sub: 'Hundre prosent! Odin ville vært stolt.' },
        { headline: '🔥 Er det mulig?', sub: 'Du brilljerer, viking!' },
        { headline: '💫 Strålende!', sub: 'Perfekt score — prøv neste nivå!' },
        { headline: '👑 LEGENDARISK!', sub: 'Ikke ett feil svar. Utrolig!' },
    ],
    normal: [
        { headline: '🎉 Bra jobba!', sub: 'Du er på god vei, viking!' },
        { headline: '💪 Solid runde!', sub: 'Keep it up — du blir bedre og bedre!' },
        { headline: '🌊 Godt kjørt!', sub: 'Vikinger gir aldri opp!' },
        { headline: '⚔️ Knallbra!', sub: 'Sverd hevet — klar for neste runde!' },
        { headline: '🛡️ Bra innsats!', sub: 'Hvert svar gjør deg sterkere!' },
        { headline: '🐉 Dragedreper!', sub: 'Du takler ordene som en helt!' },
        { headline: '🚀 Fremover!', sub: 'Skal du brilljere — og det gjør du!' },
        { headline: '⭐ Stjernestunt!', sub: 'Du samler XP som en proff!' },
        { headline: '🎵 Flott!', sub: 'Skaldene synger om deg i kveld!' },
        { headline: '🌅 Ny runde venter!', sub: 'Du vokser for hver gang!' },
    ],
    zero: [
        { headline: '😤 Uffda!', sub: 'Jeg har tro på deg — prøv én gang til!' },
        { headline: '💡 Ikke gi opp!', sub: 'Du lærer noe nytt for hver runde!' },
        { headline: '🛡️ Vikinger reiser seg!', sub: 'Det var tøft — men du klarer det!' },
        { headline: '🔄 Prøv igjen!', sub: 'Ved Odin! Det er slik vi lærer!' },
        { headline: '❄️ Fortsett!', sub: 'Til og med Tor hadde dårlige dager!' },
        { headline: '🌱 Neste gang!', sub: 'Hvert forsøk gjør deg klokere!' },
    ],
}

interface Props {
    state: 'perfect' | 'normal' | 'zero'
}

export default function VikingMessage({ state }: Props) {
    // Stable random picks — won't re-randomize on re-render
    const vikingIdx = useRef(Math.floor(Math.random() * VIKINGS.length)).current
    const msgList = MESSAGES[state]
    const msgIdx = useRef(Math.floor(Math.random() * msgList.length)).current
    const msg = msgList[msgIdx]

    return (
        <div className="flex items-center gap-4 w-full max-w-sm">
            <img
                src={VIKINGS[vikingIdx]}
                alt="viking mascot"
                className="w-1/2 h-auto flex-shrink-0 drop-shadow-lg"
            />
            <div className="text-left">
                <p className="text-xl font-black text-white leading-tight">{msg.headline}</p>
                <p className="text-md text-white/75 mt-1">{msg.sub}</p>
            </div>
        </div>
    )
}
