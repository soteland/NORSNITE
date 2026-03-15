import type { RhymeQuestion } from './types'

export const rhymeQuestions: RhymeQuestion[] = [
  // D1 — 3 choices
  { type: 'rhyme', id: 'rhy-001', difficulty: 1, word: 'katt',  correct: 'hatt',  choices: ['hatt',  'bil',   'sko'] },
  { type: 'rhyme', id: 'rhy-002', difficulty: 1, word: 'hus',   correct: 'mus',   choices: ['mus',   'fugl',  'sol'] },
  { type: 'rhyme', id: 'rhy-003', difficulty: 1, word: 'bil',   correct: 'vil',   choices: ['vil',   'hund',  'tre'] },
  { type: 'rhyme', id: 'rhy-004', difficulty: 1, word: 'ball',  correct: 'tall',  choices: ['tall',  'bord',  'stol'] },
  { type: 'rhyme', id: 'rhy-005', difficulty: 1, word: 'sol',   correct: 'stol',   choices: ['stol',   'bok',   'dyr'] },
  // D2
  { type: 'rhyme', id: 'rhy-006', difficulty: 2, word: 'fisk',  correct: 'disk',  choices: ['disk',  'fugl',  'gress'] },
  { type: 'rhyme', id: 'rhy-007', difficulty: 2, word: 'skog',  correct: 'plog',   choices: ['plog',   'is',    'natt'] },
  { type: 'rhyme', id: 'rhy-008', difficulty: 2, word: 'barn',  correct: 'garn',  choices: ['garn',  'fugl',  'tre'] },
  { type: 'rhyme', id: 'rhy-009', difficulty: 2, word: 'natt',  correct: 'matt',  choices: ['matt',  'dag',   'lys'] },
  { type: 'rhyme', id: 'rhy-010', difficulty: 2, word: 'dag',   correct: 'lag',   choices: ['lag',   'natt',  'rom'] },
  // D3
  { type: 'rhyme', id: 'rhy-011', difficulty: 3, word: 'bark', correct: 'mark', choices: ['mark', 'sky',   'tomst'] },
  { type: 'rhyme', id: 'rhy-012', difficulty: 3, word: 'hjerte', correct: 'smerte', choices: ['smerte', 'øye', 'hånd'] },
  { type: 'rhyme', id: 'rhy-013', difficulty: 3, word: 'leke',  correct: 'reke',  choices: ['reke',  'sang',  'bane'] },
  { type: 'rhyme', id: 'rhy-014', difficulty: 3, word: 'vann',  correct: 'mann',  choices: ['mann',  'sky',   'jord'] },
  { type: 'rhyme', id: 'rhy-015', difficulty: 3, word: 'sang',  correct: 'gang',  choices: ['gang',  'lyd',   'bok'] },
  // D4 — 4 choices
  { type: 'rhyme', id: 'rhy-016', difficulty: 4, word: 'sove',  correct: 'love',  choices: ['love',  'spise', 'gå',   'stå'] },
  { type: 'rhyme', id: 'rhy-017', difficulty: 4, word: 'bake',  correct: 'rake',  choices: ['rake',  'synge', 'hoppe', 'løpe'] },
  { type: 'rhyme', id: 'rhy-018', difficulty: 4, word: 'stige', correct: 'hige',  choices: ['hige',  'dale',  'svinge', 'bøye'] },
  { type: 'rhyme', id: 'rhy-019', difficulty: 4, word: 'alle', correct: 'palle', choices: ['palle', 'gulv',  'vegg',  'tak'] },
  { type: 'rhyme', id: 'rhy-020', difficulty: 4, word: 'drøm',  correct: 'strøm', choices: ['strøm', 'tanke', 'farge', 'lyd'] },
  // D5
  { type: 'rhyme', id: 'rhy-021', difficulty: 5, word: 'skrive', correct: 'drive', choices: ['drive', 'synge', 'tegne', 'male'] },
  { type: 'rhyme', id: 'rhy-022', difficulty: 5, word: 'stemme', correct: 'temme', choices: ['temme', 'øyne', 'hender', 'føtter'] },
  { type: 'rhyme', id: 'rhy-023', difficulty: 5, word: 'morgen', correct: 'borgen', choices: ['borgen', 'kveld', 'midnatt', 'grå'] },
  { type: 'rhyme', id: 'rhy-024', difficulty: 5, word: 'fjell',  correct: 'grell',  choices: ['grell',  'daler', 'innsjø', 'vann'] },
  { type: 'rhyme', id: 'rhy-025', difficulty: 5, word: 'snø',    correct: 'blø',   choices: ['blø',   'regn',  'sol',   'vind'] },
  // D6
  { type: 'rhyme', id: 'rhy-026', difficulty: 6, word: 'tanke',   correct: 'planke',  choices: ['planke', 'drøm',  'håp',   'frykt'] },
  { type: 'rhyme', id: 'rhy-027', difficulty: 6, word: 'frihet',  correct: 'sihet',   choices: ['sihet',  'bundet', 'lenket', 'stengt'] },
  { type: 'rhyme', id: 'rhy-028', difficulty: 6, word: 'lykke',   correct: 'stykke',  choices: ['stykke', 'sorg',  'smerte', 'anger'] },
  { type: 'rhyme', id: 'rhy-029', difficulty: 6, word: 'himmel',  correct: 'krimmel', choices: ['krimmel', 'jord', 'hav',   'stein'] },
  { type: 'rhyme', id: 'rhy-030', difficulty: 6, word: 'klokke',  correct: 'flokke',  choices: ['flokke', 'tid',   'time',  'år'] },
  // D7
  { type: 'rhyme', id: 'rhy-031', difficulty: 7, word: 'vandre',   correct: 'andre',    choices: ['andre',    'dvele',  'streve',  'vente'] },
  { type: 'rhyme', id: 'rhy-032', difficulty: 7, word: 'fortelle', correct: 'bestelle', choices: ['bestelle', 'lytte',  'skrive',  'lese'] },
  { type: 'rhyme', id: 'rhy-033', difficulty: 7, word: 'minne',    correct: 'finne',    choices: ['finne',    'glemme', 'miste',   'savne'] },
  { type: 'rhyme', id: 'rhy-034', difficulty: 7, word: 'stille',   correct: 'grille',   choices: ['grille',   'bråk',   'lyd',     'rop'] },
  { type: 'rhyme', id: 'rhy-035', difficulty: 7, word: 'glede',    correct: 'rede',     choices: ['rede',     'sorg',   'sinne',   'frykt'] },
]

export function getRhymeForDifficulty(difficulty: number): RhymeQuestion[] {
  return rhymeQuestions.filter(q => Math.abs(q.difficulty - difficulty) <= 1)
}
