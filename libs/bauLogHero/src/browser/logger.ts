import type { LoggerConfig, LogLevel, TagReturn } from '../types';
import { colors } from '../types';

export class BrowserLogger {
  private config: LoggerConfig;
  private readonly filename: string;
  private enabled: boolean;

  constructor(filename: string, enabled: boolean) {
    this.config = { level: 'info', enabled: true };
    this.filename = filename;
    this.enabled = enabled;

    if (this.enabled && process.env['NODE_ENV'] !== 'test') {
      const timeString = new Date().toISOString();
      console.log(
        `%cBaudevsLogger initialized for ${this.filename} at ${timeString}`,
        'color: blue; font-weight: bold;'
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
    const symbol = this.getLevelSymbol(level);
    const levelText = level.toUpperCase();

    const prefix = [
      `${symbol} %c${timestamp}%c ${levelText} %c${this.filename}%c → `,
      'background:white; color:black; font-weight:bold;',
      '',
      'background:blue; color:white; font-weight:bold;',
      ''
    ];

    const consoleMethod = (console[level] as Console['log']) || console.log;
    consoleMethod(...prefix, message, ...args);
  }
}
