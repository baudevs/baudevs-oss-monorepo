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

/**
 * Interface for internal log entry structure
 * @internal
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: unknown;
  args: unknown[];
  filename: string;
}

/**
 * OutputHandler manages all log output operations for both browser and Node.js environments.
 * It provides consistent logging behavior across platforms with features like:
 * - JSON Lines format for structured logging
 * - File rotation with size limits
 * - Console output with JSON truncation
 * - Browser-specific fallbacks (download, localStorage, console)
 *
 * @example
 * ```typescript
 * const handler = new OutputHandler({
 *   console: {
 *     enabled: true,
 *     truncateJson: {
 *       enabled: true,
 *       firstLines: 4,
 *       lastLines: 4
 *     }
 *   },
 *   file: {
 *     enabled: true,
 *     path: './logs',
 *     format: 'json',
 *     rotation: {
 *       enabled: true,
 *       maxSize: 5 * 1024 * 1024,
 *       maxFiles: 5,
 *       compress: true
 *     }
 *   }
 * });
 * ```
 */
export class OutputHandler {
  private config: OutputConfig;
  private readonly isBrowser: boolean;
  #logBuffer: LogEntry[] = [];

  /**
   * Creates a new OutputHandler instance
   * @param config - Configuration options for the output handler
   */
  constructor(config: OutputConfig = {}) {
    this.isBrowser = typeof globalThis.window !== 'undefined';
    this.config = {
      console: {
        enabled: true,
        truncateJson: {
          enabled: true,
          firstLines: 4,
          lastLines: 4
        }
      },
      prettyPrint: true,
      maxDepth: 3,
      ...config
    };

    // Convert boolean console config to object
    if (typeof this.config.console === 'boolean') {
      this.config.console = {
        enabled: this.config.console,
        truncateJson: {
          enabled: true,
          firstLines: 4,
          lastLines: 4
        }
      };
    }
  }

  /**
   * Logs a message with the specified level and arguments
   * @param level - Log level ('debug', 'info', 'warn', 'error')
   * @param filename - Source filename for the log
   * @param message - Main log message
   * @param args - Additional arguments to log
   */
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
    const consoleConfig = typeof this.config.console === 'boolean'
      ? { enabled: this.config.console }
      : this.config.console;

    if (consoleConfig?.enabled) {
      const consoleMethod = (console[level] as Console['log']) || console.log;
      const formattedMessage = this.#formatConsoleMessage(entry);
      const truncatedArgs = args.map(arg =>
        this.#shouldTruncateJson(arg) ? this.#truncateJson(arg) : arg
      );
      consoleMethod(formattedMessage, ...truncatedArgs);
    }

