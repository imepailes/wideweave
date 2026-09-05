-- Wideweave — Stroop module migration.
-- Run this in your Supabase project's SQL editor (Dashboard → SQL Editor → New query).
-- It's idempotent: every CREATE uses IF NOT EXISTS so re-running is safe.
--
-- Adds the 'stroop' module to the sessions check, and a stroop_personal_best
-- view that tracks each user's best (lowest) mean-incongruent RT.

-- ============================================================================
-- EXTEND the sessions module check
-- ============================================================================

alter table public.sessions
  drop constraint if exists sessions_module_check;

alter table public.sessions
  add constraint sessions_module_check
  check (module in ('dat', 'rat', 'cj', 'nb', 'stroop'));

-- ============================================================================
-- VIEW: per-user stroop personal best
-- ============================================================================

create or replace view public.stroop_personal_best as
  select
    user_id,
    min(score)::real as best_incongruent_rt_ms,
    count(*) as sessions,
    max(created_at) as last_session
  from public.sessions
  where module = 'stroop'
  group by user_id;

grant select on public.stroop_personal_best to anon, authenticated;
