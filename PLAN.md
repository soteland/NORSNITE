# NorsNite — Implementation Plan

## Goal
Build a Norwegian reading game for kids 7–12 that is so fun they beg to play it.
Inspired by Fortnite's progression loop and Duolingo's minigame variety.

> **Kun norsk. Ingen oversettelse noen gang.**
> All tekst i UI, instruksjoner, spørsmål, tilbakemeldinger og feilmeldinger skal være på norsk.
> Ingen i18n-bibliotek, ingen lokaliseringslag, ingen `lang`-variabel, ingen engelske strenger i UI.
> Kodekommentarer og variabelnavn er på engelsk (standard). Brukervendt tekst er 100 % norsk.

## Key Decisions Made
- **Stack**: React + TypeScript + Vite → Cloudflare Pages + Supabase
- **Routing**: TanStack Router (type-safe, integrert med TanStack Query)
- **Server state**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Client state**: Zustand (spilltilstand, aktiv runde, crown)
- **UI**: shadcn/ui + Tailwind CSS
- **Animasjoner**: Framer Motion (Victory Royale, XP-bar, league promotion)
- **Auth**: Google OAuth + Microsoft OAuth (no passwords). **Microsoft school tenant caveat**: school Microsoft accounts may require IT admin consent before OAuth works. Test with a real school account before advertising class use. Gmail is sufficient for launch — Microsoft school OAuth is best-effort.
- **Tiers**: Bronze → Silver → Gold → Platinum → Diamond → Elite → Champion → Unreal
- **Minigames**: 7 types, unlocked progressively by league
- **Avatar**: Simple 2D character with unlockable outfits and backgrounds
- **Content**: Stored in TypeScript files, editable in code — no admin UI
- **Social**: Friends list with league visibility; no teacher dashboard (v1)
- **Progresjon — vanskelighetssystem (1–10)**:
  - Skala 1–10 (ikke 1–5 — mer granularitet for bedre finjustering uten brukertesting)
  - Nye spillere starter på **nivå 2** (litt utfordrende fra dag én — målet er at det skal være vanskelig)
  - Antall svaralternativer: nivå 1–4 → **3 valg**, nivå 5–10 → **4 valg** (gratis vanskelighetsøkning uten nytt innhold)
  - **Ligaterskel (gulv)** — vanskelighetsgrad kan aldri synke under dette per liga:
    Bronze=1 | Silver=2 | Gold=3 | Platinum=4 | Diamond=5 | Elite=6 | Champion=7 | Unreal=8
  - Ved **ligarykk**: hvis gjeldende vanskelighetsgrad < nytt gulv → bump automatisk til gulvet
  - **Hva vanskelighetsgraden påvirker per minigame**:
    - Ord→Bilde / Bilde→Ord: ordlengde og frekvens (korte hverdagsord → lange sammensatte ord)
    - Fyll inn: setningslengde og antall leddsetninger
    - Skriv ordet: ordlengde (ren hukommelse, ingen svaralternativer)
    - Ordrekkefølge: antall ord i setningen (4 ord ved D1 → 8+ ord ved D10)
    - Les og forstå: avsnitts lengde og vokabular
    - Staving: trykk på bokstavene i riktig rekkefølge (som i ordrekkefølge-spillet)

  **Selvrapport** («Er dette lett, passe eller vanskelig?»):
  > ℹ️ Auto-adjust fra xp_log er fjernet. Vanskelighetsgrad endres KUN via selvrapport + ligaterskel.
  - Trigges ved rundeslutt når `total_correct_answers` passerer et multiplum av 15
  - Maks én gang per runde selv om flere terskler krysses
  - Viking-maskot stiller spørsmålet med tre store emoji-knapper:
    - 😴 «For lett!» → vanskelighetsgrad +1
    - 😊 «Passe!» → ingen endring
    - 😤 «Vanskelig!» → vanskelighetsgrad -1 (aldri under ligaterskel)
  - Frekvensen er selvkalibrerende: svake spillere (færre rette svar) spørres sjeldnere, sterke spillere (mange rette svar) spørres oftere

  **Vanskelighetsnivåer — hva de betyr i praksis**:
  | Nivå | Ord | Setning |
  |------|-----|---------|
  | 1 | 3–4 bokstaver, CVC (bil, sol, katt) | — |
  | 2 | 4–5 bokstaver, vanlige (hund, barn, melk) | 4–5 ord |
  | 3 | 5–6 bokstaver (skole, eple, blomst) | 5–6 ord |
  | 4 | 6–7 bokstaver (fotball, matpakke) | 6–7 ord |
  | 5 | 7–8 bokstaver (bibliotek, sykkel) | 7–8 ord, én leddsetning |
  | 6 | 8–9 bokstaver, noen sammensatte | 8–9 ord |
  | 7 | 9–10 bokstaver, mindre vanlige | Flere leddsetninger |
  | 8 | 10+ bokstaver, abstrakte | Komplekse setninger |
  | 9 | Avansert vokabular | Idiomatiske fraser |
  | 10 | Ekspertnivå | Langt avsnitt, full forståelse |
