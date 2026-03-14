import type { SynonymQuestion } from './types'

export const synonymQuestions: SynonymQuestion[] = [
  // D1 — 3 choices total (correct + 2 wrong)
  { type: 'synonym', id: 'syn-001', difficulty: 1, word: 'glad',   correct: 'lykkelig', choices: ['lykkelig', 'trist', 'sint'] },
  { type: 'synonym', id: 'syn-002', difficulty: 1, word: 'sint',   correct: 'arg',      choices: ['arg', 'glad', 'redd'] },
  { type: 'synonym', id: 'syn-003', difficulty: 1, word: 'rask',   correct: 'fort',     choices: ['fort', 'sakte', 'rolig'] },
  { type: 'synonym', id: 'syn-004', difficulty: 1, word: 'snill',  correct: 'vennlig',  choices: ['vennlig', 'slem', 'stille'] },
  // D2
  { type: 'synonym', id: 'syn-005', difficulty: 2, word: 'pen',    correct: 'vakker',   choices: ['vakker', 'stygg', 'kjedelig'] },
  { type: 'synonym', id: 'syn-006', difficulty: 2, word: 'rar',    correct: 'merkelig', choices: ['merkelig', 'vanlig', 'normal'] },
  { type: 'synonym', id: 'syn-007', difficulty: 2, word: 'slem',   correct: 'ond',      choices: ['ond', 'snill', 'glad'] },
  { type: 'synonym', id: 'syn-008', difficulty: 2, word: 'trøtt',  correct: 'søvnig',   choices: ['søvnig', 'pigg', 'energisk'] },
  { type: 'synonym', id: 'syn-009', difficulty: 2, word: 'stor',   correct: 'enorm',    choices: ['enorm', 'liten', 'tynn'] },
  // D3
  { type: 'synonym', id: 'syn-010', difficulty: 3, word: 'modig',  correct: 'tapper',   choices: ['tapper', 'feig', 'redd'] },
  { type: 'synonym', id: 'syn-011', difficulty: 3, word: 'stille', correct: 'rolig',    choices: ['rolig', 'bråkete', 'urolig'] },
  { type: 'synonym', id: 'syn-012', difficulty: 3, word: 'rope',   correct: 'skrike',   choices: ['skrike', 'hviske', 'synge'] },
  { type: 'synonym', id: 'syn-013', difficulty: 3, word: 'sulten', correct: 'svulten',  choices: ['svulten', 'mett', 'fornøyd'] },
  { type: 'synonym', id: 'syn-014', difficulty: 3, word: 'hjelpe', correct: 'støtte',   choices: ['støtte', 'ødelegge', 'hindre'] },
  // D4 — 4 choices total (correct + 3 wrong)
  { type: 'synonym', id: 'syn-015', difficulty: 4, word: 'velge',   correct: 'bestemme',  choices: ['bestemme', 'glemme', 'vente', 'løpe'] },
  { type: 'synonym', id: 'syn-016', difficulty: 4, word: 'starte',  correct: 'begynne',   choices: ['begynne', 'avslutte', 'stoppe', 'hvile'] },
  { type: 'synonym', id: 'syn-017', difficulty: 4, word: 'gammel',  correct: 'eldgammel', choices: ['eldgammel', 'ny', 'ung', 'fersk'] },
  { type: 'synonym', id: 'syn-018', difficulty: 4, word: 'fikse',   correct: 'reparere',  choices: ['reparere', 'ødelegge', 'knekke', 'miste'] },
  { type: 'synonym', id: 'syn-019', difficulty: 4, word: 'gå',      correct: 'vandre',    choices: ['vandre', 'sitte', 'ligge', 'stå'] },
  // D5
  { type: 'synonym', id: 'syn-020', difficulty: 5, word: 'klok',    correct: 'intelligent', choices: ['intelligent', 'dum', 'enkel', 'lat'] },
  { type: 'synonym', id: 'syn-021', difficulty: 5, word: 'høre',    correct: 'lytte',       choices: ['lytte', 'snakke', 'rope', 'se'] },
  { type: 'synonym', id: 'syn-022', difficulty: 5, word: 'trist',   correct: 'bedrøvet',    choices: ['bedrøvet', 'glad', 'lykkelig', 'fornøyd'] },
  { type: 'synonym', id: 'syn-023', difficulty: 5, word: 'farlig',  correct: 'risikabelt',  choices: ['risikabelt', 'trygt', 'sikkert', 'hyggelig'] },
  // D6
  { type: 'synonym', id: 'syn-024', difficulty: 6, word: 'skummel',  correct: 'uhyggelig',      choices: ['uhyggelig', 'hyggelig', 'koselig', 'morsom'] },
  { type: 'synonym', id: 'syn-025', difficulty: 6, word: 'forandre', correct: 'endre',           choices: ['endre', 'beholde', 'bevare', 'stoppe'] },
  { type: 'synonym', id: 'syn-026', difficulty: 6, word: 'viktig',   correct: 'betydningsfull',  choices: ['betydningsfull', 'uviktig', 'liten', 'glemt'] },
  // D7
  { type: 'synonym', id: 'syn-027', difficulty: 7, word: 'ærlig',     correct: 'oppriktig',     choices: ['oppriktig', 'løgnaktig', 'uærlig', 'lurende'] },
  { type: 'synonym', id: 'syn-028', difficulty: 7, word: 'forsiktig', correct: 'varsom',        choices: ['varsom', 'hensynsløs', 'uaktsom', 'vill'] },
  { type: 'synonym', id: 'syn-029', difficulty: 7, word: 'ivrig',     correct: 'entusiastisk',  choices: ['entusiastisk', 'likegyldig', 'passiv', 'kjedelig'] },
  { type: 'synonym', id: 'syn-030', difficulty: 7, word: 'rolig',     correct: 'behersket',     choices: ['behersket', 'vill', 'urolig', 'opphisset'] },
  // Added 50 synonyms evenly across levels 1-10 (5 per level)
  // Level 1 (easy, 3 choices each)
  { type: 'synonym', id: 'syn-031', difficulty: 1, word: 'god',    correct: 'bra',      choices: ['bra', 'dårlig', 'rar'] },
  { type: 'synonym', id: 'syn-032', difficulty: 1, word: 'ny',     correct: 'fersk',    choices: ['fersk', 'gammel', 'skadet'] },
  { type: 'synonym', id: 'syn-033', difficulty: 1, word: 'blid',   correct: 'glad',     choices: ['glad', 'sint', 'trist'] },
  { type: 'synonym', id: 'syn-034', difficulty: 1, word: 'kald',   correct: 'kjølig',   choices: ['kjølig', 'varm', 'våt'] },
  { type: 'synonym', id: 'syn-035', difficulty: 1, word: 'full',   correct: 'fylt',     choices: ['fylt', 'tom', 'liten'] },
  // Level 2 (3 choices each)
  { type: 'synonym', id: 'syn-036', difficulty: 2, word: 'klar',   correct: 'tydelig',  choices: ['tydelig', 'uklar', 'svak'] },
  { type: 'synonym', id: 'syn-037', difficulty: 2, word: 'våt',    correct: 'fuktig',   choices: ['fuktig', 'tørr', 'vår'] },
  { type: 'synonym', id: 'syn-038', difficulty: 2, word: 'tynn',   correct: 'slank',    choices: ['slank', 'tjukk', 'kort'] },
  { type: 'synonym', id: 'syn-039', difficulty: 2, word: 'kjapp',  correct: 'rask',     choices: ['rask', 'langsom', 'rolig'] },
  { type: 'synonym', id: 'syn-040', difficulty: 2, word: 'rett',   correct: 'korrekt',  choices: ['korrekt', 'feil', 'galt'] },
  // Level 3 (3 choices each)
  { type: 'synonym', id: 'syn-041', difficulty: 3, word: 'begynne', correct: 'starte',     choices: ['starte', 'avslutte', 'vente'] },
  { type: 'synonym', id: 'syn-042', difficulty: 3, word: 'hjelpe',  correct: 'støtte',     choices: ['støtte', 'skade', 'ignorere'] },
  { type: 'synonym', id: 'syn-043', difficulty: 3, word: 'sende',   correct: 'oversende',  choices: ['oversende', 'motta', 'stoppe'] },
  { type: 'synonym', id: 'syn-044', difficulty: 3, word: 'tenke',   correct: 'reflektere', choices: ['reflektere', 'handle', 'sove'] },
  { type: 'synonym', id: 'syn-045', difficulty: 3, word: 'snakke',  correct: 'prate',      choices: ['prate', 'hviske', 'rope'] },
  // Level 4 (4 choices each)
  { type: 'synonym', id: 'syn-046', difficulty: 4, word: 'sliten',   correct: 'trett',      choices: ['trett', 'sunn', 'sterk', 'blid'] },
  { type: 'synonym', id: 'syn-047', difficulty: 4, word: 'vanskelig',correct: 'komplisert', choices: ['komplisert', 'enkelt', 'raskt', 'tidlig'] },
  { type: 'synonym', id: 'syn-048', difficulty: 4, word: 'glad',     correct: 'lykkelig',   choices: ['lykkelig', 'trist', 'sint', 'rolig'] },
  { type: 'synonym', id: 'syn-049', difficulty: 4, word: 'ferdig',   correct: 'fullført',    choices: ['fullført', 'startet', 'ledig', 'mett'] },
  { type: 'synonym', id: 'syn-050', difficulty: 4, word: 'reise',    correct: 'dra',         choices: ['dra', 'komme', 'sitte', 'stå'] },
  // Level 5 (4 choices each)
  { type: 'synonym', id: 'syn-051', difficulty: 5, word: 'klok',     correct: 'forstandig', choices: ['forstandig', 'dum', 'vill', 'frossen'] },
  { type: 'synonym', id: 'syn-052', difficulty: 5, word: 'høre',     correct: 'lytte',      choices: ['lytte', 'snakke', 'se', 'rope'] },
  { type: 'synonym', id: 'syn-053', difficulty: 5, word: 'trist',    correct: 'bedrøvet',   choices: ['bedrøvet', 'glad', 'lykkelig', 'fornøyd'] },
  { type: 'synonym', id: 'syn-054', difficulty: 5, word: 'farlig',   correct: 'risikabelt', choices: ['risikabelt', 'trygt', 'ufarlig', 'sikkert'] },
  { type: 'synonym', id: 'syn-055', difficulty: 5, word: 'rask',     correct: 'kvikk',      choices: ['kvikk', 'treig', 'stor', 'vakker'] },
  // Level 6 (4 choices each)
  { type: 'synonym', id: 'syn-056', difficulty: 6, word: 'skummel',  correct: 'uhyggelig',    choices: ['uhyggelig', 'hyggelig', 'sjarmerende', 'sikker'] },
  { type: 'synonym', id: 'syn-057', difficulty: 6, word: 'forandre', correct: 'endre',        choices: ['endre', 'beholde', 'stoppe', 'skape'] },
  { type: 'synonym', id: 'syn-058', difficulty: 6, word: 'viktig',   correct: 'vesentlig',     choices: ['vesentlig', 'uviktig', 'liten', 'ubetydelig'] },
  { type: 'synonym', id: 'syn-059', difficulty: 6, word: 'undersøke',correct: 'granske',      choices: ['granske', 'ignorere', 'leve', 'bære'] },
  { type: 'synonym', id: 'syn-060', difficulty: 6, word: 'oppleve',  correct: 'erfare',       choices: ['erfare', 'se', 'miste', 'gi'] },
  // Level 7 (4 choices each)
  { type: 'synonym', id: 'syn-061', difficulty: 7, word: 'ærlig',     correct: 'oppriktig',     choices: ['oppriktig', 'løgnaktig', 'falsk', 'skjult'] },
  { type: 'synonym', id: 'syn-062', difficulty: 7, word: 'forsiktig', correct: 'varsom',        choices: ['varsom', 'uaktsom', 'voldsom', 'vill'] },
  { type: 'synonym', id: 'syn-063', difficulty: 7, word: 'ivrig',     correct: 'entusiastisk',  choices: ['entusiastisk', 'likegyldig', 'rolig', 'trist'] },
  { type: 'synonym', id: 'syn-064', difficulty: 7, word: 'rolig',     correct: 'behersket',     choices: ['behersket', 'opphisset', 'vilter', 'vill'] },
  { type: 'synonym', id: 'syn-065', difficulty: 7, word: 'modig',     correct: 'tapper',        choices: ['tapper', 'feig', 'redd', 'usikker'] },
  // Level 8 (4 choices each)
  { type: 'synonym', id: 'syn-066', difficulty: 8, word: 'synlig',    correct: 'tydelig',       choices: ['tydelig', 'usynlig', 'liten', 'skjult'] },
  { type: 'synonym', id: 'syn-067', difficulty: 8, word: 'komfortabel',correct: 'behagelig',     choices: ['behagelig', 'ubehagelig', 'trang', 'løs'] },
  { type: 'synonym', id: 'syn-068', difficulty: 8, word: 'tilstede',  correct: 'nærværende',    choices: ['nærværende', 'fraværende', 'sjenert', 'rolig'] },
  { type: 'synonym', id: 'syn-069', difficulty: 8, word: 'stabil',    correct: 'fast',          choices: ['fast', 'ustabil', 'svak', 'stor'] },
  { type: 'synonym', id: 'syn-070', difficulty: 8, word: 'kompleks',  correct: 'innviklet',     choices: ['innviklet', 'enkelt', 'rent', 'klart'] },
  // Level 9 (4 choices each)
  { type: 'synonym', id: 'syn-071', difficulty: 9, word: 'omfattende', correct: 'ekstensiv',    choices: ['ekstensiv', 'liten', 'begrenset', 'kort'] },
  { type: 'synonym', id: 'syn-072', difficulty: 9, word: 'presis',     correct: 'nøyaktig',      choices: ['nøyaktig', 'omtrentlig', 'rundt', 'vid'] },
  { type: 'synonym', id: 'syn-073', difficulty: 9, word: 'daglig',     correct: 'hverdaglig',    choices: ['hverdaglig', 'sjelden', 'uvanlig', 'spesiell'] },
  { type: 'synonym', id: 'syn-074', difficulty: 9, word: 'kompatibel', correct: 'forenlig',      choices: ['forenlig', 'uforenlig', 'feil', 'ny'] },
  { type: 'synonym', id: 'syn-075', difficulty: 9, word: 'minst',      correct: 'minimal',       choices: ['minimal', 'maksimal', 'stor', 'mange'] },
  // Level 10 (4 choices each)
  { type: 'synonym', id: 'syn-076', difficulty: 10, word: 'abstrakt',   correct: 'teoretisk',     choices: ['teoretisk', 'konkret', 'klar', 'praktisk'] },
  { type: 'synonym', id: 'syn-077', difficulty: 10, word: 'analytisk',  correct: 'granskende',    choices: ['granskende', 'overfladisk', 'usikker', 'rolig'] },
  { type: 'synonym', id: 'syn-078', difficulty: 10, word: 'konsistent', correct: 'samstemt',      choices: ['samstemt', 'inkonsekvent', 'avvikende', 'rar'] },
  { type: 'synonym', id: 'syn-079', difficulty: 10, word: 'implisitt',  correct: 'underforstått', choices: ['underforstått', 'tydelig', 'åpenbart', 'klart'] },
  { type: 'synonym', id: 'syn-080', difficulty: 10, word: 'komplementær', correct: 'utfyllende',   choices: ['utfyllende', 'motstridende', 'lik', 'samme'] },
]

export function getSynonymForDifficulty(difficulty: number): SynonymQuestion[] {
  return synonymQuestions.filter(q => Math.abs(q.difficulty - difficulty) <= 1)
}
