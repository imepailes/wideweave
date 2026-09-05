// Spaced Recall — per-item scheduling for RAT and CJ.
//
// The model is intentionally simple. Each item has a half-life (in days).
// When the half-life elapses since the last recall, the item is "due".
// A correct recall multiplies the half-life by 1.7; a wrong recall halves it.
// This is the Anki-style boost/halve, not full Ebisu — but it's defensible
// and the platform can switch to full Ebisu later without changing the
// table schema.
//
// Items are scoped per (user, module, item_key). New items are created the
// first time a user sees them. Reviews update the half-life and append a
// row to module_reviews for later analysis.

import { supabase, SUPABASE_CONFIGURED } from './supabase';
import { getAuthState } from './auth';

export type RecallModule = 'rat' | 'cj';

export type ModuleItem = {
  id: number;
  user_id: string;
  module: RecallModule;
  item_key: string;
  display: string;
  payload: Record<string, unknown>;
  half_life: number;
  last_recall: string | null;
  last_score: number | null;
  recall_count: number;
  created_at: string;
};

export type DueItem = {
  item_id: number;
  user_id: string;
  module: RecallModule;
  item_key: string;
  display: string;
  payload: Record<string, unknown>;
  half_life: number;
  last_recall: string | null;
  retention_estimate: number;
};

export const RECALL_MODULES: RecallModule[] = ['rat', 'cj'];

// Boost factor for a correct recall. 1.7 is the SM-2/Anki default.
const CORRECT_BOOST = 1.7;
// Decay factor for a wrong recall. 0.5 is "halve".
const WRONG_DECAY = 0.5;
// Floor on half-life (in days). 0.1 = ~2.4 hours.
const HALF_LIFE_FLOOR = 0.1;
// Ceiling on half-life (in days). ~2 years.
const HALF_LIFE_CEILING = 730;

function clampHalfLife(days: number): number {
  if (!isFinite(days) || days < HALF_LIFE_FLOOR) return HALF_LIFE_FLOOR;
  if (days > HALF_LIFE_CEILING) return HALF_LIFE_CEILING;
  return days;
}

export async function getOrCreateItem(
  module: RecallModule,
  itemKey: string,
  display: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; item?: ModuleItem; error?: string }> {
  if (!SUPABASE_CONFIGURED) return { ok: false, error: 'Supabase not configured' };
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return { ok: false, error: 'Not signed in' };
  // Upsert by (user_id, module, item_key). On conflict, do nothing — we
  // don't want to overwrite a user's existing review state.
  const { data, error } = await supabase
    .from('module_items')
    .upsert(
      {
        user_id: auth.user.id,
        module,
        item_key: itemKey,
        display,
        payload
      },
      { onConflict: 'user_id,module,item_key', ignoreDuplicates: true }
    )
    .select('id, user_id, module, item_key, display, payload, half_life, last_recall, last_score, recall_count, created_at')
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, item: data as ModuleItem };
}

// Get items due for review RIGHT NOW. An item is due when:
// - it's never been reviewed (last_recall is null), OR
// - now() - last_recall >= half_life
// We order by oldest first (most overdue = top of queue).
export async function loadDueItems(module: RecallModule, limit = 10): Promise<DueItem[]> {
  if (!SUPABASE_CONFIGURED) return [];
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return [];
  // The items_due view does most of the work. The retention_estimate is
  // informational; the queue is sorted by last_recall nulls first, then
  // by last_recall ascending.
  const { data, error } = await supabase
    .from('items_due')
    .select('item_id, user_id, module, item_key, display, payload, half_life, last_recall, retention_estimate')
    .eq('user_id', auth.user.id)
    .eq('module', module)
    .order('last_recall', { ascending: true, nullsFirst: true })
    .limit(limit);
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[recall] load due failed', error);
    return [];
  }
  return (data ?? []) as DueItem[];
}

// Load a specific item by its key.
export async function loadItemByKey(module: RecallModule, itemKey: string): Promise<ModuleItem | null> {
  if (!SUPABASE_CONFIGURED) return null;
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return null;
  const { data, error } = await supabase
    .from('module_items')
    .select('id, user_id, module, item_key, display, payload, half_life, last_recall, last_score, recall_count, created_at')
    .eq('user_id', auth.user.id)
    .eq('module', module)
    .eq('item_key', itemKey)
    .maybeSingle();
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[recall] load item failed', error);
    return null;
  }
  return (data ?? null) as ModuleItem | null;
}

// Record a review: update the item's half-life + last_recall, append a
// row to module_reviews. Returns the new half-life.
export async function recordReview(
  itemId: number,
  correct: boolean,
  sessionId?: number,
  rtMs?: number
): Promise<{ ok: boolean; newHalfLife?: number; error?: string }> {
  if (!SUPABASE_CONFIGURED) return { ok: false, error: 'Supabase not configured' };
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return { ok: false, error: 'Not signed in' };
  // Read the current half-life first.
  const { data: existing, error: readErr } = await supabase
    .from('module_items')
    .select('half_life, recall_count')
    .eq('id', itemId)
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (readErr || !existing) return { ok: false, error: readErr?.message ?? 'item not found' };
  const oldHalf = Number(existing.half_life);
  const newHalf = clampHalfLife(correct ? oldHalf * CORRECT_BOOST : oldHalf * WRONG_DECAY);
  const now = new Date().toISOString();
  // Update the item.
  const { error: updErr } = await supabase
    .from('module_items')
    .update({
      half_life: newHalf,
      last_recall: now,
      last_score: correct ? 1 : 0,
      recall_count: Number(existing.recall_count) + 1
    })
    .eq('id', itemId)
    .eq('user_id', auth.user.id);
  if (updErr) return { ok: false, error: updErr.message };
  // Append the review row.
  await supabase.from('module_reviews').insert({
    user_id: auth.user.id,
    item_id: itemId,
    correct,
    rt_ms: rtMs ?? null,
    session_id: sessionId ?? null,
    half_life_before: oldHalf,
    half_life_after: newHalf
  });
  return { ok: true, newHalfLife: newHalf };
}

// Get summary stats for the recall queue (per module).
export async function loadRecallSummary(): Promise<Record<RecallModule, { due: number; total: number; avgHalfLife: number }>> {
  const empty: Record<RecallModule, { due: number; total: number; avgHalfLife: number }> = {
    rat: { due: 0, total: 0, avgHalfLife: 0 },
    cj: { due: 0, total: 0, avgHalfLife: 0 }
  };
  if (!SUPABASE_CONFIGURED) return empty;
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return empty;
  const { data, error } = await supabase
    .from('module_items')
    .select('module, half_life, last_recall, recall_count')
    .eq('user_id', auth.user.id);
  if (error) return empty;
  const rows = (data ?? []) as { module: RecallModule; half_life: number; last_recall: string | null; recall_count: number }[];
  for (const r of rows) {
    const out = empty[r.module];
    out.total++;
    out.avgHalfLife = (out.avgHalfLife * (out.total - 1) + r.half_life) / out.total;
    if (r.last_recall === null) {
      out.due++;
    } else {
      const dueAt = new Date(r.last_recall).getTime() + r.half_life * 24 * 3600 * 1000;
      if (Date.now() >= dueAt) out.due++;
    }
  }
  return empty;
}
