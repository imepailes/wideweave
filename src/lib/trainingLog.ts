// Training log — the most evidence-backed feature of the platform,
// and the least app-like. Self-reported daily values for the four
// non-app interventions that the literature has actually shown
// move the needle on cognition: sleep, aerobic exercise, reading,
// and (since the user is here) a brief journal entry.
//
// Citations:
//   Smith et al. (2010) — aerobic exercise and executive function
//     meta-analysis (29 RCTs, n=2049). Aerobic exercise produces
//     reliable, small-to-moderate improvements in executive
//     function, attention, processing speed, and working memory.
//     This is the largest modifiable cognitive booster in the
//     literature.
//   Walker (2017) — "Why We Sleep" review. Sleep deprivation
//     drops cognitive test performance by 5-15 IQ points acutely;
//     chronic poor sleep has cumulative effects.
//   Cepeda et al. (2006) — distributed practice meta-analysis
//     (d ≈ 0.85 for the spacing effect on long-term retention).
//     Spaced practice is the most reliable within-domain learning
//     effect in the lab.
//   Ritchie et al. (2018) — years of cognitively demanding
//     activity, especially reading, are the largest modifiable
//     correlate of adult crystallised IQ.
//   Pennebaker (1997) — expressive writing has small but reliable
//     effects on cognitive performance after stressful events.

import { supabase, SUPABASE_CONFIGURED } from './supabase';
import { getAuthState } from './auth';

export type TrainingLogRow = {
  log_date: string; // 'YYYY-MM-DD'
  slept_well: boolean | null;
  exercised: boolean | null;
  pages_read: number | null;
  journal: string | null;
};

export type TrainingLogEntry = {
  logDate: string;
  sleptWell: boolean;
  exercised: boolean;
  pagesRead: number;
  journal: string;
};

function toEntry(row: TrainingLogRow): TrainingLogEntry {
  return {
    logDate: row.log_date,
    sleptWell: row.slept_well === true,
    exercised: row.exercised === true,
    pagesRead: row.pages_read ?? 0,
    journal: row.journal ?? ''
  };
}

function isMissingTable(err: { code?: string; message?: string; status?: number } | null): boolean {
  if (!err) return false;
  if (err.code === '404' || err.code === 'PGRST116') return true;
  if (err.status === 404) return true;
  if (err.message && /Could not find the table|relation.*does not exist|404/i.test(err.message)) return true;
  return false;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function loadTodayLog(): Promise<{ entry: TrainingLogEntry | null; needsMigration: boolean }> {
  if (!SUPABASE_CONFIGURED) return { entry: null, needsMigration: false };
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return { entry: null, needsMigration: false };
  const today = todayISO();
  const { data, error } = await supabase
    .from('training_log')
    .select('log_date, slept_well, exercised, pages_read, journal')
    .eq('user_id', auth.user.id)
    .eq('log_date', today)
    .maybeSingle();
  if (error) {
    if (isMissingTable(error as { code?: string; message?: string; status?: number } | null)) {
      return { entry: null, needsMigration: true };
    }
    return { entry: null, needsMigration: false };
  }
  if (!data) return { entry: null, needsMigration: false };
  return { entry: toEntry(data as TrainingLogRow), needsMigration: false };
}

export async function loadRecentLog(days = 30): Promise<{ rows: TrainingLogEntry[]; needsMigration: boolean }> {
  if (!SUPABASE_CONFIGURED) return { rows: [], needsMigration: false };
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return { rows: [], needsMigration: false };
  const { data, error } = await supabase
    .from('training_log')
    .select('log_date, slept_well, exercised, pages_read, journal')
    .eq('user_id', auth.user.id)
    .order('log_date', { ascending: false })
    .limit(days);
  if (error) {
    if (isMissingTable(error as { code?: string; message?: string; status?: number } | null)) {
      return { rows: [], needsMigration: true };
    }
    return { rows: [], needsMigration: false };
  }
  return { rows: (data as TrainingLogRow[] | null ?? []).map(toEntry), needsMigration: false };
}

export async function upsertTodayLog(entry: Omit<TrainingLogEntry, 'logDate'>): Promise<{ ok: boolean; needsMigration?: boolean; error?: string }> {
  if (!SUPABASE_CONFIGURED) return { ok: false, error: 'Supabase not configured' };
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return { ok: false, error: 'Not signed in' };
  const row = {
    user_id: auth.user.id,
    log_date: todayISO(),
    slept_well: entry.sleptWell,
    exercised: entry.exercised,
    pages_read: Math.max(0, Math.floor(entry.pagesRead)),
    journal: entry.journal.slice(0, 500)
  };
  const { error } = await supabase.from('training_log').upsert(row, { onConflict: 'user_id,log_date' });
  if (error) {
    if (isMissingTable(error as { code?: string; message?: string; status?: number } | null)) {
      return { ok: false, needsMigration: true };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
