// libs/bauLogHero/src/lib/utils.ts

export interface LoggerConfig {
  level?: 'debug' | 'info' | 'warn' | 'error';
  enabled: boolean;
}

const defaultConfig: LoggerConfig = {
  level: 'info',
  enabled: true
};

export function setLoggerConfig(config: Partial<LoggerConfig>): void {
  Object.assign(defaultConfig, config);
}

export function getLoggerConfig(): LoggerConfig {
  return { ...defaultConfig };
}

/**
 * getTimeString returns a function that when called returns the current ISO timestamp.
 */
export function getTimeString(): () => string {
  return () => {
    const now = new Date();
    return now.toISOString();
  };
}

/**
 * fileHasEnabledComment checks if the file at `filePath` contains
 * "// baudevs-logger-enabled" comment in the first few lines.
 * Only works in Node.js environment.
 */
export function fileHasEnabledComment(filePath: string): boolean {
  // In browser environments, use the config
  if (typeof window !== 'undefined') {
    return defaultConfig.enabled;
  }

  // In Node.js environment, try to read the file
  try {
    // Dynamically import fs only in Node environment
    const fs = require('fs');
    if (!fs.existsSync(filePath)) return defaultConfig.enabled;

    const content = fs.readFileSync(filePath, 'utf8').toString();
    const lines = content.split('\n').slice(0, 5);
    return lines.some((line: string): boolean => line.includes('// baudevs-logger-enabled'));
  } catch {
    return defaultConfig.enabled;
  }
}

/**
 * parseJson5Like
 * A function that attempts to parse a JSON-like string with relaxed JSON5-like rules.
 */
export function parseJson5Like(input: string): unknown {
  // Remove single-line comments
  let withoutComments = input.replace(/\/\/[^\n]*\n/g, '\n');

  // Remove multi-line comments
  withoutComments = withoutComments.replace(/\/\*[\s\S]*?\*\//g, '');

  // Allow trailing commas in objects and arrays
  withoutComments = withoutComments.replace(/,\s*([}\]])/g, '$1');

  // Allow unquoted keys
  withoutComments = withoutComments.replace(
    /([{,]\s*)([A-Za-z0-9_]+)\s*:/g,
    '$1"$2":'
  );

  return JSON.parse(withoutComments.trim());
}
