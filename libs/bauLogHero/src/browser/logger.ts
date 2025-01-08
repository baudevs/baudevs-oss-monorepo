import type { LogLevel, TagReturn, LoggerConfig } from '../types';
import { colors } from '../types';
import { OutputHandler } from '../lib/output-handler';

export class BrowserLogger {
  private outputHandler: OutputHandler;

  constructor(config: LoggerConfig = {}) {
    this.outputHandler = new OutputHandler({
      ...config.output ?? {},
      console: {
        enabled: true, // Always enable colors in browser
        ...(config.output?.console && typeof config.output.console === 'object' ? config.output.console : {})
      }
    });
  }

  log(level: LogLevel, tag?: TagReturn, ...args: unknown[]): void {
    const [tagName, tagValue] = Array.isArray(tag) ? tag : [tag, undefined];
    const coloredTag = tagValue
      ? `${colors.cyan}[${tagName}=${tagValue}]${colors.reset}`
      : tagName
        ? `${colors.cyan}[${tagName}]${colors.reset}`
        : '';

    this.outputHandler.log(level, 'browser', coloredTag, ...args);
  }

  debug(tag?: TagReturn, ...args: unknown[]): void {
    this.log('debug', tag, ...args);
  }

  info(tag?: TagReturn, ...args: unknown[]): void {
    this.log('info', tag, ...args);
  }

  warn(tag?: TagReturn, ...args: unknown[]): void {
    this.log('warn', tag, ...args);
  }

  error(tag?: TagReturn, ...args: unknown[]): void {
    this.log('error', tag, ...args);
  }
}
