import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { BauCMSContent } from './lib/content';
import type { NewContent } from './lib/database/schema';
import type { Menu } from './lib/types';

export * from './lib/types';
export * from './lib/content';
export * from './lib/database/schema';

export interface BauCMSConfig {
  database: {
    url: string;
    authToken?: string;
  };
}

export class BauCMS {
  private contentManager: BauCMSContent;

  constructor(config: BauCMSConfig) {
    const client = createClient({
      url: config.database.url,
      authToken: config.database.authToken,
    });

    const db = drizzle(client);
    this.contentManager = new BauCMSContent(db);
  }

  content() {
    return this.contentManager;
  }

  // Convenience methods
  async getContent(slug: string) {
    return this.contentManager.get(slug);
  }

  async listContent(options = {}) {
    return this.contentManager.list(options);
  }

  async createContent(data: NewContent) {
    return this.contentManager.create(data);
  }

  async updateContent(slug: string, data: Partial<NewContent>) {
    return this.contentManager.update(slug, data);
  }

  async deleteContent(slug: string) {
    return this.contentManager.delete(slug);
  }

  async publishContent(slug: string) {
    return this.contentManager.publish(slug);
  }

  async unpublishContent(slug: string) {
    return this.contentManager.unpublish(slug);
  }

  async updateContentMenu(slug: string, menu: Menu | null) {
    return this.contentManager.updateMenu(slug, menu);
  }
}

export function initBauCMS(config: BauCMSConfig) {
  const cms = new BauCMS(config);

  return {
    GET: async (req: Request) => {
      const url = new URL(req.url);
      const slug = url.searchParams.get('slug');
      
      if (slug) {
        const content = await cms.getContent(slug);
        return new Response(JSON.stringify(content));
      }
      
      const contents = await cms.listContent();
      return new Response(JSON.stringify(contents));
    },
    POST: async (req: Request) => {
      const data = await req.json();
      const content = await cms.createContent(data);
      return new Response(JSON.stringify(content));
    },
    PUT: async (req: Request) => {
      const url = new URL(req.url);
      const slug = url.searchParams.get('slug');
      if (!slug) {
        return new Response('Slug is required', { status: 400 });
      }
      const data = await req.json();
      const content = await cms.updateContent(slug, data);
      return new Response(JSON.stringify(content));
    },
    DELETE: async (req: Request) => {
      const url = new URL(req.url);
      const slug = url.searchParams.get('slug');
      if (!slug) {
        return new Response('Slug is required', { status: 400 });
      }
      await cms.deleteContent(slug);
      return new Response(null, { status: 204 });
    }
  };
}
