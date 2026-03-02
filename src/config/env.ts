/**
 * Load config from environment and validate.
 */

import { configSchema, type Config } from './schema';

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const raw = {
    ninjatrader: {
      baseUrl: env.NINJATRADER_BASE_URL,
      apiKey: env.NINJATRADER_API_KEY,
      enabled: env.NINJATRADER_ENABLED !== 'false',
    },
    server: {
      port: env.PORT,
      wsPort: env.WS_PORT,
    },
    strategy: {
      defaultInstrument: env.DEFAULT_INSTRUMENT,
      maxPositions: env.MAX_POSITIONS,
      riskPerTradeTicks: env.RISK_PER_TRADE_TICKS,
      requireConfirmation: env.REQUIRE_CONFIRMATION !== 'false',
      autoStopLoss: env.AUTO_STOP_LOSS === 'true',
      autoProfitTarget: env.AUTO_PROFIT_TARGET === 'true',
      stopLossTicks: env.STOP_LOSS_TICKS,
      profitTargetTicks: env.PROFIT_TARGET_TICKS,
    },
    signals: {
      enabled: env.SIGNALS_ENABLED !== 'false',
      playSound: env.ALERT_SOUND_ENABLED !== 'false',
      soundFile: env.ALERT_SOUND_FILE,
      fastMaPeriod: env.FAST_MA_PERIOD,
      slowMaPeriod: env.SLOW_MA_PERIOD,
      orderFlowThreshold: env.ORDER_FLOW_THRESHOLD,
    },
  };
  return configSchema.parse(raw);
}