- **XP-skalering**: Hvert league-tier krever 15% mer XP enn forrige (svakt eksponensielt på terskler, ikke per oppgave). Base XP: 10 XP per riktig svar. Bonuser: perfekt runde +25%, crown win +50%, comeback +25%. **Ingen daglig tak** — spill mer, få mer. Terskler (kumulativ): Bronze 0 | Silver 1 000 | Gold 2 150 | Platinum 3 472 | Diamond 4 993 | Elite 6 742 | Champion 8 753 | Unreal 11 066. Total til Unreal ≈ 11 066 XP.
- **Rundelengde**: Styres av liganivå — Bronse: 5 spørsmål | Sølv: 6 | Gull: 7 | Platina: 8 | Diamant: 9 | Elite–Unreal: 10. Animasjoner og loot box tar lik andel av spilletiden uansett nivå. Høyere liga → naturlig mer XP per runde (flere spørsmål).
- **Innhold**: Schema defineres i kode, mengde genereres med GPT-4/5 mini etterpå. Kategorier avklares separat.
- **GDPR**: Personvernerklæring i appen = tilstrekkelig. Prosjektet open source.
- **Usernames**: Auto-generated fra lokal norsk ordliste (adj + substantiv + 1-3 siffer). 600 000 unike kombinasjoner. Kan renames én gang per 30 dager (`last_rename_at` i profiles).
- **Username format**: PascalCase e.g. `FlytendeHest2`, `GrønnBåt4`
- **Word lists**: Curated, kid-appropriate Norwegian words stored in `src/lib/username/`
- **Audio**: Web Speech API (browser built-in, `speechSynthesis`, Norwegian locale `nb-NO`). Zero cost, no server, works in Safari + Chrome on iPad/iPhone.
- **Friends**: Eksakt brukernavn-søk. Forespørsel + godkjenning (ikke instant). Email aldri eksponert. GDPR-compliant.
- **Loot box**: 3-klikks kiste — klikk 1+2 rister kisten, klikk 3 sprenger den åpen (Framer Motion). Trigges etter **5 fullførte runder** (etter runde 1 for nye spillere). Serveren ruller loot i `claim_loot()` RPC. Innhold:

  | Sannsynlighet | Rarity | Belønning |
  |---|---|---|
  | 60% | Vanlig (grå) | XP — tilfeldig 50–100 |
  | 10% | Uvanlig (grønn) | ⚡ Hopp-token |
  | 18% | Uvanlig (grønn) | 🛡️ 1-dags strekk-skjold |
  | 6% | Sjelden (blå) | 🛡️🛡️ 2-dagers strekk-skjold |
  | 4% | Episk (lilla) | 🛡️🛡️🛡️ 3-dagers strekk-skjold |
  | 2% | Legendarisk (gull) | 🛡️×5 5-dagers strekk-skjold |
