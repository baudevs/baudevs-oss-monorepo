// libs/bauLogHero/src/lib/utils.ts
import { readFileSync, existsSync } from 'fs';

/**
 * getTimeString returns a function that when called returns the current ISO timestamp.
 */
export function getTimeString() {
  return () => {
    const now = new Date();
    return now.toISOString();
  };
}

/**
 * fileHasEnabledComment checks if the file at `filePath` contains
 * "// baudevs-logger-enabled" comment in the first few lines.
 */
export function fileHasEnabledComment(filePath: string): boolean {
  if (typeof window !== 'undefined') {
    // Client side can't read files
    return false;
  }
  if (!existsSync(filePath)) return false;

  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n').slice(0, 5);
    return lines.some(line => line.includes('// baudevs-logger-enabled'));
  } catch {
    return false;
  }
}

/**
 * parseJson5Like
 * A function that attempts to parse a JSON-like string with relaxed JSON5-like rules:
 * - Allows single-line (//) and multi-line (/* ... *\/) comments.
 * - Allows trailing commas in objects and arrays.
 * - Allows unquoted object keys (alphanumeric and underscore).
 *
 * NOTE: This is a heuristic-based parser. It transforms the input into valid JSON
 * and then uses JSON.parse. It won’t handle all JSON5 features perfectly, but covers common cases.
 */
export function parseJson5Like(input: string): unknown {
  // Remove single-line comments
  let withoutComments = input.replace(/\/\/[^\n]*\n/g, '\n');

  // Remove multi-line comments
  withoutComments = withoutComments.replace(/\/\*[\s\S]*?\*\//g, '');

  // Allow trailing commas in objects and arrays by removing them.
  withoutComments = withoutComments.replace(/,\s*([}\]])/g, '$1');

  // Allow unquoted keys (a simplified approach: keys that are word characters)
  // This converts something like { foo: "bar", baz: 123 } to { "foo": "bar", "baz": 123 }
  withoutComments = withoutComments.replace(
    /([{,]\s*)([A-Za-z0-9_]+)\s*:/g,
    '$1"$2":'
  );

  // Trim
  const trimmed = withoutComments.trim();

  return JSON.parse(trimmed);
}