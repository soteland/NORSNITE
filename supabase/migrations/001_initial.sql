-- NorsNite initial schema
-- Run in Supabase SQL Editor against both norsnite-dev and norsnite-prod
--
-- Key decisions:
--   - XP is client-computed (accepted for non-competitive kids game)
--   - XP bonuses are multiplicative: base × 1.25 (perfect) × 1.50 (crown win) × 1.25 (comeback)
--   - questions_total = original round length only (re-queued retries not counted)
--   - Auto-difficulty removed — changes only via self-report (😴/😊/😤) + league floor bump
--   - Streak shields are n-day: streak_shield_days = total days of protection banked (max 7)
--   - Loot box rolls server-side in claim_loot(); rewards XP (50-100) or shield days
--   - used_skip = true → server forces crown_win = false

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id                    uuid references auth.users on delete cascade primary key,
  username              text unique not null,
  last_rename_at        timestamptz,
  avatar_config         jsonb not null default '{}'::jsonb,
  total_xp              int not null default 0,
  total_correct_answers int not null default 0,  -- mod 15 triggers difficulty self-report
  today_xp              int not null default 0,
  today_date            date not null default current_date,
  max_xp_in_day         int not null default 0,
  streak_days           int not null default 0,
  last_active_date      date,
  difficulty_level      int not null default 2,  -- 1-10; self-report only; league floor on promotion
  crown_wins            int not null default 0,
  streak_shield_days    int not null default 0,  -- total days of streak protection banked (max 7)
  skip_tokens           int not null default 0,  -- max 5 banked
  rounds_since_loot     int not null default 0,  -- resets via claim_loot(); first loot after round 1
  is_banned             bool not null default false,
  created_at            timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_own_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_own_update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_public_select" on public.profiles for select using (true);

-- ============================================================
-- XP LOG  (one row per completed round)
-- ============================================================
create table if not exists public.xp_log (
  id                bigserial primary key,
  user_id           uuid references public.profiles(id) on delete cascade not null,
  xp_earned         int not null,
  questions_total   int not null,           -- original round length (no retry attempts)
  questions_correct int not null,
  crown_round       bool not null default false,
  crown_win         bool not null default false,  -- server enforces: used_skip → crown_win = false
  used_skip         bool not null default false,
  difficulty_level  int not null,
  created_at        timestamptz not null default now()
);

alter table public.xp_log enable row level security;
create policy "xp_log_own_select" on public.xp_log for select using (auth.uid() = user_id);
create policy "xp_log_own_insert" on public.xp_log for insert with check (auth.uid() = user_id);

-- ============================================================
-- FRIENDS  (requires approval)
-- ============================================================
create table if not exists public.friends (
  id            bigserial primary key,
  requester_id  uuid references public.profiles(id) on delete cascade not null,
  receiver_id   uuid references public.profiles(id) on delete cascade not null,
  status        text not null default 'pending',  -- pending | accepted | blocked
  created_at    timestamptz not null default now(),
  unique(requester_id, receiver_id)
);

alter table public.friends enable row level security;
create policy "friends_involved" on public.friends for all
  using (auth.uid() = requester_id or auth.uid() = receiver_id);

