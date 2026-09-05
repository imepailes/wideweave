// Battery task runner — orchestrates a single 4-task transfer battery.
// Each task is a self-contained component: takes a root element and
// an onComplete callback, runs for N trials or N ms, returns a score.

export type TaskScore = {
  // Normalized value: lower-is-better tasks use a positive number where
  // smaller is better; higher-is-better tasks use a positive number where
  // larger is better. Direction is determined by the task baseline.
  raw: number;
  // Number of trials completed (sanity check)
  trials: number;
  // Time in seconds
  time_s: number;
  // Trial-level data for the trajectory view (optional)
  trials_detail?: Record<string, unknown>;
};

export type TaskContext = {
  root: HTMLElement;        // where the task renders
  onProgress?: (n: number, total: number) => void;
  onComplete: (score: TaskScore) => void;
  onAbort?: () => void;
};

export type TaskDef = {
  id: string;
  name: string;
  // Total expected trial count (used for progress display)
  totalTrials: number;
  run: (ctx: TaskContext) => void | Promise<void>;
};

// Pre-built task order for the v1 transfer battery.
export const BATTERY_ORDER: TaskDef[] = []; // populated by index.ts
