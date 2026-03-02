import * as confirmation from '../../src/trade/confirmation';
import type { Signal } from '../../src/core/types';

const signal: Signal = {
  id: 'sig-1',
  side: 'long',
  instrument: 'ES',
  price: 4500,
  reason: 'MA Cross',
  timestamp: new Date(),
};

describe('confirmation', () => {
  beforeEach(() => {
    confirmation.clearPending();
  });

  it('adds and confirms pending signal', () => {
    confirmation.addPending(signal);
    const out = confirmation.confirm('sig-1');
    expect(out).not.toBeNull();
    expect(out!.id).toBe('sig-1');
    expect(confirmation.getPending()).toHaveLength(0);
  });

  it('reject removes pending', () => {
    confirmation.addPending(signal);
    expect(confirmation.reject('sig-1')).toBe(true);
    expect(confirmation.confirm('sig-1')).toBeNull();
  });
});
