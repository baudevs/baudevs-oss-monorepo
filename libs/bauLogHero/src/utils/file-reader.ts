import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import type { LogEntry } from '../types';

/**
 * Read a log file line by line using streams (recommended for large files)
 */
export async function* readLogsStream(filePath: string): AsyncGenerator<LogEntry, void, unknown> {
  const fileStream = createReadStream(filePath);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        const entry = JSON.parse(line);
        yield entry;
      } catch (error) {
        console.warn(`Failed to parse log entry: ${line}`, error);
      }
    }
  }
}

/**
 * Read all logs from a file at once (for smaller files)
 */
export async function readLogsSync(filePath: string): Promise<LogEntry[]> {
  const content = await readFile(filePath, 'utf8');
  const entries: LogEntry[] = [];

  for (const line of content.split('\n')) {
    if (line.trim()) {
      try {
        const entry = JSON.parse(line);
        entries.push(entry);
      } catch (error) {
        console.warn(`Failed to parse log entry: ${line}`, error);
      }
    }
  }

  return entries;
}

/**
 * Read the last N lines from a log file
 */
export async function readLastLogs(filePath: string, count: number): Promise<LogEntry[]> {
  const entries: LogEntry[] = [];
  const fileStream = createReadStream(filePath);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const buffer: string[] = [];
  for await (const line of rl) {
    buffer.push(line);
    if (buffer.length > count) {
      buffer.shift();
    }
  }

  for (const line of buffer) {
    if (line.trim()) {
      try {
        const entry = JSON.parse(line);
        entries.push(entry);
      } catch (error) {
        console.warn(`Failed to parse log entry: ${line}`, error);
      }
    }
  }

  return entries;
}

/**
 * Read logs within a specific time range
 */
export async function readLogsInRange(
  filePath: string,
  startTime: Date,
  endTime: Date
): Promise<LogEntry[]> {
  const entries: LogEntry[] = [];
  const fileStream = createReadStream(filePath);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        const entry = JSON.parse(line) as LogEntry;
        const timestamp = new Date(entry.timestamp);
        if (timestamp >= startTime && timestamp <= endTime) {
          entries.push(entry);
        }
      } catch (error) {
        console.warn(`Failed to parse log entry: ${line}`, error);
      }
    }
  }

  return entries;
}