    // File output if enabled
    if (this.config.file?.enabled) {
      await this.#handleFileOutput(entry);
    }
  }

  /**
   * Formats a log entry for console output with colors and symbols
   * @param entry - Log entry to format
   * @returns Formatted string with ANSI colors and emoji indicators
   * @internal
   */
  #formatConsoleMessage(entry: LogEntry): string {
    const { timestamp, level, filename } = entry;
    const levelSymbols: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };

    const levelColors: Record<LogLevel, string> = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m'  // red
    };

    const reset = '\x1b[0m';
    const dim = '\x1b[2m';
    const bright = '\x1b[1m';

    return `${levelSymbols[level]} ${dim}[${timestamp}]${reset} ${levelColors[level]}${level.toUpperCase()}${reset} ${bright}[${filename}]${reset} →`;
  }

  /**
   * Stringifies an object with depth limiting to prevent circular references
   * @param obj - Object to stringify
   * @param depth - Current depth level
   * @returns Stringified representation of the object
   * @internal
   */
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

    // For console output, check if we should truncate
    if (depth === 0 && this.#shouldTruncateJson(obj)) {
      return this.#truncateJson(obj);
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

  /**
   * Handles file output operations for both browser and Node.js
   * @param entry - Log entry to write
   * @internal
   */
  async #handleFileOutput(entry: LogEntry): Promise<void> {
    const fileConfig = this.config.file as FileOutputConfig;
    const formattedEntry = this.#formatLogEntry(entry);

    if (this.isBrowser) {
      await this.#handleBrowserOutput(formattedEntry, fileConfig);
    } else {
      await this.#handleNodeOutput(formattedEntry, fileConfig);
    }
  }

  /**
   * Formats a log entry as JSON Lines or text format
   * @param entry - Log entry to format
   * @returns Formatted string ready for output
   * @internal
   */
  #formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, args, filename } = entry;

    if (this.config.file?.format === 'json') {
      // Create a structured log entry
      const logObject = {
        timestamp,
        level,
        logger: filename,
        message: this.#stringifyWithDepth(message),
        data: args.length > 0 ? args.map(arg => this.#stringifyWithDepth(arg)) : undefined,
        metadata: {
          filename,
          pid: process.pid,
          hostname: process.env['HOSTNAME'] || 'unknown'
        }
      };

      // For JSON Lines format, we don't use pretty print - one line per entry
      return JSON.stringify(logObject);
    }

    // Text format
    const formattedArgs = args.map(arg =>
      typeof arg === 'object' ? this.#stringifyWithDepth(arg) : String(arg)
    ).join(' ');

    return `[${timestamp}] ${level.toUpperCase()} [${filename}]: ${
      typeof message === 'object' ? this.#stringifyWithDepth(message) : message
    } ${formattedArgs}`;
  }

  /**
   * Handles browser-specific output operations (download, localStorage, console)
   * @param formattedEntry - Formatted log entry
   * @param config - File output configuration
   * @internal
   */
  async #handleBrowserOutput(formattedEntry: string, config: FileOutputConfig): Promise<void> {
    switch (config.browserFallback) {
      case 'download': {
        // Write immediately instead of batching
        const blob = new Blob([formattedEntry + '\n'], {
          type: 'application/x-ndjson'  // Use proper MIME type for JSON Lines
        });

        try {
          if ('showSaveFilePicker' in window) {
            // Use .jsonl extension to match Node.js
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const handle = await window.showSaveFilePicker({
              suggestedName: `app.${timestamp}.jsonl`,
              types: [{
                description: 'JSON Lines Files',
                accept: { 'application/x-ndjson': ['.jsonl'] }
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
            a.download = `app.${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        } catch (err) {
          console.error('Failed to download log:', err);
        }
        break;
      }
      case 'localStorage': {
        await this.#saveToLocalStorage(formattedEntry);
        break;
      }
      case 'console': {
        // Match Node.js format
        console.log(formattedEntry);
        break;
      }
      case 'none':
      default: {
        // Do nothing
        break;
      }
    }
  }

  /**
   * Handles Node.js-specific file output operations
   * @param formattedEntry - Formatted log entry
   * @param config - File output configuration
   * @internal
   */
  async #handleNodeOutput(formattedEntry: string, config: FileOutputConfig): Promise<void> {
    try {
      const { mkdir, access, appendFile } = await import('node:fs/promises');
      const { join, dirname } = await import('node:path');

      const logDir = config.path ?? './logs';
      const logFile = join(logDir, 'app.jsonl');  // Using .jsonl extension

      // Create directories
      try {
        await access(dirname(logDir));
      } catch {
        await mkdir(dirname(logDir), { recursive: true });
      }
      try {
        await access(logDir);
      } catch {
        await mkdir(logDir, { recursive: true });
      }

      // Write entry
      await appendFile(logFile, formattedEntry + '\n');

      // Handle rotation
      if (config.rotation?.enabled) {
        await this.#handleFileRotation(logFile, formattedEntry, config);
      }
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  /**
   * Handles log file rotation based on size limits
   * @param logFile - Path to the log file
   * @param entry - New log entry to be written
   * @param config - File output configuration
   * @internal
   */
  async #handleFileRotation(logFile: string, entry: string, config: FileOutputConfig): Promise<void> {
    try {
      const { access, stat, rename, readFile, writeFile, unlink, readdir } = await import('node:fs/promises');
      const { join, dirname } = await import('node:path');
      const maxSize = config.rotation?.maxSize ?? 5 * 1024 * 1024; // 5MB default
      const maxFiles = config.rotation?.maxFiles ?? 5;

      try {
        const stats = await stat(logFile);
        if (stats.size + entry.length > maxSize) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const rotatedFile = `${logFile}.${timestamp}`;

          // Rename current log file
          try {
            await access(logFile);
            await rename(logFile, rotatedFile);

            // Compress if enabled
            if (config.rotation?.compress) {
              const { gzipSync } = await import('node:zlib');
              const oldLog = await readFile(rotatedFile);
              const compressed = gzipSync(oldLog);
              await writeFile(`${rotatedFile}.gz`, compressed);
              await unlink(rotatedFile);
            }

            // Clean up old files
            const dir = dirname(logFile);
            const baseFile = logFile.split('/').pop() || '';
            const files = (await readdir(dir))
              .filter(f => f.startsWith(baseFile) && f !== baseFile)
              .sort()
              .reverse();

            // Remove excess files
            for (let i = maxFiles - 1; i < files.length; i++) {
              await unlink(join(dir, files[i]));
            }
          } catch (err) {
            console.error('Error rotating log file:', err);
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // File doesn't exist yet, ignore
      }
    } catch (err) {
      console.error('Error in file rotation:', err);
    }
  }

  /**
   * Saves a log entry to localStorage with size-based rotation
   * @param entry - Log entry to save
   * @internal
   */
  async #saveToLocalStorage(entry: string): Promise<void> {
    try {
      const key = 'bauLogHero_logs';
      const maxSize = 5 * 1024 * 1024; // 5MB like Node.js default

      // Get current logs
      const currentLogs = localStorage.getItem(key) ?? '';
      const newContent = currentLogs + entry + '\n';

      // Implement size-based rotation like Node.js
      if (newContent.length > maxSize) {
        // Remove old entries until we're under maxSize
        const lines = currentLogs.split('\n').filter(Boolean);
        while (lines.join('\n').length + entry.length + 1 > maxSize) {
          lines.shift();
        }
        localStorage.setItem(key, lines.join('\n') + '\n' + entry + '\n');
      } else {
        localStorage.setItem(key, newContent);
      }
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  /**
   * Retrieves all logs from localStorage
   * @returns String containing all logs in JSON Lines format
   */
  static getLogsFromStorage(): string {
    try {
      return localStorage.getItem('bauLogHero_logs') ?? '';
    } catch {
      return '';
    }
  }

  /**
   * Clears all logs from localStorage
   */
  static clearLogsFromStorage(): void {
    localStorage.removeItem('bauLogHero_logs');
  }

  /**
   * Determines if a value should be truncated in console output
   * @param value - Value to check
   * @returns True if the value should be truncated
   * @internal
   */
  #shouldTruncateJson(value: unknown): boolean {
    const consoleConfig = typeof this.config.console === 'boolean'
      ? { enabled: this.config.console }
      : this.config.console;

    return !!(
      consoleConfig?.truncateJson?.enabled &&
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Error) &&
      !(value instanceof Map) &&
      !(value instanceof Set)
    );
  }

  /**
   * Truncates a JSON string to show only the first and last N lines
   * @param obj - Object to truncate
   * @returns Truncated JSON string
   * @internal
   */
  #truncateJson(obj: unknown): string {
    const consoleConfig = typeof this.config.console === 'boolean'
      ? { enabled: this.config.console }
      : this.config.console;

    const firstLines = consoleConfig?.truncateJson?.firstLines ?? 4;
    const lastLines = consoleConfig?.truncateJson?.lastLines ?? 4;

    const jsonString = JSON.stringify(obj, null, 2);
    const lines = jsonString.split('\n');

    if (lines.length <= firstLines + lastLines + 1) {
      return jsonString;
    }

    const truncatedLines = [
      ...lines.slice(0, firstLines),
      '  ...',
      ...lines.slice(-lastLines)
    ];

    return truncatedLines.join('\n');
  }
}
