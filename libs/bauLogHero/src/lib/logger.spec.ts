// libs/bauLogHero/src/lib/logger.spec.ts
import { fileHasEnabledComment } from '@/lib/utils';
import {  createLogger } from '@/src/index';

jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  fileHasEnabledComment: jest.fn().mockReturnValue(true),
}));


describe('BaudevsLogger', () => {
  let originalLog: typeof console.log;
  let originalWarn: typeof console.warn;
  let originalError: typeof console.error;
  let originalDebug: typeof console.debug;
  let originalInfo: typeof console.info;
  let originalNodeEnv: string | undefined;

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
    originalNodeEnv = process.env['NODE_ENV'];
    process.env['NODE_ENV'] = 'test';

    (fileHasEnabledComment as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    console.debug = originalDebug;
    console.info = originalInfo;

    process.env['NODE_ENV'] = originalNodeEnv;
  });

  it('should create a logger instance', () => {
    const logger = createLogger(__filename);
    expect(logger).toBeDefined();
  });

  it('should log info messages when enabled', () => {
    const logger = createLogger(__filename);
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
    const logger = createLogger(__filename);
    logger.debug('Test debug message');
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining('🔍'),
      expect.stringContaining('→'),
      'Test debug message'
    );
  });

});
