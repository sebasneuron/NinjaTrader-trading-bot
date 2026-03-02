/**
 * Moving average crossover condition.
 */

import type { ConditionContext, SignalCondition } from './types';

function sma(values: number[], period: number): number {
  if (values.length < period) return NaN;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export const movingAverageCrossover: SignalCondition = {
  name: 'MA Crossover',
  params: {
    fastPeriod: { default: 10, min: 1, max: 200 },
    slowPeriod: { default: 30, min: 1, max: 200 },
  },
  evaluate(ctx: ConditionContext): { long: boolean; short: boolean } {
    const fastPeriod = Number(ctx.params.fastPeriod ?? 10);
    const slowPeriod = Number(ctx.params.slowPeriod ?? 30);
    const closes = ctx.bars.map((b) => b.close);
    if (closes.length < slowPeriod + 1) return { long: false, short: false };
    const fastPrev = sma(closes.slice(0, -1), fastPeriod);
    const slowPrev = sma(closes.slice(0, -1), slowPeriod);
    const fastCurr = sma(closes, fastPeriod);
    const slowCurr = sma(closes, slowPeriod);
    const long = fastPrev <= slowPrev && fastCurr > slowCurr;
    const short = fastPrev >= slowPrev && fastCurr < slowCurr;
    return { long, short };
  },
};