- **Hopp-token ⚡**: Vunnet fra loot box (uvanlig). Maks 5 banket (`skip_tokens` i profiles). Bruk 1 per runde — hopper over et spørsmål og cacher inn base XP for det spørsmålet (ingen bonusmultiplikator). Hoppet teller **ikke** som riktig svar for perfekt runde eller Crown Win — bruker du hopp mister du sjansen for perfekt-bonus (+25%) og crown win (+50%) den runden. Skaper strategisk valg: er det verdt å bruke hoppet her?
- **Season reset**: Manuell admin-dato. Micro-admin UI for eier. Nedtelling vises subtilt for spillere. Reset arkiverer league som «Season X»-badge.
- **Slett konto**: Bruker kan slette alt + koble fra SSO (kan re-registrere med samme konto). Krever Supabase Edge Function (admin API). Sletter alle rader på tvers av alle tabeller.
- **Admin**: Brukerliste med brukernavn, XP, league, sist aktiv. INGEN e-post i UI eller queries. Season-dato. is_banned flag. Admin-tilgang: én hardkodet Supabase UUID i Supabase-miljøvariabel (`ADMIN_USER_ID`), sjekkes mot `auth.uid()` i RLS + Edge Functions.
- **Rundestruktur**: Blandet — spørsmål innen en runde trekkes tilfeldig fra *alle* låste minigame-typer. Sikrer variasjon. Minigame-type vises tydelig i UI for hvert spørsmål.
- **Offline/tilkobling**: Dersom Supabase-tilkobling dropper midt i runde → vis feilmelding, runden avbrytes, **ingen XP tildeles** (man taper XP man ville fått).
- **Daglig XP-tak**: Ingen. Spill mer, få mer — læring trenger ikke grenser.
- **Innholdskategorier**: 12 kategorier — mat, dyr, skole, kropp, natur, hjem, eventyr, sport, følelser, vær, familie, yrker. Defineres som TypeScript union type. Kategorier brukes til å velge innhold og kan filtreres av admin fremover.
- **Minimum innhold for launch**: 20 ord per kategori = 240 ord totalt. **101 fyll-inn-setninger** ✅. **32 ordrekkefølge-setninger** ✅. **12 les-og-forstå-avsnitt** ✅. **44 tegnsetting-spørsmål** ✅. Alt genereres med GPT — ta deg tid til dette før launch.
- **Feil svar → læringsmoment**: Når et svar er feil → lyser spørsmålet rødt i 1 sekund, viser riktig svar tydelig i 2 sekunder, sier riktig svar via Web Speech API. Deretter: legg spørsmålet tilbake i bunken — det dukker opp igjen mot slutten av runden. Målet er læring, ikke bare testing.
- **Strekk-skjold 🛡️**: Vinnes fra loot box i 1–5 dagers varianter. Lagres som `streak_shield_days` (totalt antall dager med beskyttelse, maks 7 banket). Brukes automatisk ved rundeslutt: hvis du har mistet N dager OG `streak_days >= 3` OG `streak_shield_days >= N` → konsumerer N skjold-dager, strekken bevares. Har du ikke nok dager → strekken brytes. Kritisk for å beholde yngre spillere etter sykdom/ferie. Et legendarisk 5-dagers skjold beskytter mot en hel ukes fravær.
- **«Nesten der!»-hook ved rundeslutt**: Victory Royale-skjermen viser alltid: «Du trenger bare **X XP** til [neste liga/badge]! 🔥» med stor Play Again-knapp. Dersom spilleren er innen 20% av neste terskel, pulser teksten. Ingen mulighet til å lukke skjermen uten å se dette.
- **Første loot box etter runde 1**: Nye spillere (0 fullførte runder) får loot box etter første runde, ikke femte. Hook dem umiddelbart. Deretter normal 5-runders rytme.
- **Navnebytte og venner**: Vennskap er koblet til UUID (ikke brukernavn). Bytter du navn ser vennen din det nye navnet automatisk — ingen reconnect, ingen tap.
- **Krone + tap**: **10% sjanse** ved rundestart for å spille med krone. Crown Win krever **alle svar riktige** (perfekt runde) — da gis +50% XP-bonus. Starter du med krone og ikke får perfekt runde → vanlig tap, ingen straff. Ingen grense på antall Crown Wins — samler seg ubegrenset. Antall crown wins vises tydelig i profil (tall ved siden av 👑). Kronen gir kun oppside — ikke downside.
- **`today_xp` / `today_date` reset**: Server-side only. Round controller calls a Supabase RPC function `start_round()` at the start of each round. The function checks if `today_date < current_date` and resets `today_xp = 0, today_date = current_date` atomically before returning. Never done client-side (gameable via clock manipulation).
- **Streak timezone**: Always use `Europe/Oslo` (handles both UTC+1 winter and UTC+2 summer DST). Never use hardcoded UTC offsets.
- **Avatar**: DiceBear `adventurer-neutral` SVG (`@dicebear/collection@8` + `@dicebear/core@8` — pin versions, do NOT upgrade without checking API). Faktiske valg: øyne (26), øyenbryn (15), munn (30), briller (5 varianter). Designes ved onboarding, kan endres i profil. Unlockable cosmetics er CSS-lag rundt kortet: kortbakgrunn (per league), ramme/border (Champion+), krone-ikon (crown win), titler (achievements).
- **Avatar hudfarger**: To grupper i fargevelgeren — **Hudtoner** (5 stk): `#FDDBB4` (lys), `#E8AC80` (medium lys), `#C68642` (medium), `#8D5524` (mørk), `#4A2912` (meget mørk). **Morsomme farger** (8 stk): lilla `#a855f7`, blå `#3b82f6`, grønn `#22c55e`, oransje `#f97316`, rosa `#ec4899`, cyan `#06b6d4`, gul `#eab308`, rød `#ef4444`. Totalt 13 valg, visuelt gruppert i UI.
- **Oppmuntring ved null riktige**: Viser trist emoji (😢) + tilfeldig valgt norsk oppmuntring, f.eks. «Uffda! Jeg har tro på deg — prøv én gang til! 💪». **25% sjanse** for å aktivere «Comeback-bonus»: neste runde gir +25% XP (merk: IKKE dobling — kun +25%). Presenteres som en dramatisk overraskelse — skjermen lyser opp, konfetti, stor tekst «⚡ EKSTRA SJANSE! ⚡ Neste runde gir BONUS XP — men KUN om du spiller NÅ!». Framer Motion full-screen splash. Bonus lever kun i Zustand (nullstilles ved reload) — forsvinner om de ikke spiller med en gang, noe som forsterker urgency.
- **Backgrounds**: CSS gradients only — no WebP files needed. Each league unlocks a named gradient defined in `src/lib/cosmetics.ts`. Can be upgraded to art assets later without changing logic. The `public/backgrounds/` placeholder folder can be removed.
- **Viking-maskot**: Gjennomgående karakter (en norsk viking) med snakkeboble brukes til å snakke til spilleren ved nøkkelmoment. Bilder ligger i `public/vikings/`. Navnekonvensjon: `viking-bubble-left-01.webp` (viking ser høyre, boble til venstre) og `viking-bubble-right-01.webp`. Spillet velger random variant per hendelse. Triggere: rundeseier · perfekt runde · Crown Win · null riktige · comeback-bonus · liga-opprykk · strekk-milepæl · onboarding-velkomst · feil svar (mid-runde) · loot box.
- **Grafikk-kart** (alle steder som trenger illustrasjoner — alle er placeholder webp inntil ekte bilder er laget):
  - `public/vikings/` — Viking-maskot med snakkeboble, 3+ varianter per retning
  - `public/splash/` — Månedlig velkomstbilde (january.webp … december.webp)
  - ~~`public/backgrounds/`~~ — **FJERNET** — erstattet med CSS gradients i `src/lib/cosmetics.ts`
  - `public/league-icons/` — 8 liga-ikoner (shield/badge-stil, 256×256px)
  - `public/lootbox/` — Kiste i 3 tilstander: closed · shaking · open
