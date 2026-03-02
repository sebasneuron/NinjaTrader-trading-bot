/**
 * Signals and pending confirmations API.
 */

import { Router, type Request, type Response } from 'express';
import type { TradeManager } from '../../trade/manager';

export function createSignalsRouter(getTradeManager: () => TradeManager | null): Router {
  const router = Router();

  router.get('/pending', (req: Request, res: Response) => {
    const tm = getTradeManager();
    if (!tm) return res.status(503).json({ error: 'Trade manager not available' });
    const pending = tm.getPendingSignals();
    res.json({ pending });
  });

  router.post('/confirm/:signalId', async (req: Request, res: Response) => {
    const tm = getTradeManager();
    if (!tm) return res.status(503).json({ error: 'Trade manager not available' });
    const { signalId } = req.params;
    const result = await tm.executeSignal(signalId);
    if (result.error) return res.status(400).json(result);
    res.json(result);
  });

  router.post('/reject/:signalId', (req: Request, res: Response) => {
    const tm = getTradeManager();
    if (!tm) return res.status(503).json({ error: 'Trade manager not available' });
    const ok = tm.rejectSignal(req.params.signalId);
    res.json({ rejected: ok });
  });

  return router;
}
