import type { OutputConfig, LogLevel, Colors, LogEntry } from '../types';
import { colors } from '../types';
import { findRelevantEmoji } from './utils';
import { FileHandler } from './file-handler';

export class OutputHandler {
  private config: OutputConfig;
  private colors: Colors;
  private isNode: boolean;
  private fileHandler: FileHandler | null = null;

  constructor(config: OutputConfig = {}) {
    this.config = config;
    this.colors = colors;
    this.isNode = typeof window === 'undefined';

    if (this.isNode && config.file?.enabled && config.file.path) {
      this.fileHandler = new FileHandler(config.file);
    }
  }

  async log(level: LogLevel, source: string, message: unknown, ...args: unknown[]): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      args,
      filename: source
    };

    const consoleConfig = typeof this.config.console === 'boolean'
      ? { enabled: this.config.console }
      : this.config.console;

    if (consoleConfig?.enabled !== false) {
      this.consoleOutput(entry);
    }

    if (this.config.file?.enabled) {
      if (this.isNode && this.fileHandler) {
        await this.fileHandler.writeEntry(entry);
      } else {
        this.browserOutput(entry);
      }
    }
  }

  private consoleOutput(entry: LogEntry): void {
    const emoji = findRelevantEmoji(String(entry.message));
    const timestamp = this.colors.dim + `[${entry.timestamp}]` + this.colors.reset;
    const level = this.colorizeLevel(entry.level);
    const source = this.colors.cyan + `[${entry.filename}]` + this.colors.reset;

    console.log(`${emoji} ${timestamp} ${level} ${source} → ${entry.message}`);

    if (entry.args.length > 0) {
      const formattedArgs = this.formatArgs(entry.args);
      console.log(formattedArgs);
    }
  }

  private formatArgs(args: unknown[]): string {
    const consoleConfig = typeof this.config.console === 'boolean'
      ? { enabled: this.config.console }
      : this.config.console;

    const jsonConfig = consoleConfig?.formatJson;

    if (!jsonConfig?.enabled) {
      return JSON.stringify(args, null, 2);
    }

    return this.stringifyWithDepth(args, {
      indent: jsonConfig.indent ?? 2,
      maxDepth: jsonConfig.maxDepth ?? 3
    });
  }

  private stringifyWithDepth(obj: unknown, options: { indent: number; maxDepth: number }, currentDepth = 0): string {
    if (currentDepth > options.maxDepth) {
      return '"[Max Depth Reached]"';
    }

    if (typeof obj !== 'object' || obj === null) {
      return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
      const items = obj.map(item => this.stringifyWithDepth(item, options, currentDepth + 1));
      return `[\n${' '.repeat((currentDepth + 1) * options.indent)}${items.join(',\n' + ' '.repeat((currentDepth + 1) * options.indent))}\n${' '.repeat(currentDepth * options.indent)}]`;
    }

    const entries = Object.entries(obj).map(([key, value]) => {
      const formattedValue = this.stringifyWithDepth(value, options, currentDepth + 1);
      return `${' '.repeat((currentDepth + 1) * options.indent)}"${key}": ${formattedValue}`;
    });

    return `{\n${entries.join(',\n')}\n${' '.repeat(currentDepth * options.indent)}}`;
  }

  private colorizeLevel(level: LogLevel): string {
    const levelColors: Record<LogLevel, keyof Colors> = {
      debug: 'magenta',
      info: 'green',
      warn: 'yellow',
      error: 'red'
    };

    const color = this.colors[levelColors[level]];
    const resetColor = this.colors.reset;
    return `${color}${level.toUpperCase()}${resetColor}`;
  }

  private browserOutput(entry: LogEntry): void {
    const fallback = this.config.file?.browserFallback ?? 'console';

    switch (fallback) {
      case 'localStorage':
        this.localStorageOutput(entry);
        break;
      case 'download':
        this.downloadOutput(entry);
        break;
      case 'console':
        this.consoleOutput(entry);
        break;
      case 'none':
        // Do nothing
        break;
    }
  }

  private localStorageOutput(entry: LogEntry): void {
    try {
      const key = `baulog_${entry.timestamp}`;
      const value = JSON.stringify(entry);
      localStorage.setItem(key, value);

      // Implement rotation if needed
      this.rotateLocalStorage();
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
    }
  }

  private rotateLocalStorage(): void {
    const maxSize = 5 * 1024 * 1024; // 5MB default
    let totalSize = 0;
    const keys = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('baulog_')) {
        const value = localStorage.getItem(key) || '';
        totalSize += value.length * 2; // Approximate size in bytes
        keys.push(key);
      }
    }

    if (totalSize > maxSize) {
      // Remove oldest entries until under limit
      keys.sort().slice(0, Math.floor(keys.length * 0.2)).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }

  private downloadOutput(entry: LogEntry): void {
    const filename = `baulog_${entry.timestamp.replace(/[:.]/g, '-')}.jsonl`;
    const content = JSON.stringify(entry) + '\n';
    const blob = new Blob([content], { type: 'application/json-lines' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