- **Onboarding flow** (ny bruker etter OAuth):
  1. Sjekk om `profiles`-rad finnes for `auth.uid()` — hvis ja, hopp over onboarding
  2. Auto-generer brukernavn med `generateUsername()` fra `src/lib/username/`
  3. Vis: «Hei! Vi ga deg brukernavnet **FlytendeHest42** — du kan endre det én gang. Vil du beholde det?»
  4. Fri tekst-input om brukeren vil endre (PascalCase-validering, unikhetssjekk mot Supabase)
  5. Velg avatar: hudtone-rad + morsomt-farger-rad → stor DiceBear-forhåndsvisning oppdateres live
  6. Kortregelbeskrivelse (maks 2 skjermbilder): hva XP er, hva ligaer er — Skip-knapp alltid synlig
  7. → Første runde starter umiddelbart
- **Zustand store shape**:
  ```ts
  interface GameStore {
    roundActive: boolean;
    crownActive: boolean;       // 10% roll at round start — Zustand only
    comebackBonus: boolean;     // +25% XP next round — Zustand only, null on reload
    usedSkipThisRound: boolean; // skip voids perfect/crown win
    questionsInRound: Question[];
    currentQuestionIndex: number;
    correctThisRound: number;
    startRound: (questions: Question[], hasCrown: boolean) => void;
    answerQuestion: (correct: boolean) => void;
    useSkip: () => void;
    endRound: () => void;
    activateComeback: () => void;
    clearComeback: () => void;
  }
  ```
