-- Wideweave — Daily training log.
-- Run this in your Supabase project's SQL editor. It's idempotent.
--
-- This is the platform's most evidence-backed feature, even though
-- it's the least app-like. Smith et al. (2010) — aerobic exercise
-- improves executive function (d ≈ 0.10 per session/week, with
-- larger effects in older adults). Walker (2017) and the Harvard
-- sleep-and-cognition literature — sleep deprivation drops cognitive
-- test performance by 5-15 points acutely. Cepeda et al. (2006) —
-- spaced repetition improves long-term retention (d ≈ 0.85, the most
-- reliable within-domain learning effect in the literature).
-- Ritchie et al. (2018) — years of cognitively demanding activity,
-- especially reading, are the largest modifiable correlate of
-- adult crystallised IQ.
--
-- The training log stores one row per user per day with the four
-- self-reported evidence-backed lifestyle interventions. The
-- platform uses this data only to (a) show the user their own
-- trajectory and (b) compute correlations in the research panel.
-- It does NOT export this data anywhere. It does NOT sell it. It
-- does NOT use it for any kind of recommendation engine.

create table if not exists public.training_log (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  log_date date not null,
  -- Sleep: did the user report 7+ hours of sleep the night before?
  -- Stored as a boolean to keep the schema simple. The platform
  -- could later expand to a 1-5 self-report.
  slept_well boolean,
  -- Aerobic exercise: did the user report 20+ minutes of moderate
  -- aerobic exercise today? The Smith 2010 threshold for the
  -- meta-analytic effect is 30+ minutes per session, but the
  -- threshold of 20+ is what 4-3-2-1 protocols use.
  exercised boolean,
  -- Pages read: integer. Crystallised IQ is the most reliably
  -- improvable part of intelligence, and reading widely is the
  -- single best-documented way to do it.
  pages_read int default 0,
  -- One-line journal entry. The literature on expressive writing
  -- (Pennebaker 1997) shows small but reliable effects on
  -- cognitive performance after stressful events; the platform
  -- does not claim this is a measurable effect, but the field
  -- for the user is the field for the lab.
  journal text,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists training_log_user_date_idx
  on public.training_log (user_id, log_date desc);

alter table public.training_log enable row level security;

drop policy if exists "training_log_read_own" on public.training_log;
create policy "training_log_read_own" on public.training_log
  for select using (user_id = auth.uid());

drop policy if exists "training_log_insert_own" on public.training_log;
create policy "training_log_insert_own" on public.training_log
  for insert with check (user_id = auth.uid());

drop policy if exists "training_log_update_own" on public.training_log;
create policy "training_log_update_own" on public.training_log
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
