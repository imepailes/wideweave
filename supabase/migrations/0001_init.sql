-- Wideweave — initial schema.
-- Run this in your Supabase project's SQL editor (Dashboard → SQL Editor → New query).
-- It's idempotent: every CREATE uses IF NOT EXISTS so re-running is safe.

-- ============================================================================
-- TABLES
-- ============================================================================

-- users — one row per authenticated user. With Supabase auth, the user id
-- from auth.uid() is the primary key. We don't store anything sensitive
-- here beyond what auth already holds.
create table if not exists public.users (
  id uuid primary key,                    -- matches auth.users.id
  claimed_email text,                     -- filled in after email claim
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  cohort text not null default 'open'     -- free text cohort tag
);

-- sessions — one row per completed module session.
-- Score semantics differ per module:
--   dat: score = mean pairwise cosine distance (real, 0..1.4ish)
--   rat: score = solved / 6
--   cj:  score = mean efficiency (optimal_len / user_len, 0..1)
--   nb:  score = final n-back level reached; score_secondary = mean accuracy
create table if not exists public.sessions (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  module text not null check (module in ('dat', 'rat', 'cj', 'nb')),
  score real not null,
  score_secondary real,
  time_s int not null,
  trials int,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_module_idx
  on public.sessions (user_id, module, created_at desc);

create index if not exists sessions_module_created_idx
  on public.sessions (module, created_at desc);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Live cohort stats — 90-day rolling window. The hero reads this to
-- replace the fake "5,318 weavers" number with a real one.
create or replace view public.cohort_stats as
  select
    module,
    count(distinct user_id) as weavers,
    count(*) as sessions_total,
    percentile_cont(0.5) within group (order by score) as median_score
  from public.sessions
  where created_at > now() - interval '90 days'
  group by module;

-- A single "lab health" row for the hero.
create or replace view public.lab_stats as
  select
    (select count(distinct user_id) from public.sessions
       where created_at > now() - interval '90 days') as weavers,
    (select count(*) from public.sessions
       where created_at > now() - interval '90 days') as sessions_total,
    (select count(*) from public.sessions
       where created_at > now() - interval '24 hours') as sessions_today;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.users enable row level security;
alter table public.sessions enable row level security;

-- Users can read their own row.
drop policy if exists "users_read_own" on public.users;
create policy "users_read_own" on public.users
  for select using (id = auth.uid());

-- Users can insert their own row (created on first session save).
drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own" on public.users
  for insert with check (id = auth.uid());

-- Users can update their own row (to set claimed_email/claimed_at later).
drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update using (id = auth.uid());

-- Users can read their own sessions.
drop policy if exists "sessions_read_own" on public.sessions;
create policy "sessions_read_own" on public.sessions
  for select using (user_id = auth.uid());

-- Users can insert their own sessions.
drop policy if exists "sessions_insert_own" on public.sessions;
create policy "sessions_insert_own" on public.sessions
  for insert with check (user_id = auth.uid());

-- Everyone can read cohort stats (it's aggregate, no PII).
drop policy if exists "cohort_stats_read" on public.sessions;
-- (no RLS on views; reading through the view is allowed if base table RLS
-- permits. Aggregate over a user's own data is fine; aggregate over all
-- users is also fine because we grant select on the view to anon and
-- authenticated. The view itself doesn't expose user_ids.)
grant select on public.cohort_stats to anon, authenticated;
grant select on public.lab_stats to anon, authenticated;

-- ============================================================================
-- TRIGGER: auto-create users row on first sign-in
-- ============================================================================
-- Supabase's auth.users table is created when a user signs in. We add a
-- row in public.users the first time they hit our app, so we always have
-- a row to reference from public.sessions.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
