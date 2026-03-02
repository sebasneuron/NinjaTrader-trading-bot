/**
 * CLI for running the assistant and optional config.
 */

import { loadConfig } from '../config';
import { logger } from '../core/logger';

export interface CliOptions {
  mode?: 'run' | 'serve' | 'config';
  port?: number;
  mock?: boolean;
}

export function parseArgs(argv: string[]): CliOptions {
  const args = argv.slice(2);
  const opts: CliOptions = { mode: 'run' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--serve' || args[i] === '-s') opts.mode = 'serve';
    else if (args[i] === '--config') opts.mode = 'config';
    else if (args[i] === '--port' && args[i + 1]) opts.port = parseInt(args[i + 1], 10);
    else if (args[i] === '--mock') opts.mock = true;
  }
  return opts;
}

export function printConfig(): void {
  const config = loadConfig();
  console.log(JSON.stringify(config, null, 2));
}
