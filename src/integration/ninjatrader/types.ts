/**
 * Types for NinjaTrader / ATI integration.
 */

import type { Position, AccountSummary, OrderRequest, Bar, MarketDataTick } from '../../core/types';

export interface INinjaTraderClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  getPositions(): Promise<Position[]>;
  getAccountSummary(): Promise<AccountSummary | null>;
  sendOrder(request: OrderRequest): Promise<{ orderId: string } | null>;

  subscribeMarketData?(instrument: string, callback: (tick: MarketDataTick) => void): (() => void) | void;
  subscribeBars?(instrument: string, intervalMinutes: number, callback: (bar: Bar) => void): (() => void) | void;
  onPositionUpdate?(callback: (position: Position) => void): (() => void) | void;
}

export interface AtiOrderPayload {
  instrument: string;
  action: 'buy' | 'sell';
  quantity: number;
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  limitPrice?: number;
  stopPrice?: number;
}

export interface AtiConfig {
  baseUrl: string;
  apiKey?: string;
}
