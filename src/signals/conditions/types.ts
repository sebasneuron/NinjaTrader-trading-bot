/**
 * Signal condition types and contracts.
 */

import type { Bar } from '../../core/types';

export interface ConditionContext {
  instrument: string;
  bars: Bar[];
  currentBar: Bar;
  params: Record<string, number | string | boolean>;
}

export interface SignalCondition {
  name: string;
  params: Record<string, { default: number | string | boolean; min?: number; max?: number }>;
  evaluate(ctx: ConditionContext): boolean | { long: boolean; short: boolean };
}
