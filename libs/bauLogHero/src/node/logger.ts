import type { LoggerConfig, LogLevel, TagReturn } from '../types';
import { colors } from '../types';
import { readFileSync, existsSync } from 'fs';

export class NodeLogger {
  private config: LoggerConfig;
  private readonly filename: string;

  constructor(filename: string, config: LoggerConfig) {
    this.config = config;
    this.filename = filename;

    // Try to load config from file
    const configFilePath = filename.replace(/\.ts$/, '.config.json5');
    try {
      if (existsSync(configFilePath)) {
        const rawConfig = readFileSync(configFilePath, 'utf8');
        this.config = { ...this.config, ...JSON.parse(rawConfig.replace(/\/\/.*/g, '')) };
      }
    } catch {
      // Ignore config parse errors
    }

    if (this.config.output?.console && process.env['NODE_ENV'] !== 'test') {
      const timeString = new Date().toISOString();
      const initMessage = this.buildInitMessage(timeString);
      console.log(initMessage);
    }
  }

  private buildInitMessage(timeStr: string): string[] {
    const fileTag = this.createTag(this.filename, colors.bgBlue, colors.white);
    return [
      `${colors.cyan}╔════════════════════════════════════════════`,
      `║ ${fileTag}`,
      `║ BaudevsLogger started at ${timeStr}`,
      `╚════════════════════════════════════════════${colors.reset}`
    ];
  }

  private createTag(text: string, bgColor: string, textColor: string = colors.black): TagReturn {
    return `${bgColor}${textColor} ${text} ${colors.reset}`;
  }

  enable(): void {
    this.setConfig({ output: { console: true } });
  }

  disable(): void {
    this.setConfig({ output: { console: false } });
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  log(message: unknown, ...args: unknown[]): void {
    this.log_messages(message, 'info', ...args);
  }

  debug(message: unknown, ...args: unknown[]): void {
    this.log_messages(message, 'debug', ...args);
  }

  info(message: unknown, ...args: unknown[]): void {
    this.log_messages(message, 'info', ...args);
  }

  warn(message: unknown, ...args: unknown[]): void {
    this.log_messages(message, 'warn', ...args);
  }

  error(message: unknown, ...args: unknown[]): void {
    this.log_messages(message, 'error', ...args);
  }

  private getLevelSymbol(level: LogLevel): string {
    const symbols: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };
    return symbols[level];
  }

  private formatTimestamp(timestamp: string): string {
    switch (this.config.timestampFormat) {
      case 'short':
        return new Date(timestamp).toLocaleTimeString();
      case 'none':
        return '';
      case 'iso':
      default:
        return timestamp;
    }
  }

  private log_messages(message: unknown, level: LogLevel = 'info', ...args: unknown[]): void {
    if (!this.config.output?.console) return;

    const order: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const configLevel = this.config.level || 'debug';
    if (order.indexOf(level) < order.indexOf(configLevel)) return;

    const timestamp = new Date().toISOString();
    const formattedTimestamp = this.formatTimestamp(timestamp);
    const tags: Record<LogLevel, TagReturn> = {
      debug: this.createTag('DEBUG', colors.bgCyan, colors.black),
      info: this.createTag('INFO', colors.bgGreen, colors.black),
      warn: this.createTag('WARN', colors.bgYellow, colors.black),
      error: this.createTag('ERROR', colors.bgRed, colors.white),
    };

    const fileTag = this.createTag(this.filename, colors.bgBlue, colors.white);
    const timeTag = this.config.timestamp ? this.createTag(formattedTimestamp, colors.bgWhite, colors.black) : '';
    const symbol = this.getLevelSymbol(level);

    const levelColors: Record<LogLevel, string> = {
      debug: colors.cyan,
      info: colors.green,
      warn: colors.yellow,
      error: colors.red,
    };

    const linePrefix = `${colors.dim}│ ${levelColors[level]}${level.toUpperCase()}${colors.reset}`;
    const resolveTag = (tag: TagReturn): string =>
      Array.isArray(tag) ? tag[0].replace(/%c\s?/, '') : tag;

    const prefix = [
      `${symbol} ${this.config.timestamp ? `${resolveTag(timeTag)} ` : ''}${resolveTag(tags[level])} ${resolveTag(fileTag)}`,
      '→'
    ];
    const levelLine = [linePrefix];

    const consoleMethod = (console[level] as Console['log']) || console.log;
    consoleMethod(...prefix, message, ...args);
    consoleMethod(...levelLine);
  }
}
