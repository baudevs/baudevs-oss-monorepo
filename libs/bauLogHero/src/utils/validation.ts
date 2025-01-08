import type { LogLevel, LogEntry } from '../types';

const validLogLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

export function isValidLogLevel(level: unknown): level is LogLevel {
  return typeof level === 'string' && validLogLevels.includes(level as LogLevel);
}

export function validateLogEntry(entry: unknown): entry is LogEntry {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const { timestamp, level, message, args, filename } = entry as Partial<LogEntry>;

  return (
    typeof timestamp === 'string' &&
    isValidLogLevel(level) &&
    message !== undefined &&
    Array.isArray(args) &&
    typeof filename === 'string'
  );
}

export function validateStructuredLog(message: unknown, data?: unknown): {
  isValid: boolean;
  error?: string;
} {
  // Message should be a string for structured logging
  if (typeof message !== 'string') {
    return {
      isValid: false,
      error: 'Message must be a string for structured logging'
    };
  }

  // If data is provided, it should be an object
  if (data !== undefined && (typeof data !== 'object' || data === null)) {
    return {
      isValid: false,
      error: 'Data must be an object for structured logging'
    };
  }

  // Check for template literals in message (anti-pattern)
  if (message.includes('${')) {
    return {
      isValid: false,
      error: 'Avoid using template literals in log messages. Use structured logging instead.'
    };
  }

  return { isValid: true };
}

export function validateLogContext(context: unknown): {
  isValid: boolean;
  error?: string;
} {
  if (!context || typeof context !== 'object') {
    return {
      isValid: false,
      error: 'Context must be an object'
    };
  }

  // Check for common fields that should be strings
  const { ip, url, method, path } = context as Record<string, unknown>;

  if (ip !== undefined && typeof ip !== 'string') {
    return {
      isValid: false,
      error: 'IP address must be a string'
    };
  }

  if (url !== undefined && typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL must be a string'
    };
  }

  if (method !== undefined && typeof method !== 'string') {
    return {
      isValid: false,
      error: 'HTTP method must be a string'
    };
  }

  if (path !== undefined && typeof path !== 'string') {
    return {
      isValid: false,
      error: 'Path must be a string'
    };
  }

  return { isValid: true };
}
