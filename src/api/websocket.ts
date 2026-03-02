/**
 * WebSocket server for real-time signals and position updates.
 */

import { WebSocketServer } from 'ws';
import { on, type AppEvent } from '../core/events';
import { logger } from '../core/logger';

export function attachWebSocket(server: import('http').Server, path = '/ws'): WebSocketServer {
  const wss = new WebSocketServer({ server, path });
  const unsub = on((event: AppEvent) => {
    const msg = JSON.stringify({ type: event.type, payload: event.payload });
    wss.clients.forEach((client) => {
      if (client.readyState === 1) client.send(msg);
    });
  });

  wss.on('connection', () => {
    logger.info('WebSocket client connected');
  });

  wss.on('close', () => {
    unsub();
  });

  return wss;
}
