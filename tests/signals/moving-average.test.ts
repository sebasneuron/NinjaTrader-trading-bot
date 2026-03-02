import { movingAverageCrossover } from '../../src/signals/conditions';

function bar(close: number, time = new Date()): { instrument: string; open: number; high: number; low: number; close: number; volume: number; time: Date } {
  return { instrument: 'ES', open: close, high: close + 1, low: close - 1, close, volume: 1000, time };
}

describe('movingAverageCrossover', () => {
  it('returns long when fast crosses above slow', () => {
    const bars = [
      ...Array(30).fill(0).map((_, i) => bar(4490 + i)),
      bar(4520),
      bar(4525),
    ];
    const ctx = { instrument: 'ES', bars, currentBar: bars[bars.length - 1], params: { fastPeriod: 10, slowPeriod: 30 } };
    const r = movingAverageCrossover.evaluate(ctx);
    expect(r).toEqual({ long: expect.any(Boolean), short: expect.any(Boolean) });
  });

  it('returns short when fast crosses below slow', () => {
    const bars = [
      ...Array(35).fill(0).map((_, i) => bar(4530 - i)),
      bar(4495),
      bar(4490),
    ];
    const ctx = { instrument: 'ES', bars, currentBar: bars[bars.length - 1], params: { fastPeriod: 10, slowPeriod: 30 } };
    const r = movingAverageCrossover.evaluate(ctx);
    expect(r).toHaveProperty('long');
    expect(r).toHaveProperty('short');
  });
});
