import type { Content, NewContent, Media, NewMedia, User, NewUser } from '../database/schema';

export type ContentStatus = 'draft' | 'published' | 'archived';
export type ContentType = 'page' | 'post' | 'portfolio' | 'documentation';

export interface Menu {
  items: MenuItem[];
}

export interface MenuItem {
  title: string;
  path: string;
  children?: MenuItem[];
}

export interface ContentOperations {
  create(data: Omit<NewContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Content>;
  update(slug: string, data: Partial<Omit<NewContent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Content>;
  delete(slug: string): Promise<void>;
  get(slug: string): Promise<Content | null>;
  list(options?: {
    type?: ContentType;
    status?: ContentStatus;
    limit?: number;
    offset?: number;
  }): Promise<Content[]>;
  publish(slug: string): Promise<Content>;
  unpublish(slug: string): Promise<Content>;
  updateMenu(slug: string, menu: Menu | null): Promise<Content>;
}

export interface MediaOperations {
  upload(file: File): Promise<Media>;
  get(id: string): Promise<Media | null>;
  list(options?: { limit?: number; offset?: number }): Promise<Media[]>;
  delete(id: string): Promise<void>;
  update(id: string, data: Partial<Omit<NewMedia, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Media>;
}

export interface AuthOperations {
  createUser(data: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, data: Partial<Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  listUsers(options?: { limit?: number; offset?: number }): Promise<User[]>;
}