-- ============================================================
-- UNLOCKS  (cosmetics earned)
-- ============================================================
create table if not exists public.unlocks (
  user_id     uuid references public.profiles(id) on delete cascade not null,
  item_key    text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

alter table public.unlocks enable row level security;
create policy "unlocks_own" on public.unlocks for all using (auth.uid() = user_id);

-- ============================================================
-- EARNED ACHIEVEMENTS
-- ============================================================
create table if not exists public.earned_achievements (
  user_id         uuid references public.profiles(id) on delete cascade not null,
  achievement_key text not null,
  earned_at       timestamptz not null default now(),
  primary key (user_id, achievement_key)
);

alter table public.earned_achievements enable row level security;
create policy "achievements_own" on public.earned_achievements for all using (auth.uid() = user_id);

-- ============================================================
-- RPC: start_round
-- Resets today_xp if Oslo date changed. Streak/loot handled in award_xp.
-- ============================================================
create or replace function public.start_round(p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_today   date := (now() at time zone 'Europe/Oslo')::date;
  v_profile public.profiles;
begin
  update public.profiles
  set
    today_xp   = case when today_date < v_today then 0 else today_xp end,
    today_date = v_today
  where id = p_user_id;

  select * into v_profile from public.profiles where id = p_user_id;
  return row_to_json(v_profile);
end;
$$;

-- ============================================================
-- RPC: award_xp
-- Called once per completed round.
-- Enforces: used_skip → crown_win = false.
-- Streak shield logic: days_missed = (today - last_active_date) - 1.
--   If days_missed > 0 AND streak >= 3 AND shield_days >= days_missed
--   → consume exactly days_missed shield days, streak preserved.
--   Otherwise → streak resets to 1.
-- ============================================================
create or replace function public.award_xp(
  p_user_id           uuid,
  p_xp                int,
  p_questions_total   int,
  p_questions_correct int,
  p_crown_round       bool,
  p_crown_win         bool,
  p_used_skip         bool,
  p_difficulty_level  int
)
returns json
language plpgsql
security definer
as $$
declare
  v_today      date := (now() at time zone 'Europe/Oslo')::date;
  v_crown_win  bool := p_crown_win and not p_used_skip;
  v_profile    public.profiles;
begin
  -- Log the round
  insert into public.xp_log (
    user_id, xp_earned, questions_total, questions_correct,
    crown_round, crown_win, used_skip, difficulty_level
  ) values (
    p_user_id, p_xp, p_questions_total, p_questions_correct,
    p_crown_round, v_crown_win, p_used_skip, p_difficulty_level
  );

  -- Update profile atomically
  -- Note: in SET clauses, column refs use OLD values (evaluated simultaneously).
  -- We compute days_missed inline as (v_today - last_active_date - 1), min 0.
  update public.profiles
  set
    total_xp              = total_xp + p_xp,
    total_correct_answers = total_correct_answers + p_questions_correct,
    today_xp              = today_xp + p_xp,
    max_xp_in_day         = greatest(max_xp_in_day, today_xp + p_xp),
    crown_wins            = crown_wins + case when v_crown_win then 1 else 0 end,
    rounds_since_loot     = rounds_since_loot + 1,

    -- Consume shield days equal to days missed (if coverage is sufficient)
    streak_shield_days = case
      when last_active_date is null
        then streak_shield_days
      when last_active_date = v_today
        then streak_shield_days  -- already played today, no change
      when (v_today - last_active_date - 1) > 0
       and streak_days >= 3
       and streak_shield_days >= (v_today - last_active_date - 1)
        then streak_shield_days - (v_today - last_active_date - 1)
      else streak_shield_days
    end,

    streak_days = case
      when last_active_date is null
        then 1                                                     -- first ever round
      when last_active_date = v_today
        then streak_days                                           -- already played today
      when last_active_date = v_today - 1
        then streak_days + 1                                       -- consecutive day
      when (v_today - last_active_date - 1) > 0
       and streak_days >= 3
       and streak_shield_days >= (v_today - last_active_date - 1)
        then streak_days + 1                                       -- shield covers all missed days
      else 1                                                       -- streak broken
    end,

    last_active_date = v_today

  where id = p_user_id;

  select * into v_profile from public.profiles where id = p_user_id;
  return row_to_json(v_profile);
end;
$$;

-- ============================================================
-- RPC: claim_loot
-- Rolls the loot box server-side and awards the reward.
-- Returns the result so the client can drive the animation.
--
-- Loot table:
--   60% common    → XP (random 50–100)
--   10% uncommon  → skip token
--   18% uncommon  → 1-day streak shield
--    6% rare      → 2-day streak shield
--    4% epic      → 3-day streak shield
--    2% legendary → 5-day streak shield
--
-- streak_shield_days capped at 7. rounds_since_loot reset to 0.
-- ============================================================
create or replace function public.claim_loot(p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_roll         float    := random();
  v_today        date     := (now() at time zone 'Europe/Oslo')::date;
  v_type         text;
  v_rarity       text;
  v_xp           int      := 0;
  v_shield_days  int      := 0;
  v_skip_tokens  int      := 0;
begin
  -- Determine reward
  if v_roll < 0.02 then
    v_type := 'shield'; v_shield_days := 5; v_rarity := 'legendary';
  elsif v_roll < 0.06 then
    v_type := 'shield'; v_shield_days := 3; v_rarity := 'epic';
  elsif v_roll < 0.12 then
    v_type := 'shield'; v_shield_days := 2; v_rarity := 'rare';
  elsif v_roll < 0.30 then
    v_type := 'shield'; v_shield_days := 1; v_rarity := 'uncommon';
  elsif v_roll < 0.40 then
    v_type := 'skip'; v_skip_tokens := 1; v_rarity := 'uncommon';
  else
    v_type := 'xp'; v_xp := 50 + floor(random() * 51)::int; v_rarity := 'common';
  end if;

  -- Apply reward
  if v_type = 'xp' then
    update public.profiles set
      rounds_since_loot = 0,
      total_xp          = total_xp + v_xp,
      today_xp          = case when today_date < v_today then v_xp else today_xp + v_xp end,
      today_date        = v_today,
      max_xp_in_day     = greatest(max_xp_in_day,
                            case when today_date < v_today then v_xp else today_xp + v_xp end)
    where id = p_user_id;
  elsif v_type = 'skip' then
    update public.profiles set
      rounds_since_loot = 0,
      skip_tokens       = least(5, skip_tokens + v_skip_tokens)
    where id = p_user_id;
  else
    update public.profiles set
      rounds_since_loot  = 0,
      streak_shield_days = least(7, streak_shield_days + v_shield_days)
    where id = p_user_id;
  end if;

  return json_build_object(
    'type',         v_type,
    'rarity',       v_rarity,
    'xp',           v_xp,
    'shield_days',  v_shield_days,
    'skip_tokens',  v_skip_tokens
  );
end;
$$;

-- ============================================================
-- RPC: update_difficulty
-- Called after self-report (😴 = +1, 😤 = -1). Never below league floor.
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

  -- League XP thresholds → floor
  v_floor := case
    when v_xp >= 11066 then 8   -- Unreal
    when v_xp >= 8753  then 7   -- Champion
    when v_xp >= 6742  then 6   -- Elite
    when v_xp >= 4993  then 5   -- Diamond
    when v_xp >= 3472  then 4   -- Platinum
    when v_xp >= 2150  then 3   -- Gold
    when v_xp >= 1000  then 2   -- Silver
    else 1                      -- Bronze
  end;

  v_new := greatest(v_floor, least(10, v_current + p_delta));
  update public.profiles set difficulty_level = v_new where id = p_user_id;
  return v_new;
end;
$$;
