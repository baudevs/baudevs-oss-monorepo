import type { LogLevel, LoggerConfig } from '../types';
import { OutputHandler } from './output-handler';
import { ensureError } from './utils';

export class Logger {
  private name: string;
  private level: LogLevel;
  private outputHandler: OutputHandler;
  private config: LoggerConfig;

  constructor(config: LoggerConfig = {}) {
    this.name = config.name || 'default';
    this.level = config.level || 'info';
    this.config = config;
    this.outputHandler = new OutputHandler(config.output);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return levels[level] >= levels[this.level];
  }

  private async log(level: LogLevel, message: unknown, ...args: unknown[]): Promise<void> {
    if (!this.shouldLog(level)) return;

    await this.outputHandler.log(level, this.name, message, ...args);
  }

  async debug(message: unknown, ...args: unknown[]): Promise<void> {
    await this.log('debug', message, ...args);
  }

  async info(message: unknown, ...args: unknown[]): Promise<void> {
    await this.log('info', message, ...args);
  }

  async warn(message: unknown, ...args: unknown[]): Promise<void> {
    await this.log('warn', message, ...args);
  }

  async error(error: unknown, ...args: unknown[]): Promise<void> {
    const err = ensureError(error);
    await this.log('error', err.message, {
      stack: err.stack,
      ...args
    });
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };

    if (config.level) {
      this.level = config.level;
    }

    if (config.name) {
      this.name = config.name;
    }

    if (config.output) {
      this.outputHandler = new OutputHandler(config.output);
    }
  }

  static getLogsFromStorage(): unknown[] {
    return OutputHandler.getLogsFromStorage();
  }

  static clearLogsFromStorage(): void {
    OutputHandler.clearLogsFromStorage();
  }
}
