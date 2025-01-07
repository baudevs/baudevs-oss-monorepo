// libs/bauLogHero/src/logger.ts

import { getTimeString } from './lib/utils';
import type { LoggerConfig, LogLevel } from './types';

export type TagReturn = string | [string, string];

export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  white: '\x1b[37m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bgRed: '\x1b[41;1m',
  bgGreen: '\x1b[42;1m',
  bgYellow: '\x1b[43;1m',
  bgBlue: '\x1b[44;1m',
  bgMagenta: '\x1b[45;1m',
  bgCyan: '\x1b[46;1m',
  bgWhite: '\x1b[47;1m',
} as const;

export type Colors = typeof colors;

export class BaudevsLoggerInstance {
  private readonly isBrowser: boolean;
  private config: LoggerConfig;
  private readonly filename: string;

  constructor(filename: string, config?: Partial<LoggerConfig>) {
    this.isBrowser = typeof window !== 'undefined';
    this.config = {
      level: 'info',
      timestamp: true,
      timestampFormat: 'iso',
      output: {
        console: true,
        file: {
          enabled: false,
          format: 'text',
          browserFallback: this.isBrowser ? 'console' : undefined
        }
      },
      ...config
    };
    this.filename = filename;

    // Only print initialization outside of test environment
    if (this.config.output?.console && process.env['NODE_ENV'] !== 'test') {
      const timeString = getTimeString();
      const initMessage = this.buildInitMessage(timeString());
      if (initMessage) {
        console.log(...initMessage);
      }
    }
  }

  private buildInitMessage(timeStr: string): string[] {
    const fileTag = this.createTag(this.filename, colors['bgBlue'], colors['white']);

    if (this.isBrowser) {
      return [
        `%cBaudevsLogger initialized for ${this.filename} at ${timeStr}`,
        'color: blue; font-weight: bold;'
      ];
    }

    return [
      `${colors['cyan']}╔════════════════════════════════════════════`,
      `║ ${fileTag}`,
      `║ BaudevsLogger started at ${timeStr}`,
      `╚════════════════════════════════════════════${colors['reset']}`
    ];
  }

  private createTag(text: string, bgColor: string, textColor: string = colors['black']): TagReturn {
    if (this.isBrowser) {
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

    return `${bgColor}${textColor} ${text} ${colors['reset']}`;
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

    const timestamp = getTimeString()();
    const formattedTimestamp = this.formatTimestamp(timestamp);
    const tags: Record<LogLevel, TagReturn> = {
      debug: this.createTag('DEBUG', colors['bgCyan'], colors['black']),
      info: this.createTag('INFO', colors['bgGreen'], colors['black']),
      warn: this.createTag('WARN', colors['bgYellow'], colors['black']),
      error: this.createTag('ERROR', colors['bgRed'], colors['white']),
    };

    const fileTag = this.createTag(this.filename, colors['bgBlue'], colors['white']);
    const timeTag = this.config.timestamp ? this.createTag(formattedTimestamp, colors['bgWhite'], colors['black']) : '';
    const symbol = this.getLevelSymbol(level);

    let prefix: string[] = [];
    let levelLine: string[] = [];

    if (this.isBrowser) {
      const levelText = level.toUpperCase();
      prefix = [
        `${symbol} ${this.config.timestamp ? `%c${formattedTimestamp}%c ` : ''}${levelText} %c${this.filename}%c → `,
        ...(this.config.timestamp ? ['background:white; color:black; font-weight:bold;', ''] : []),
        'background:blue; color:white; font-weight:bold;',
        ''
      ];
    } else {
      const levelColors: Record<LogLevel, string> = {
        debug: colors['cyan'],
        info: colors['green'],
        warn: colors['yellow'],
        error: colors['red'],
      };
      const linePrefix = `${colors['dim']}│ ${levelColors[level]}${level.toUpperCase()}${colors['reset']}`;
      const resolveTag = (tag: TagReturn): string =>
        Array.isArray(tag) ? tag[0].replace(/%c\s?/, '') : tag;

      prefix = [
        `${symbol} ${this.config.timestamp ? `${resolveTag(timeTag)} ` : ''}${resolveTag(tags[level])} ${resolveTag(fileTag)}`,
        '→'
      ];
      levelLine = [linePrefix];
    }

    const consoleMethod = (console[level] as Console['log']) || console.log;
    consoleMethod(...prefix, message, ...args);
    if (levelLine.length > 0) {
      consoleMethod(...levelLine);
    }
  }
}


