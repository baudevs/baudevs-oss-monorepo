// tools/release-tools/src/utils/chunk-helpers.ts

/**
 * Splits a long string into multiple chunks of a given size.
 * @param str The string to split.
 * @param size The maximum size of each chunk.
 * @returns An array of string chunks.
 */
export function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  let offset = 0;
  while (offset < str.length) {
    chunks.push(str.slice(offset, offset + size));
    offset += size;
  }
  return chunks;
}

/**
 * Limits the number of chunks to a maximum value by merging them.
 * @param chunks The original array of chunks.
 * @param maxChunks The maximum number of chunks desired.
 * @returns A new array with at most maxChunks elements.
 */
export function limitChunks(chunks: string[], maxChunks = 10): string[] {
  if (chunks.length <= maxChunks) return chunks;

  const newChunks: string[] = [];
  const groupSize = Math.ceil(chunks.length / maxChunks);

  let i = 0;
  while (i < chunks.length) {
    let merged = '';
    for (let j = 0; j < groupSize && i < chunks.length; j++) {
      merged += chunks[i] + '\n\n';
      i++;
    }
    newChunks.push(merged);
  }
  return newChunks;
}
