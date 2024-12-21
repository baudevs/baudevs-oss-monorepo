import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { BauCMSContent } from './content';
import { content } from './database/schema';
import type { NewContent } from './database/schema';

describe('BauCMSContent', () => {
  const client = createClient({
    url: 'file:test.db',
  });
  
  const db = drizzle(client);
  const cms = new BauCMSContent(db);

  beforeAll(async () => {
    // Clean up database before tests
    await db.delete(content);
  });

  afterAll(async () => {
    await client.close();
  });

  const testContent: NewContent = {
    slug: 'test-page',
    template: 'page',
    status: 'draft',
    data: {
      title: 'Test Page',
      content: 'This is a test page',
    },
    menu: [
      {
        label: 'Home',
        path: '/',
      },
    ],
  };

  it('should create content', async () => {
    const result = await cms.create(testContent);
    expect(result.slug).toBe(testContent.slug);
    expect(result.template).toBe(testContent.template);
    expect(result.status).toBe('draft');
    expect(result.data).toEqual(testContent.data);
    expect(result.menu).toEqual(testContent.menu);
  });

  it('should get content by slug', async () => {
    const result = await cms.get('test-page');
    expect(result).toBeTruthy();
    expect(result?.slug).toBe(testContent.slug);
  });

  it('should list content with pagination', async () => {
    const result = await cms.list({ page: 1, limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('should update content', async () => {
    const updates = {
      data: {
        title: 'Updated Test Page',
        content: 'This is an updated test page',
      },
    };

    const result = await cms.update('test-page', updates);
    expect(result.data).toEqual(updates.data);
  });

  it('should publish content', async () => {
    const result = await cms.publish('test-page');
    expect(result.status).toBe('published');
  });

  it('should unpublish content', async () => {
    const result = await cms.unpublish('test-page');
    expect(result.status).toBe('draft');
  });

  it('should update menu', async () => {
    const newMenu = [
      {
        label: 'Updated Home',
        path: '/',
      },
    ];

    const result = await cms.updateMenu('test-page', newMenu);
    expect(result.menu).toEqual(newMenu);
  });

  it('should delete content', async () => {
    await cms.delete('test-page');
    const result = await cms.get('test-page');
    expect(result).toBeNull();
  });
}); 