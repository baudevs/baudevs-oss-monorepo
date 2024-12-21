import React, { useCallback, useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  preview?: boolean;
  height?: number;
  className?: string;
  previewClassName?: string;
}

export function Editor({
  value,
  onChange,
  preview = false,
  height = 400,
  className = '',
  previewClassName = '',
}: EditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = useCallback((value?: string) => {
    onChange(value || '');
  }, [onChange]);

  if (!mounted) {
    return null;
  }

  if (preview) {
    return (
      <div className={`prose prose-invert max-w-none ${previewClassName}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {value}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className={className} data-color-mode="dark">
      <MDEditor
        value={value}
        onChange={handleChange}
        height={height}
        preview="edit"
        hideToolbar={false}
        enableScroll={true}
        textareaProps={{
          placeholder: 'Write your content here...',
        }}
      />
    </div>
  );
} 