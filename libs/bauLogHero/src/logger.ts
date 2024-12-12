// libs/bauLogHero/src/logger.ts

import { getTimeString, fileHasEnabledComment, parseJson5Like } from '@/lib/utils';
import { readFileSync, existsSync } from 'fs';

const colors = {
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

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type TagReturn = string | [string, string];

class BaudevsLogger {
  private enabled: boolean;
  private filename: string;
  private isBrowser = typeof window !== 'undefined';
  private config: { level?: LogLevel } = {};

  constructor(filename: string, enabled: boolean) {
    this.filename = filename;
    this.enabled = enabled;

    // Load config if exists
    if (!this.isBrowser) {
      const configFilePath = filename.replace(/\.ts$/, '.config.json5');
      if (existsSync(configFilePath)) {
        const rawConfig = readFileSync(configFilePath, 'utf8');
        try {
          this.config = parseJson5Like(rawConfig) as unknown as { level?: LogLevel };
        } catch {
          // Ignore config parse errors
        }
      }
    }

    // Only print initialization outside of test environment
    if (this.enabled && process.env['NODE_ENV'] !== 'test') {
      const timeString = getTimeString();
      const initMessage = this.buildInitMessage(timeString());
      if (initMessage) {
        console.log(...initMessage);
      }
    }
  }

  private buildInitMessage(timeStr: string): string[] {
    const fileTag = this.createTag(this.filename, colors.bgBlue, colors.white);

    if (this.isBrowser) {
      return [
        `%cBaudevsLogger initialized for ${this.filename} at ${timeStr}`,
        'color: blue; font-weight: bold;'
      ];
    }

    return [
      `${colors.cyan}╔════════════════════════════════════════════`,
      `║ ${fileTag}`,
      `║ BaudevsLogger started at ${timeStr}`,
      `╚════════════════════════════════════════════${colors.reset}`
    ];
  }

  private createTag(text: string, bgColor: string, textColor: string = colors.black): TagReturn {
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

    return `${bgColor}${textColor} ${text} ${colors.reset}`;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  log(message: unknown, ...args: unknown[]) {
    this.log_messages(message, 'info', ...args);
  }

  debug(message: unknown, ...args: unknown[]) {
    this.log_messages(message, 'debug', ...args);
  }

  info(message: unknown, ...args: unknown[]) {
    this.log_messages(message, 'info', ...args);
  }

  warn(message: unknown, ...args: unknown[]) {
    this.log_messages(message, 'warn', ...args);
  }

  error(message: unknown, ...args: unknown[]) {
    this.log_messages(message, 'error', ...args);
  }

  private getLevelSymbol(level: LogLevel): string {
    const symbols = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };
    return symbols[level];
  }

  private log_messages(message: unknown, level: LogLevel = 'info', ...args: unknown[]) {
    if (!this.enabled) return;

    const order = ['debug', 'info', 'warn', 'error'];
    const configLevel = this.config.level || 'debug'; 
    if (order.indexOf(level) < order.indexOf(configLevel)) return;

    const timestamp = getTimeString()();
    const tags = {
      debug: this.createTag('DEBUG', colors.bgCyan, colors.black),
      info: this.createTag('INFO', colors.bgGreen, colors.black),
      warn: this.createTag('WARN', colors.bgYellow, colors.black),
      error: this.createTag('ERROR', colors.bgRed, colors.white),
    };

    const fileTag = this.createTag(this.filename, colors.bgBlue, colors.white);
    const timeTag = this.createTag(timestamp, colors.bgWhite, colors.black);
    const symbol = this.getLevelSymbol(level);

    let prefix: string[] = [];
    let levelLine: string[] = [];

    if (this.isBrowser) {
      const levelText = level.toUpperCase();
      prefix = [
        `${symbol} %c${timestamp}%c ${levelText} %c${this.filename}%c → `,
        'background:white; color:black; font-weight:bold;',
        '',
        'background:blue; color:white; font-weight:bold;',
        ''
      ];
      levelLine = [];
    } else {
      const levelColors = {
        debug: colors.cyan,
        info: colors.green,
        warn: colors.yellow,
        error: colors.red,
      };
      const linePrefix = `${colors.dim}│ ${levelColors[level]}${level.toUpperCase()}${colors.reset}`;
      const resolveTag = (tag: TagReturn) =>
        Array.isArray(tag) ? tag[0].replace(/%c\s?/, '') : tag;

      prefix = [
        `${symbol} ${resolveTag(timeTag)} ${resolveTag(tags[level])} ${resolveTag(fileTag)}`,
        '→'
      ];
      levelLine = [linePrefix];
    }

    const consoleMethod = console[level] || console.log;
    consoleMethod(...prefix, message, ...args);
    if (levelLine.length > 0) {
      consoleMethod(...levelLine);
    }
  }
}

export const createBaudevsLogger = (filename: string): BaudevsLogger => {
  const enabled = fileHasEnabledComment(filename);
  return new BaudevsLogger(filename, enabled);
};