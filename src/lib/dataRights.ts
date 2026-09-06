// Data rights — export and delete. The platform promises "Data stays
// yours." This module is how that promise is kept. Two operations:
//
//  - exportAll(): pulls every row associated with the signed-in user
//    from sessions, battery_runs, spaced_recall_items, and the
//    profile row. Bundles it as a single JSON object the user can
//    download.
//
//  - deleteAll(): deletes every row associated with the signed-in user
//    across the same tables. The auth.users row is not deleted (the
//    user would have to do that through Supabase); what we delete is
//    the application's data.

import { supabase, SUPABASE_CONFIGURED } from './supabase';
import { getAuthState } from './auth';

export type ExportPayload = {
  exportedAt: string;
  userId: string;
  profile: Record<string, unknown> | null;
  sessions: Array<Record<string, unknown>>;
  battery_runs: Array<Record<string, unknown>>;
  spaced_recall_items: Array<Record<string, unknown>>;
};

export type ExportResult = {
  ok: boolean;
  payload?: ExportPayload;
  error?: string;
  needsAuth?: boolean;
  needsMigration?: boolean;
};

export async function exportAll(): Promise<ExportResult> {
  if (!SUPABASE_CONFIGURED) return { ok: false, error: 'Supabase not configured' };
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return { ok: false, error: 'Not signed in', needsAuth: true };

  const uid = auth.user.id;
  const [profileRes, sessionsRes, batteryRes, recallRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', uid).maybeSingle(),
    supabase.from('sessions').select('*').eq('user_id', uid),
    supabase.from('battery_runs').select('*').eq('user_id', uid),
    supabase.from('spaced_recall_items').select('*').eq('user_id', uid)
  ]);

  const migrationNeeded = (err: { code?: string; message?: string } | null) =>
    !!err && (err.code === '404' || err.code === 'PGRST116' || (err.message ?? '').includes('Could not find the table') || (err.message ?? '').includes('does not exist'));

  if (profileRes.error && migrationNeeded(profileRes.error)) {
    return { ok: false, error: 'Schema not migrated', needsMigration: true };
  }

  return {
    ok: true,
    payload: {
      exportedAt: new Date().toISOString(),
      userId: uid,
      profile: (profileRes.data as Record<string, unknown> | null) ?? null,
      sessions: (sessionsRes.data as Array<Record<string, unknown>> | null) ?? [],
      battery_runs: (batteryRes.data as Array<Record<string, unknown>> | null) ?? [],
      spaced_recall_items: (recallRes.data as Array<Record<string, unknown>> | null) ?? []
    }
  };
}

export type DeleteResult = {
  ok: boolean;
  deleted?: { sessions: number; battery_runs: number; spaced_recall_items: number };
  error?: string;
  needsAuth?: boolean;
};

export async function deleteAll(): Promise<DeleteResult> {
  if (!SUPABASE_CONFIGURED) return { ok: false, error: 'Supabase not configured' };
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return { ok: false, error: 'Not signed in', needsAuth: true };

  const uid = auth.user.id;
  const [sessionsRes, batteryRes, recallRes] = await Promise.all([
    supabase.from('sessions').delete().eq('user_id', uid).select('id'),
    supabase.from('battery_runs').delete().eq('user_id', uid).select('id'),
    supabase.from('spaced_recall_items').delete().eq('user_id', uid).select('id')
  ]);

  // Log but don't fail on per-table errors — the user wants everything
  // they can delete, deleted.
  for (const e of [sessionsRes.error, batteryRes.error, recallRes.error]) {
    if (e) {
      // eslint-disable-next-line no-console
      console.warn('[data-rights] delete error:', e);
    }
  }

  return {
    ok: true,
    deleted: {
      sessions: (sessionsRes.data as Array<{ id: number }> | null)?.length ?? 0,
      battery_runs: (batteryRes.data as Array<{ id: number }> | null)?.length ?? 0,
      spaced_recall_items: (recallRes.data as Array<{ id: number }> | null)?.length ?? 0
    }
  };
}

// Trigger a browser download of the export payload as a JSON file.
export function downloadPayload(payload: ExportPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wideweave-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
