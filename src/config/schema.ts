/**
 * Configuration schema and validation using Zod.
 */

import { z } from 'zod';

export const configSchema = z.object({
  ninjatrader: z.object({
    baseUrl: z.string().url().default('http://localhost:36999'),
    apiKey: z.string().optional(),
    enabled: z.boolean().default(true),
  }),
  server: z.object({
    port: z.coerce.number().min(1).max(65535).default(4000),
    wsPort: z.coerce.number().min(1).max(65535).default(4001),
  }),
  strategy: z.object({
    defaultInstrument: z.string().default('ES 03-25'),
    maxPositions: z.coerce.number().int().min(0).default(1),
    riskPerTradeTicks: z.coerce.number().min(0).default(4),
    requireConfirmation: z.boolean().default(true),
    autoStopLoss: z.boolean().default(false),
    autoProfitTarget: z.boolean().default(false),
    stopLossTicks: z.coerce.number().min(0).default(8),
    profitTargetTicks: z.coerce.number().min(0).default(16),
  }),
  signals: z.object({
    enabled: z.boolean().default(true),
    playSound: z.boolean().default(true),
    soundFile: z.string().optional(),
    fastMaPeriod: z.coerce.number().int().min(1).default(10),
    slowMaPeriod: z.coerce.number().int().min(1).default(30),
    orderFlowThreshold: z.coerce.number().default(1.5),
  }),
});

export type Config = z.infer<typeof configSchema>;
