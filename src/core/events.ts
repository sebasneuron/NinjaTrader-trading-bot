/**
 * Central event bus for signal, trade, and system events.
 */

import type { Signal } from './types';
import type { Position } from './types';

export type SignalEvent = { type: 'signal'; payload: Signal };
export type PositionUpdateEvent = { type: 'position'; payload: Position };
export type OrderFilledEvent = { type: 'order_filled'; payload: { orderId: string; filledQty: number } };
export type SystemEvent = { type: 'connected' | 'disconnected' | 'error'; payload?: unknown };

export type AppEvent = SignalEvent | PositionUpdateEvent | OrderFilledEvent | SystemEvent;

export type EventHandler<T extends AppEvent = AppEvent> = (event: T) => void;

const listeners = new Set<EventHandler>();

export function emit(event: AppEvent): void {
  listeners.forEach((fn) => {
    try {
      fn(event);
    } catch (e) {
      console.error('Event handler error:', e);
    }
  });
}

export function on(handler: EventHandler): () => void {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

export function onSignal(handler: (signal: Signal) => void): () => void {
  return on((ev) => {
    if (ev.type === 'signal') handler(ev.payload);
  });
}

export function onPositionUpdate(handler: (position: Position) => void): () => void {
  return on((ev) => {
    if (ev.type === 'position') handler(ev.payload);
  });
}
