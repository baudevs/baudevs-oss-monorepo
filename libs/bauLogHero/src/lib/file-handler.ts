import type { FileOutputConfig, LogEntry } from '../types';
import { mkdir, access, appendFile, stat, rename, readFile, writeFile, unlink, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { gzipSync } from 'node:zlib';

export class FileHandler {
  private config: FileOutputConfig;

  constructor(config: FileOutputConfig) {
    this.config = config;
  }

  async writeEntry(entry: LogEntry): Promise<void> {
    if (!this.config.path) {
      throw new Error('File output enabled but no path specified');
    }

    const formattedEntry = this.formatEntry(entry);
    const logDir = this.config.path;
    const logFile = join(logDir, 'app.jsonl');

    try {
      // Create directories if they don't exist
      await this.ensureDirectories(logDir);

      // Write entry
      await appendFile(logFile, formattedEntry + '\n');

      // Handle rotation if enabled
      if (this.config.rotation?.enabled) {
        await this.handleRotation(logFile, formattedEntry);
      }
    } catch (error) {
      console.error('Failed to write to log file:', error);
      throw error;
    }
  }

  private formatEntry(entry: LogEntry): string {
    if (this.config.format === 'json') {
      const logObject = {
        timestamp: entry.timestamp,
        level: entry.level,
        logger: entry.filename,
        message: entry.message,
        data: entry.args.length > 0 ? entry.args : undefined,
        metadata: {
          filename: entry.filename,
          pid: process.pid,
          hostname: process.env['HOSTNAME'] || 'unknown'
        }
      };
      return JSON.stringify(logObject);
    }

    // Text format
    const formattedArgs = entry.args
      .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
      .join(' ');

    return `[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.filename}]: ${
      typeof entry.message === 'object' ? JSON.stringify(entry.message) : entry.message
    } ${formattedArgs}`;
  }

  private async ensureDirectories(logDir: string): Promise<void> {
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
  }

  private async handleRotation(logFile: string, entry: string): Promise<void> {
    const maxSize = this.config.rotation?.maxSize ?? 5 * 1024 * 1024; // 5MB default
    const maxFiles = this.config.rotation?.maxFiles ?? 5;

    try {
      const stats = await stat(logFile);
      if (stats.size + entry.length > maxSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFile = `${logFile}.${timestamp}`;

        // Rename current log file
        await rename(logFile, rotatedFile);

        // Compress if enabled
        if (this.config.rotation?.compress) {
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
      }
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        // File doesn't exist yet, ignore
        return;
      }
      throw error;
    }
  }
}
