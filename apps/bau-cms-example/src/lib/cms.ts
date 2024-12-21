import { BauCMS } from '@baudevs/bau-cms-core';

export const cms = new BauCMS({
  database: {
    url: process.env.DATABASE_URL || 'file:content.db',
  },
}); 