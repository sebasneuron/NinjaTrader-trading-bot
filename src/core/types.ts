/**
 * Core domain types for the trading assistant.
 */

export type Side = 'long' | 'short';

export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';

export interface MarketDataTick {
  instrument: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  time: Date;
}

export interface Bar {
  instrument: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: Date;
}

export interface Signal {
  id: string;
  side: Side;
  instrument: string;
  price?: number;
  reason: string;
  timestamp: Date;
  strength?: number;
}

export interface Position {
  instrument: string;
  side: Side;
  quantity: number;
  avgPrice: number;
  unrealizedPnL?: number;
  openedAt: Date;
}

export interface OrderRequest {
  instrument: string;
  side: Side;
  quantity: number;
  orderType: OrderType;
  limitPrice?: number;
  stopPrice?: number;
}

export interface AccountSummary {
  balance: number;
  equity: number;
  marginUsed: number;
  openPnL: number;
}
