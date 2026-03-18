export interface SentenceData {
  id: string
  difficulty: number
  sentence: string   // with ___ for blank
  correct: string
  choices: string[]  // includes correct, 2-3 wrong answers
}

export const sentences: SentenceData[] = [
  // ── Difficulty 1 ───────────────────────────────────────────────
  { id: 'fi-001', difficulty: 1, sentence: 'Hunden er ___.',         correct: 'stor',    choices: ['stor', 'bil', 'grønn'] },
  { id: 'fi-002', difficulty: 1, sentence: 'Katten sover på ___.',   correct: 'sofaen',  choices: ['sofaen', 'bilen', 'hunden'] },
  { id: 'fi-003', difficulty: 1, sentence: 'Jeg spiser et ___.',     correct: 'eple',    choices: ['eple', 'hus', 'bord'] },
  { id: 'fi-004', difficulty: 1, sentence: 'Sola er ___.',           correct: 'gul',     choices: ['gul', 'kald', 'bort'] },
  { id: 'fi-005', difficulty: 1, sentence: 'Bilen er ___.',          correct: 'rød',     choices: ['rød', 'svømme', 'liten'] },
  { id: 'fi-006', difficulty: 1, sentence: 'Huset har en stor ___.',  correct: 'dør',     choices: ['dør', 'katt', 'grønn'] },
  { id: 'fi-007', difficulty: 1, sentence: 'Jeg leser en ___.',      correct: 'bok',     choices: ['bok', 'bil', 'stol'] },
  { id: 'fi-008', difficulty: 1, sentence: 'Fuglen ___ høyt.',       correct: 'flyr',    choices: ['flyr', 'spiser', 'sover'] },
  { id: 'fi-009', difficulty: 1, sentence: 'Melken er ___.',         correct: 'hvit',    choices: ['hvit', 'rask', 'langt'] },
  { id: 'fi-010', difficulty: 1, sentence: 'Gutten har en liten ___.',correct: 'ball',    choices: ['ball', 'sky', 'grønn'] },
  { id: 'fi-011', difficulty: 1, sentence: 'Jenta løper ___.',       correct: 'fort',    choices: ['fort', 'bord', 'hund'] },

  // ── Difficulty 2 ───────────────────────────────────────────────
  { id: 'fi-012', difficulty: 2, sentence: 'Bjørnen ___ honning.',   correct: 'spiser',  choices: ['spiser', 'synger', 'sover'] },
  { id: 'fi-013', difficulty: 2, sentence: 'Vi leker i ___.',        correct: 'skogen',  choices: ['skogen', 'boken', 'stolen'] },
  { id: 'fi-014', difficulty: 2, sentence: 'Det er mange ___ på himmelen.', correct: 'skyer', choices: ['skyer', 'biler', 'hunder'] },
  { id: 'fi-015', difficulty: 2, sentence: 'Fisken svømmer i ___.',  correct: 'vannet',  choices: ['vannet', 'skogen', 'huset'] },
  { id: 'fi-016', difficulty: 2, sentence: 'Toget kjører ___ stasjonen.', correct: 'til',  choices: ['til', 'av', 'i'] },
  { id: 'fi-017', difficulty: 2, sentence: 'Blomstene er ___ og røde.', correct: 'gule',  choices: ['gule', 'store', 'lange'] },
  { id: 'fi-018', difficulty: 2, sentence: 'Barnet ___ på lekeplassen.', correct: 'leker', choices: ['leker', 'synger', 'leser'] },
  { id: 'fi-019', difficulty: 2, sentence: 'Det er kaldt om ___.',    correct: 'vinteren', choices: ['vinteren', 'sommeren', 'kvelden'] },
  { id: 'fi-020', difficulty: 2, sentence: 'Hesten er et stort ___.',  correct: 'dyr',    choices: ['dyr', 'hus', 'tre'] },
  { id: 'fi-021', difficulty: 2, sentence: 'Jeg pusser ___ hver morgen.', correct: 'tennene', choices: ['tennene', 'boken', 'bilen'] },
  { id: 'fi-022', difficulty: 2, sentence: 'Katten liker å ___.',    correct: 'sove',    choices: ['sove', 'fly', 'drikke'] },

  // ── Difficulty 3 ───────────────────────────────────────────────
  { id: 'fi-023', difficulty: 3, sentence: 'Elefanten har en lang ___.',  correct: 'snabel', choices: ['snabel', 'hale', 'vinge'] },
  { id: 'fi-024', difficulty: 3, sentence: 'Vi spiste ___ til frokost.',  correct: 'havregrøt', choices: ['havregrøt', 'sjokolade', 'is'] },
  { id: 'fi-025', difficulty: 3, sentence: 'Læreren forklarte en vanskelig ___.',  correct: 'oppgave', choices: ['oppgave', 'spiser', 'sykkel'] },
  { id: 'fi-026', difficulty: 3, sentence: 'Regnet falt ___ taket.',  correct: 'på',      choices: ['på', 'under', 'bort'] },
  { id: 'fi-027', difficulty: 3, sentence: 'Jenta hadde på seg en rød ___.',  correct: 'regnjakke', choices: ['regnjakke', 'fotball', 'melk'] },
  { id: 'fi-028', difficulty: 3, sentence: 'Barna hoppet i ___.',    correct: 'snøen',   choices: ['snøen', 'boken', 'bilen'] },
  { id: 'fi-029', difficulty: 3, sentence: 'Farfar leste for oss om ___.',  correct: 'kvelden', choices: ['kvelden', 'sommeren', 'dagen'] },
  { id: 'fi-030', difficulty: 3, sentence: 'Sykkelstien gikk gjennom ___.',  correct: 'skogen', choices: ['skogen', 'glasset', 'bordet'] },
  { id: 'fi-031', difficulty: 3, sentence: 'Hunden gjemte benet sitt i ___.',  correct: 'jorda', choices: ['jorda', 'boka', 'glasset'] },
  { id: 'fi-032', difficulty: 3, sentence: 'Vi fikk ___ i bursdagspresang.',  correct: 'sjokolade', choices: ['sjokolade', 'stein', 'blyant'] },
  { id: 'fi-033', difficulty: 3, sentence: 'Katten satt og ___ på fuglen.',  correct: 'stirret', choices: ['stirret', 'spiste', 'hoppet'] },

  // ── Difficulty 4 ───────────────────────────────────────────────
  { id: 'fi-034', difficulty: 4, sentence: 'Pingvinen lever i ___ og kalde strøk.',  correct: 'snørike', choices: ['snørike', 'varme', 'tørre', 'grønne'] },
  { id: 'fi-035', difficulty: 4, sentence: 'Hunden er kjent som menneskets beste ___.',  correct: 'venn', choices: ['venn', 'fiende', 'bok', 'mat'] },
  { id: 'fi-036', difficulty: 4, sentence: 'Vi drar på hytta hver ___ sommer.',  correct: 'eneste', choices: ['eneste', 'store', 'triste', 'billige'] },
  { id: 'fi-037', difficulty: 4, sentence: 'Musikk gjør meg ___ og glad.',  correct: 'rolig', choices: ['rolig', 'sur', 'sliten', 'kald'] },
  { id: 'fi-038', difficulty: 4, sentence: 'Brannbilen kjørte fort mot ___.',  correct: 'brannen', choices: ['brannen', 'stranden', 'skolen', 'leken'] },
  { id: 'fi-039', difficulty: 4, sentence: 'Læreren ba oss om å sitte ___.',  correct: 'stille', choices: ['stille', 'fort', 'høyt', 'utendørs'] },
  { id: 'fi-040', difficulty: 4, sentence: 'Jenta var så glad at hun måtte ___.',  correct: 'smile', choices: ['smile', 'jorda', 'mange', 'rakett'] },
  { id: 'fi-041', difficulty: 4, sentence: 'Vi fisket hele dagen uten å få ___.',  correct: 'noe',  choices: ['noe', 'alt', 'ingenting', 'mer'] },
  { id: 'fi-042', difficulty: 4, sentence: 'Helikopteret landet ___ gården.',  correct: 'ved', choices: ['ved', 'over', 'under', 'snurrende'] },
  { id: 'fi-043', difficulty: 4, sentence: 'Grantreet er alltid ___ om vinteren.',  correct: 'grønt', choices: ['grønt', 'rødt', 'blått', 'hvitt'] },
  { id: 'fi-044', difficulty: 4, sentence: 'Han spiste ___ av kaken sin.',  correct: 'resten', choices: ['resten', 'boken', 'turen', 'steinen'] },

  // ── Difficulty 5 ───────────────────────────────────────────────
  { id: 'fi-045', difficulty: 5, sentence: 'Vi spiser ___ til middag i dag.',  correct: 'spagetti', choices: ['spagetti', 'telefon', 'lykkelig', 'sykkel'] },
  { id: 'fi-046', difficulty: 5, sentence: 'Ambulansen kom ___ til ulykkesstedet.',  correct: 'raskt', choices: ['raskt', 'sakte', 'forsiktig', 'utrolig'] },
  { id: 'fi-047', difficulty: 5, sentence: 'Helikopteret ___ over fjelltoppen.',  correct: 'fløy', choices: ['fløy', 'kjørte', 'sprang', 'falt'] },
  { id: 'fi-048', difficulty: 5, sentence: 'Det er viktig å ___ hender etter toalettet.',  correct: 'vaske', choices: ['vaske', 'spise', 'lese', 'male'] },
  { id: 'fi-049', difficulty: 5, sentence: 'Boka han leste var veldig ___.',  correct: 'spennende', choices: ['spennende', 'varm', 'rund', 'lang'] },
  { id: 'fi-050', difficulty: 5, sentence: 'Klatringen i fjellet krevde mye ___.',  correct: 'styrke', choices: ['styrke', 'musikk', 'farger', 'lekser'] },
  { id: 'fi-051', difficulty: 5, sentence: 'Brokkoli er en grønnsak som er god for ___.',  correct: 'helsen', choices: ['helsen', 'sangen', 'skolen', 'boken'] },
  { id: 'fi-052', difficulty: 5, sentence: 'Det store fjellet ___ seg over dalen.',  correct: 'hevet', choices: ['hevet', 'skjulte', 'gjemte', 'rørte'] },
  { id: 'fi-053', difficulty: 5, sentence: 'Neshornets horn er laget av ___.',  correct: 'keratin', choices: ['keratin', 'jern', 'gull', 'stein'] },
  { id: 'fi-054', difficulty: 5, sentence: 'Vaskemaskinen lager mye ___ når den spinner.',  correct: 'lyd', choices: ['lyd', 'farge', 'lukt', 'smak'] },
  { id: 'fi-055', difficulty: 5, sentence: 'Elevene jobbet hardt for å løse ___.',  correct: 'oppgaven', choices: ['oppgaven', 'dyret', 'bilen', 'sangen'] },

  // ── Difficulty 6 ───────────────────────────────────────────────
  { id: 'fi-056', difficulty: 6, sentence: 'Flodhesten tilbringer mye tid i ___.',  correct: 'vannet', choices: ['vannet', 'treet', 'skrinet', 'huset'] },
  { id: 'fi-057', difficulty: 6, sentence: 'Ubåten ___ ned til havbunnen.',  correct: 'dykket', choices: ['dykket', 'fløy', 'klatret', 'sprang'] },
  { id: 'fi-058', difficulty: 6, sentence: 'Det er viktig å ___ naturen vår.',  correct: 'bevare', choices: ['bevare', 'spise', 'male', 'ødelegge'] },
  { id: 'fi-059', difficulty: 6, sentence: 'Isbreene ___ på grunn av klimaendringene.',  correct: 'smelter', choices: ['smelter', 'vokser', 'synger', 'leser'] },
  { id: 'fi-060', difficulty: 6, sentence: 'Saksofonen gir en ___ og varm lyd.',  correct: 'myk', choices: ['myk', 'skarp', 'kald', 'hard'] },
  { id: 'fi-061', difficulty: 6, sentence: 'Oppvaskmaskinen bruker mye ___.',  correct: 'vann', choices: ['vann', 'stein', 'lys', 'jord'] },
  { id: 'fi-062', difficulty: 6, sentence: 'Han ___ seg ut som en løve i skuespillet.',  correct: 'kledde', choices: ['kledde', 'spiste', 'leste', 'kjørte'] },
  { id: 'fi-063', difficulty: 6, sentence: 'Orientering krever at man kan lese et ___.',  correct: 'kart', choices: ['kart', 'brev', 'dikt', 'bilde'] },
  { id: 'fi-064', difficulty: 6, sentence: 'Tallene i ___ hjelper oss å telle.',  correct: 'matematikk', choices: ['matematikk', 'norsk', 'kunst', 'gym'] },
  { id: 'fi-065', difficulty: 6, sentence: 'Vulkanen ___ lava ned fjellsiden.',  correct: 'spydde', choices: ['spydde', 'sang', 'drakk', 'leste'] },
  { id: 'fi-066', difficulty: 6, sentence: 'Luftballongen steg ___ i himmelen.',  correct: 'høyt', choices: ['høyt', 'lavt', 'sakte', 'stille'] },

  // ── Difficulty 7 ───────────────────────────────────────────────
  { id: 'fi-067', difficulty: 7, sentence: 'Sjimpansen løste ___ lettere enn vi trodde.',  correct: 'problemet', choices: ['problemet', 'sangen', 'boken', 'maten'] },
  { id: 'fi-068', difficulty: 7, sentence: 'Tordenvær kan oppstå når ___ møter kald luft.',  correct: 'varm luft', choices: ['varm luft', 'snø', 'is', 'tåke'] },
  { id: 'fi-069', difficulty: 7, sentence: 'Jordskjelv måles på en ___ kalt Richterskalaen.',  correct: 'skala', choices: ['skala', 'linjer', 'farge', 'form'] },
  { id: 'fi-070', difficulty: 7, sentence: 'Ullgenseren holdt meg ___ i kulden.',  correct: 'varm', choices: ['varm', 'kald', 'tørr', 'våt'] },
  { id: 'fi-071', difficulty: 7, sentence: 'Kontrabassen er det største ___ instrumentet.',  correct: 'strykeinstrumentet', choices: ['strykeinstrumentet', 'blåseinstrumentet', 'slagverket', 'trekkspillet'] },
  { id: 'fi-072', difficulty: 7, sentence: 'Friidrett ___ mange forskjellige øvelser.',  correct: 'inkluderer', choices: ['inkluderer', 'bruker', 'fjerner', 'lager'] },
  { id: 'fi-073', difficulty: 7, sentence: 'Søppelkassen bør ___ for å beskytte miljøet.',  correct: 'sorteres', choices: ['sorteres', 'brennes', 'lukkes', 'åpnes'] },
  { id: 'fi-074', difficulty: 7, sentence: 'En trombonist spiller ved å ___.',  correct: 'skyve et rør', choices: ['skyve et rør', 'blåse i et hull', 'trykke tangenter', 'stryke strenger'] },
  { id: 'fi-075', difficulty: 7, sentence: 'Nøkkelbenet er plassert mellom skulderen og ___.',  correct: 'brystbenet', choices: ['brystbenet', 'låret', 'albuen', 'kneet'] },
  { id: 'fi-076', difficulty: 7, sentence: 'Triatlon består av svømming, sykling og ___.',  correct: 'løping', choices: ['løping', 'hopping', 'kasting', 'klatring'] },
  { id: 'fi-077', difficulty: 7, sentence: 'Polarlyset ___ fordi partikler fra sola treffer atmosfæren.',  correct: 'skinner', choices: ['skinner', 'brummer', 'dunker', 'faller'] },

  // ── Difficulty 8 ───────────────────────────────────────────────
  { id: 'fi-078', difficulty: 8, sentence: 'Ribbena beskytter de indre ___ i brystkassen.',  correct: 'organene', choices: ['organene', 'musklene', 'knokkelene', 'nervene'] },
  { id: 'fi-079', difficulty: 8, sentence: 'Trompeten er et blåsinstrument i ___.',  correct: 'messing', choices: ['messing', 'diamant', 'kull', 'slagverk'] },
  { id: 'fi-080', difficulty: 8, sentence: 'Ørnen er kjent for sine skarpe ___.',  correct: 'klør', choices: ['klør', 'fjær', 'vinger', 'fingre'] },
  { id: 'fi-081', difficulty: 8, sentence: 'Jordskjelv oppstår langs tektoniske ___.',  correct: 'plategrenser', choices: ['plategrenser', 'elvebreddene', 'kystlinjene', 'fjellkjeder'] },
  { id: 'fi-082', difficulty: 8, sentence: 'Monsunregnet er avgjørende for landbruket i ___.',  correct: 'Asia', choices: ['Asia', 'Europa', 'Afrika', 'Amerika'] },
  { id: 'fi-083', difficulty: 8, sentence: 'Xylofonen lages av treplanker lagt over ___.',  correct: 'resonanskasser', choices: ['resonanskasser', 'strenger', 'membranene', 'ventiler'] },
  { id: 'fi-084', difficulty: 8, sentence: 'Stafettløp krever god ___ mellom deltakerne.',  correct: 'koordinasjon', choices: ['koordinasjon', 'styrke', 'hastighet', 'balanse'] },
  { id: 'fi-085', difficulty: 8, sentence: 'Snowboard ble ___ fra USA på 1980-tallet.',  correct: 'populært', choices: ['populært', 'oppfunnet', 'forbudt', 'glemt'] },
  { id: 'fi-086', difficulty: 8, sentence: 'Polarlyset kalles også ___.',  correct: 'nordlys', choices: ['nordlys', 'sydlys', 'stjernelys', 'månelys'] },
  { id: 'fi-087', difficulty: 8, sentence: 'Mellomgulvet er en ___ som hjelper oss å puste.',  correct: 'muskel', choices: ['muskel', 'nerve', 'åre', 'knokkel'] },
  { id: 'fi-088', difficulty: 8, sentence: 'Piano er et populært instrument med ___.',  correct: 'tangenter', choices: ['tangenter', 'rør', 'ventiler', 'membran'] },

  // ── Difficulty 9 ───────────────────────────────────────────────
  { id: 'fi-089', difficulty: 9, sentence: 'Regnfrakken er laget av et ___ materiale.',  correct: 'vanntett', choices: ['vanntett', 'lufttett', 'tynt', 'mykt'] },
  { id: 'fi-090', difficulty: 9, sentence: 'Hjerteklaffen sørger for at blodet strømmer i riktig ___.',  correct: 'retning', choices: ['retning', 'fart', 'mengde', 'form'] },
  { id: 'fi-091', difficulty: 9, sentence: 'Wifi brukest til å få ___ signaler.',  correct: 'trådløse', choices: ['trådløse', 'kablede', 'analoge', 'digitale'] },
  { id: 'fi-092', difficulty: 9, sentence: 'Undergrunnsbanen kalles også ___ på norsk.',  correct: 'T-bane', choices: ['T-bane', 'trikk', 'buss', 'ekspressbane'] },
  { id: 'fi-093', difficulty: 9, sentence: 'Svevefartøyet flyr ved hjelp av ___.',  correct: 'luftpute', choices: ['luftpute', 'vingene', 'propellen', 'rattet'] },
  { id: 'fi-094', difficulty: 9, sentence: 'Triatlon er en OL-øvelse der man gjør ___ øvelser.',  correct: 'tre', choices: ['tre', 'to', 'fire', 'fem'] },
  { id: 'fi-095', difficulty: 9, sentence: 'Sort er fravær av ___.',  correct: 'lys', choices: ['lys', 'farge', 'mørke', 'skygge'] },

  // ── Difficulty 10 ──────────────────────────────────────────────
  { id: 'fi-096', difficulty: 10, sentence: 'Mellomgulvet kontraherer og ___ ved innånding.',  correct: 'flater ut', choices: ['flater ut', 'hever seg', 'krymper', 'stivner'] },
  { id: 'fi-097', difficulty: 10, sentence: 'Magenta er en farge som ikke finnes i det synlige ___.',  correct: 'lysspekteret', choices: ['lysspekteret', 'fargehjulet', 'regnbuen', 'prismet'] },
  { id: 'fi-098', difficulty: 10, sentence: 'Slagverket i et orkester bidrar med dynamikk og ___.',  correct: '', choices: ['rytme', 'melodi', 'harmoni', 'tekstur'] },
  { id: 'fi-099', difficulty: 10, sentence: 'Termodrakten isolerer kroppen ved å fange ___ luft.',  correct: 'varm', choices: ['varm', 'kald', 'fuktig', 'tørr'] },
  { id: 'fi-100', difficulty: 10, sentence: 'Projeksjonsskjermen reflekterer lys fra ___.',  correct: 'projektoren', choices: ['projektoren', 'lampen', 'komfyren', 'veggene'] },
]
