/**
 * Ninja Trade Bot - Semi-automated trading assistant for NinjaTrader (ATI).
 * Entry point: run assistant with optional dashboard server.
 */

import 'dotenv/config';
import { loadConfig } from './config';
import { createNinjaTraderClient } from './integration/ninjatrader';
import { TradeManager } from './trade/manager';
import { SignalEngine } from './signals/engine';
import { movingAverageCrossover } from './signals/conditions';
import { startAlerts, configureAlerts } from './signals/alerts';
import { startServer } from './api/server';
import { logger } from './core/logger';
import { parseArgs, printConfig } from './cli';

async function main(): Promise<void> {
  const opts = parseArgs(process.argv);
  const config = loadConfig();

  if (opts.mode === 'config') {
    printConfig();
    process.exit(0);
  }

  const client = createNinjaTraderClient({
    baseUrl: config.ninjatrader.baseUrl,
    apiKey: config.ninjatrader.apiKey,
    mock: opts.mock ?? !config.ninjatrader.enabled,
  });

  await client.connect();
  logger.info('NinjaTrader client connected', { mock: opts.mock });

  const tradeManager = new TradeManager(client, {
    requireConfirmation: config.strategy.requireConfirmation,
    maxPositions: config.strategy.maxPositions,
    defaultQuantity: 1,
    autoStopLoss: config.strategy.autoStopLoss,
    autoProfitTarget: config.strategy.autoProfitTarget,
    stopLossTicks: config.strategy.stopLossTicks,
    profitTargetTicks: config.strategy.profitTargetTicks,
  });
  tradeManager.start();

  const signalEngine = new SignalEngine({
    instrument: config.strategy.defaultInstrument,
    conditions: [movingAverageCrossover],
    params: {
      fastPeriod: config.signals.fastMaPeriod,
      slowPeriod: config.signals.slowMaPeriod,
      orderFlowThreshold: config.signals.orderFlowThreshold,
    },
  });

  configureAlerts({
    playSound: config.signals.playSound,
    soundFile: config.signals.soundFile,
    logToConsole: true,
  });
  if (config.signals.enabled) startAlerts();

  // Demo: run signal engine on simulated bars (replace with real market data from ATI/CrossTrade)
  if (config.signals.enabled) {
    const bars = getSimulatedBars(config.strategy.defaultInstrument);
    bars.forEach((bar) => {
      signalEngine.pushBar(bar);
      const signal = signalEngine.evaluate();
      if (signal) logger.info('Signal', { signal });
    });
  }

  if (opts.mode === 'serve') {
    startServer({
      getConfig: () => loadConfig(),
      getClient: () => client,
      getTradeManager: () => tradeManager,
      port: opts.port ?? config.server.port,
    });
  }

  logger.info('Assistant running. Use --serve to start dashboard.');
}

function getSimulatedBars(instrument: string): Array<{ instrument: string; open: number; high: number; low: number; close: number; volume: number; time: Date }> {
  const bars = [];
  let price = 4500;
  for (let i = 0; i < 50; i++) {
    const change = (Math.random() - 0.5) * 10;
    const open = price;
    price += change;
    bars.push({
      instrument,
      open,
      high: Math.max(open, price) + Math.random() * 2,
      low: Math.min(open, price) - Math.random() * 2,
      close: price,
      volume: 1000 + Math.floor(Math.random() * 500),
      time: new Date(Date.now() - (50 - i) * 60000),
    });
  }
  return bars;
}

main().catch((err) => {
  logger.error('Fatal error', { error: String(err) });
  process.exit(1);
});
