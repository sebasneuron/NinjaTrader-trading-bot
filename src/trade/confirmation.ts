/**
 * Manual confirmation queue: holds pending signals until user confirms or rejects.
 */

import type { Signal } from '../core/types';

export interface PendingConfirmation {
  signal: Signal;
  createdAt: Date;
  expiresAt?: Date;
}

const pending: Map<string, PendingConfirmation> = new Map();

export function addPending(signal: Signal, ttlMs?: number): void {
  const expiresAt = ttlMs ? new Date(Date.now() + ttlMs) : undefined;
  pending.set(signal.id, { signal, createdAt: new Date(), expiresAt });
}

export function confirm(signalId: string): Signal | null {
  const item = pending.get(signalId);
  if (!item) return null;
  if (item.expiresAt && item.expiresAt < new Date()) {
    pending.delete(signalId);
    return null;
  }
  pending.delete(signalId);
  return item.signal;
}

export function reject(signalId: string): boolean {
  return pending.delete(signalId);
}

export function getPending(): PendingConfirmation[] {
  const now = new Date();
  for (const [id, item] of pending.entries()) {
    if (item.expiresAt && item.expiresAt < now) pending.delete(id);
  }
  return Array.from(pending.values());
}

export function clearPending(): void {
  pending.clear();
}
