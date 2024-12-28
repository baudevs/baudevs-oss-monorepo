import { createClient } from '@libsql/client';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { schema } from './schema';

export type Database = LibSQLDatabase<typeof schema>;

export function createDatabase(url: string): Database {
  const client = createClient({ url });
  return drizzle(client, { schema });
}
