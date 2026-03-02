/**
 * Mock NinjaTrader client for development and tests.
 * Simulates positions, account, and order submission without a live connection.
 */

import type { INinjaTraderClient } from './types';
import type { Position, AccountSummary, OrderRequest, Bar, MarketDataTick } from '../../core/types';

export class MockNinjaTraderClient implements INinjaTraderClient {
  private connected = false;
  private positions: Position[] = [];
  private positionCallbacks: Array<(p: Position) => void> = [];
  private lastPrice = 4500;

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.positionCallbacks = [];
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getPositions(): Promise<Position[]> {
    return [...this.positions];
  }

  async getAccountSummary(): Promise<AccountSummary | null> {
    return {
      balance: 100000,
      equity: 100000,
      marginUsed: 0,
      openPnL: 0,
    };
  }

  async sendOrder(request: OrderRequest): Promise<{ orderId: string } | null> {
    if (!this.connected) return null;
    const orderId = `mock-${Date.now()}`;
    const pos: Position = {
      instrument: request.instrument,
      side: request.side,
      quantity: request.quantity,
      avgPrice: this.lastPrice,
      openedAt: new Date(),
    };
    this.positions.push(pos);
    this.positionCallbacks.forEach((cb) => cb(pos));
    return { orderId };
  }

  onPositionUpdate(callback: (position: Position) => void): () => void {
    this.positionCallbacks.push(callback);
    return () => {
      this.positionCallbacks = this.positionCallbacks.filter((cb) => cb !== callback);
    };
  }

  /** Test helper: set simulated last price. */
  setLastPrice(price: number): void {
    this.lastPrice = price;
  }

  /** Test helper: clear positions. */
  clearPositions(): void {
    this.positions = [];
  }
}
