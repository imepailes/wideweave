// Battery task orchestrator. The transfer battery is a sequence of
// 4 short tasks. Each task is a self-contained renderable: it gets
// a host element, renders its UI, runs its trials, and calls
// onComplete() with a typed score.

export type TaskScore = {
  raw: number;             // primary score (see taskDistributions.unit)
  trials: number;          // trial count
  correct?: number;        // for accuracy-based tasks
  time_s: number;          // duration in seconds
  // Optional trial-level detail for the trajectory view
  detail?: Record<string, unknown>;
};

export type TaskHandle = {
  id: string;
  name: string;
  // Mount the task UI into the host element. The returned function
  // is called when the task is done and should tear down listeners.
  mount: (host: HTMLElement, onComplete: (s: TaskScore) => void, onAbort?: () => void) => () => void;
};

// The four tasks in the v1 battery. Order matters — Stroop first
// (warm-up of attentional control), Reading Span last (most
// cognitively demanding).
export const BATTERY_TASKS: TaskHandle[] = [
  // populated by the index file
];