- **App name**: **NorsNite** (norsk + Fortnite)

## Open Questions (resolved)
- ✅ Daily XP cap: **Ingen** — spill mer, få mer
- ✅ Avatar: DiceBear adventurer-neutral — brukeren velger øyne (26 varianter), øyenbryn (15), munn (30), briller (5), hudfarge (13)
- ✅ Admin-tilgang: hardkodet UUID i env-variabel

## Badge Visual Design

CSS sirkel med radial gradient (svart senter → rarity-farge ytterst) + to-lags neon glow.
Ikoner (emoji) sitter på den svarte midten — ser ut som de glør frem fra mørket.

```
background: radial-gradient(circle, #000 0%, #111 35%, <rarity-color> 100%)
box-shadow: 0 0 12px 4px rgba(color, 0.8), 0 0 40px 12px rgba(color, 0.3)
border: 1.5px solid rgba(color, 0.9)
```

| Rarity | Hex | Effekt |
|--------|-----|--------|
| Vanlig | #6b7280 | Svak kald glow |
| Uvanlig | #22c55e | Myk grønn |
| Sjelden | #3b82f6 | Elektrisk blå |
| Episk | #a855f7 | Lilla plasma |
| Legendarisk | #f59e0b | Varm gull-glimt |

Locked: `grayscale(100%) brightness(0.3)` + 🔒 emoji — kids ser silhuetten og vet hva de jakter.
Unlock-animasjon (Framer Motion): scale 0→1.2→1 + glow-puls ×3 + partikler fra midten.

## Achievements (Fortnite rarity system)

5 rarity-nivåer med gradientfarger: Vanlig (grå) → Uvanlig (grønn) → Sjelden (blå) → Episk (lilla) → Legendarisk (gull)

Visuell stil: CSS sirkel + gradient + stor emoji + tittel under. Låste badges vises grå med 🔒.
Placeholder: CSS badges nå. Kan byttes til ekte logo-stil kunst senere uten å endre logikk.

| Badge | Emoji | Navn | Krav | Rarity |
|-------|-------|------|------|--------|
| | 🎮 | Første skritt | Fullfør første runde | Vanlig |
| | ✅ | Ren tavle | Runde uten én feil | Vanlig |
| | 👥 | Lagkamerat | Legg til første venn | Vanlig |
| | 📖 | Leser | 10 fullførte runder | Vanlig |
| | 🔥 | På strekk | 3 dager på rad | Uvanlig |
| | 👑 | Krone | Første krone-seier | Uvanlig |
| | ⚡ | Lynrask | ~~Fjernet~~ (ingen rundetimer i v1) | — |
| | 📚 | Bokorm | 50 fullførte runder | Uvanlig |
| | 🎯 | Skarpskytter | 5 perfekte runder på rad | Sjelden |
| | 🔥🔥 | Ukestrekk | 7 dager på rad | Sjelden |
| | 👑👑 | Kronekjemper | 5 krone-seire | Sjelden |
| | 🌍 | Utforsker | Spill alle 7 minigame-typer | Sjelden |
| | 🧠 | Hjernekraft | 100 fullførte runder | Episk |
| | 🔥🔥🔥 | Månedsstrekk | 30 dager på rad | Episk |
| | 👑👑👑 | Kronelord | 25 krone-seire | Episk |
| | 💎 | Diamantsinn | Nå Diamond league | Episk |
| | 🏆 | Ureal | Nå Unreal league | Legendarisk |
| | 💯 | Mesteren | 500 fullførte runder | Legendarisk |
| | 🌟 | Ordmester | 50 perfekte runder | Legendarisk |
| | 👑🌟 | Evig krone | 50 krone-seire | Legendarisk |

**Daglig XP-rekord badges** (basert på `max_xp_in_day`):

