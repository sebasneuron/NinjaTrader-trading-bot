/**
 * Config and strategy parameters API.
 */

import { Router, type Request, type Response } from 'express';
import type { Config } from '../../config';

export function createConfigRouter(getConfig: () => Config): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.json(getConfig());
  });

  return router;
}
