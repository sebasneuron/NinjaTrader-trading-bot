/**
 * Express API server and optional WebSocket for dashboard.
 */

import path from 'path';
import fs from 'fs';
import express from 'express';
import http from 'http';
import type { Config } from '../config';
import type { INinjaTraderClient } from '../integration/ninjatrader';
import type { TradeManager } from '../trade/manager';
import { createConfigRouter } from './routes/config';
import { createSignalsRouter } from './routes/signals';
import { createAccountRouter } from './routes/account';
import { attachWebSocket } from './websocket';

export interface ServerOptions {
  getConfig: () => Config;
  getClient: () => INinjaTraderClient | null;
  getTradeManager: () => TradeManager | null;
}

export function createApp(options: ServerOptions): express.Express {
  const app = express();
  app.use(express.json());
  const publicDir = path.join(__dirname, 'public');
  const fallback = path.join(process.cwd(), 'src', 'api', 'public');
  app.use(express.static(fs.existsSync(publicDir) ? publicDir : fallback));

  app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
  app.use('/api/config', createConfigRouter(options.getConfig));
  app.use('/api/signals', createSignalsRouter(options.getTradeManager));
  app.use('/api/account', createAccountRouter(options.getClient));

  return app;
}

export function startServer(options: ServerOptions & { port?: number; wsPath?: string }): http.Server {
  const port = options.port ?? options.getConfig().server.port;
  const app = createApp(options);
  const server = http.createServer(app);
  attachWebSocket(server, options.wsPath ?? '/ws');
  server.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
    console.log(`WebSocket on ws://localhost:${port}/ws`);
  });
  return server;
}
