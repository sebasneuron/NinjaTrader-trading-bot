/**
 * Account and positions API.
 */

import { Router, type Request, type Response } from 'express';
import type { INinjaTraderClient } from '../../integration/ninjatrader';

export function createAccountRouter(getClient: () => INinjaTraderClient | null): Router {
  const router = Router();

  router.get('/positions', async (req: Request, res: Response) => {
    const client = getClient();
    if (!client?.isConnected()) return res.status(503).json({ error: 'Not connected' });
    const positions = await client.getPositions();
    res.json({ positions });
  });

  router.get('/summary', async (req: Request, res: Response) => {
    const client = getClient();
    if (!client?.isConnected()) return res.status(503).json({ error: 'Not connected' });
    const summary = await client.getAccountSummary();
    res.json(summary ?? {});
  });

  return router;
}
