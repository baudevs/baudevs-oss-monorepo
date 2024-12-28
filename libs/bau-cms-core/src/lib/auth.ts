import { eq } from 'drizzle-orm';
import type { User, NewUser } from './database/schema';
import type { AuthOperations } from './types';
import { randomUUID } from 'crypto';
import { users } from './database/schema';
import type { Database } from './database/client';

export class AuthManager implements AuthOperations {
  constructor(private db: Database) {}

  async createUser(data: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const result = await this.db.insert(users)
      .values({
        id: randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async getUser(id: string): Promise<User | null> {
    const result = await this.db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] || null;
  }

  async updateUser(id: string, data: Partial<Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    const result = await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await this.db.delete(users)
      .where(eq(users.id, id));
  }

  async listUsers(options: { limit?: number; offset?: number } = {}): Promise<User[]> {
    const query = this.db.select()
      .from(users)
      .orderBy(users.createdAt);

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    return query;
  }
}
