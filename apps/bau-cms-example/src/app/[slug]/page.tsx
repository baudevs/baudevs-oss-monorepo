import { cms } from '@/lib/cms';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: PageProps) {
  const content = await cms.getContent(params.slug);

  if (!content || !content.published) {
    notFound();
  }

  return (
    <main className="container mx-auto py-8">
      <article className="prose lg:prose-xl mx-auto">
        <h1>{content.title}</h1>
        
        {content.template === 'page' && (
          <div dangerouslySetInnerHTML={{ __html: content.content }} />
        )}

        {content.template === 'blog' && (
          <>
            <div className="text-gray-500 mb-8">
              Published on {new Date(content.createdAt).toLocaleDateString()}
            </div>
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          </>
        )}
      </article>
    </main>
  );
} 