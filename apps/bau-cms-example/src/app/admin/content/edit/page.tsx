import { ContentForm, type ContentFormProps } from '@baudevs/bau-cms-editor';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const templates = [
  { name: 'blog', label: 'Blog Post' },
  { name: 'service', label: 'Service' },
  { name: 'menu', label: 'Menu' },
] as const;

export default async function ContentEditorPage() {
  const session = await auth();

  if (!session?.userId) {
    redirect('/sign-in');
  }

  const handleSubmit = async (data: Parameters<ContentFormProps['onSubmit']>[0]) => {
    'use server';
    // TODO: Implement content creation
    console.log('Content submitted:', data);
  };

  const handlePreview = (data: Parameters<ContentFormProps['onPreview']>[0]) => {
    // TODO: Implement preview
    console.log('Preview content:', data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create Content</h1>
      <ContentForm
        templates={templates}
        onSubmit={handleSubmit}
        onPreview={handlePreview}
      />
    </div>
  );
} 