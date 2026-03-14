# NorsNite 🎮📖

Et Fortnite-inspirert norsk lesespill for barn 7–12 år. Målet er at barn skal **ha lyst til** å øve på lesing ved å pakke det inn i en engasjerende og visuelt spennende spillopplevelse.

*Hva gjør en pappa som kan kode, men som ikke er så flink lærer? Dette!*

> **Språk: Kun norsk.** Spillet er bygget for norsktalende barn og jeg har ingen umiddelbare planer om å oversette det. All UI-tekst, instruksjoner, spørsmål og tilbakemeldinger er på norsk. Ingen i18n, ingen lokaliseringslag.

---

## Hva det er

- **Norsk lesetrening** — ikke fremmedspråklæring, men flyt og forståelse for morsmålsbrukere
- **Web app** som fungerer bra i Safari på iPad og iPhone
- **TBD: Innlogging** via Google (gmail.com) eller Microsoft (outlook.com) — ingen passord å huske
- **Venner-system** — se dine venners liga-nivå og XP
- **Solo spill-loop** — fullfør runder med minispill, tjen XP, klatre i ligaer, lås opp kosmetikk

---

## Minispill

| # | Navn | Beskrivelse | Låses opp på |
|---|------|-------------|--------------|
| 1 | **Ord→Bilde** | Les et ord, velg riktig emoji fra 3 valg | Bronse (start) |
| 2 | **Bilde→Ord** | Se en emoji, velg riktig ord fra 3 valg | Bronse (start) |
| 3 | **Fyll inn** | «Jeg vil ha en ___» → velg riktig ord fra 3 | Sølv |
| 4 | **Skriv ordet** | Hør/se et ord — skriv det selv (med ÆØÅ-knapper) | Gull |
| 5 | **Ordrekkefølge** | Bygg en setning fra stokket om ord-brikker | Platina |
| 6 | **Les og forstå** | Les et avsnitt → «Hva handlet dette om?» — velg 1 av 3 | Diamant |

**Bilder og emojis:**
- Alle minispill bruker **emojis** (Unicode) — definert i kode, tekst↔bilde alltid korrekt, ingen filer, fungerer perfekt på iOS
- Bakgrunner og avatar-kosmetikk bruker **CSS gradients + SVG** — ingen bildefiler, rask på mobil

Vanskelighetsgrad justeres automatisk: korte, enkle ord tidlig → lengre ord + komplekse setninger på høyere nivåer.

---

## XP- og Liga-system (Fortnite-stil)

```
Bronze → Silver → Gold → Platinum → Diamond → Elite → Champion → Unreal
```

- Hver riktig svar gir XP (justert etter vanskelighetsgrad og minispilltype)
- **Victory Royale** skjerm ved rundegevinst
- **Kroneseier** — 10% sjanse ved rundestart til å spille med krone; du må få **alle svarene riktige** (perfekt runde) for å tjene +50% XP-bonus. Ingen straff for en ikke-perfekt kronerunde. Ingen begrensning på kroneseire — antall vises på profil (👑 ×12)
- Liga-badge vist på avatar og venneliste

---

## Kosmetikk (Låsbare elementer)

- **Kostymer** for 2D-avatar (låses opp på milepælsnivåer)
- **Bakgrunner** for spillskjermen (låses opp ved ligapromoteringer)
- Mer kan legges til ved å redigere innholdsfilene i koden — ingen admin-panel nødvendig

---

## Innhold

Alle spørsmål/ord/setninger ligger i `/src/content/` som TypeScript-filer.  
Legge til nytt innhold = redigere disse filene og distribuere. Ingen CMS eller admin-grensesnitt nødvendig.

---

## Teknologi-stack

| Lag | Valg | Årsak |
|-------|--------|--------|
| Frontend rammeverk | **React + TypeScript** | Kjent for utvikler, stort økosystem |
| Byggverktøy | **Vite** | Rask, enkel Cloudflare-distribusjon |
| Ruting | **TanStack Router** | Type-sikker, integrert med TanStack Query |
| Serverstatus | **TanStack Query** | Hurtigbuffer, lastetilstander, Supabase-integrasjon |
| Klientstatus | **Zustand** | Spilltilstand, aktiv runde, krone-status |
| Skjemaer | **React Hook Form + Zod** | Validering av brukernavn-endring m.m. |
| UI-komponenter | **shadcn/ui + Tailwind CSS** | Full kontroll, copy-paste komponenter |
| Animasjoner | **Framer Motion** | Victory Royale, XP-bar, liga promoteringer |
| Database + Auth | **Supabase** | Postgres, RLS, Google + Microsoft OAuth |
| Hosting | **Cloudflare Pages** | Gratis, rask, kobler til GitHub |

---

## Prosjektstruktur (planlagt)

```
norsGame/
├── src/
│   ├── routes/
│   │   ├── index.tsx             ← Hjem / lobby
│   │   ├── game/index.tsx        ← Aktiv spillrunde
│   │   ├── profile/index.tsx     ← Avatar, XP, merker
│   │   ├── friends/index.tsx     ← Venner liste + liga rangeringer
│   │   └── admin/index.tsx       ← Admin panel (eier kun)
│   ├── content/
│   │   ├── words.ts              ← ordliste (240+ ord, 12 kategorier)
│   │   ├── sentences.ts          ← fyll-inn og ord-rekkefølge setninger
│   │   └── comprehension.ts      ← les-og-forstå avsnitt
│   ├── lib/
│   │   ├── xp.ts                 ← XP/liga beregninger
│   │   ├── minigames/            ← En fil per minispilltype
│   │   ├── avatar.ts             ← Kosmetisk opplåsingslogikk
│   │   ├── username/             ← Norske ordlister for brukernavn-generering
│   │   └── supabase.ts           ← Supabase-klient
│   └── store/
│       └── game.ts               ← Zustand: aktiv runde, krone, comeback bonus
├── supabase/
│   └── migrations/               ← DB-skjema (kjør mot dev + prod)
├── .github/
│   └── workflows/
│       └── keep-alive.yml        ← Ukentlig Supabase ping
├── public/
│   └── splash/                   ← Månedlige splash-bilder (january.webp, osv.)
├── README.md
└── PLAN.md
```

---

## Komme i gang (utvikling)

```bash
cd norsGame
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

Supabase prosjekt-URL og anon-nøkkel går i `.env.local`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ADMIN_USER_ID=...
```
