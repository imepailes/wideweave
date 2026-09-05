-- Wideweave — Spaced Recall migration.
-- Run this in your Supabase project's SQL editor (Dashboard → SQL Editor → New query).
-- It's idempotent: every CREATE uses IF NOT EXISTS so re-running is safe.
--
-- Adds per-item tracking for the two modules that have items to recall
-- (RAT puzzle-answer mappings and CJ start-target pairs). DAT, N-back,
-- and Stroop are training tasks with no per-item recall surface and are
-- NOT included in this schema.

-- ============================================================================
-- TABLES
-- ============================================================================

-- module_items — one row per (user, module, item). The "item" is the
-- module-specific thing the user is trying to remember. For RAT, that's a
-- puzzle (e.g. "cottage / swiss / cake") and the answer ("cheese"). For
-- CJ, that's a (start, target) pair (e.g. "Berlin → Munich").
create table if not exists public.module_items (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  module text not null check (module in ('rat', 'cj')),
  item_key text not null,                 -- module-specific stable id
  display text not null,                  -- human-readable form
  payload jsonb not null default '{}'::jsonb,  -- module-specific data
  half_life real not null default 4,      -- days; first review ~4 days after first see
  last_recall timestamptz,                -- null = never reviewed
  last_score real,                        -- 0..1; proportion correct on last review
  recall_count int not null default 0,    -- how many times reviewed
  created_at timestamptz not null default now(),
  unique (user_id, module, item_key)
);

create index if not exists module_items_user_module_due_idx
  on public.module_items (user_id, module, last_recall nulls first);

-- module_reviews — one row per review attempt. We keep all of them for
-- later analysis (forgetting curves, item-difficulty statistics).
create table if not exists public.module_reviews (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  item_id bigint not null references public.module_items(id) on delete cascade,
  reviewed_at timestamptz not null default now(),
  correct boolean not null,
  rt_ms int,                              -- optional, for future use
  session_id bigint references public.sessions(id) on delete set null,
  half_life_before real not null,
  half_life_after real not null
);

create index if not exists module_reviews_item_idx
  on public.module_reviews (item_id, reviewed_at desc);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- items_due — what's due for review RIGHT NOW, per user, per module.
-- A new (never-reviewed) item is due immediately so the user always
-- has something to drill. After a review, an item is due again after
-- its half-life elapses.
create or replace view public.items_due as
  select
    i.id as item_id,
    i.user_id,
    i.module,
    i.item_key,
    i.display,
    i.payload,
    i.half_life,
    i.last_recall,
    case
      when i.last_recall is null then 1.0
      else greatest(0, 1.0 - extract(epoch from (now() - i.last_recall)) / extract(epoch from (i.half_life * interval '1 day')))
    end as retention_estimate
  from public.module_items i;

-- review_stats — per-item rollup. The lab stats view stays as-is.
create or replace view public.review_stats as
  select
    user_id,
    module,
    count(*) as total_items,
    count(*) filter (where last_recall is null) as unseen_items,
    count(*) filter (where last_recall is not null) as reviewed_items,
    avg(recall_count)::real as avg_reviews_per_item
  from public.module_items
  group by user_id, module;

grant select on public.items_due to anon, authenticated;
grant select on public.review_stats to anon, authenticated;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.module_items enable row level security;
alter table public.module_reviews enable row level security;

drop policy if exists "items_read_own" on public.module_items;
create policy "items_read_own" on public.module_items
  for select using (user_id = auth.uid());

drop policy if exists "items_insert_own" on public.module_items;
create policy "items_insert_own" on public.module_items
  for insert with check (user_id = auth.uid());

drop policy if exists "items_update_own" on public.module_items;
create policy "items_update_own" on public.module_items
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "reviews_read_own" on public.module_reviews;
create policy "reviews_read_own" on public.module_reviews
  for select using (user_id = auth.uid());

drop policy if exists "reviews_insert_own" on public.module_reviews;
create policy "reviews_insert_own" on public.module_reviews
  for insert with check (user_id = auth.uid());
