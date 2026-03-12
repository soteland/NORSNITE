# NorsNite 🎮📖

Et Fortnite-inspirert norsk lesespill for barn 7–12 år. Målet er at barn skal **ha lyst til** å øve på lesing ved å pakke det inn i en engasjerende og visuelt spennende spillopplevelse.

> **Språk: Kun norsk.** Spillet er bygget for norsktalende barn og skal aldri oversettes. All UI-tekst, instruksjoner, spørsmål og tilbakemeldinger er på norsk. Ingen i18n, ingen lokaliseringslag.

---

## What it is

- **Norsk lesetrening** — ikke fremmedspråklæring, men flyt og forståelse for morsmålsbrukere
- **Web app** that works great in Safari on iPad and iPhone
- **Login** via Google (gmail.com) or Microsoft (outlook.com) — no passwords to remember
- **Friends system** — see your friends' league tier and XP
- **Solo game loop** — complete rounds of minigames, earn XP, climb leagues, unlock cosmetics

---

## Minigames

| # | Name | Description | Unlocks at |
|---|------|-------------|------------|
| 1 | **Ord→Bilde** | Les et ord, velg riktig emoji fra 3 valg | Bronze (start) |
| 2 | **Bilde→Ord** | Se en emoji, velg riktig ord fra 3 valg | Bronze (start) |
| 3 | **Fyll inn** | «Jeg vil ha en ___» → velg riktig ord fra 3 | Silver |
| 4 | **Skriv ordet** | Hør/se et ord — skriv det selv (med ÆØÅ-knapper) | Gold |
| 5 | **Ordrekkefølge** | Bygg en setning fra stokket om ord-brikker | Platinum |
| 6 | **Les og forstå** | Les et avsnitt → «Hva handlet dette om?» — velg 1 av 3 | Diamond |

**Bilder og emojis:**
- Alle minigames bruker **emojis** (Unicode) — definert i kode, tekst↔bilde alltid korrekt, ingen filer, fungerer perfekt på iOS
- Bakgrunner og avatar-kosmetikk bruker **CSS gradients + SVG** — ingen bildefiler, rask på mobil

Difficulty scales automatically: short, simple words early → longer words + complex sentences at higher levels.

---

## XP & League System (Fortnite-style)

```
Bronze → Silver → Gold → Platinum → Diamond → Elite → Champion → Unreal
```

- Each correct answer earns XP (scaled by difficulty and minigame type)
- **Victory Royale** screen on round win
- **Crown Win** — 10% chance at round start to play with a crown; you must get **all answers correct** (perfect round) to earn the +50% XP bonus. No penalty for a non-perfect crown round. No limit on crown wins — count shown on profile (👑 ×12)
- League badge shown on avatar and friend list

---

## Cosmetics (Unlockables)

- **Outfits** for the 2D avatar (unlocked at milestone levels)
- **Backgrounds** for the game screen (unlocked at league promotions)
- More can be added by editing content files in code — no admin panel needed

---

## Content

All questions/words/sentences live in `/src/content/` as TypeScript files.  
Adding new content = editing those files and deploying. No CMS or admin UI needed.

```
/src/content/
  words.ts        ← word bank with difficulty tags
  sentences.ts    ← fill-in-the-blank sentences
  images.ts       ← emoji/image mappings for Bildekort
```

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend framework | **React + TypeScript** | Kjent for utvikler, stort økosystem |
| Build tool | **Vite** | Rask, enkel Cloudflare-deploy |
| Routing | **TanStack Router** | Type-safe, integrert med TanStack Query |
| Server state | **TanStack Query** | Caching, loading states, Supabase-integrasjon |
| Client state | **Zustand** | Spilltilstand, aktiv runde, crown-status |
| Forms | **React Hook Form + Zod** | Validering av brukernavn-endring m.m. |
| UI-komponenter | **shadcn/ui + Tailwind CSS** | Full kontroll, copy-paste komponenter |
| Animasjoner | **Framer Motion** | Victory Royale, XP-bar, league promotions |
| Database + Auth | **Supabase** | Postgres, RLS, Google + Microsoft OAuth |
| Hosting | **Cloudflare Pages** | Gratis, rask, kobler til GitHub |

---

## Project Structure (planned)

```
norsGame/
├── src/
│   ├── routes/
│   │   ├── index.tsx             ← Home / lobby
│   │   ├── game/index.tsx        ← Active game round
│   │   ├── profile/index.tsx     ← Avatar, XP, badges
│   │   ├── friends/index.tsx     ← Friends list + league ranks
│   │   └── admin/index.tsx       ← Admin panel (owner only)
│   ├── content/
│   │   ├── words.ts              ← word bank (240+ words, 12 categories)
│   │   ├── sentences.ts          ← fill-in and word-order sentences
│   │   └── comprehension.ts      ← read-and-understand paragraphs
│   ├── lib/
│   │   ├── xp.ts                 ← XP/league calculations
│   │   ├── minigames/            ← One file per minigame type
│   │   ├── avatar.ts             ← Cosmetic unlock logic
│   │   ├── username/             ← Norwegian word lists for username gen
│   │   └── supabase.ts           ← Supabase client
│   └── store/
│       └── game.ts               ← Zustand: active round, crown, comeback bonus
├── supabase/
│   └── migrations/               ← DB schema (run against dev + prod)
├── .github/
│   └── workflows/
│       └── keep-alive.yml        ← Weekly Supabase ping
├── public/
│   └── splash/                   ← Monthly splash images (january.webp, etc.)
├── README.md
└── PLAN.md
```

---

## Getting Started (dev)

```bash
cd norsGame
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

Supabase project URL and anon key go in `.env.local`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ADMIN_USER_ID=...
```
