export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type TimestampFormat = 'iso' | 'short' | 'none';
export type TagReturn = string | [string, string];

export interface JsonFormatConfig {
  enabled?: boolean;
  indent?: number;
  maxDepth?: number;
}

export interface CIConfig {
  enabled?: boolean;
  minLevel?: LogLevel;
  filterPatterns?: string[];
  showFullObjects?: boolean;
  truncateLength?: number;
  excludeMetadata?: boolean;
  formatJson?: JsonFormatConfig;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: unknown;
  args: unknown[];
  filename: string;
}

export interface LogContext {
  ip?: string;
  url?: string;
  statusCode?: number;
  [key: string]: unknown;
}

export interface RotationConfig {
  enabled?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  compress?: boolean;
}

export interface FileOutputConfig {
  enabled?: boolean;
  path?: string;
  format?: 'json' | 'text';
  browserFallback?: 'download' | 'localStorage' | 'console' | 'none';
  rotation?: RotationConfig;
}

export interface OutputConfig {
  console?: boolean | {
    enabled?: boolean;
    truncateJson?: {
      enabled?: boolean;
      firstLines?: number;
      lastLines?: number;
    };
    formatJson?: JsonFormatConfig;
  };
  file?: FileOutputConfig;
  prettyPrint?: boolean;
  maxDepth?: number;
  ci?: CIConfig;
}

export interface LoggerConfig {
  name?: string;
  level?: LogLevel;
  timestamp?: boolean;
  timestampFormat?: TimestampFormat;
  output?: OutputConfig;
  smartAnalysis?: {
    enabled?: boolean;
    groupingSimilarityThreshold?: number;
    timeWindowMinutes?: number;
    maxGroups?: number;
    minGroupSize?: number;
  };
}

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
