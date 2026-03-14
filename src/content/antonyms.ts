import type { AntonymQuestion } from './types'

export const antonymQuestions: AntonymQuestion[] = [
  // D1 — 3 choices (correct + 2 wrong)
  { type: 'antonym', id: 'ant-001', difficulty: 1, word: 'glad',   correct: 'trist',  choices: ['trist', 'sint', 'rask'] },
  { type: 'antonym', id: 'ant-002', difficulty: 1, word: 'stor',   correct: 'liten',  choices: ['liten', 'lang', 'bred'] },
  { type: 'antonym', id: 'ant-003', difficulty: 1, word: 'varm',   correct: 'kald',   choices: ['kald', 'våt', 'sterk'] },
  { type: 'antonym', id: 'ant-004', difficulty: 1, word: 'ny',     correct: 'gammel', choices: ['gammel', 'ung', 'pen'] },
  { type: 'antonym', id: 'ant-005', difficulty: 1, word: 'opp',    correct: 'ned',    choices: ['ned', 'inn', 'frem'] },
  // D2
  { type: 'antonym', id: 'ant-006', difficulty: 2, word: 'lys',   correct: 'mørk',  choices: ['mørk', 'tung', 'sterk'] },
  { type: 'antonym', id: 'ant-007', difficulty: 2, word: 'høy',   correct: 'lav',   choices: ['lav', 'bred', 'tykk'] },
  { type: 'antonym', id: 'ant-008', difficulty: 2, word: 'tung',  correct: 'lett',  choices: ['lett', 'smal', 'flat'] },
  { type: 'antonym', id: 'ant-009', difficulty: 2, word: 'hard',  correct: 'myk',   choices: ['myk', 'glatt', 'kald'] },
  { type: 'antonym', id: 'ant-010', difficulty: 2, word: 'snill', correct: 'slem',  choices: ['slem', 'trøtt', 'stille'] },
  { type: 'antonym', id: 'ant-011', difficulty: 2, word: 'fort',  correct: 'sakte', choices: ['sakte', 'stille', 'svak'] },
  { type: 'antonym', id: 'ant-012', difficulty: 2, word: 'våt',   correct: 'tørr',  choices: ['tørr', 'kald', 'ren'] },
  // D3
  { type: 'antonym', id: 'ant-013', difficulty: 3, word: 'sterk',  correct: 'svak',   choices: ['svak', 'stor', 'tung'] },
  { type: 'antonym', id: 'ant-014', difficulty: 3, word: 'flink',  correct: 'dårlig', choices: ['dårlig', 'snill', 'rask'] },
  { type: 'antonym', id: 'ant-015', difficulty: 3, word: 'trygg',  correct: 'farlig', choices: ['farlig', 'vanskelig', 'stille'] },
  { type: 'antonym', id: 'ant-016', difficulty: 3, word: 'rik',    correct: 'fattig', choices: ['fattig', 'lei', 'gammel'] },
  { type: 'antonym', id: 'ant-017', difficulty: 3, word: 'tidlig', correct: 'sen',    choices: ['sen', 'lang', 'rask'] },
  { type: 'antonym', id: 'ant-018', difficulty: 3, word: 'bred',   correct: 'smal',   choices: ['smal', 'tung', 'lav'] },
  // D4 — 4 choices
  { type: 'antonym', id: 'ant-019', difficulty: 4, word: 'åpen',    correct: 'lukket', choices: ['lukket', 'bred', 'høy', 'lett'] },
  { type: 'antonym', id: 'ant-020', difficulty: 4, word: 'kjent',   correct: 'ukjent', choices: ['ukjent', 'rask', 'gammel', 'ny'] },
  { type: 'antonym', id: 'ant-021', difficulty: 4, word: 'modig',   correct: 'feig',   choices: ['feig', 'sterk', 'ung', 'rolig'] },
  { type: 'antonym', id: 'ant-022', difficulty: 4, word: 'dyp',     correct: 'grunn',  choices: ['grunn', 'bred', 'tykk', 'lang'] },
  { type: 'antonym', id: 'ant-023', difficulty: 4, word: 'sjelden', correct: 'vanlig', choices: ['vanlig', 'ny', 'ung', 'fort'] },
  // D5
  { type: 'antonym', id: 'ant-024', difficulty: 5, word: 'stolt',  correct: 'skamfull', choices: ['skamfull', 'trist', 'glad', 'sint'] },
  { type: 'antonym', id: 'ant-025', difficulty: 5, word: 'aktiv',  correct: 'passiv',   choices: ['passiv', 'klok', 'snill', 'glad'] },
  { type: 'antonym', id: 'ant-026', difficulty: 5, word: 'skarp',  correct: 'stump',    choices: ['stump', 'hard', 'sterk', 'kald'] },
  // D6
  { type: 'antonym', id: 'ant-027', difficulty: 6, word: 'positiv',     correct: 'negativ',      choices: ['negativ', 'sterk', 'trist', 'lat'] },
  { type: 'antonym', id: 'ant-028', difficulty: 6, word: 'optimistisk', correct: 'pessimistisk', choices: ['pessimistisk', 'aktiv', 'passiv', 'rolig'] },
  // D7
  { type: 'antonym', id: 'ant-029', difficulty: 7, word: 'objektiv',    correct: 'subjektiv',  choices: ['subjektiv', 'positiv', 'negativ', 'aktiv'] },
  { type: 'antonym', id: 'ant-030', difficulty: 7, word: 'konstruktiv', correct: 'destruktiv', choices: ['destruktiv', 'aktiv', 'passiv', 'rolig'] },
  { type: 'antonym', id: 'ant-031', difficulty: 4, word: 'rolig',        correct: 'urolig',       choices: ['urolig', 'snill', 'sterk', 'glad'] },
  { type: 'antonym', id: 'ant-032', difficulty: 4, word: 'enkel',        correct: 'vanskelig',    choices: ['vanskelig', 'dyr', 'kort', 'gammel'] },
  { type: 'antonym', id: 'ant-033', difficulty: 5, word: 'åpenhjertig', correct: 'tilbakeholden',choices: ['tilbakeholden', 'rolig', 'trist', 'snill'] },
  { type: 'antonym', id: 'ant-034', difficulty: 5, word: 'sann',         correct: 'usann',        choices: ['usann', 'vakker', 'våt', 'lang'] },
  { type: 'antonym', id: 'ant-035', difficulty: 6, word: 'ekte',         correct: 'falsk',        choices: ['falsk', 'lovlig', 'stor', 'rask'] },
  { type: 'antonym', id: 'ant-036', difficulty: 6, word: 'frem',         correct: 'tilbake',      choices: ['tilbake', 'innover', 'over', 'ned'] },
  { type: 'antonym', id: 'ant-037', difficulty: 7, word: 'venstre',      correct: 'høyre',        choices: ['høyre', 'nord', 'sør', 'oppover'] },
  { type: 'antonym', id: 'ant-038', difficulty: 7, word: 'ute',          correct: 'inne',         choices: ['inne', 'oppe', 'lavt', 'sint'] },
  { type: 'antonym', id: 'ant-039', difficulty: 8, word: 'synlig',       correct: 'usynlig',      choices: ['usynlig', 'stor', 'ny', 'gammel'] },
  { type: 'antonym', id: 'ant-040', difficulty: 8, word: 'tilstede',     correct: 'fraværende',   choices: ['fraværende', 'rolig', 'glad', 'sterk'] },
  { type: 'antonym', id: 'ant-041', difficulty: 9, word: 'minst',        correct: 'størst',       choices: ['størst', 'rask', 'ny', 'mange'] },
  { type: 'antonym', id: 'ant-042', difficulty: 9, word: 'komplett',     correct: 'uferdig',      choices: ['uferdig', 'ny', 'stor', 'gammel'] },
  { type: 'antonym', id: 'ant-043', difficulty: 9, word: 'stabil',       correct: 'ustabil',      choices: ['ustabil', 'tung', 'litt', 'høy'] },
  { type: 'antonym', id: 'ant-044', difficulty: 10, word: 'tiltrekke',  correct: 'frastøte',     choices: ['frastøte', 'løfte', 'dytte', 'dra'] },
  { type: 'antonym', id: 'ant-045', difficulty: 10, word: 'logisk',     correct: 'illogisk',     choices: ['illogisk', 'særlig', 'rart', 'rolig'] },
  { type: 'antonym', id: 'ant-046', difficulty: 10, word: 'konkret',    correct: 'abstrakt',     choices: ['abstrakt', 'større', 'klar', 'pen'] },
  { type: 'antonym', id: 'ant-047', difficulty: 8, word: 'komfortabel',  correct: 'ubehagelig',   choices: ['ubehagelig', 'kald', 'tung', 'glad'] },
  { type: 'antonym', id: 'ant-048', difficulty: 5, word: 'vennlig',      correct: 'fiendtlig',    choices: ['fiendtlig', 'rolig', 'liten', 'stor'] },
  { type: 'antonym', id: 'ant-049', difficulty: 6, word: 'samme',        correct: 'forskjellig',  choices: ['forskjellig', 'lik', 'nær', 'lang'] },
  { type: 'antonym', id: 'ant-050', difficulty: 7, word: 'åpenbar',      correct: 'skjult',       choices: ['skjult', 'rask', 'gammel', 'vakker'] },
  // Additional level 1 questions
  { type: 'antonym', id: 'ant-051', difficulty: 1, word: 'kort',   correct: 'lang', choices: ['lang', 'liten', 'ny'] },
  { type: 'antonym', id: 'ant-052', difficulty: 1, word: 'sunn',   correct: 'syk',  choices: ['syk', 'glad', 'stor'] },
  { type: 'antonym', id: 'ant-053', difficulty: 1, word: 'full',   correct: 'tom',  choices: ['tom', 'stor', 'rund'] },
  { type: 'antonym', id: 'ant-054', difficulty: 1, word: 'dag',    correct: 'natt', choices: ['natt', 'morgen', 'sint'] },
  { type: 'antonym', id: 'ant-055', difficulty: 1, word: 'blid',   correct: 'sint', choices: ['sint', 'rastløs', 'rolig'] },
  // Additional level 2 questions
  { type: 'antonym', id: 'ant-056', difficulty: 2, word: 'ren',    correct: 'skitten', choices: ['skitten', 'kald', 'sunn'] },
  { type: 'antonym', id: 'ant-057', difficulty: 2, word: 'tynn',   correct: 'tjukk',   choices: ['tjukk', 'høy', 'lang'] },
  { type: 'antonym', id: 'ant-058', difficulty: 2, word: 'klar',   correct: 'uklar',   choices: ['uklar', 'pen', 'stor'] },
  // Additional level 3 questions
  { type: 'antonym', id: 'ant-059', difficulty: 3, word: 'vanskelig', correct: 'lett',     choices: ['lett', 'stor', 'sint'] },
  { type: 'antonym', id: 'ant-060', difficulty: 3, word: 'høflig',    correct: 'uhøflig',  choices: ['uhøflig', 'snill', 'rolig'] },
  { type: 'antonym', id: 'ant-061', difficulty: 3, word: 'nær',       correct: 'fjern',    choices: ['fjern', 'stor', 'sint'] },
  { type: 'antonym', id: 'ant-062', difficulty: 3, word: 'sosial',    correct: 'ensom',    choices: ['ensom', 'rolig', 'stor'] },
]

export function getAntonymForDifficulty(difficulty: number): AntonymQuestion[] {
  return antonymQuestions.filter(q => Math.abs(q.difficulty - difficulty) <= 1)
}
