// libs/logger/src/index.ts
import { Logger } from './lib/logger';

export * from './types';
export { createLogger } from './lib/logger';
export { SmartAnalyzer } from './lib/smart-analysis';
export { findRelevantEmoji } from './lib/utils';
export { Logger };
export {
  readLogsStream,
  readLogsSync,
  readLastLogs,
  readLogsInRange
} from './utils/file-reader';
export {
  isValidLogLevel,
  validateLogEntry,
  validateStructuredLog,
  validateLogContext
} from './utils/validation';