| Badge | Emoji | Navn | Krav | Rarity |
|-------|-------|------|------|--------|
| | ⚡ | Glimt | 10 XP på én dag | Vanlig |
| | 🌟 | Gnist | 100 XP på én dag | Vanlig |
| | 🔥 | Flamme | 250 XP på én dag | Uvanlig |
| | 💥 | Eksplosjon | 400 XP på én dag | Uvanlig |
| | 🚀 | Rakett | 500 XP på én dag | Sjelden |
| | ⚡🔥 | Strøm | 750 XP på én dag | Sjelden |
| | 💎 | Diamantdag | 1 000 XP på én dag | Episk |
| | 🌠 | Stjerneskudd | 1 500 XP på én dag | Episk |
| | 👑⚡ | Dagkonge | 2 000 XP på én dag | Legendarisk |

\+ League-badge per tier: 🥉🥈🥇💜💙🔥👑⚡

## Implementation Phases

### Phase 1 — Project Foundation
- [x] Fix PLAN.md stale references (done in review pass)
- [ ] Scaffold Vite + React + TypeScript in `/norsGame/`
- [ ] Create `.env.local` from `.env.example` (already exists) — fill in dev Supabase URL + anon key + admin UUID
- [ ] Install all deps: TanStack Router, TanStack Query, Zustand, RHF+Zod, Framer Motion, shadcn/ui, Tailwind, @dicebear/collection, supabase-js
- [ ] Set up **two** Supabase projects: `norsnite-dev` and `norsnite-prod` — migrations from day 1
- [ ] Create `supabase/migrations/` folder with initial schema (profiles, xp_log, friends, unlocks, earned_achievements)
- [ ] Add GitHub Actions keep-alive workflow (`.github/workflows/keep-alive.yml`) — weekly ping to dev + prod Supabase to prevent 7-day free-tier pause
- [ ] Wire Google + Microsoft OAuth via Supabase Auth
- [ ] Session handling and protected routes (TanStack Router guards)
- [ ] Cloudflare Pages config (`wrangler.toml`)
- [ ] Environment variables pattern (`.env.local` for dev, Cloudflare secrets for prod)

### Phase 2 — Content Layer ✅ DONE
- [x] Design content TypeScript types: `Word`, `FillSentence`, `OrderSentence`, `ComprehensionText`, `PunctuationQuestion`
- [x] Generate initial word bank: 240 words (20 × 12 categories, difficulty 1–10)
- [x] 101 fill-in-the-blank sentences (D1–D10)
- [x] 32 word-order sentences (D1–D10, grammatically unambiguous constructions)
- [x] 12 comprehension paragraphs (D1–D10)
- [x] 44 punctuation questions (D1–D10, with teachingNote per question)
- [x] Norwegian word lists for username generation (`src/lib/username/adjectives.ts`, `nouns.ts`, `index.ts`)

### Phase 3 — Core Game Loop
- [ ] Round controller: select N questions based on league tier (5–10), draw from all unlocked minigame types
- [ ] Crown win logic: **10%** random roll at round start; stored in Zustand for the round. Crown Win requires **all answers correct** (perfect round) — gives +50% XP bonus. No crown = no bonus. Non-perfect crown round = normal loss, zero penalty.
- [ ] XP award logic: bonuses are **multiplicative** — `xp = base × (1.25 if perfect) × (1.50 if crown_win) × (1.25 if comeback)`. Client computes XP, server stores it (accepted for non-competitive game). After each round: increment `today_xp` (reset if `today_date` < today), update `max_xp_in_day` if today's total is a new record, check daily-record achievements.
- [ ] Wrong answer flow: red flash 1s → show correct answer 2s → speak correct answer (Web Speech) → re-queue question at end of round. `questions_total` = **original round length only** (re-queued retries are not counted).
- [ ] `rounds_since_loot` increment + loot box trigger: after round 1 for new players, every 5 rounds thereafter. Reset via `claim_loot()` RPC.
- [ ] Streak logic (in `award_xp` RPC — runs on round completion): `days_missed = (today - last_active_date) - 1`. If `days_missed > 0` AND `streak_days >= 3` AND `streak_shield_days >= days_missed` → consume exactly `days_missed` shield days, streak +1. Otherwise reset streak to 1. Always set `last_active_date = today`.
- [ ] "Nesten der!"-hook on Victory Royale screen: always show XP to next league/badge milestone, pulse if within 20% of threshold. Big "Spill igjen?" CTA.
- [ ] Victory Royale / Winner feedback screen with Framer Motion animation
- [ ] League tier calculation from `total_xp`
- [ ] ~~Adaptive difficulty from xp_log~~ **REMOVED**. Difficulty changes only via: (1) self-report 😴/😊/😤, (2) league floor bump on promotion.
- [ ] Difficulty self-report: at round end, if total_correct_answers just crossed a multiple of 15 → show viking asking 😴/😊/😤 (max once per round). ±1 difficulty, never below league floor.
- [ ] Offline detection: if Supabase drops mid-round → show error, void round, no XP

