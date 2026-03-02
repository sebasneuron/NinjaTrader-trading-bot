/**
 * Visual and audio alerts when signals occur.
 */

import type { Signal } from '../core/types';
import { onSignal } from '../core/events';
import { logger } from '../core/logger';

export interface AlertOptions {
  playSound: boolean;
  soundFile?: string;
  logToConsole: boolean;
}

const defaultOptions: AlertOptions = {
  playSound: true,
  logToConsole: true,
};

let options = { ...defaultOptions };
let unsubscribe: (() => void) | null = null;

export function configureAlerts(opts: Partial<AlertOptions>): void {
  options = { ...options, ...opts };
}

export function startAlerts(): void {
  if (unsubscribe) return;
  unsubscribe = onSignal((signal: Signal) => {
    if (options.logToConsole) {
      logger.info(`ALERT: ${signal.side.toUpperCase()} signal on ${signal.instrument}`, {
        reason: signal.reason,
        price: signal.price,
      });
    }
    if (options.playSound) {
      try {
        const { exec } = require('child_process');
        const sound = options.soundFile || '';
        if (sound && process.platform === 'win32') {
          exec(`powershell -c "[console]::beep(800,200)"`, () => {});
        }
      } catch {
        // ignore
      }
    }
  });
}

export function stopAlerts(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
