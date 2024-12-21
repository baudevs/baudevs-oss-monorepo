import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

export function createClient(dbPath: string) {
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, { schema });
} 