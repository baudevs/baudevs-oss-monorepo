import type { LogLevel, OutputConfig, FileOutputConfig } from '../types';
import { getTimeString } from './utils';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: unknown;
  args: unknown[];
  filename: string;
}

export class OutputHandler {
  private config: OutputConfig;
  private isBrowser: boolean;
  private logBuffer: LogEntry[] = [];
  private currentFileSize = 0;
  private fileCount = 0;

  constructor(config: OutputConfig = {}) {
    this.isBrowser = typeof window !== 'undefined';
    this.config = {
      console: true,
      prettyPrint: true,
      maxDepth: 3,
      ...config
    };
  }

  async log(level: LogLevel, filename: string, message: unknown, ...args: unknown[]): Promise<void> {
    const entry: LogEntry = {
      timestamp: getTimeString()(),
      level,
      message,
      args,
      filename
    };

    // Always buffer the log entry
    this.logBuffer.push(entry);

    // Console output if enabled
    if (this.config.console) {
      // Console output is handled by the main logger classes
      return;
    }

    // File output if enabled
    if (this.config.file?.enabled) {
      await this.handleFileOutput(entry);
    }
  }

  private async handleFileOutput(entry: LogEntry): Promise<void> {
    const fileConfig = this.config.file as FileOutputConfig;
    const formattedEntry = this.formatLogEntry(entry);

    if (this.isBrowser) {
      await this.handleBrowserOutput(formattedEntry, fileConfig);
    } else {
      await this.handleNodeOutput(formattedEntry, fileConfig);
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, args, filename } = entry;

    if (this.config.file?.format === 'json') {
      return JSON.stringify({
        timestamp,
        level,
        message: this.stringifyWithDepth(message),
        args: args.map(arg => this.stringifyWithDepth(arg)),
        filename
      }, null, this.config.prettyPrint ? 2 : 0);
    }

    // Text format
    const formattedArgs = args.map(arg =>
      typeof arg === 'object' ? this.stringifyWithDepth(arg) : String(arg)
    ).join(' ');

    return `[${timestamp}] ${level.toUpperCase()} [${filename}]: ${
      typeof message === 'object' ? this.stringifyWithDepth(message) : message
    } ${formattedArgs}`;
  }

  private stringifyWithDepth(obj: unknown, depth = 0): string {
    if (depth >= (this.config.maxDepth || 3)) {
      return '[Object]';
    }

    if (typeof obj !== 'object' || obj === null) {
      return String(obj);
    }

    if (Array.isArray(obj)) {
      return `[${obj.map(item => this.stringifyWithDepth(item, depth + 1)).join(', ')}]`;
    }

    const entries = Object.entries(obj).map(([key, value]) =>
      `${key}: ${this.stringifyWithDepth(value, depth + 1)}`
    );

    return this.config.prettyPrint
      ? `{\n  ${entries.join(',\n  ')}\n}`
      : `{ ${entries.join(', ')} }`;
  }

  private async handleBrowserOutput(formattedEntry: string, config: FileOutputConfig): Promise<void> {
    switch (config.browserFallback) {
      case 'download':
        await this.downloadLogs(formattedEntry);
        break;
      case 'localStorage':
        this.saveToLocalStorage(formattedEntry);
        break;
      case 'console':
        console.log('[File Log]', formattedEntry);
        break;
      case 'none':
      default:
        // Do nothing
        break;
    }
  }

  private async handleNodeOutput(formattedEntry: string, config: FileOutputConfig): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      const logDir = config.path || './logs';
      const logFile = path.join(logDir, 'app.log');

      // Ensure log directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Handle rotation if enabled
      if (config.rotation?.enabled) {
        await this.handleFileRotation(logFile, formattedEntry, config);
      } else {
        fs.appendFileSync(logFile, formattedEntry + '\n');
      }
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  private async handleFileRotation(logFile: string, entry: string, config: FileOutputConfig): Promise<void> {
    const fs = require('fs');
    const maxSize = config.rotation?.maxSize || 5 * 1024 * 1024; // 5MB default

    try {
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.size + entry.length > maxSize) {
          const maxFiles = config.rotation?.maxFiles || 5;

          // Rotate files
          for (let i = maxFiles - 1; i >= 0; i--) {
            const oldFile = `${logFile}.${i}`;
            const newFile = `${logFile}.${i + 1}`;

            if (fs.existsSync(oldFile)) {
              fs.renameSync(oldFile, newFile);
            }
          }

          // Rename current log file
          if (fs.existsSync(logFile)) {
            fs.renameSync(logFile, `${logFile}.0`);
          }

          // Compress old logs if enabled
          if (config.rotation?.compress) {
            const zlib = require('zlib');
            const oldLog = fs.readFileSync(`${logFile}.0`);
            const compressed = zlib.gzipSync(oldLog);
            fs.writeFileSync(`${logFile}.0.gz`, compressed);
            fs.unlinkSync(`${logFile}.0`);
          }
        }
      }

      // Write new entry
      fs.appendFileSync(logFile, entry + '\n');
    } catch (err) {
      console.error('Error rotating log files:', err);
    }
  }

  private async downloadLogs(entry: string): Promise<void> {
    this.logBuffer.push(JSON.parse(entry));

    if (this.logBuffer.length >= 100) { // Download every 100 entries
      const blob = new Blob([JSON.stringify(this.logBuffer, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.logBuffer = [];
    }
  }

  private saveToLocalStorage(entry: string): void {
    try {
      const key = 'bauLogHero_logs';
      const maxEntries = 1000;

      let logs = JSON.parse(localStorage.getItem(key) || '[]');
      logs.push(JSON.parse(entry));

      // Keep only the last maxEntries
      if (logs.length > maxEntries) {
        logs = logs.slice(-maxEntries);
      }

      localStorage.setItem(key, JSON.stringify(logs));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  // Utility method to get logs from localStorage
  static getLogsFromStorage(): unknown[] {
    try {
      return JSON.parse(localStorage.getItem('bauLogHero_logs') || '[]');
    } catch {
      return [];
    }
  }

  // Utility method to clear logs from localStorage
  static clearLogsFromStorage(): void {
    localStorage.removeItem('bauLogHero_logs');
  }
}
