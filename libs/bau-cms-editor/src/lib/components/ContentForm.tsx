import React, { useState } from 'react';
import { Editor } from './Editor';

export interface ContentFormProps {
  initialData?: {
    title: string;
    content: string;
    slug: string;
    template: string;
    published?: boolean;
  };
  templates: Array<{
    name: string;
    label: string;
  }>;
  onSubmit: (data: {
    title: string;
    content: string;
    slug: string;
    template: string;
    published: boolean;
  }) => void;
  onPreview?: (data: {
    title: string;
    content: string;
    template: string;
  }) => void;
}

export function ContentForm({
  initialData,
  templates,
  onSubmit,
  onPreview,
}: ContentFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    slug: initialData?.slug || '',
    template: initialData?.template || (templates[0]?.name || ''),
    published: initialData?.published || false,
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview({
        title: formData.title,
        content: formData.content,
        template: formData.template,
      });
    }
    setShowPreview(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1">
            Slug
          </label>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="template" className="block text-sm font-medium mb-1">
            Template
          </label>
          <select
            id="template"
            value={formData.template}
            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            {templates.map((template) => (
              <option key={template.name} value={template.name}>
                {template.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            Content
          </label>
          <Editor
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
            preview={showPreview}
            className="min-h-[400px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            className="rounded bg-white/5 border-white/10 text-primary-500 focus:ring-primary-500"
          />
          <label htmlFor="published" className="text-sm font-medium">
            Published
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {onPreview && (
          <button
            type="button"
            onClick={handlePreview}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Preview
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Save
        </button>
      </div>
    </form>
  );
} 