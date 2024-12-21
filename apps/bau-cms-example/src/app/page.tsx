import { cms } from '@/lib/cms';
import { Page } from '@baudevs/bau-cms-core/src/lib/types';
import Link from 'next/link';

export default async function Home() {
  const { items: pages } = await cms.listContent({
    status: 'published',
  });

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">BauCMS Example</h1>
        <Link 
          href="/admin" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Admin Panel
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page: Page) => (
          <Link 
            key={page.slug} 
            href={`/${page.slug}`}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">
              {page.title}
            </h2>
            <p className="text-gray-600">
              Template: {page.template}
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Last updated: {new Date(page.updatedAt).toLocaleDateString()}
            </div>
          </Link>
        ))}

        {pages.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No published content yet. Visit the admin panel to create some!
          </div>
        )}
      </div>
    </main>
  );
}
