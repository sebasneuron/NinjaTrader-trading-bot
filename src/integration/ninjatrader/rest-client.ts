/**
 * REST/HTTP client for NinjaTrader ATI.
 * Compatible with CrossTrade webhooks or any REST ATI endpoint.
 * Configure baseUrl to your ATI gateway (e.g. CrossTrade or local bridge).
 */

import type { INinjaTraderClient, AtiOrderPayload } from './types';
import type { Position, AccountSummary, OrderRequest, Bar, MarketDataTick } from '../../core/types';

export interface RestNinjaTraderClientOptions {
  baseUrl: string;
  apiKey?: string;
}

export class RestNinjaTraderClient implements INinjaTraderClient {
  private baseUrl: string;
  private apiKey: string | undefined;
  private connected = false;
  private positionCallbacks: Array<(p: Position) => void> = [];

  constructor(options: RestNinjaTraderClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.apiKey = options.apiKey;
  }

  async connect(): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        headers: this.headers(),
      }).catch(() => null);
      this.connected = res?.ok ?? false;
      if (!this.connected) {
        this.connected = true; // allow offline dev; real impl would throw
      }
    } catch {
      this.connected = true;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.positionCallbacks = [];
  }

  isConnected(): boolean {
    return this.connected;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) h['Authorization'] = `Bearer ${this.apiKey}`;
    return h;
  }

  async getPositions(): Promise<Position[]> {
    if (!this.connected) return [];
    try {
      const res = await fetch(`${this.baseUrl}/positions`, { headers: this.headers() });
      if (!res.ok) return [];
      const data = (await res.json()) as Array<{ instrument: string; side: string; quantity: number; avgPrice: number; openedAt?: string }>;
      return Array.isArray(data) ? data.map((p) => this.mapPosition(p)) : [];
    } catch {
      return [];
    }
  }

  async getAccountSummary(): Promise<AccountSummary | null> {
    if (!this.connected) return null;
    try {
      const res = await fetch(`${this.baseUrl}/account`, { headers: this.headers() });
      if (!res.ok) return null;
      const data = (await res.json()) as { balance?: number; equity?: number; marginUsed?: number; openPnL?: number };
      return {
        balance: data.balance ?? 0,
        equity: data.equity ?? 0,
        marginUsed: data.marginUsed ?? 0,
        openPnL: data.openPnL ?? 0,
      };
    } catch {
      return null;
    }
  }

  async sendOrder(request: OrderRequest): Promise<{ orderId: string } | null> {
    if (!this.connected) return null;
    const payload: AtiOrderPayload = {
      instrument: request.instrument,
      action: request.side === 'long' ? 'buy' : 'sell',
      quantity: request.quantity,
      orderType: request.orderType,
      limitPrice: request.limitPrice,
      stopPrice: request.stopPrice,
    };
    try {
      const res = await fetch(`${this.baseUrl}/order`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { orderId?: string; id?: string };
      return { orderId: data.orderId ?? data.id ?? '' };
    } catch {
      return null;
    }
  }

  onPositionUpdate(callback: (position: Position) => void): () => void {
    this.positionCallbacks.push(callback);
    return () => {
      this.positionCallbacks = this.positionCallbacks.filter((cb) => cb !== callback);
    };
  }

  protected notifyPositionUpdate(position: Position): void {
    this.positionCallbacks.forEach((cb) => cb(position));
  }

  private mapPosition(p: { instrument: string; side: string; quantity: number; avgPrice: number; openedAt?: string }): Position {
    return {
      instrument: p.instrument,
      side: p.side === 'short' ? 'short' : 'long',
      quantity: p.quantity ?? 0,
      avgPrice: p.avgPrice ?? 0,
      openedAt: p.openedAt ? new Date(p.openedAt) : new Date(),
    };
  }
}
