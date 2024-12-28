import { ContentManager } from './lib/content';
import { MediaManager } from './lib/media';
import { AuthManager } from './lib/auth';
import type { NewContent, NewMedia, NewUser, Content, Media, User } from './lib/database/schema';
import type { ContentOperations, MediaOperations, AuthOperations } from './lib/types';
import { createDatabase } from './lib/database/client';
import type { Database } from './lib/database/client';

export interface BauCMSOptions {
  dbUrl: string;
}

export class BauCMS {
  private db: Database;
  public content: ContentOperations;
  public media: MediaOperations;
  public auth: AuthOperations;

  constructor(options: BauCMSOptions) {
    this.db = createDatabase(options.dbUrl);
    this.content = new ContentManager(this.db);
    this.media = new MediaManager(this.db);
    this.auth = new AuthManager(this.db);
  }
}

export type {
  Content,
  NewContent,
  Media,
  NewMedia,
  User,
  NewUser,
  ContentOperations,
  MediaOperations,
  AuthOperations,
};
