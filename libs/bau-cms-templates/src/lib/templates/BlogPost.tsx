import React from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { Content } from '@baudevs/bau-cms-core';

interface BlogPostProps {
  content: Content;
}

export function BlogPost({ content }: BlogPostProps) {
  const data = JSON.parse(content.content);

  return (
    <article className="prose lg:prose-xl mx-auto py-8">
      <h1>{content.title}</h1>
      <div className="mt-8">
        <MDXRemote {...data.mdx} />
      </div>
    </article>
  );
} 