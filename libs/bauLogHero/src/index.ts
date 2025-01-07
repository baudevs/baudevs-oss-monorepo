// libs/logger/src/index.ts
import type { LoggerConfig } from './types';
import { Logger } from './lib/logger';

export { Logger } from './lib/logger';
export { OutputHandler } from './lib/output-handler';
export * from './types';

// Factory function to create a new logger instance
export function createLogger(config: LoggerConfig = {}): Logger {
  return new Logger(config);
}

// Utility functions
export { getTimeString, ensureError, sanitizeFilename, formatBytes } from './lib/utils';
