// Sessions — save completed module sessions, load per-user history.
// The score semantics differ per module; the caller passes a typed
// payload and we map it to a generic row.

import { supabase, SUPABASE_CONFIGURED } from './supabase';
import { getAuthState } from './auth';

export type Module = 'dat' | 'rat' | 'cj' | 'nb' | 'stroop';

export type SessionPayload =
  | { module: 'dat'; score: number; time_s: number; detail: { words: string[] } }
  | { module: 'rat'; score: number; time_s: number; trials: number; detail: { solved: number; revealed: number; skipped: number; words: string[]; guesses: string[] } }
  | { module: 'cj'; score: number; time_s: number; trials: number; detail: { pairs: { start: string; target: string; userLen: number; optimalLen: number; reached: boolean }[] } }
  | { module: 'nb'; score: number; score_secondary: number; time_s: number; trials: number; detail: { finalN: number; posAcc: number; audAcc: number; trialAcc: number } }
  | { module: 'stroop'; score: number; score_secondary: number; time_s: number; trials: number; detail: { per_trial: { word: string; color: string; congruent: boolean; correct: boolean; rt: number }[]; mean_congruent_ms: number; mean_incongruent_ms: number; stroop_effect_ms: number; incongruent_acc: number; congruent_acc: number; difficulty: number } };

export type SessionRow = {
  id: number;
  module: Module;
  score: number;
  score_secondary: number | null;
  time_s: number;
  trials: number | null;
  detail: Record<string, unknown>;
  created_at: string;
};

export type CohortStat = {
  module: Module;
  weavers: number;
  sessions_total: number;
  median_score: number;
};

let lastSaveWarnAt = 0;
function saveSkippedNotice(reason: string): void {
  // Throttle to once per 5s so we don't spam the console.
  const now = Date.now();
  if (now - lastSaveWarnAt < 5000) return;
  lastSaveWarnAt = now;
  // eslint-disable-next-line no-console
  console.info(`[sessions] save skipped — ${reason}`);
}

export async function saveSession(payload: SessionPayload): Promise<{ ok: boolean; id?: number; error?: string }> {
  if (!SUPABASE_CONFIGURED) {
    saveSkippedNotice('Supabase not configured');
    return { ok: false, error: 'Supabase not configured' };
  }
  const auth = getAuthState();
  if (auth.status !== 'signed-in') {
    saveSkippedNotice('not signed in');
    return { ok: false, error: 'Not signed in' };
  }
  const row = {
    user_id: auth.user.id,
    module: payload.module,
    score: payload.score,
    score_secondary: 'score_secondary' in payload ? payload.score_secondary : null,
    time_s: payload.time_s,
    trials: 'trials' in payload ? payload.trials : null,
    detail: payload.detail
  };
  const { data, error } = await supabase.from('sessions').insert(row).select('id').single();
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[sessions] save failed', error);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: (data as { id: number } | null)?.id };
}

export async function loadMyHistory(module: Module, limit = 30): Promise<SessionRow[]> {
  if (!SUPABASE_CONFIGURED) return [];
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return [];
  const { data, error } = await supabase
    .from('sessions')
    .select('id, module, score, score_secondary, time_s, trials, detail, created_at')
    .eq('user_id', auth.user.id)
    .eq('module', module)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[sessions] load failed', error);
    return [];
  }
  return (data ?? []) as SessionRow[];
}

export async function loadMyLatestPerModule(): Promise<Partial<Record<Module, SessionRow>>> {
  if (!SUPABASE_CONFIGURED) return {};
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return {};
  // Pull the last 50 sessions, group client-side by module, keep newest.
  const { data, error } = await supabase
    .from('sessions')
    .select('id, module, score, score_secondary, time_s, trials, detail, created_at')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return {};
  const out: Partial<Record<Module, SessionRow>> = {};
  for (const r of (data ?? []) as SessionRow[]) {
    if (!out[r.module]) out[r.module] = r;
  }
  return out;
}

export async function loadCohortStats(): Promise<{ weavers: number; sessions_total: number; byModule: Record<Module, CohortStat> }> {
  if (!SUPABASE_CONFIGURED) return { weavers: 0, sessions_total: 0, byModule: { dat: emptyStat('dat'), rat: emptyStat('rat'), cj: emptyStat('cj'), nb: emptyStat('nb'), stroop: emptyStat('stroop') } };
  const { data, error } = await supabase
    .from('cohort_stats')
    .select('module, weavers, sessions_total, median_score');
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[cohort] load failed', error);
    return { weavers: 0, sessions_total: 0, byModule: { dat: emptyStat('dat'), rat: emptyStat('rat'), cj: emptyStat('cj'), nb: emptyStat('nb'), stroop: emptyStat('stroop') } };
  }
  const byModule: Record<Module, CohortStat> = { dat: emptyStat('dat'), rat: emptyStat('rat'), cj: emptyStat('cj'), nb: emptyStat('nb'), stroop: emptyStat('stroop') };
  let totalWeavers = 0;
  let totalSessions = 0;
  for (const row of (data ?? []) as CohortStat[]) {
    byModule[row.module] = row;
    totalWeavers = Math.max(totalWeavers, row.weavers);
    totalSessions += row.sessions_total;
  }
  return { weavers: totalWeavers, sessions_total: totalSessions, byModule };
}

function emptyStat(module: Module): CohortStat {
  return { module, weavers: 0, sessions_total: 0, median_score: 0 };
}
