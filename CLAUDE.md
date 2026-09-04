# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**NorsNite** — a Fortnite-themed Norwegian reading-practice game for kids aged 7–12. React 19 + TypeScript + Vite SPA on top of Supabase (Postgres + Auth + RLS + Edge Functions), deployed to GitHub Pages at `norsnite.soteland.no`.

The author built this to gamify his own kids' Norwegian vocabulary practice — **the design goal is dopamine-driven daily engagement**, not assessment or competitive integrity. When weighing a tradeoff, favour "does this make a 7–12 year old want to play one more round" over correctness, anti-cheat, or measurement rigour. It is in **perpetual beta**; there is no launch date and no "before launch" cleanup deadline.

**All user-facing text is Norwegian (bokmål).** UI labels, questions, feedback, error messages, achievement names — everything the player sees. Code identifiers, comments, and commit messages are English. There is no i18n layer and no plan for one; write Norwegian strings inline.

## Commands

```bash
npm run dev       # Vite dev server (vite-plugin-checker runs tsc in-band, so type errors surface in the browser overlay)
npm run build     # tsc -b && vite build
npm run lint      # eslint .
npm run preview   # serve dist/
```

There is **no test framework** in this project — no vitest/jest, no test files. Verify changes by running `npm run dev` and playing through the affected flow. `/dev` (dev-build only, route-guarded on `import.meta.env.DEV`) is the manual test harness: it renders every question type at any difficulty, the loot box, and every achievement badge without needing a live round.

