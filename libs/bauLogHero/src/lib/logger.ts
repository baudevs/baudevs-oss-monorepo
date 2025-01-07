import type { LogLevel, LoggerConfig } from '../types';
import { OutputHandler } from './output-handler';

export class Logger {
  private outputHandler: OutputHandler;
  private config: LoggerConfig;
  private isCI: boolean;

  constructor(config: LoggerConfig = {}) {
    this.config = config;
    this.outputHandler = new OutputHandler(config.output);
    this.isCI = this.detectCI();
  }

  private detectCI(): boolean {
    return Boolean(
      process.env['CI'] ||
      process.env['GITHUB_ACTIONS'] ||
      process.env['GITLAB_CI'] ||
      process.env['CIRCLECI'] ||
      process.env['JENKINS_URL'] ||
      process.env['TRAVIS']
    );
  }

  private shouldLog(level: LogLevel, message: unknown, args: unknown[]): boolean {
    if (!this.isCI || !this.config.output?.ci?.enabled) {
      return true;
    }

    const ciConfig = this.config.output.ci;

    // Check minimum level
    if (ciConfig.minLevel) {
      const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
      const minLevelIndex = levels.indexOf(ciConfig.minLevel);
      const currentLevelIndex = levels.indexOf(level);
      if (currentLevelIndex < minLevelIndex) {
        return false;
      }
    }

    // Check filter patterns
    if (ciConfig.filterPatterns?.length) {
      const messageStr = String(message);
      return ciConfig.filterPatterns.some(pattern =>
        messageStr.includes(pattern)
      );
    }

    return true;
  }

  private formatForCI(message: unknown, args: unknown[]): [unknown, unknown[]] {
    if (!this.isCI || !this.config.output?.ci?.enabled) {
      return [message, args];
    }

    const ciConfig = this.config.output.ci;

    const formatValue = (value: unknown): unknown => {
      if (!value || typeof value !== 'object') {
        return value;
      }

      if (!ciConfig.showFullObjects) {
        if (Array.isArray(value)) {
          return `Array(${value.length})`;
        }
        return `${value.constructor.name}`;
      }

      if (ciConfig.truncateLength && typeof value === 'object') {
        const str = JSON.stringify(value);
        if (str.length > ciConfig.truncateLength) {
          return str.substring(0, ciConfig.truncateLength) + '...';
        }
      }

      if (ciConfig.excludeMetadata && typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        const cleaned = { ...obj };
        if ('metadata' in cleaned) {
          delete cleaned['metadata'];
        }
        return cleaned;
      }

      return value;
    };

    const formattedMessage = formatValue(message);
    const formattedArgs = args.map(formatValue);

    return [formattedMessage, formattedArgs];
  }

  debug(message: unknown, ...args: unknown[]): void {
    if (this.shouldLog('debug', message, args)) {
      const [formattedMessage, formattedArgs] = this.formatForCI(message, args);
      this.outputHandler.log('debug', String(formattedMessage), formattedArgs);
    }
  }

  info(message: unknown, ...args: unknown[]): void {
    if (this.shouldLog('info', message, args)) {
      const [formattedMessage, formattedArgs] = this.formatForCI(message, args);
      this.outputHandler.log('info', String(formattedMessage), formattedArgs);
    }
  }

  warn(message: unknown, ...args: unknown[]): void {
    if (this.shouldLog('warn', message, args)) {
      const [formattedMessage, formattedArgs] = this.formatForCI(message, args);
      this.outputHandler.log('warn', String(formattedMessage), formattedArgs);
    }
  }

  error(message: unknown, ...args: unknown[]): void {
    if (this.shouldLog('error', message, args)) {
      const [formattedMessage, formattedArgs] = this.formatForCI(message, args);
      this.outputHandler.log('error', String(formattedMessage), formattedArgs);
    }
  }
}
