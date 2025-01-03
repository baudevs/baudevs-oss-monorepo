import { BauCMS } from '@baudevs/bau-cms-core';

const cms = new BauCMS({
  database: {
    url: process.env.DATABASE_URL || 'file:./baucms.db',
  },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');

  switch (action) {
    case 'content':
      if (slug) {
        return Response.json(await cms.getContent(slug));
      }
      return Response.json(await cms.listContent());

    case 'media':
      if (id) {
        return Response.json(await cms.getMedia(Number(id)));
      }
      return Response.json(await cms.listMedia());

    case 'users':
      if (id) {
        return Response.json(await cms.getUser(Number(id)));
      }
      return Response.json(await cms.listUsers());

    default:
      return Response.json({
        status: 'ok',
        features: ['content', 'media', 'users'],
      });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const data = await request.json();

  switch (action) {
    case 'content':
      return Response.json(await cms.createContent(data));

    case 'media':
      // Note: In a real app, you'd handle file uploads differently
      return Response.json(await cms.uploadMedia(data as unknown as File));

    case 'users':
      return Response.json(await cms.createUser(data));

    default:
      return Response.json({ error: 'Invalid action' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');
  const data = await request.json();

  switch (action) {
    case 'content':
      if (!slug) {
        return Response.json({ error: 'Slug is required' }, { status: 400 });
      }
      return Response.json(await cms.updateContent(slug, data));

    case 'media':
      if (!id) {
        return Response.json({ error: 'Media ID is required' }, { status: 400 });
      }
      return Response.json(await cms.updateMedia(Number(id), data));

    case 'users':
      if (!id) {
        return Response.json({ error: 'User ID is required' }, { status: 400 });
      }
      return Response.json(await cms.updateUser(Number(id), data));

    default:
      return Response.json({ error: 'Invalid action' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');

  switch (action) {
    case 'content':
      if (!slug) {
        return Response.json({ error: 'Slug is required' }, { status: 400 });
      }
      await cms.deleteContent(slug);
      return new Response(null, { status: 204 });

    case 'media':
      if (!id) {
        return Response.json({ error: 'Media ID is required' }, { status: 400 });
      }
      await cms.deleteMedia(Number(id));
      return new Response(null, { status: 204 });

    case 'users':
      if (!id) {
        return Response.json({ error: 'User ID is required' }, { status: 400 });
      }
      await cms.deleteUser(Number(id));
      return new Response(null, { status: 204 });

    default:
      return Response.json({ error: 'Invalid action' }, { status: 400 });
  }
}
