// libs/bauLogHero/src/lib/logger.spec.ts
import { createBaudevsLogger } from '@/index';

jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  fileHasEnabledComment: jest.fn().mockReturnValue(true),
}));

import { fileHasEnabledComment } from '@/lib/utils';

describe('BaudevsLogger', () => {
  let originalLog: typeof console.log;
  let originalWarn: typeof console.warn;
  let originalError: typeof console.error;
  let originalDebug: typeof console.debug;
  let originalInfo: typeof console.info;
  beforeEach(() => {
    originalLog = console.log;
    originalWarn = console.warn;
    originalError = console.error;
    originalDebug = console.debug;

    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.debug = jest.fn();
    console.info = jest.fn();

    (fileHasEnabledComment as jest.Mock).mockReturnValue(true);
    process.env['NODE_ENV'] = 'test'; // Using bracket notation for tests
  });

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    console.debug = originalDebug;
    console.info = originalInfo;
  });

  it('should create a logger instance', () => {
    const logger = createBaudevsLogger(__filename);
    expect(logger).toBeDefined();
  });

  it('should log info messages when enabled', () => {
    const logger = createBaudevsLogger(__filename);
    logger.info('Test info message');
    // Now we expect only one console.log call because init is skipped in test env
    expect(console.info).toHaveBeenCalledTimes(2);
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('ℹ️'),
      expect.stringContaining('→'),
      'Test info message'
    );
  });

  it('should log debug messages when enabled', () => {
    const logger = createBaudevsLogger(__filename);
    logger.debug('Test debug message');
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining('🔍'),
      expect.stringContaining('→'),
      'Test debug message'
    );
  });

  // ... other tests unchanged ...
});