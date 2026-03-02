/**
 * Monitors positions from NinjaTrader and emits updates; optional trailing stop logic.
 */

import type { Position } from '../core/types';
import { emit } from '../core/events';
import { logger } from '../core/logger';
import type { INinjaTraderClient } from '../integration/ninjatrader';

export interface PositionMonitorConfig {
  pollIntervalMs?: number;
  trailingStopTicks?: number;
  onPositionUpdate?: (position: Position) => void;
}

export class PositionMonitor {
  private client: INinjaTraderClient;
  private config: PositionMonitorConfig;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastPositions: Position[] = [];

  constructor(client: INinjaTraderClient, config: PositionMonitorConfig = {}) {
    this.client = client;
    this.config = { pollIntervalMs: 2000, ...config };
  }

  start(): void {
    if (this.intervalId) return;
    const poll = async () => {
      if (!this.client.isConnected()) return;
      try {
        const positions = await this.client.getPositions();
        this.diffAndEmit(positions);
        this.lastPositions = positions;
      } catch (e) {
        logger.warn('Position poll failed', { error: String(e) });
      }
    };
    poll();
    this.intervalId = setInterval(poll, this.config.pollIntervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.lastPositions = [];
  }

  private diffAndEmit(positions: Position[]): void {
    for (const p of positions) {
      const key = (pos: Position) => `${pos.instrument}-${pos.side}`;
      const prev = this.lastPositions.find((x) => key(x) === key(p));
      if (!prev || prev.quantity !== p.quantity || prev.avgPrice !== p.avgPrice) {
        emit({ type: 'position', payload: p });
        this.config.onPositionUpdate?.(p);
      }
    }
  }
}
