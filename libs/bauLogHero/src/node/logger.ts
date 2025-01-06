import type { LoggerConfig, LogLevel, TagReturn } from '../types';
import { colors } from '../types';
import { readFileSync, existsSync } from 'fs';

export class NodeLogger {
  private config: LoggerConfig;
  private readonly filename: string;
  private enabled: boolean;

  constructor(filename: string, enabled: boolean) {
    this.config = { level: 'info', enabled: true };
    this.filename = filename;
    this.enabled = enabled;

    // Try to load config from file
    const configFilePath = filename.replace(/\.ts$/, '.config.json5');
    try {
      if (existsSync(configFilePath)) {
        const rawConfig = readFileSync(configFilePath, 'utf8');
        this.config = JSON.parse(rawConfig.replace(/\/\/.*/g, '')) as LoggerConfig;
      }
    } catch {
      // Ignore config parse errors
    }

    // Only print initialization outside of test environment
    if (this.enabled && process.env['NODE_ENV'] !== 'test') {
      const timeString = new Date().toISOString();
      const initMessage = this.buildInitMessage(timeString);
      console.log(...initMessage);
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
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
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

  private log_messages(message: unknown, level: LogLevel = 'info', ...args: unknown[]): void {
    if (!this.enabled) return;

    const order: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const configLevel = this.config.level || 'debug';
    if (order.indexOf(level) < order.indexOf(configLevel)) return;

    const timestamp = new Date().toISOString();
    const tags: Record<LogLevel, TagReturn> = {
      debug: this.createTag('DEBUG', colors.bgCyan, colors.black),
      info: this.createTag('INFO', colors.bgGreen, colors.black),
      warn: this.createTag('WARN', colors.bgYellow, colors.black),
      error: this.createTag('ERROR', colors.bgRed, colors.white),
    };

    const fileTag = this.createTag(this.filename, colors.bgBlue, colors.white);
    const timeTag = this.createTag(timestamp, colors.bgWhite, colors.black);
    const symbol = this.getLevelSymbol(level);

    const levelColors: Record<LogLevel, string> = {
      debug: colors.cyan,
      info: colors.green,
      warn: colors.yellow,
      error: colors.red,
    };

    const linePrefix = `${colors.dim}│ ${levelColors[level]}${level.toUpperCase()}${colors.reset}`;
    const prefix = [
      `${symbol} ${timeTag} ${tags[level]} ${fileTag}`,
      '→'
    ];

    const consoleMethod = (console[level] as Console['log']) || console.log;
    consoleMethod(...prefix, message, ...args);
    consoleMethod(linePrefix);
  }
}
