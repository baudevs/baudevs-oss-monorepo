// libs/bauLogHero/src/lib/utils.ts

import type { LoggerConfig } from '../types';

export const getTimeString = (config?: Pick<LoggerConfig, 'timestampFormat'>) => {
  return () => {
    const now = new Date();

    switch (config?.timestampFormat) {
      case 'short':
        return now.toLocaleTimeString();
      case 'none':
        return '';
      case 'iso':
      default:
        return now.toISOString();
    }
  };
};

export const ensureError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(String(error));
};

export const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

export const formatBytes = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)}${units[unitIndex]}`;
};

interface EmojiPattern {
  emoji: string;
  patterns: string[];
  score: number;
}

const emojiPatterns: EmojiPattern[] = [
  // Development & System
  { emoji: '🚀', patterns: ['start', 'launch', 'init', 'boot'], score: 1 },
  { emoji: '⚡️', patterns: ['performance', 'speed', 'fast', 'optimize'], score: 1 },
  { emoji: '🔄', patterns: ['sync', 'update', 'refresh', 'reload'], score: 1 },
  { emoji: '🔧', patterns: ['config', 'setup', 'tool', 'setting'], score: 1 },
  { emoji: '🏗️', patterns: ['build', 'construct', 'create'], score: 1 },

  // Data & Analysis
  { emoji: '📊', patterns: ['analyze', 'report', 'stats', 'metrics'], score: 1 },
  { emoji: '📈', patterns: ['increase', 'growth', 'improve'], score: 1 },
  { emoji: '📉', patterns: ['decrease', 'drop', 'reduce'], score: 1 },
  { emoji: '🔍', patterns: ['search', 'find', 'look', 'seek'], score: 1 },

  // Status & Results
  { emoji: '✅', patterns: ['success', 'complete', 'done', 'finish'], score: 1 },
  { emoji: '❌', patterns: ['error', 'fail', 'crash', 'invalid'], score: 1 },
  { emoji: '⚠️', patterns: ['warning', 'caution', 'notice'], score: 1 },
  { emoji: '🎯', patterns: ['target', 'goal', 'aim'], score: 1 },

  // Files & Data
  { emoji: '📁', patterns: ['file', 'folder', 'directory'], score: 1 },
  { emoji: '📝', patterns: ['write', 'edit', 'modify', 'change'], score: 1 },
  { emoji: '🗑️', patterns: ['delete', 'remove', 'clean'], score: 1 },
  { emoji: '📦', patterns: ['package', 'bundle', 'module'], score: 1 },

  // Network & API
  { emoji: '🌐', patterns: ['network', 'web', 'http', 'api'], score: 1 },
  { emoji: '🔌', patterns: ['connect', 'socket', 'plugin'], score: 1 },
  { emoji: '📡', patterns: ['send', 'receive', 'transmit'], score: 1 },

  // Security & Access
  { emoji: '🔐', patterns: ['secure', 'encrypt', 'auth', 'login'], score: 1 },
  { emoji: '🔑', patterns: ['key', 'token', 'password', 'credential'], score: 1 },
  { emoji: '👤', patterns: ['user', 'account', 'profile'], score: 1 },

  // Git & Version Control
  { emoji: '🔀', patterns: ['merge', 'branch', 'git'], score: 1 },
  { emoji: '📌', patterns: ['version', 'tag', 'release'], score: 1 },
  { emoji: '🔖', patterns: ['commit', 'save', 'checkpoint'], score: 1 },

  // Testing & Quality
  { emoji: '🧪', patterns: ['test', 'check', 'verify'], score: 1 },
  { emoji: '🐛', patterns: ['bug', 'debug', 'issue'], score: 1 },
  { emoji: '🧹', patterns: ['lint', 'clean', 'format'], score: 1 }
];

export function findRelevantEmoji(text: string): string {
  // Default emoji if no match is found
  const defaultEmoji = 'ℹ️';

  if (!text) return defaultEmoji;

  // Convert text to lowercase for matching
  const lowerText = text.toLowerCase();

  // Calculate scores for each emoji based on pattern matches
  const scores = emojiPatterns.map(pattern => {
    let score = 0;

    // Check for exact matches
    pattern.patterns.forEach(p => {
      if (lowerText.includes(p)) {
        score += pattern.score * 2; // Exact matches get double score
      }

      // Check for partial matches (e.g., "updating" matches "update")
      if (lowerText.includes(p.slice(0, -1))) {
        score += pattern.score;
      }
    });

    return {
      emoji: pattern.emoji,
      score
    };
  });

  // Sort by score and get the highest scoring emoji
  const bestMatch = scores.sort((a, b) => b.score - a.score)[0];

  // Return default emoji if no good matches found
  return bestMatch.score > 0 ? bestMatch.emoji : defaultEmoji;
}
