import { BauCMS } from '@baudevs/bau-cms-core';

const cms = new BauCMS({
  dbUrl: process.env.DATABASE_URL || 'file:content.db',
});

export default cms;
