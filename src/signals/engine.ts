/**
 * Signal generation engine: runs conditions on bar data and emits signals.
 */

import type { Bar, Signal, Side } from '../core/types';
import { emit } from '../core/events';
import { logger } from '../core/logger';
import type { SignalCondition } from './conditions/types';

export interface SignalEngineConfig {
  instrument: string;
  conditions: SignalCondition[];
  params: Record<string, number | string | boolean>;
  maxSignalsPerBar?: number;
}

export class SignalEngine {
  private bars: Bar[] = [];
  private config: SignalEngineConfig;
  private lastSignalBarTime: Date | null = null;
  private signalsThisBar = 0;

  constructor(config: SignalEngineConfig) {
    this.config = { maxSignalsPerBar: 1, ...config };
  }

  pushBar(bar: Bar): void {
    if (bar.instrument !== this.config.instrument) return;
    this.bars.push(bar);
    this.signalsThisBar = 0;
  }

  evaluate(): Signal | null {
    if (this.bars.length < 2) return null;
    const currentBar = this.bars[this.bars.length - 1];
    const maxPerBar = this.config.maxSignalsPerBar ?? 1;
    if (this.signalsThisBar >= maxPerBar) return null;
    if (this.lastSignalBarTime?.getTime() === currentBar.time.getTime()) return null;

    const ctx = {
      instrument: this.config.instrument,
      bars: [...this.bars],
      currentBar,
      params: this.config.params,
    };

    for (const condition of this.config.conditions) {
      try {
        const result = condition.evaluate(ctx);
        if (typeof result === 'boolean') {
          if (result) {
            const side: Side = 'long';
            return this.emitSignal(side, currentBar, condition.name);
          }
        } else {
          if (result.long) return this.emitSignal('long', currentBar, condition.name);
          if (result.short) return this.emitSignal('short', currentBar, condition.name);
        }
      } catch (e) {
        logger.warn('Condition evaluation failed', { condition: condition.name, error: String(e) });
      }
    }
    return null;
  }

  private emitSignal(side: Side, bar: Bar, reason: string): Signal | null {
    const signal: Signal = {
      id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      side,
      instrument: this.config.instrument,
      price: bar.close,
      reason,
      timestamp: new Date(),
    };
    this.lastSignalBarTime = bar.time;
    this.signalsThisBar++;
    emit({ type: 'signal', payload: signal });
    logger.info('Signal generated', { signal });
    return signal;
  }

  reset(): void {
    this.bars = [];
    this.lastSignalBarTime = null;
    this.signalsThisBar = 0;
  }
}
