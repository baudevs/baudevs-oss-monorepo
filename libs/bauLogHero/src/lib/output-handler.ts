import type { LogLevel, OutputConfig, FileOutputConfig } from '../types';
import { getTimeString } from './utils';

// TypeScript declarations for File System Access API
declare global {
  interface Window {
    showSaveFilePicker(options?: {
      suggestedName?: string;
      types?: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
    }): Promise<FileSystemFileHandle>;
  }

  interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write(data: BufferSource | Blob | string): Promise<void>;
    close(): Promise<void>;
  }
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: unknown;
  args: unknown[];
  filename: string;
}

export class OutputHandler {
  private config: OutputConfig;
  private readonly isBrowser: boolean;
  #logBuffer: LogEntry[] = [];

  constructor(config: OutputConfig = {}) {
    this.isBrowser = typeof globalThis.window !== 'undefined';
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
    this.#logBuffer.push(entry);

    // Console output if enabled
    if (this.config.console) {
      // Console output is handled by the main logger classes
      return;
    }

    // File output if enabled
    if (this.config.file?.enabled) {
      await this.#handleFileOutput(entry);
    }
  }

  #stringifyWithDepth(obj: unknown, depth = 0): string {
    if (depth >= (this.config.maxDepth ?? 3)) {
      return '[Object]';
    }

    if (obj === null || obj === undefined) {
      return String(obj);
    }

    if (typeof obj !== 'object') {
      return String(obj);
    }

    if (Array.isArray(obj)) {
      return `[${obj.map(item => this.#stringifyWithDepth(item, depth + 1)).join(', ')}]`;
    }

    if (obj instanceof Error) {
      return `${obj.name}: ${obj.message}${obj.stack ? `\n${obj.stack}` : ''}`;
    }

    if (obj instanceof Map) {
      const entries = Array.from(obj.entries())
        .map(([key, value]) => `${String(key)} => ${this.#stringifyWithDepth(value, depth + 1)}`);
      return `Map(${entries.length}) { ${entries.join(', ')} }`;
    }

    if (obj instanceof Set) {
      const values = Array.from(obj.values())
        .map(value => this.#stringifyWithDepth(value, depth + 1));
      return `Set(${values.length}) { ${values.join(', ')} }`;
    }

    const entries = Object.entries(obj).map(([key, value]) =>
      `${key}: ${this.#stringifyWithDepth(value, depth + 1)}`
    );

    return this.config.prettyPrint
      ? `{\n  ${entries.join(',\n  ')}\n}`
      : `{ ${entries.join(', ')} }`;
  }

  async #handleFileOutput(entry: LogEntry): Promise<void> {
    const fileConfig = this.config.file as FileOutputConfig;
    const formattedEntry = this.#formatLogEntry(entry);

    if (this.isBrowser) {
      await this.#handleBrowserOutput(formattedEntry, fileConfig);
    } else {
      await this.#handleNodeOutput(formattedEntry, fileConfig);
    }
  }

  #formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, args, filename } = entry;

    if (this.config.file?.format === 'json') {
      return JSON.stringify({
        timestamp,
        level,
        message: this.#stringifyWithDepth(message),
        args: args.map(arg => this.#stringifyWithDepth(arg)),
        filename
      }, null, this.config.prettyPrint ? 2 : 0);
    }

    // Text format
    const formattedArgs = args.map(arg =>
      typeof arg === 'object' ? this.#stringifyWithDepth(arg) : String(arg)
    ).join(' ');

    return `[${timestamp}] ${level.toUpperCase()} [${filename}]: ${
      typeof message === 'object' ? this.#stringifyWithDepth(message) : message
    } ${formattedArgs}`;
  }

  async #handleBrowserOutput(formattedEntry: string, config: FileOutputConfig): Promise<void> {
    switch (config.browserFallback) {
      case 'download': {
        await this.#downloadLogs(formattedEntry);
        break;
      }
      case 'localStorage': {
        await this.#saveToLocalStorage(formattedEntry);
        break;
      }
      case 'console': {
        console.log('[File Log]', formattedEntry);
        break;
      }
      case 'none':
      default: {
        // Do nothing
        break;
      }
    }
  }

  async #handleNodeOutput(formattedEntry: string, config: FileOutputConfig): Promise<void> {
    try {
      const { mkdir, access, appendFile } = await import('node:fs/promises');
      const { join } = await import('node:path');

      const logDir = config.path ?? './logs';
      const logFile = join(logDir, 'app.log');

      // Ensure log directory exists
      try {
        await access(logDir);
      } catch {
        await mkdir(logDir, { recursive: true });
      }

      // Handle rotation if enabled
      if (config.rotation?.enabled) {
        await this.#handleFileRotation(logFile, formattedEntry, config);
      } else {
        await appendFile(logFile, formattedEntry + '\n');
      }
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  async #handleFileRotation(logFile: string, entry: string, config: FileOutputConfig): Promise<void> {
    try {
      const { access, stat, rename, readFile, writeFile, unlink } = await import('node:fs/promises');
      const maxSize = config.rotation?.maxSize ?? 5 * 1024 * 1024; // 5MB default

      try {
        const stats = await stat(logFile);
        if (stats.size + entry.length > maxSize) {
          const maxFiles = config.rotation?.maxFiles ?? 5;

          // Rotate files
          for (let i = maxFiles - 1; i >= 0; i--) {
            const oldFile = `${logFile}.${i}`;
            const newFile = `${logFile}.${i + 1}`;

            try {
              await access(oldFile);
              await rename(oldFile, newFile);
            } catch {
              // File doesn't exist, skip
            }
          }

          // Rename current log file
          try {
            await access(logFile);
            await rename(logFile, `${logFile}.0`);
          } catch {
            // File doesn't exist, skip
          }

          // Compress old logs if enabled
          if (config.rotation?.compress) {
            const { gzipSync } = await import('node:zlib');
            const oldLog = await readFile(`${logFile}.0`);
            const compressed = gzipSync(oldLog);
            await writeFile(`${logFile}.0.gz`, compressed);
            await unlink(`${logFile}.0`);
          }
        }
      } catch {
        // File doesn't exist yet
      }

      // Write new entry
      const { appendFile } = await import('node:fs/promises');
      await appendFile(logFile, entry + '\n');
    } catch (err) {
      console.error('Error rotating log files:', err);
    }
  }

  async #downloadLogs(entry: string): Promise<void> {
    this.#logBuffer.push(JSON.parse(entry));

    if (this.#logBuffer.length >= 100) { // Download every 100 entries
      const blob = new Blob([JSON.stringify(this.#logBuffer, null, 2)], {
        type: 'application/json'
      });

      // Use modern File System Access API if available
      try {
        if ('showSaveFilePicker' in window) {
          const handle = await window.showSaveFilePicker({
            suggestedName: `logs-${new Date().toISOString()}.json`,
            types: [{
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] }
            }]
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } else {
          // Fallback to legacy approach
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `logs-${new Date().toISOString()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.error('Failed to download logs:', err);
      }

      this.#logBuffer = [];
    }
  }

  async #saveToLocalStorage(entry: string): Promise<void> {
    try {
      const key = 'bauLogHero_logs';
      const maxEntries = 1000;

      // Use structured clone for deep cloning
      let logs = JSON.parse(localStorage.getItem(key) ?? '[]');
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
      return JSON.parse(localStorage.getItem('bauLogHero_logs') ?? '[]');
    } catch {
      return [];
    }
  }

  // Utility method to clear logs from localStorage
  static clearLogsFromStorage(): void {
    localStorage.removeItem('bauLogHero_logs');
  }
}
