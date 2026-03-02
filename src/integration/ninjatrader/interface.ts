/**
 * Abstract interface for NinjaTrader connectivity.
 * Implement with RestNinjaTraderClient (CrossTrade/ATI) or MockNinjaTraderClient for tests.
 */

import type { INinjaTraderClient } from './types';
import { RestNinjaTraderClient } from './rest-client';
import { MockNinjaTraderClient } from './mock-client';

export type { INinjaTraderClient, AtiOrderPayload, AtiConfig } from './types';

export const NINJATRADER_INTERFACE: unique symbol = Symbol('INinjaTraderClient');

export function createNinjaTraderClient(config: { baseUrl: string; apiKey?: string; mock?: boolean }): INinjaTraderClient {
  if (config.mock) return new MockNinjaTraderClient();
  return new RestNinjaTraderClient(config);
}
