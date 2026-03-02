import { loadConfig } from '../src/config';

describe('config', () => {
  it('loads default config from env', () => {
    const config = loadConfig({});
    expect(config.server.port).toBe(4000);
    expect(config.strategy.requireConfirmation).toBe(true);
    expect(config.signals.fastMaPeriod).toBe(10);
  });

  it('parses PORT from env', () => {
    const config = loadConfig({ PORT: '5000' });
    expect(config.server.port).toBe(5000);
  });
});
