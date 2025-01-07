import type { LoggerConfig, LogLevel, TagReturn } from '../types';
import { colors } from '../types';

export class BrowserLogger {
  private config: LoggerConfig;
  private readonly filename: string;

  constructor(filename: string, config: LoggerConfig) {
    this.config = config;
    this.filename = filename;
    const isEnabled = config.output?.console ?? true;

    if (isEnabled && process.env['NODE_ENV'] !== 'test') {
      const timeString = new Date().toISOString();
      console.log(
        '%cBaudevsLogger initialized for %s at %s',
        'color: blue; font-weight: bold;',
        filename,
        timeString
      );
    }
  }

  private createTag(text: string, bgColor: string, textColor: string = colors.black): TagReturn {
    const bgCSS = bgColor.includes('41') ? 'background: red;' :
                 bgColor.includes('42') ? 'background: green;' :
                 bgColor.includes('43') ? 'background: yellow;' :
                 bgColor.includes('44') ? 'background: blue;' :
                 bgColor.includes('45') ? 'background: magenta;' :
                 bgColor.includes('46') ? 'background: cyan;' :
                 bgColor.includes('47') ? 'background: white; color: black;' :
                 'background: gray;';

    const txtCSS = textColor.includes('37') ? 'color: white;' :
                  textColor.includes('30') ? 'color: black;' : 'color: black;';

    return [`%c ${text} `, `${bgCSS}${txtCSS} font-weight: bold;`];
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
    const symbol = this.getLevelSymbol(level);
    const levelText = level.toUpperCase();

    const prefix = [
      `${symbol} ${this.config.timestamp ? `%c${formattedTimestamp}%c ` : ''}${levelText} %c${this.filename}%c → `,
      ...(this.config.timestamp ? ['background:white; color:black; font-weight:bold;', ''] : []),
      'background:blue; color:white; font-weight:bold;',
      ''
    ];

    const consoleMethod = (console[level] as Console['log']) || console.log;
    consoleMethod(...prefix, message, ...args);
  }
}
