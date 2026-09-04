-- NorsNite economy rebalance
-- Run in Supabase SQL Editor against both norsnite-dev and norsnite-prod.
--
-- Context: players were clearing Bronze → Gold in roughly one hour, and the
-- whole ladder to Unreal in 3-4 hours of play. Three causes were found:
--
--   1. src/lib/xp.ts held league thresholds at exactly HALF the values in
--      PLAN.md and in update_difficulty() below (Silver 500 vs 1000, and so on
--      for all seven tiers). The client table has been restored to the PLAN
--      values, so client and server now agree. No SQL change needed for that —
--      the thresholds here were always the correct ones.
--
--   2. Loot XP was flat 50-240 regardless of league, i.e. 2-3 whole Bronze
--      rounds from one chest, making loot ~35% of all income in Bronze. Loot is
--      now scaled off round base XP client-side (LootBox.tsx). No SQL change.
--
--   3. The rarity upgrade table produced episk 41% / mytisk 26% /
--      legendarisk 11%. Retuned client-side. No SQL change.
--
-- The only server-side change is the difficulty floor, below.
--
-- NOTE: claim_loot() in 001_initial.sql is dead code — loot has been rolled and
-- applied client-side in LootBox.tsx for some time and nothing calls the RPC.
-- It is left in place rather than dropped, in case loot is ever moved back to
-- the server. Its loot table does NOT reflect the live game.

-- ============================================================
-- RPC: update_difficulty  (replaces the version in 001_initial.sql)
--
-- Difficulty floors are deliberately decoupled from leagues. Previously the
-- floor tracked league 1:1 (Bronze=1 … Unreal=8), which gated difficulty behind
-- XP grinding rather than demonstrated ability — and with the corrected (2x
-- higher) thresholds a player would have been pinned at a low difficulty for
-- weeks even if the words were far too easy for them.
--
-- The 😴/😊/😤 self-report is now the real driver. These floors exist only so a
-- player who always answers "for lett" can't sit at level 1 forever.
--
-- Floors: Bronze 1 | Silver 1 | Gold 2 | Platinum 2 | Diamond 3 | Elite 4 |
--         Champion 5 | Unreal 6
--
-- Must stay in sync with LEAGUE_DIFFICULTY_FLOOR and LEAGUE_THRESHOLDS in
-- src/lib/xp.ts.
-- ============================================================
create or replace function public.update_difficulty(p_user_id uuid, p_delta int)
returns int
language plpgsql
security definer
as $$
declare
  v_current  int;
  v_xp       int;
  v_floor    int;
  v_new      int;
begin
  -- Clamp to exactly ±1 (prevent client from sending large deltas)
  p_delta := case when p_delta > 0 then 1 else -1 end;

  select total_xp, difficulty_level into v_xp, v_current
  from public.profiles where id = p_user_id;

  -- League XP thresholds → difficulty floor
  v_floor := case
    when v_xp >= 11066 then 6   -- Unreal
    when v_xp >= 8753  then 5   -- Champion
    when v_xp >= 6742  then 4   -- Elite
    when v_xp >= 4993  then 3   -- Diamond
    when v_xp >= 3472  then 2   -- Platinum
    when v_xp >= 2150  then 2   -- Gold
    when v_xp >= 1000  then 1   -- Silver
    else 1                      -- Bronze
  end;

  v_new := greatest(v_floor, least(10, v_current + p_delta));
  update public.profiles set difficulty_level = v_new where id = p_user_id;
  return v_new;
end;
$$;
