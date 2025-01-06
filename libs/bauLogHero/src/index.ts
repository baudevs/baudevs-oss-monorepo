// libs/logger/src/index.ts
import { BrowserLogger } from './browser/logger';
import { NodeLogger } from './node/logger';
import type { LoggerConfig, LogLevel } from './types';

export type { LoggerConfig, LogLevel };

const isBrowser = typeof window !== 'undefined';

export const createLogger = (filename: string): BrowserLogger | NodeLogger => {
  const enabled = true; // Default to enabled, can be configured via config
  return isBrowser
    ? new BrowserLogger(filename, enabled)
    : new NodeLogger(filename, enabled);
};
