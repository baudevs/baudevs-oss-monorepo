import { eq, desc } from 'drizzle-orm';
import type { Content, NewContent } from './database/schema';
import type { ContentOperations, ContentStatus, ContentType, Menu } from './types';
import { randomUUID } from 'crypto';
import { contents } from './database/schema';
import type { Database } from './database/client';

export class ContentManager implements ContentOperations {
  constructor(private db: Database) {}

  async create(data: Omit<NewContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Content> {
    const result = await this.db.insert(contents)
      .values({
        id: randomUUID(),
        ...data,
        data: '{}',
        menu: '[]',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async update(slug: string, data: Partial<Omit<NewContent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Content> {
    const result = await this.db.update(contents)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(contents.slug, slug))
      .returning();
    return result[0];
  }

  async delete(slug: string): Promise<void> {
    await this.db.delete(contents)
      .where(eq(contents.slug, slug));
  }

  async get(slug: string): Promise<Content | null> {
    const result = await this.db.select()
      .from(contents)
      .where(eq(contents.slug, slug))
      .limit(1);

    return result[0] || null;
  }

  async list(options: {
    type?: ContentType;
    status?: ContentStatus;
    limit?: number;
    offset?: number;
  } = {}): Promise<Content[]> {
    const query = this.db.select()
      .from(contents)
      .orderBy(desc(contents.createdAt));

    if (options.type) {
      query.where(eq(contents.type, options.type));
    }

    if (options.status) {
      query.where(eq(contents.status, options.status));
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    return query;
  }

  async publish(slug: string): Promise<Content> {
    return this.update(slug, { status: 'published' });
  }

  async unpublish(slug: string): Promise<Content> {
    return this.update(slug, { status: 'draft' });
  }

  async updateMenu(slug: string, menu: Menu | null): Promise<Content> {
    return this.update(slug, { menu: menu ? JSON.stringify(menu) : '[]' });
  }
}
