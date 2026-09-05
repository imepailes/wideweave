// User settings — currently just age band. Stored in localStorage.
// Each battery run also records the age_band at the time of the run,
// so the server has the data it needs for cohort comparisons.

import type { AgeBand } from './batteryDistributions';

const STORAGE_KEY = 'wideweave.age_band';

export function getStoredAgeBand(): AgeBand | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return null;
    if (['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].includes(v)) {
      return v as AgeBand;
    }
  } catch { /* noop */ }
  return null;
}

export function setStoredAgeBand(band: AgeBand | null): void {
  try {
    if (band) localStorage.setItem(STORAGE_KEY, band);
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* noop */ }
}