Env: copy `.env.example` → `.env.local`. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_USER_ID` are required (`src/lib/supabase/client.ts` throws at import time without the first two). Path alias `@/` → `src/`.

## Architecture

### Round lifecycle — the core loop

A round is the central unit of the game. `src/pages/game/GamePage.tsx` orchestrates it as a `Phase` state machine (`loading → playing → loot? → result`):

1. **`start_round(p_user_id)` RPC** — server resets `today_xp` if the Oslo-timezone date rolled over, returns the fresh profile row. Never compute daily rollover client-side (clock-gameable).
2. **`buildRound(difficulty, totalXp)`** (`src/lib/roundController.ts`) — derives league from XP, looks up round length, filters question types to those unlocked at that league, then pulls N distinct questions from the content layer.
3. **Answering** — correct → speak "Riktig!", advance. Wrong → flash red, speak the correct answer, then **re-queue the question at the end of the queue** (learning, not testing). Only answers at `qIndex < originalCount` count toward score, so retries never earn XP or preserve a perfect round.
4. **`calculateXp()`** (`src/lib/xp.ts`) — multiplicative bonuses: `base × 1.25 (perfect) × 1.50 (crown win) × 1.25 (comeback)`, plus flat base XP for a used skip token.
5. **`award_xp(...)` RPC** — writes one `xp_log` row and updates the profile atomically (XP, streak, shield consumption, crown count, `rounds_since_loot`). The server re-enforces `used_skip → crown_win = false`. If the RPC fails the client falls back to a local XP estimate for display only.
6. **Achievements** — `useAchievements().checkAndGrant(profile)` re-derives stats by querying `xp_log` (round count, perfect count, consecutive-perfect streak) plus friend count, diffs against already-earned keys, and inserts the new ones.
7. **Loot box** — triggers on first-ever round, then every 5 rounds (`rounds_since_loot >= 5`). Rolled **entirely client-side** in `LootBox.tsx`: a 3-tap chest where taps 1–2 roll rarity upgrades (`rollUpgrade`) and tap 3 rolls the reward (`rollReward`), then writes `total_xp` / `skip_tokens` / `streak_shield_days` with a direct read-then-write `profiles` update.

⚠️ The `claim_loot()` RPC in `001_initial.sql` is **dead code** — nothing calls it, and its loot table (60% common, 2% legendary, 50–100 XP) no longer describes the game. `LootResult` in `client.ts` is likewise stale. Treat `LootBox.tsx` as the only source of truth for loot.

Trust boundary: XP amounts and loot rolls are computed client-side and written by the client (deliberate — non-competitive kids' game), while **date/streak arithmetic and difficulty floors are server-side** and should stay that way. Note this means loot is no longer a server-side balance lever.

### Progression model

`src/lib/xp.ts` is the single source for leagues: `LEAGUES` (Bronze → Unreal), `LEAGUE_THRESHOLDS` (cumulative XP), `LEAGUE_DIFFICULTY_FLOOR`, `ROUND_LENGTH`. `roundController.ts` owns `UNLOCK_AT`, which maps each league to the question types it unlocks — this is what gates minigames behind progression.

Difficulty (1–10, new players start at 2) changes **only** via player self-report (`DifficultyCheck.tsx`, triggered when `total_correct_answers` crosses a multiple of 15) and the league floor. There is no auto-adjustment from performance; don't add one without checking `PLAN.md`.

⚠️ **Known divergence:** the league XP thresholds in `src/lib/xp.ts` (Silver 500, Gold 1075, …) do **not** match the thresholds hardcoded in the `update_difficulty()` SQL function or `PLAN.md` (Silver 1000, Gold 2150, …). The client decides which league to display and which minigames to unlock; the server decides the difficulty floor. Changing thresholds means editing both places.

### Content layer

`src/content/` holds all question content as plain TypeScript arrays — no CMS, no admin editor. `types.ts` defines a discriminated union `Question` over ten `QuestionType` variants; every question carries an `id` and a `difficulty` (1–10).

`index.ts` is the façade: per-type `get*ForDifficulty()` selectors (all match `|q.difficulty - difficulty| <= 1`), `build*()` constructors for the word-pool types, and `pickRandomQuestion(difficulty, excludeIds, preferredTypes)` — the single entry point `buildRound` uses.

Adding a question type means touching: `types.ts` (interface + union + `QuestionType`), a content file, `index.ts` (selector + a branch in `pickRandomQuestion`), `roundController.ts` (`UNLOCK_AT` + `getCorrectAnswerText`), a component under `components/game/`, a case in `QuestionCard.tsx`, and the `TYPES` list in `DevPage.tsx`. The compiler catches most of these via the exhaustive switches.

Distractors for `word_to_image` / `image_to_word` are drawn from the **same category** as the target, and choice count scales with difficulty (3 choices at ≤4, 4 at ≥5).

### State

Three layers, deliberately separate:

- **TanStack Query** — server data (profile, friends, achievements). `retry: 1`, `staleTime: 30s`.
- **Zustand** (`src/lib/store/gameStore.ts`) — intentionally non-persisted round state. Note that `GamePage` keeps its own `useState` for the question queue/index/score and only uses the store for `comebackBonus` (which must survive a route change but *not* a reload — that ephemerality is the design: the comeback bonus expires if the player doesn't replay immediately). The rest of the store's surface is currently unused by `GamePage`.
- **`AuthContext`** (`src/lib/auth/AuthContext.tsx`) — Supabase session, subscribed via `onAuthStateChange`. Sessions are configured to never expire (`storageKey: 'norsnite-session'`) so kids don't get logged out.

### Routing

`src/routeTree.tsx` — one hand-written TanStack Router file, **not** file-based routing. Paths are Norwegian (`/logg-inn`, `/registrer`, `/spill`, `/venner/$userId`, `/ligaer`). Guards are `beforeLoad` helpers: `requireAuth` (redirects to `/logg-inn`) and `redirectIfLoggedIn`. Adding a page = add the import, a `createRoute`, and an entry in `rootRoute.addChildren([...])`.

Admin is gated client-side only, by comparing `auth.uid()` against `VITE_ADMIN_USER_ID`.

### Database

`supabase/migrations/*.sql` are applied **manually via the Supabase SQL editor** — there is no CLI migration pipeline, and the files carry no ordering enforcement. Run them against both the dev and prod projects.

Row types are hand-maintained in the `Database` type in `src/lib/supabase/client.ts` — there is no codegen, so schema changes require editing that type by hand to keep it in sync.

RLS is on for every table. `profiles` is publicly selectable (needed for friend search and league display); everything else is own-user, with one extra policy letting accepted friends read each other's achievements. Email is never exposed in any query or UI.

Account deletion goes through the `delete-account` Edge Function, which verifies the caller's JWT then uses the service-role key to `auth.admin.deleteUser` (cascades to `profiles` via FK).

### Audio, avatars, assets

`src/lib/speech.ts` wraps the Web Speech API (`nb-NO`, rate 0.9) plus a shared `AudioContext` for SFX — no audio files, no TTS service. iOS Safari workarounds are baked in and matter: `AudioContext` resumes on gesture, and `speakThen()` has a 3-second fallback timer because Safari sometimes never fires `onend`. **Speech defaults to muted**; SFX defaults on (`src/lib/useMute.ts`, localStorage-backed).

Avatars are DiceBear SVGs rendered at runtime (`@dicebear/collection` + `@dicebear/core`, **pinned at v8 — do not upgrade without checking the API**). `src/lib/avatar.ts` holds the option lists and `AvatarConfig`, which is stored as `profiles.avatar_config` jsonb.

Splash images are served from `public/splashscreen/<english-month>.webp`, chosen by current month. `src/images/` holds near-duplicate copies with Norwegian filenames plus a pile of stray `*:Zone.Identifier` WSL artifacts — the `public/` copies are the ones actually served.

Styling is Tailwind v4 (via `@tailwindcss/vite`, no config file) plus CSS custom properties for the dark theme and `.btn-*` component classes in `src/index.css`. Reference theme colors as `var(--accent)` etc., not hardcoded hex. Note that v4's spacing scale is generated on demand, so non-standard steps like `w-34` are valid (`calc(var(--spacing) * 34)`) — don't "fix" them.

### The mobile vertical budget

**The reference device is an iPhone 12: 390×844 CSS px, ~660px of usable height in Safari with toolbars showing** (~763px installed to the Home Screen). This is a hard constraint, not a preference — the game is played almost entirely on one.

- Always use `min-h-[100dvh]`, **never `min-h-screen`** (which is `100vh`, the *large* viewport on iOS, so centred content sits too low and form bottoms hide under the toolbar).
- Full-screen containers need `env(safe-area-inset-top)` / `-bottom` padding; `viewport-fit=cover` is set in `index.html`, so the notch and home indicator are yours to handle.
- `GamePage` spends ~189px on permanent chrome (top bar 71, progress 6, feedback reserve 88, question padding 24), leaving **~470px for the question**. Before adding anything to that column, check it against the budget — `WordToImage` at 4 choices and `ImageToWord` both used to overflow by >100px. The question area has `overflow-y-auto` as a backstop, but a kid scrolling mid-question loses sight of the ✓/✗ feedback banner at the top, so treat scrolling as a failure.
- Reserve fixed height only for what a given question type can actually show: the teaching-note slot is rendered only for `punctuation` questions, because reserving it on all ten cost the other nine 68px.
- Touch targets are 48px for anything a child taps repeatedly (letter tiles, word tiles). The global `button { min-height: 44px }` in `index.css` is Apple's adult *minimum*, not the target here.

### Deployment

`.github/workflows/deploy-pages.yml` builds and deploys to GitHub Pages on push to `main`, injecting the `VITE_*` values from repo secrets. `public/CNAME` sets the custom domain and `public/404.html` is a meta-refresh SPA fallback. `keep-alive.yml` pings Supabase weekly to keep the free-tier project from pausing. (`PLAN.md` and `.env.example` still mention Cloudflare Pages — GitHub Pages is what actually runs.)

## Notable current state

- **Cloudflare Turnstile is stubbed out, deliberately and temporarily.** `src/components/ui/TurnstileWidget.tsx` immediately calls `onSuccess('disabled')`; the auth pages still gate submission on `turnstileOk`, so the flow works unchanged. It was pulled because of unresolved friction with iOS family-controls devices. **The author wants it back on eventually — do not delete the stub's call sites or the `turnstileOk` gating.** Restoring it means putting back a real widget implementation and setting `VITE_TURNSTILE_SITE_KEY`; don't attempt the restore unless asked.
- **The dev-only loot cheat in `GamePage` is intentional and stays:** under `import.meta.env.DEV` the loot box shows with 50% probability regardless of `rounds_since_loot`. The "remove before launch" comment is stale — perpetual beta, no launch. Same for `/dev`.
- **Dead / stale code to be aware of** (don't "helpfully" wire these up without asking): `claim_loot()` SQL and the `LootResult` type (superseded by client-side loot), `rollComebackBonus()` in `xp.ts` (GamePage inlines `Math.random() < 0.25`), and most of `gameStore`'s round-state surface.
- `PLAN.md` (~700 lines) is the design document: decisions with rationale, XP tables, achievement definitions, phased implementation status. Consult it before changing progression, loot, or reward tuning — several values in it were later revised in code, so **code wins on conflicts**, but the reasoning there explains *why* a number was chosen.
- Loose `*.csv` files in the repo root and `*:Zone.Identifier` files throughout are untracked scratch/WSL artifacts, not part of the build.
