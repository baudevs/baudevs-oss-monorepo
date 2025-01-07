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
