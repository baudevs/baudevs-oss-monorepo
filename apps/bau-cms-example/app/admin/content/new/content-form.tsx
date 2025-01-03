'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import type { NewContent } from '@baudevs/bau-cms-core';

export function ContentForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data: Partial<NewContent> = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      type: formData.get('type') as 'page' | 'post' | 'portfolio' | 'documentation',
      content: formData.get('content') as string,
      excerpt: formData.get('excerpt') as string,
      status: 'draft',
    };

    try {
      const response = await fetch('/api/cms?action=content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create content');
      }

      const featuredImage = formData.get('featured-image') as File;
      if (featuredImage && featuredImage.size > 0) {
        const mediaFormData = new FormData();
        mediaFormData.append('file', featuredImage);

        const mediaResponse = await fetch('/api/cms?action=media', {
          method: 'POST',
          body: mediaFormData,
        });

        if (!mediaResponse.ok) {
          console.error('Failed to upload featured image');
        }
      }

      router.push('/admin/content');
      router.refresh();
    } catch (error) {
      console.error('Error creating content:', error);
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="title"
            id="title"
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter title"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700"
        >
          Slug
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="slug"
            id="slug"
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="enter-slug"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700"
        >
          Type
        </label>
        <div className="mt-1">
          <select
            id="type"
            name="type"
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="page">Page</option>
            <option value="post">Post</option>
            <option value="portfolio">Portfolio</option>
            <option value="documentation">Documentation</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="excerpt"
          className="block text-sm font-medium text-gray-700"
        >
          Excerpt
        </label>
        <div className="mt-1">
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Brief description"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Content
        </label>
        <div className="mt-1">
          <textarea
            id="content"
            name="content"
            rows={10}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Write your content here..."
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="featured-image"
          className="block text-sm font-medium text-gray-700"
        >
          Featured Image
        </label>
        <div className="mt-1">
          <input
            type="file"
            name="featured-image"
            id="featured-image"
            accept="image/*"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save as Draft'}
        </button>
      </div>
    </form>
  );
}
