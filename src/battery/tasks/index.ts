// Transfer battery — task registry. Order matters: Stroop is the
// attentional warm-up, Reading Span is the most demanding, so it
// goes last.

import type { TaskHandle } from '../taskRunner';
import { stroopTask } from './stroop';
import { inspectionTimeTask } from './inspectionTime';
import { mentalRotationTask } from './mentalRotation';
import { readingSpanTask } from './readingSpan';

export const BATTERY_TASKS: TaskHandle[] = [
  stroopTask,
  inspectionTimeTask,
  mentalRotationTask,
  readingSpanTask
];
