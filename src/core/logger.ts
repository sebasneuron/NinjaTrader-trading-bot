/**
 * Simple structured logger for the assistant.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let minLevel: LogLevel = 'info';

export function setLogLevel(level: LogLevel): void {
  minLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return levelOrder[level] >= levelOrder[minLevel];
}

function format(level: string, msg: string, meta?: object): string {
  const ts = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${ts}] [${level.toUpperCase()}] ${msg}${metaStr}`;
}

export const logger = {
  debug(msg: string, meta?: object): void {
    if (shouldLog('debug')) console.debug(format('debug', msg, meta));
  },
  info(msg: string, meta?: object): void {
    if (shouldLog('info')) console.info(format('info', msg, meta));
  },
  warn(msg: string, meta?: object): void {
    if (shouldLog('warn')) console.warn(format('warn', msg, meta));
  },
  error(msg: string, meta?: object): void {
    if (shouldLog('error')) console.error(format('error', msg, meta));
  },
};