### Phase 4 — Minigames
- [ ] Minigame 1: **Ord→Bilde** (read word, choose correct emoji from 3) — available from Bronze
- [ ] Minigame 2: **Bilde→Ord** (see emoji, choose correct word from 3) — available from Bronze
- [ ] Minigame 3: **Fyll inn** (complete the sentence, choose from 3 words) — unlocks at Silver
- [ ] Minigame 4: **Skriv ordet** (hear/see word, type it yourself) — unlocks at Gold
  - ÆØÅ custom on-screen buttons for all devices
  - `visualViewport` API for iOS keyboard handling (viewport shrinks when keyboard opens)
- [ ] Minigame 5: **Ordrekkefølge** (build sentence from shuffled word tiles) — unlocks at Platinum
- [ ] Minigame 6: **Les og forstå** (read paragraph → pick 1 of 3: «Hva handlet dette om?») — unlocks at Diamond
- [ ] Minigame 7: **Sett tegnet** (choose correct punctuation . ? ! for a sentence) — unlocks at Silver
  - Always 3 choices (. ? !)
  - Show `teachingNote` after each answer (correct or wrong) — teaches the rule

### Phase 5 — Profile & Progression
- [ ] Profile page: avatar editor, XP bar, league badge, streak, crown count, badges
- [ ] Avatar cosmetic system: DiceBear options (eyes/eyebrows/mouth/glasses) + 13 color choices (grouped: 5 skin tones + 8 fun colors)
- [ ] Unlockable cosmetics: CSS layer around avatar card — league backgrounds, Champion+ frame, crown icon on Crown Win
- [ ] Crown Win icon display: shown on profile until end of current session (not 24h — it's a per-win highlight; permanent badge earned after first Crown Win)
- [ ] Loot box animation: 3-click (shake, shake, explode). Framer Motion. Duplicates → XP.
- [ ] Comeback-bonus splash: full-screen Framer Motion, +25% XP, Zustand only, voided on reload

### Phase 6 — Friends
- [ ] Add friend by exact username search
- [ ] Friend request + approval flow (pending → accepted; can block)
- [ ] Friends list with league badge and XP rank
- [ ] Friendship linked to UUID — username changes transparent to friends

### Phase 7 — Admin & Season
- [ ] Admin page (gated by `ADMIN_USER_ID` env var):
  - User list: username, XP, league, last active, is_banned toggle
  - Season reset: set end date, trigger reset (archives current league as «Season X» badge), no email shown
  - Season countdown shown subtly to all players
- [ ] Delete account: Edge Function with service-role key (never in frontend)

### Phase 8 — Polish & Deploy
- [ ] Mobile-first CSS polish (iPad/iPhone Safari — large tap targets, readable font for 7-year-olds)
- [ ] Splash screen: monthly WebP (`public/splash/month.webp`), min 2 sec, prefetch auth+profile in background
- [ ] Accessibility: min 44×44px tap targets, high contrast text
- [ ] Cloudflare Pages production deploy + custom domain
- [ ] Supabase production project: enable RLS on all tables, verify Edge Functions
- [ ] Test Google + Microsoft OAuth with real accounts (incl. school Microsoft tenant)
- [ ] Smoke test on real iPhone + iPad in Safari

---

## DB Schema Sketch

> **Decisions locked in**: XP is client-computed (accepted for non-competitive game). Bonuses are multiplicative. `questions_total` = original round length only. Auto-difficulty removed — only self-report + league floor. `receiver_id` used in friends table.

```sql
-- profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  last_rename_at timestamptz,
  avatar_config jsonb default '{}',       -- DiceBear params
  total_xp int default 0,
  total_correct_answers int default 0,    -- cumulative; mod 15 triggers difficulty self-report
  today_xp int default 0,                 -- running XP total for current Oslo date (no cap)
  today_date date default current_date,   -- resets today_xp when Oslo date changes
  max_xp_in_day int default 0,            -- all-time best single day (drives daily-record achievements)
  streak_days int default 0,
  last_active_date date,                  -- date of last completed round
  difficulty_level int default 2,         -- 1-10; starts at 2; changed only by self-report + league floor
  crown_wins int default 0,
  streak_shield_days    int not null default 0,  -- total days of streak protection banked (max 7; see loot table)
  -- streak_shields (old binary field) replaced by streak_shield_days
  skip_tokens int default 0,              -- max 5; 1 per round; voids perfect/crown win eligibility
  rounds_since_loot int default 0,        -- resets to 0 via claim_loot(); first loot after round 1
  is_banned bool default false,
  created_at timestamptz default now()
);

-- xp_log (one row per completed round)
create table xp_log (
  id bigserial primary key,
  user_id uuid references profiles,
  xp_earned int not null,
  questions_total int not null,      -- original round length (no retry attempts counted)
  questions_correct int not null,
  crown_round bool default false,    -- crown was active this round
  crown_win bool default false,      -- perfect round WITH crown (server enforces: used_skip → crown_win = false)
  used_skip bool default false,
  difficulty_level int not null,     -- difficulty at time of round
  created_at timestamptz default now()
);

-- friends (requires approval)
create table friends (
  id bigserial primary key,
  requester_id uuid references profiles,
  receiver_id uuid references profiles,  -- consistent naming (not addressee_id)
  status text default 'pending',          -- pending | accepted | blocked
  created_at timestamptz default now(),
  unique (requester_id, receiver_id)
);

-- unlocks (cosmetics earned)
create table unlocks (
  user_id uuid references profiles,
  item_key text,
  unlocked_at timestamptz default now(),
  primary key (user_id, item_key)
);

-- earned_achievements
create table earned_achievements (
  user_id uuid references profiles,
  achievement_key text,
  earned_at timestamptz default now(),
  primary key (user_id, achievement_key)
);
```

## RLS Policies (must be in first migration)

Enable RLS on all tables. Rules:

```sql
-- profiles: own row only (admin bypasses via service role key in Edge Functions)
alter table profiles enable row level security;
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- profiles: public read for username + league (for friend search)
create policy "profiles_select_public" on profiles for select
  using (true);  -- username/league must be non-sensitive; email NEVER stored in profiles

-- xp_log: own rows only
alter table xp_log enable row level security;
create policy "xp_log_select_own" on xp_log for select using (auth.uid() = user_id);
create policy "xp_log_insert_own" on xp_log for insert with check (auth.uid() = user_id);

-- friends: rows where user is requester or receiver
alter table friends enable row level security;
create policy "friends_select_involved" on friends for select
  using (auth.uid() = requester_id or auth.uid() = receiver_id);
create policy "friends_insert_own" on friends for insert with check (auth.uid() = requester_id);
create policy "friends_update_involved" on friends for update
  using (auth.uid() = requester_id or auth.uid() = receiver_id);

-- unlocks: own rows only
alter table unlocks enable row level security;
create policy "unlocks_select_own" on unlocks for select using (auth.uid() = user_id);
create policy "unlocks_insert_own" on unlocks for insert with check (auth.uid() = user_id);

-- earned_achievements: own rows only
alter table earned_achievements enable row level security;
create policy "achievements_select_own" on earned_achievements for select using (auth.uid() = user_id);
create policy "achievements_insert_own" on earned_achievements for insert with check (auth.uid() = user_id);
```

> **Admin access**: Uses Supabase service-role key (never in frontend). Admin Edge Functions bypass RLS entirely. The `ADMIN_USER_ID` env var is checked inside Edge Functions for authorization.

## XP Thresholds (kumulativ, 15% compound)

| Liga | Kumulativ XP |
|------|-------------|
| Bronze | 0 |
| Silver | 1 000 |
| Gold | 2 150 |
| Platinum | 3 472 |
| Diamond | 4 993 |
| Elite | 6 742 |
| Champion | 8 753 |
| Unreal | 11 066 |

Base: 10 XP per riktig svar. Ingen daglig tak.
