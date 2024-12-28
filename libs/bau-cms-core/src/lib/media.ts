import { eq } from 'drizzle-orm';
import type { Media, NewMedia } from './database/schema';
import type { MediaOperations } from './types';
import { randomUUID } from 'crypto';
import { media } from './database/schema';
import type { Database } from './database/client';

export class MediaManager implements MediaOperations {
  constructor(private db: Database) {}

  async upload(file: File): Promise<Media> {
    const mediaData: NewMedia = {
      id: randomUUID(),
      filename: file.name,
      path: `/uploads/${file.name}`, // TODO: Implement proper path generation
      mimeType: file.type,
      size: file.size,
      metadata: JSON.stringify({
        lastModified: file.lastModified,
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.db.insert(media)
      .values(mediaData)
      .returning();
    return result[0];
  }

  async get(id: string): Promise<Media | null> {
    const result = await this.db.select()
      .from(media)
      .where(eq(media.id, id))
      .limit(1);
    return result[0] || null;
  }

  async list(options: { limit?: number; offset?: number } = {}): Promise<Media[]> {
    const query = this.db.select()
      .from(media)
      .orderBy(media.createdAt);

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    return query;
  }

  async delete(id: string): Promise<void> {
    // TODO: Delete actual file from storage service
    await this.db.delete(media)
      .where(eq(media.id, id));
  }

  async update(id: string, data: Partial<Omit<NewMedia, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Media> {
    const result = await this.db
      .update(media)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(media.id, id))
      .returning();
    return result[0];
  }
}
