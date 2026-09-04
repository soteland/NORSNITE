import type { WordRecognitionQuestion } from './types'

// Word recognition: three visually similar words, tap the one matching the
// target shown above them. The point is fast whole-word recognition for kids
// who still decode letter by letter, so the words within a triplet share a
// first letter and a length and differ by only a letter or two.
//
// The selector picks WHICH of the three is the target at random, so every
// triplet is three different questions. Meaning is not required to answer —
// that's why the top difficulties can use words a 12-year-old only half knows.

// A triplet stores just the three words; target, display order and text sizes
// are randomised per question by the selector below.
type WordRecognitionTriplet = {
  id: string
  difficulty: number
  words: [string, string, string]
}

export const wordRecognitionTriplets: WordRecognitionTriplet[] = [
  // ── Nivå 1 ───────────────────────────────────────────────────────────
  { id: 'wr-b02', difficulty: 1, words: ['bad', 'bak', 'bar'] },
  { id: 'wr-b03', difficulty: 1, words: ['dam', 'dum', 'dal'] },
  { id: 'wr-b04', difficulty: 1, words: ['dyr', 'dyp', 'dør'] },
  { id: 'wr-s07', difficulty: 1, words: ['sol', 'sal', 'sel'] },
  { id: 'wr-s10', difficulty: 1, words: ['lys', 'løs', 'les'] },
  { id: 'wr-s13', difficulty: 1, words: ['ris', 'ros', 'rot'] },
  { id: 'wr-s14', difficulty: 1, words: ['katt', 'hatt', 'matt'] },
  // ── Nivå 2 ───────────────────────────────────────────────────────────
  { id: 'wr-b05', difficulty: 2, words: ['hake', 'hule', 'hele'] },
  { id: 'wr-b09', difficulty: 2, words: ['gutt', 'godt', 'gikk'] },
  { id: 'wr-b10', difficulty: 2, words: ['gate', 'gave', 'gass'] },
  { id: 'wr-k01', difficulty: 2, words: ['kort', 'kart', 'korn'] },
  { id: 'wr-k02', difficulty: 2, words: ['kald', 'kalv', 'kant'] },
  { id: 'wr-k05', difficulty: 2, words: ['lek', 'lat', 'lam'] },
  { id: 'wr-k09', difficulty: 2, words: ['natt', 'nett', 'nøtt'] },
  { id: 'wr-r03', difficulty: 2, words: ['tre', 'tro', 'tur'] },
  { id: 'wr-r04', difficulty: 2, words: ['vei', 'ved', 'vev'] },
  { id: 'wr-r05', difficulty: 2, words: ['rot', 'rop', 'rom'] },
  { id: 'wr-r07', difficulty: 2, words: ['tak', 'tap', 'tar'] },
  { id: 'wr-s01', difficulty: 2, words: ['mørk', 'mark', 'melk'] },
  { id: 'wr-s02', difficulty: 2, words: ['hest', 'hast', 'høst'] },
  { id: 'wr-s03', difficulty: 2, words: ['fisk', 'fest', 'fast'] },
  { id: 'wr-s05', difficulty: 2, words: ['hage', 'hale', 'hule'] },
  { id: 'wr-s06', difficulty: 2, words: ['bake', 'bade', 'bare'] },
  { id: 'wr-s08', difficulty: 2, words: ['mor', 'mur', 'mus'] },
  { id: 'wr-s09', difficulty: 2, words: ['kort', 'kurv', 'kork'] },
  { id: 'wr-s12', difficulty: 2, words: ['seng', 'sang', 'seil'] },
  { id: 'wr-s18', difficulty: 2, words: ['øre', 'øve', 'øke'] },
  { id: 'wr-s19', difficulty: 2, words: ['lite', 'late', 'lete'] },
  { id: 'wr-v01', difficulty: 2, words: ['and', 'ape', 'arm'] },
  { id: 'wr-v03', difficulty: 2, words: ['elg', 'eng', 'elv'] },
  { id: 'wr-v06', difficulty: 2, words: ['ute', 'uke', 'ulv'] },
  { id: 'wr-v08', difficulty: 2, words: ['ord', 'orm', 'ost'] },
  { id: 'wr-v11', difficulty: 2, words: ['øye', 'øks', 'ørn'] },
  // ── Nivå 3 ───────────────────────────────────────────────────────────
  { id: 'wr-b08', difficulty: 3, words: ['fare', 'fart', 'fane'] },
  { id: 'wr-k03', difficulty: 3, words: ['kino', 'kilo', 'kiwi'] },
  { id: 'wr-k06', difficulty: 3, words: ['like', 'lite', 'litt'] },
  { id: 'wr-k07', difficulty: 3, words: ['mat', 'matt', 'mast'] },
  { id: 'wr-r06', difficulty: 3, words: ['sko', 'ski', 'sti'] },
  { id: 'wr-r08', difficulty: 3, words: ['vis', 'vin', 'vet'] },
  { id: 'wr-s04', difficulty: 3, words: ['stol', 'stil', 'stål'] },
  { id: 'wr-s11', difficulty: 3, words: ['tann', 'tynn', 'tenk'] },
  { id: 'wr-s15', difficulty: 3, words: ['vind', 'venn', 'vann'] },
  { id: 'wr-s16', difficulty: 3, words: ['hånd', 'hund', 'hull'] },
  { id: 'wr-s20', difficulty: 3, words: ['vite', 'våte', 'vise'] },
  { id: 'wr-v04', difficulty: 3, words: ['eple', 'erte', 'ekte'] },
  { id: 'wr-v10', difficulty: 3, words: ['ære', 'ærlig', 'ærend'] },
  { id: 'wr-v13', difficulty: 3, words: ['åpen', 'åker', 'åtte'] },
  { id: 'wr-v14', difficulty: 3, words: ['jakt', 'jern', 'juks'] },
  { id: 'wr-v20', difficulty: 3, words: ['isbjørn', 'iskrem', 'istapp'] },
  // ── Nivå 4 ───────────────────────────────────────────────────────────
  { id: 'wr-k10', difficulty: 4, words: ['port', 'pult', 'pust'] },
  { id: 'wr-m03', difficulty: 4, words: ['kjøre', 'kjære', 'kjøpe'] },
  { id: 'wr-m11', difficulty: 4, words: ['farge', 'ferge', 'ferie'] },
  { id: 'wr-m18', difficulty: 4, words: ['gaver', 'gater', 'gamle'] },
  { id: 'wr-r09', difficulty: 4, words: ['torg', 'torn', 'tolv'] },
  { id: 'wr-s17', difficulty: 4, words: ['vaske', 'vokse', 'veske'] },
  { id: 'wr-v16', difficulty: 4, words: ['kjole', 'kjede', 'kjeve'] },
  { id: 'wr-v18', difficulty: 4, words: ['skje', 'skjær', 'skjev'] },
  // ── Nivå 5 ───────────────────────────────────────────────────────────
  { id: 'wr-b11', difficulty: 5, words: ['dommer', 'drømme', 'dukker'] },
  { id: 'wr-b12', difficulty: 5, words: ['fisker', 'finger', 'farger'] },
  { id: 'wr-b13', difficulty: 5, words: ['gjerde', 'gjemme', 'gjerne'] },
  { id: 'wr-k12', difficulty: 5, words: ['klokke', 'klasse', 'klatre'] },
  { id: 'wr-k14', difficulty: 5, words: ['morsom', 'morgen', 'mengde'] },
  { id: 'wr-k19', difficulty: 5, words: ['medlem', 'middag', 'mandag'] },
  { id: 'wr-k20', difficulty: 5, words: ['pistol', 'pinlig', 'pinne'] },
  { id: 'wr-m01', difficulty: 5, words: ['bakke', 'bukke', 'bruke'] },
  { id: 'wr-m04', difficulty: 5, words: ['hjelpe', 'hjerte', 'hjemme'] },
  { id: 'wr-m05', difficulty: 5, words: ['vinter', 'vinner', 'vindu'] },
  { id: 'wr-m09', difficulty: 5, words: ['regne', 'renne', 'reise'] },
  { id: 'wr-m12', difficulty: 5, words: ['kanin', 'kanon', 'kanel'] },
  { id: 'wr-m13', difficulty: 5, words: ['skrike', 'skrive', 'skrue'] },
  { id: 'wr-m14', difficulty: 5, words: ['klippe', 'klappe', 'klatre'] },
  { id: 'wr-m17', difficulty: 5, words: ['vaske', 'viske', 'fiske'] },
  { id: 'wr-m19', difficulty: 5, words: ['hoppe', 'hylle', 'hilse'] },
  { id: 'wr-r11', difficulty: 5, words: ['stille', 'stikke', 'stjele'] },
  { id: 'wr-r12', difficulty: 5, words: ['vasken', 'varmen', 'vannet'] },
  // ── Nivå 6 ───────────────────────────────────────────────────────────
  { id: 'wr-b15', difficulty: 6, words: ['hamster', 'himmel', 'hundre'] },
  { id: 'wr-b16', difficulty: 6, words: ['gulrot', 'gutter', 'gullfisk'] },
  { id: 'wr-b17', difficulty: 6, words: ['bikkje', 'brikke', 'briller'] },
  { id: 'wr-k15', difficulty: 6, words: ['medisin', 'melodi', 'melding'] },
  { id: 'wr-k16', difficulty: 6, words: ['nervøs', 'nesten', 'nettopp'] },
  { id: 'wr-k17', difficulty: 6, words: ['paprika', 'papegøye', 'parkere'] },
  { id: 'wr-m02', difficulty: 6, words: ['sommer', 'somler', 'sokker'] },
  { id: 'wr-m06', difficulty: 6, words: ['stein', 'stjal', 'stikk'] },
  { id: 'wr-m07', difficulty: 6, words: ['bilde', 'binde', 'bikkje'] },
  { id: 'wr-m08', difficulty: 6, words: ['koste', 'kaste', 'kiste'] },
  { id: 'wr-m10', difficulty: 6, words: ['lampe', 'lompe', 'lomme'] },
  { id: 'wr-m15', difficulty: 6, words: ['brette', 'bremse', 'brenne'] },
  { id: 'wr-m16', difficulty: 6, words: ['tanke', 'tenke', 'takke'] },
  { id: 'wr-m20', difficulty: 6, words: ['melde', 'melke', 'merke'] },
  { id: 'wr-r13', difficulty: 6, words: ['strand', 'streng', 'strikk'] },
  { id: 'wr-r15', difficulty: 6, words: ['regner', 'renner', 'ringer'] },
  { id: 'wr-v02', difficulty: 6, words: ['avtale', 'avslag', 'adresse'] },
  { id: 'wr-v05', difficulty: 6, words: ['innsjø', 'innsats', 'innblikk'] },
  { id: 'wr-v07', difficulty: 6, words: ['utsikt', 'utsalg', 'utslag'] },
  { id: 'wr-v09', difficulty: 6, words: ['oppgave', 'oppdrag', 'opptak'] },
  { id: 'wr-v15', difficulty: 6, words: ['jordbær', 'juletre', 'jernbane'] },
  { id: 'wr-v17', difficulty: 6, words: ['kjendis', 'kjeller', 'kjempe'] },
  // ── Nivå 7 ───────────────────────────────────────────────────────────
  { id: 'wr-b18', difficulty: 7, words: ['dukkehus', 'dyrepark', 'dagsplan'] },
  { id: 'wr-b19', difficulty: 7, words: ['badstue', 'bakgate', 'bursdag'] },
  { id: 'wr-k13', difficulty: 7, words: ['levende', 'ledende', 'lignende'] },
  { id: 'wr-k18', difficulty: 7, words: ['pinnsvin', 'pingvin', 'piknik'] },
  { id: 'wr-l06', difficulty: 7, words: ['samarbeid', 'samfunnet', 'samtidig'] },
  { id: 'wr-l17', difficulty: 7, words: ['vanskelig', 'vannkanne', 'vanntett'] },
  { id: 'wr-r16', difficulty: 7, words: ['spille', 'spinne', 'spenne'] },
  { id: 'wr-r17', difficulty: 7, words: ['trekke', 'trykke', 'trille'] },
  { id: 'wr-v12', difficulty: 7, words: ['øredobb', 'øyeblikk', 'øyenbryn'] },
  { id: 'wr-v19', difficulty: 7, words: ['skjorte', 'skjebne', 'skjelett'] },
  // ── Nivå 8 ───────────────────────────────────────────────────────────
  { id: 'wr-b20', difficulty: 8, words: ['fornøyd', 'forsøke', 'forsvar'] },
  { id: 'wr-k11', difficulty: 8, words: ['karamell', 'karneval', 'karakter'] },
  { id: 'wr-l01', difficulty: 8, words: ['forsiktig', 'forsinket', 'forsikret'] },
  { id: 'wr-l02', difficulty: 8, words: ['beskjeden', 'beskyldt', 'beskrevet'] },
  { id: 'wr-l03', difficulty: 8, words: ['oppdatert', 'oppdiktet', 'oppdaget'] },
  { id: 'wr-l05', difficulty: 8, words: ['mellomrom', 'mellomstor', 'mellomting'] },
  { id: 'wr-l09', difficulty: 8, words: ['motstander', 'motivere', 'motbakke'] },
  { id: 'wr-l13', difficulty: 8, words: ['anbefalt', 'ansvarlig', 'anstendig'] },
  { id: 'wr-l18', difficulty: 8, words: ['arbeidsom', 'arrangere', 'arkitekt'] },
  { id: 'wr-l19', difficulty: 8, words: ['trafikken', 'tradisjon', 'traktoren'] },
  { id: 'wr-l20', difficulty: 8, words: ['personlig', 'perspektiv', 'permanent'] },
  { id: 'wr-r18', difficulty: 8, words: ['venter', 'vinter', 'vanter'] },
  { id: 'wr-r19', difficulty: 8, words: ['sprett', 'sprekk', 'strekk'] },
  // ── Nivå 9 ───────────────────────────────────────────────────────────
  { id: 'wr-l04', difficulty: 9, words: ['utfordret', 'utforsket', 'utformet'] },
  { id: 'wr-l07', difficulty: 9, words: ['overraske', 'overlevere', 'overtatt'] },
  { id: 'wr-l08', difficulty: 9, words: ['underlig', 'undersøke', 'undertegne'] },
  { id: 'wr-l10', difficulty: 9, words: ['gjenkjenne', 'gjenoppta', 'gjenstand'] },
  { id: 'wr-l12', difficulty: 9, words: ['omtenksom', 'omstridt', 'omtrentlig'] },
  { id: 'wr-l14', difficulty: 9, words: ['selvsagt', 'selskapet', 'selvstendig'] },
  { id: 'wr-l16', difficulty: 9, words: ['beslutning', 'besparelse', 'beskyttelse'] },
  { id: 'wr-r20', difficulty: 9, words: ['vinner', 'vanner', 'venner'] },
  // ── Nivå 10 ──────────────────────────────────────────────────────────
  { id: 'wr-l11', difficulty: 10, words: ['innflytelse', 'innblanding', 'innstilling'] },
  { id: 'wr-l15', difficulty: 10, words: ['kveldsmat', 'kvikksand', 'kvitring'] },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Builds questions for a difficulty band. Per call it picks a random target
 * from each triplet, shuffles the three options, and shuffles which option gets
 * which of the three text sizes — so the same triplet never looks the same
 * twice and can't be answered from remembered position or size.
 */
export function getWordRecognitionForDifficulty(difficulty: number): WordRecognitionQuestion[] {
  return wordRecognitionTriplets
    .filter(t => Math.abs(t.difficulty - difficulty) <= 1)
    .map(t => ({
      type: 'word_recognition' as const,
      id: t.id,
      difficulty: t.difficulty,
      target: t.words[Math.floor(Math.random() * t.words.length)],
      choices: shuffle(t.words),
      sizeOrder: shuffle([0, 1, 2]),
    }))
}
