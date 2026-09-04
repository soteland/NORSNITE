import type { DoubleConsonantQuestion } from './types'

// Rows carry no `choices`; the selector below adds them in a shuffled order.
type DoubleConsonantData = Omit<DoubleConsonantQuestion, 'choices'>

// Dobbel eller enkel konsonant.
// The player picks between two spellings of the same word in a sentence
// ("Jeg ___ hjem" → løper / løpper). Only two choices by design: the whole
// point is the single/double contrast, and a third form would be artificial.
//
// Roughly half the entries have the DOUBLE form as the correct answer and half
// the SINGLE form, so a kid cannot pattern-match "double is always right".
// Keep that balance when adding entries.
//
// Three flavours, mixed together:
//   dk-v* verbs, dk-n* nouns/adjectives — the wrong form is a misspelling
//   dk-p* minimal pairs where BOTH spellings are real words with different
//         meanings (bakken/baken, tak/takk) — the sentence has to disambiguate
//   dk-x* harder rules: simplification before another consonant (kalle→kalte)
//
// Do not place two entries built on the same root within 1 difficulty step of
// each other — buildRound pulls from |q.difficulty - difficulty| <= 1, so they
// could land in the same round.

export const doubleConsonantQuestions: DoubleConsonantData[] = [
  // ── Verb ────────────────────────────────────────────────────────────────
  { type: 'double_consonant', id: 'dk-v02', difficulty: 2, sentence: 'Jeg ___ over bekken hver dag.', correct: 'hopper', wrong: 'hoper', teachingNote: 'Kort o-lyd i hopper gir dobbel p.' },
  { type: 'double_consonant', id: 'dk-v03', difficulty: 2, sentence: 'Hun ___ på stolen og tegner.', correct: 'sitter', wrong: 'siter', teachingNote: 'Kort i-lyd i sitter gir dobbel t.' },
  { type: 'double_consonant', id: 'dk-v04', difficulty: 2, sentence: 'Jeg ___ en bok før jeg legger meg.', correct: 'leser', wrong: 'lesser', teachingNote: 'Lang e-lyd i leser gir enkel s.' },
  { type: 'double_consonant', id: 'dk-v01', difficulty: 3, sentence: 'Jeg ___ hjem fra skolen.', correct: 'løper', wrong: 'løpper', teachingNote: 'Lang ø-lyd i løper gir enkel p.' },
  { type: 'double_consonant', id: 'dk-v05', difficulty: 3, sentence: 'Katten ___ og sover i sofaen.', correct: 'ligger', wrong: 'liger', teachingNote: 'Kort i-lyd i ligger gir dobbel g.' },
  { type: 'double_consonant', id: 'dk-v06', difficulty: 3, sentence: 'Hun ___ middag klokka seks.', correct: 'spiser', wrong: 'spisser', teachingNote: 'Lang i-lyd i spiser gir enkel s.' },
  { type: 'double_consonant', id: 'dk-v07', difficulty: 3, sentence: 'Laget vårt ___ nesten hver kamp.', correct: 'vinner', wrong: 'viner', teachingNote: 'Kort i-lyd i vinner gir dobbel n.' },
  { type: 'double_consonant', id: 'dk-v08', difficulty: 3, sentence: 'Han ___ vann etter fotballtrening.', correct: 'drikker', wrong: 'driker', teachingNote: 'Kort i-lyd i drikker gir dobbel k.' },
  { type: 'double_consonant', id: 'dk-v15', difficulty: 3, sentence: 'Babyen ___ hele natten nå.', correct: 'sover', wrong: 'sovver', teachingNote: 'V blir aldri dobbel i norsk: sover, ikke sovver.' },
  { type: 'double_consonant', id: 'dk-v19', difficulty: 3, sentence: 'Hun ___ bredt når hun ser meg.', correct: 'smiler', wrong: 'smiller', teachingNote: 'Lang i-lyd i smiler gir enkel l.' },
  { type: 'double_consonant', id: 'dk-v09', difficulty: 4, sentence: 'Pappa ___ gjerdet grønt i helgen.', correct: 'maler', wrong: 'maller', teachingNote: 'Lang a-lyd i maler gir enkel l.' },
  { type: 'double_consonant', id: 'dk-v10', difficulty: 4, sentence: 'Jeg ___ nesten alltid blinken.', correct: 'treffer', wrong: 'trefer', teachingNote: 'Kort e-lyd i treffer gir dobbel f.' },
  { type: 'double_consonant', id: 'dk-v11', difficulty: 4, sentence: 'Pappa ___ meg til trening.', correct: 'kjører', wrong: 'kjørrer', teachingNote: 'Lang ø-lyd i kjører gir enkel r.' },
  { type: 'double_consonant', id: 'dk-v12', difficulty: 4, sentence: 'Bilen ___ brått for det røde lyset.', correct: 'stopper', wrong: 'stoper', teachingNote: 'Kort o-lyd i stopper gir dobbel p.' },
  { type: 'double_consonant', id: 'dk-v13', difficulty: 4, sentence: 'Jeg ___ navnet mitt øverst på arket.', correct: 'skriver', wrong: 'skrivver', teachingNote: 'V blir aldri dobbel i norsk: skriver, ikke skrivver.' },
  { type: 'double_consonant', id: 'dk-v14', difficulty: 4, sentence: 'Jeg ___ paraplyen hjemme igjen.', correct: 'glemmer', wrong: 'glemer', teachingNote: 'Kort e-lyd i glemmer gir dobbel m.' },
  { type: 'double_consonant', id: 'dk-v17', difficulty: 4, sentence: 'Læreren ___ navnet mitt høyt.', correct: 'roper', wrong: 'ropper', teachingNote: 'Lang o-lyd i roper gir enkel p.' },
  { type: 'double_consonant', id: 'dk-v16', difficulty: 5, sentence: 'Bussen ___ om fem minutter.', correct: 'kommer', wrong: 'komer', teachingNote: 'M dobles inni ordet: kommer, ikke komer.' },
  { type: 'double_consonant', id: 'dk-v20', difficulty: 5, sentence: 'Jeg ___ i bassenget hver onsdag.', correct: 'svømmer', wrong: 'svømer', teachingNote: 'Kort ø-lyd i svømmer gir dobbel m.' },
  { type: 'double_consonant', id: 'dk-v18', difficulty: 6, sentence: 'Filmen ___ klokka sju i kveld.', correct: 'begynner', wrong: 'begyner', teachingNote: 'Kort y-lyd i begynner gir dobbel n.' },
  { type: 'double_consonant', id: 'dk-v21', difficulty: 7, sentence: 'Mormor ___ på meg fra kjøkkenet.', correct: 'kalte', wrong: 'kallte', teachingNote: 'Kalle mister en l foran t: kalte, ikke kallte.' },
  { type: 'double_consonant', id: 'dk-v22', difficulty: 8, sentence: 'Han ___ glasset helt til randen.', correct: 'fylte', wrong: 'fyllte', teachingNote: 'Fylle mister en l foran t: fylte, ikke fyllte.' },

  // ── Substantiv og adjektiv ──────────────────────────────────────────────
  { type: 'double_consonant', id: 'dk-n01', difficulty: 2, sentence: 'Naboen har en svart ___.', correct: 'katt', wrong: 'kat', teachingNote: 'Kort a-lyd i katt gir dobbel t.' },
  { type: 'double_consonant', id: 'dk-n02', difficulty: 2, sentence: 'Jenta kaster en rød ___.', correct: 'ball', wrong: 'bal', teachingNote: 'Kort a-lyd i ball gir dobbel l.' },
  { type: 'double_consonant', id: 'dk-n06', difficulty: 2, sentence: 'Han er en snill liten ___.', correct: 'gutt', wrong: 'gut', teachingNote: 'Kort u-lyd i gutt gir dobbel t.' },
  { type: 'double_consonant', id: 'dk-n12', difficulty: 2, sentence: 'Barna tegner en gul ___ på papiret.', correct: 'sol', wrong: 'soll', teachingNote: 'Lang o-lyd i sol gir bare én l.' },
  { type: 'double_consonant', id: 'dk-n22', difficulty: 2, sentence: 'Den nye kjolen din er veldig ___.', correct: 'pen', wrong: 'penn', teachingNote: 'Lang e-lyd i pen gir én n. Penn er noe du skriver med.' },
  { type: 'double_consonant', id: 'dk-n03', difficulty: 3, sentence: 'Jeg pakker boken i en ___.', correct: 'sekk', wrong: 'sek', teachingNote: 'Kort e-lyd i sekk gir dobbel k.' },
  { type: 'double_consonant', id: 'dk-n10', difficulty: 3, sentence: 'Bilen til pappa er ___.', correct: 'grønn', wrong: 'grøn', teachingNote: 'Kort ø-lyd i grønn gir dobbel n.' },
  { type: 'double_consonant', id: 'dk-n13', difficulty: 3, sentence: 'Laget vårt scoret et flott ___.', correct: 'mål', wrong: 'måll', teachingNote: 'Lang å-lyd i mål gir bare én l.' },
  { type: 'double_consonant', id: 'dk-n14', difficulty: 3, sentence: 'Vi bor i en rolig ___ med mange trær.', correct: 'gate', wrong: 'gatte', teachingNote: 'Lang a-lyd i gate gir bare én t.' },
  { type: 'double_consonant', id: 'dk-n15', difficulty: 3, sentence: 'Pappa vasker en blank ___ i garasjen.', correct: 'bil', wrong: 'bill', teachingNote: 'Lang i-lyd i bil gir bare én l.' },
  { type: 'double_consonant', id: 'dk-n16', difficulty: 3, sentence: 'Vi ventet i en hel ___ på bussen.', correct: 'time', wrong: 'timme', teachingNote: 'Lang i-lyd i time gir bare én m.' },
  { type: 'double_consonant', id: 'dk-n21', difficulty: 3, sentence: 'Bakeren selger nybakt ___ hver morgen.', correct: 'brød', wrong: 'brødd', teachingNote: 'Lang ø-lyd i brød gir bare én d.' },
  { type: 'double_consonant', id: 'dk-n11', difficulty: 4, sentence: 'Vinterjakken hans er varm og ___.', correct: 'tykk', wrong: 'tyk', teachingNote: 'Kort y-lyd i tykk gir dobbel k.' },
  { type: 'double_consonant', id: 'dk-n17', difficulty: 4, sentence: 'Katten jaget en liten ___ i hagen.', correct: 'mus', wrong: 'muss', teachingNote: 'Lang u-lyd i mus gir bare én s.' },
  { type: 'double_consonant', id: 'dk-n04', difficulty: 5, sentence: 'Vi fisker fra en gammel ___.', correct: 'brygge', wrong: 'bryge', teachingNote: 'Kort y-lyd i brygge gir dobbel g.' },
  { type: 'double_consonant', id: 'dk-n05', difficulty: 5, sentence: 'Bestefar lagrer epler i en stor ___.', correct: 'tønne', wrong: 'tøne', teachingNote: 'Kort ø-lyd i tønne gir dobbel n.' },
  { type: 'double_consonant', id: 'dk-n07', difficulty: 5, sentence: 'Han sover i ___ ved siden av kjøkkenet.', correct: 'rommet', wrong: 'romet', teachingNote: 'Kort o-lyd i rom gir dobbel m foran -et.' },
  { type: 'double_consonant', id: 'dk-n18', difficulty: 5, sentence: 'Familien flytter inn i et nytt ___.', correct: 'hus', wrong: 'huss', teachingNote: 'Lang u-lyd i hus gir bare én s.' },
  { type: 'double_consonant', id: 'dk-n20', difficulty: 5, sentence: 'Vi skjærer opp en rød ___ til salaten.', correct: 'tomat', wrong: 'tomatt', teachingNote: 'Lang a-lyd i tomat gir bare én t.' },
  { type: 'double_consonant', id: 'dk-n19', difficulty: 6, sentence: 'Mormor presser saft ut av en sur ___.', correct: 'sitron', wrong: 'sitronn', teachingNote: 'Lang o-lyd i sitron gir bare én n.' },
  { type: 'double_consonant', id: 'dk-n08', difficulty: 7, sentence: 'Froskene hopper ut i ___ hver sommer.', correct: 'dammen', wrong: 'damen', teachingNote: 'Dam får dobbel m: dammen. Damen betyr en voksen kvinne.' },
  { type: 'double_consonant', id: 'dk-n09', difficulty: 8, sentence: 'Bonden bærer det lille ___ inn i fjøset.', correct: 'lammet', wrong: 'lamet', teachingNote: 'Kort a-lyd i lam gir dobbel m foran -et.' },

  // ── Minimale par: begge skrivemåtene er ekte ord ─────────────────────────
  { type: 'double_consonant', id: 'dk-p01', difficulty: 4, sentence: 'Vi akte ned den bratte ___ på kjelke.', correct: 'bakken', wrong: 'baken', teachingNote: 'Bakken er en skråning. Baken er kroppsdelen du sitter på.' },
  { type: 'double_consonant', id: 'dk-p02', difficulty: 4, sentence: 'Hytta hadde et rødt ___ av tegl.', correct: 'tak', wrong: 'takk', teachingNote: 'Tak er den øverste delen av et hus. Takk sier du når du er glad.' },
  { type: 'double_consonant', id: 'dk-p03', difficulty: 5, sentence: 'Det var kaldt, så jeg tok på meg en varm ___.', correct: 'hatt', wrong: 'hat', teachingNote: 'Hatt har du på hodet. Hat betyr å mislike noen sterkt.' },
  { type: 'double_consonant', id: 'dk-p04', difficulty: 5, sentence: 'Klokka seks må jeg ___ kaninene.', correct: 'mate', wrong: 'matte', teachingNote: 'Å mate er å gi mat til et dyr. Matte er faget med tall.' },
  { type: 'double_consonant', id: 'dk-p05', difficulty: 5, sentence: 'Om kvelden liker jeg å ___ en spennende bok.', correct: 'lese', wrong: 'lesse', teachingNote: 'Å lese er å se på ord i en bok. Å lesse er å laste noe tungt.' },
  { type: 'double_consonant', id: 'dk-p09', difficulty: 5, sentence: 'Alle ballongene på bursdagen var veldig ___.', correct: 'fine', wrong: 'finne', teachingNote: 'Fine betyr pene. Å finne er å oppdage noe du lette etter.' },
  { type: 'double_consonant', id: 'dk-p11', difficulty: 5, sentence: 'Reven i skogen er et ___ dyr.', correct: 'vill', wrong: 'vil', teachingNote: 'Vill betyr at dyret lever fritt. Vil betyr å ønske seg noe.' },
  { type: 'double_consonant', id: 'dk-p13', difficulty: 5, sentence: 'Kan jeg låne en ___ så jeg får skrevet navnet mitt?', correct: 'penn', wrong: 'pen', teachingNote: 'En penn skriver du med. Pen betyr at noe ser fint ut.' },
  { type: 'double_consonant', id: 'dk-p17', difficulty: 5, sentence: 'Vi har ___ med god mat igjen etter festen.', correct: 'masse', wrong: 'mase', teachingNote: 'Masse betyr veldig mye. Å mase er å plage noen med spørsmål.' },
  { type: 'double_consonant', id: 'dk-p07', difficulty: 6, sentence: 'Det regnet, så gutten tok på en jakke med ___.', correct: 'hette', wrong: 'hete', teachingNote: 'En hette drar du over hodet. Å hete betyr å ha et navn.' },
  { type: 'double_consonant', id: 'dk-p08', difficulty: 6, sentence: 'Vi må ___ overalt for å finne katten.', correct: 'lete', wrong: 'lette', teachingNote: 'Å lete er å se etter noe. Å lette er at et fly stiger opp.' },
  { type: 'double_consonant', id: 'dk-p12', difficulty: 6, sentence: 'Vi var så sultne at vi spiste en ___ pizza.', correct: 'hel', wrong: 'hell', teachingNote: 'Hel betyr at ingenting mangler. Hell betyr flaks.' },
  { type: 'double_consonant', id: 'dk-p14', difficulty: 6, sentence: 'Etter treningen var jeg sulten og ville ha ___.', correct: 'mat', wrong: 'matt', teachingNote: 'Mat er noe du spiser. Matt betyr sjakk matt eller en dus farge.' },
  { type: 'double_consonant', id: 'dk-p15', difficulty: 6, sentence: 'Hver morgen må jeg ___ blomstene i vinduet.', correct: 'vanne', wrong: 'vane', teachingNote: 'Å vanne er å gi vann til planter. En vane er noe du gjør ofte.' },
  { type: 'double_consonant', id: 'dk-p16', difficulty: 6, sentence: 'Jeg ___ svaret, for jeg har lest boka nøye.', correct: 'vet', wrong: 'vett', teachingNote: 'Vet kommer av å vite. Vett betyr sunn fornuft.' },
  { type: 'double_consonant', id: 'dk-p06', difficulty: 7, sentence: 'På søndag skal vi ___ boller med mormor.', correct: 'bake', wrong: 'bakke', teachingNote: 'Å bake er å lage boller i ovnen. En bakke er en skråning.' },
  { type: 'double_consonant', id: 'dk-p10', difficulty: 7, sentence: 'Bestefar fortalte et gammelt ___ fra barndommen.', correct: 'minne', wrong: 'mine', teachingNote: 'Et minne er noe du husker. Mine betyr at noe tilhører meg.' },
  { type: 'double_consonant', id: 'dk-p18', difficulty: 7, sentence: 'Kan du ___ meg hvordan oppgaven løses?', correct: 'vise', wrong: 'visse', teachingNote: 'Å vise er å la noen se noe. Visse betyr noen bestemte, ikke alle.' },
  { type: 'double_consonant', id: 'dk-p19', difficulty: 8, sentence: 'Gutten ble fylt av ___ da noen tok leken hans.', correct: 'sinne', wrong: 'sine', teachingNote: 'Sinne er å være sint. Sine betyr noe som tilhører han selv.' },
  { type: 'double_consonant', id: 'dk-p20', difficulty: 9, sentence: 'For å komme over bekken måtte vi ___ i vannet.', correct: 'vasse', wrong: 'vase', teachingNote: 'Å vasse er å gå i vann til beina. En vase har du blomster i.' },

  // ── Vanskeligere regler ─────────────────────────────────────────────────
  { type: 'double_consonant', id: 'dk-x04', difficulty: 8, sentence: 'Hun ___ rommet sitt i går.', correct: 'ryddet', wrong: 'rydet', teachingNote: 'Kort y-lyd i ryddet gir dobbel d.' },
  { type: 'double_consonant', id: 'dk-x01', difficulty: 8, sentence: 'Jeg ___ svaret før læreren spurte.', correct: 'visste', wrong: 'viste', teachingNote: 'Visste kommer av å vite. Viste betyr at noen lot deg se noe.' },
  { type: 'double_consonant', id: 'dk-x08', difficulty: 8, sentence: 'Vi ___ helt til toppen av fjellet.', correct: 'klatret', wrong: 'klattret', teachingNote: 'Konsonanten dobles ikke foran en annen konsonant: klatret.' },
  { type: 'double_consonant', id: 'dk-x02', difficulty: 9, sentence: 'Jeg ___ meg på den varme ovnen.', correct: 'brente', wrong: 'brennte', teachingNote: 'Brenne mister en n foran t: brente, ikke brennte.' },
  { type: 'double_consonant', id: 'dk-x03', difficulty: 9, sentence: 'Han ___ vannet ut av bøtta.', correct: 'tømte', wrong: 'tømmte', teachingNote: 'Tømme mister en m foran t: tømte, ikke tømmte.' },
  { type: 'double_consonant', id: 'dk-x07', difficulty: 9, sentence: 'Bilen ___ forbi oss i høy fart.', correct: 'suste', wrong: 'susste', teachingNote: 'Lang u-lyd i suste gir bare én s.' },
  { type: 'double_consonant', id: 'dk-x05', difficulty: 10, sentence: 'Han glemte ___ til telefonen sin.', correct: 'nummeret', wrong: 'numeret', teachingNote: 'Kort u-lyd i nummer gir dobbel m.' },
  { type: 'double_consonant', id: 'dk-x06', difficulty: 10, sentence: 'Han ___ hardt i tauet for å få opp seilet.', correct: 'trakk', wrong: 'trak', teachingNote: 'Kort a-lyd i trakk gir dobbel k.' },
]

// Shuffles the two spellings per call, so the correct one isn't always in the
// same slot for a given question across rounds.
export function getDoubleConsonantForDifficulty(difficulty: number): DoubleConsonantQuestion[] {
  return doubleConsonantQuestions
    .filter(q => Math.abs(q.difficulty - difficulty) <= 1)
    .map(q => ({
      ...q,
      choices: Math.random() < 0.5 ? [q.correct, q.wrong] : [q.wrong, q.correct],
    }))
}
