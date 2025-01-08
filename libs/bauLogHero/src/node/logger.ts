import type { LogLevel, TagReturn, LoggerConfig } from '../types';
import { OutputHandler } from '../lib/output-handler';

export class NodeLogger {
  private outputHandler: OutputHandler;

  constructor(config: LoggerConfig = {}) {
    this.outputHandler = new OutputHandler(config.output ?? {});
  }

  log(level: LogLevel, tag?: TagReturn, ...args: unknown[]): void {
    const [tagName, tagValue] = Array.isArray(tag) ? tag : [tag, undefined];
    const formattedTag = tagValue
      ? `[${tagName}=${tagValue}]`
      : tagName
        ? `[${tagName}]`
        : '';

    this.outputHandler.log(level, 'node', formattedTag, ...args);
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
