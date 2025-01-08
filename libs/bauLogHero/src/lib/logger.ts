import type { LoggerConfig, LogEntry, LogContext } from '../types';
import { OutputHandler } from './output-handler';
import { SmartAnalyzer } from './smart-analysis';

interface AnalysisInsights {
  groups: Array<{
    id: string;
    pattern: string;
    entries: LogEntry[];
    frequency: number;
    firstSeen: Date;
    lastSeen: Date;
    severity: 'low' | 'medium' | 'high';
    context?: LogContext;
  }>;
  summary: string;
}

export class Logger {
  private config: LoggerConfig;
  private outputHandler: OutputHandler;
  private analyzer: SmartAnalyzer | null = null;

  constructor(config: LoggerConfig = {}) {
    this.config = config;
    this.outputHandler = new OutputHandler(config.output);

    if (config.smartAnalysis?.enabled) {
      this.analyzer = new SmartAnalyzer({
        groupingSimilarityThreshold: config.smartAnalysis.groupingSimilarityThreshold,
        timeWindowMinutes: config.smartAnalysis.timeWindowMinutes,
        maxGroups: config.smartAnalysis.maxGroups,
        minGroupSize: config.smartAnalysis.minGroupSize
      });
    }
  }

  log(message: unknown, ...args: unknown[]): void {
    this.logWithLevel('info', message, ...args);
  }

  debug(message: unknown, ...args: unknown[]): void {
    this.logWithLevel('debug', message, ...args);
  }

  info(message: unknown, ...args: unknown[]): void {
    this.logWithLevel('info', message, ...args);
  }

  warn(message: unknown, ...args: unknown[]): void {
    this.logWithLevel('warn', message, ...args);
  }

  error(message: unknown, ...args: unknown[]): void {
    this.logWithLevel('error', message, ...args);
  }

  getAnalysisInsights(): AnalysisInsights {
    if (!this.analyzer) {
      return {
        groups: [],
        summary: 'Smart analysis is not enabled. Enable it in the logger configuration.'
      };
    }
    return this.analyzer.getInsights();
  }

  private logWithLevel(level: 'debug' | 'info' | 'warn' | 'error', message: unknown, ...args: unknown[]): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      args,
      filename: this.config.name || 'unknown'
    };

    // Send to output handler
    this.outputHandler.log(level, this.config.name || 'unknown', message, ...args);

    // Send to analyzer if enabled
    if (this.analyzer) {
      this.analyzer.analyze(entry);
    }
  }
}

export function createLogger(config: LoggerConfig = {}): Logger {
  return new Logger(config);
}
