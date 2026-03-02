/**
 * Trade manager: coordinates confirmation, order submission, and optional stop/target.
 */

import type { Signal, OrderRequest } from '../core/types';
import { onSignal } from '../core/events';
import { logger } from '../core/logger';
import type { INinjaTraderClient } from '../integration/ninjatrader';
import * as confirmation from './confirmation';
import { PositionMonitor } from './position-monitor';

export interface TradeManagerConfig {
  requireConfirmation: boolean;
  maxPositions: number;
  defaultQuantity: number;
  autoStopLoss: boolean;
  autoProfitTarget: boolean;
  stopLossTicks: number;
  profitTargetTicks: number;
  confirmationTtlMs?: number;
}

export class TradeManager {
  private client: INinjaTraderClient;
  private config: TradeManagerConfig;
  private positionMonitor: PositionMonitor | null = null;

  constructor(client: INinjaTraderClient, config: TradeManagerConfig) {
    this.client = client;
    this.config = config;
  }

  start(): void {
    this.positionMonitor = new PositionMonitor(this.client, { pollIntervalMs: 2000 });
    this.positionMonitor.start();

    if (this.config.requireConfirmation) {
      onSignal((signal: Signal) => {
        confirmation.addPending(signal, this.config.confirmationTtlMs);
      });
    }
  }

  stop(): void {
    this.positionMonitor?.stop();
    this.positionMonitor = null;
    confirmation.clearPending();
  }

  async executeSignal(signalId: string): Promise<{ orderId: string | null; error?: string }> {
    const signal = confirmation.confirm(signalId);
    if (!signal) return { orderId: null, error: 'Signal not found or expired' };
    return this.submitOrderFromSignal(signal);
  }

  async submitOrderFromSignal(signal: Signal, quantity?: number): Promise<{ orderId: string | null; error?: string }> {
    if (!this.client.isConnected()) return { orderId: null, error: 'Not connected' };
    const positions = await this.client.getPositions();
    if (positions.length >= this.config.maxPositions) {
      return { orderId: null, error: 'Max positions reached' };
    }
    const qty = quantity ?? this.config.defaultQuantity;
    const request: OrderRequest = {
      instrument: signal.instrument,
      side: signal.side,
      quantity: qty,
      orderType: 'market',
    };
    const result = await this.client.sendOrder(request);
    if (result) {
      logger.info('Order sent', { orderId: result.orderId, signal: signal.id });
      return { orderId: result.orderId };
    }
    return { orderId: null, error: 'Order submission failed' };
  }

  getPendingSignals(): ReturnType<typeof confirmation.getPending> {
    return confirmation.getPending();
  }

  rejectSignal(signalId: string): boolean {
    return confirmation.reject(signalId);
  }
}
