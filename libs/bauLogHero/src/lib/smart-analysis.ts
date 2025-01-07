import type { LogEntry, LogContext } from '../types';

interface LogGroup {
  id: string;
  pattern: string;
  entries: LogEntry[];
  frequency: number;
  firstSeen: Date;
  lastSeen: Date;
  severity: 'low' | 'medium' | 'high';
  context?: LogContext;
}

interface SmartAnalysisOptions {
  groupingSimilarityThreshold?: number; // 0-1, default 0.8
  timeWindowMinutes?: number; // default 60
  maxGroups?: number; // default 100
  minGroupSize?: number; // default 3
}

export class SmartAnalyzer {
  private groups: Map<string, LogGroup> = new Map();
  private options: Required<SmartAnalysisOptions>;
  private tokenCache: Map<string, string[]> = new Map();

  constructor(options: SmartAnalysisOptions = {}) {
    this.options = {
      groupingSimilarityThreshold: options.groupingSimilarityThreshold ?? 0.8,
      timeWindowMinutes: options.timeWindowMinutes ?? 60,
      maxGroups: options.maxGroups ?? 100,
      minGroupSize: options.minGroupSize ?? 3
    };
  }

  analyze(entry: LogEntry): void {
    const messageStr = this.getMessageString(entry.message);
    const tokens = this.tokenize(messageStr);
    let maxSimilarity = 0;
    let bestMatchGroup: LogGroup | null = null;

    // Find the best matching group
    for (const group of this.groups.values()) {
      const similarity = this.calculateSimilarity(tokens, this.tokenize(group.pattern));
      if (similarity > maxSimilarity && similarity >= this.options.groupingSimilarityThreshold) {
        maxSimilarity = similarity;
        bestMatchGroup = group;
      }
    }

    if (bestMatchGroup) {
      // Update existing group
      bestMatchGroup.entries.push(entry);
      bestMatchGroup.frequency++;
      bestMatchGroup.lastSeen = new Date();
      this.updateGroupContext(bestMatchGroup, entry);
    } else {
      // Create new group
      const newGroup: LogGroup = {
        id: crypto.randomUUID(),
        pattern: messageStr,
        entries: [entry],
        frequency: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        severity: this.calculateSeverity(entry),
        context: this.extractContext(entry)
      };
      this.groups.set(newGroup.id, newGroup);
    }

    // Cleanup old groups
    this.cleanupOldGroups();
  }

  getInsights(): {groups: LogGroup[], summary: string} {
    const activeGroups = Array.from(this.groups.values())
      .filter(group => group.entries.length >= this.options.minGroupSize)
      .sort((a, b) => b.frequency - a.frequency);

    const summary = this.generateSummary(activeGroups);

    return {
      groups: activeGroups,
      summary
    };
  }

  private getMessageString(message: unknown): string {
    if (typeof message === 'string') return message;
    if (message instanceof Error) return message.message;
    if (message === null) return 'null';
    if (message === undefined) return 'undefined';
    if (typeof message === 'object') {
      try {
        return JSON.stringify(message);
      } catch {
        return Object.prototype.toString.call(message);
      }
    }
    return String(message);
  }

  private tokenize(text: string): string[] {
    if (this.tokenCache.has(text)) {
      return this.tokenCache.get(text) ?? [];
    }

    // Remove timestamps, IDs, and other variable data
    const normalized = text
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, 'TIMESTAMP')
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, 'UUID')
      .replace(/\d+/g, 'NUMBER');

    const tokens = normalized
      .toLowerCase()
      .split(/[\s,.!?;:()[\]{}'"]+/)
      .filter(token => token.length > 0);

    this.tokenCache.set(text, tokens);
    return tokens;
  }

  private calculateSimilarity(tokens1: string[], tokens2: string[]): number {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  private calculateSeverity(entry: LogEntry): 'low' | 'medium' | 'high' {
    if (entry.level === 'error') return 'high';
    if (entry.level === 'warn') return 'medium';
    return 'low';
  }

  private extractContext(entry: LogEntry): LogContext {
    const context: LogContext = {};

    if (typeof entry.args[0] === 'object' && entry.args[0] !== null) {
      Object.assign(context, entry.args[0]);
    }

    // Extract common patterns (IPs, URLs, status codes, etc.)
    const message = this.getMessageString(entry.message);
    const ipMatch = message.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
    if (ipMatch) context['ip'] = ipMatch[0];

    const urlMatch = message.match(/https?:\/\/[^\s]+/);
    if (urlMatch) context['url'] = urlMatch[0];

    const statusCodeMatch = message.match(/\b\d{3}\b/);
    if (statusCodeMatch) context['statusCode'] = parseInt(statusCodeMatch[0]);

    return context;
  }

  private updateGroupContext(group: LogGroup, entry: LogEntry): void {
    const newContext = this.extractContext(entry);

    if (!group.context) {
      group.context = newContext;
      return;
    }

    // Merge contexts, keeping track of frequency for values
    for (const [key, value] of Object.entries(newContext)) {
      if (key in group.context) {
        const existing = group.context[key];
        if (Array.isArray(existing)) {
          if (!existing.includes(value)) {
            existing.push(value);
          }
        } else if (existing !== value) {
          group.context[key] = [existing, value];
        }
      } else {
        group.context[key] = value;
      }
    }
  }

  private cleanupOldGroups(): void {
    const cutoff = new Date(Date.now() - this.options.timeWindowMinutes * 60 * 1000);

    for (const [id, group] of this.groups) {
      if (group.lastSeen < cutoff || this.groups.size > this.options.maxGroups) {
        this.groups.delete(id);
      }
    }
  }

  private generateSummary(groups: LogGroup[]): string {
    const totalEvents = groups.reduce((sum, group) => sum + group.frequency, 0);
    const highSeverity = groups.filter(g => g.severity === 'high').length;
    const topPatterns = groups
      .slice(0, 3)
      .map(g => `"${g.pattern}" (${g.frequency} times)`);

    return [
      `Analyzed ${totalEvents} events in ${groups.length} groups.`,
      `Found ${highSeverity} high-severity patterns.`,
      'Top patterns:',
      ...topPatterns.map(p => `- ${p}`)
    ].join('\n');
  }
}
