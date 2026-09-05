-- Wideweave — transfer battery schema.
-- One row per completed battery. The battery is 4 short tasks
-- (Stroop, Inspection Time, Mental Rotation, Reading Span) with
-- scores, age band, and computed z-scores / percentiles.

create table if not exists public.battery_runs (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  age_band text check (age_band in ('18-24', '25-34', '35-44', '45-54', '55-64', '65+')),
  started_at timestamptz not null,
  finished_at timestamptz not null,
  time_s int not null,
  scores jsonb not null,        -- {stroop: {raw, trials, correct, time_s, detail}, ...}
  zscores jsonb not null,       -- {stroop: -0.34, ...}
  percentiles jsonb not null,   -- {stroop: 37, ...}
  created_at timestamptz not null default now()
);

create index if not exists battery_runs_user_created_idx
  on public.battery_runs (user_id, created_at desc);

-- A "lab_stats" view that joins this with sessions. We add a
-- battery-specific row count for the hero.
create or replace view public.lab_stats as
  select
    (select count(distinct user_id) from public.sessions
       where created_at > now() - interval '90 days') as weavers,
    (select count(*) from public.sessions
       where created_at > now() - interval '90 days') as sessions_total,
    (select count(*) from public.sessions
       where created_at > now() - interval '24 hours') as sessions_today,
    (select count(*) from public.battery_runs
       where created_at > now() - interval '90 days') as battery_runs_total,
    (select count(distinct user_id) from public.battery_runs
       where created_at > now() - interval '90 days') as battery_weavers;

-- RLS
alter table public.battery_runs enable row level security;

drop policy if exists "battery_read_own" on public.battery_runs;
create policy "battery_read_own" on public.battery_runs
  for select using (user_id = auth.uid());

drop policy if exists "battery_insert_own" on public.battery_runs;
create policy "battery_insert_own" on public.battery_runs
  for insert with check (user_id = auth.uid());

-- Re-grant the updated lab_stats view
grant select on public.lab_stats to anon, authenticated;
