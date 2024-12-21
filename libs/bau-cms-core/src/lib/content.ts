import { eq, and, desc, sql } from 'drizzle-orm';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { content } from './database/schema';
import type { Content, NewContent } from './database/schema';
import type { ContentOperations, ContentStatus, Menu } from './types';

export class BauCMSContent implements ContentOperations {
  constructor(private db: LibSQLDatabase) {}

  async create(data: NewContent): Promise<Content> {
    const [result] = await this.db.insert(content)
      .values({
        ...data,
        data: JSON.stringify(data.data),
        menu: data.menu ? JSON.stringify(data.menu) : null,
        status: 'draft',
      })
      .returning();
    
    return this.parseContent(result);
  }

  async update(slug: string, data: Partial<NewContent>): Promise<Content> {
    const [result] = await this.db.update(content)
      .set({
        ...data,
        data: data.data ? JSON.stringify(data.data) : undefined,
        menu: data.menu ? JSON.stringify(data.menu) : undefined,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(content.slug, slug))
      .returning();
    
    if (!result) {
      throw new Error(`Content with slug "${slug}" not found`);
    }

    return this.parseContent(result);
  }

  async delete(slug: string): Promise<void> {
    await this.db.delete(content)
      .where(eq(content.slug, slug));
  }

  async get(slug: string): Promise<Content | null> {
    const result = await this.db.select()
      .from(content)
      .where(eq(content.slug, slug))
      .limit(1);

    return result[0] ? this.parseContent(result[0]) : null;
  }

  async list(options: {
    status?: ContentStatus;
    template?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    items: Content[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { status, template, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = [];
    if (status) where.push(eq(content.status, status));
    if (template) where.push(eq(content.template, template));

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(content)
      .where(and(...where));

    // Get paginated results
    const items = await this.db.select()
      .from(content)
      .where(and(...where))
      .orderBy(desc(content.updatedAt))
      .limit(limit)
      .offset(offset);

    return {
      items: items.map(this.parseContent),
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  async publish(slug: string): Promise<Content> {
    return this.update(slug, { status: 'published' });
  }

  async unpublish(slug: string): Promise<Content> {
    return this.update(slug, { status: 'draft' });
  }

  async updateMenu(slug: string, menu: Menu | null): Promise<Content> {
    return this.update(slug, { menu });
  }

  private parseContent(raw: Content): Content {
    return {
      ...raw,
      data: typeof raw.data === 'string' ? JSON.parse(raw.data) : raw.data,
      menu: raw.menu ? (
        typeof raw.menu === 'string' ? JSON.parse(raw.menu) : raw.menu
      ) : null,
    };
  }
} 