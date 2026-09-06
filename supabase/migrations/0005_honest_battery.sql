-- Wideweave — Honest battery comparison migration.
-- Run this in your Supabase project's SQL editor. It's idempotent.
--
-- The previous schema stored zscores and percentiles that were computed
-- against fabricated age-stratified means and SDs. This was a research
-- falsification: the published literature does not provide those exact
-- numbers at those age bands.
--
-- This migration replaces the zscores/percentiles columns with a
-- `comparisons` column that stores the honest directional result:
-- 'below', 'within', or 'above' the published range.

alter table public.battery_runs
  add column if not exists comparisons jsonb;

-- Drop the old columns if they exist (they were filled with fake z's).
alter table public.battery_runs
  drop column if exists zscores;

alter table public.battery_runs
  drop column if exists percentiles;
