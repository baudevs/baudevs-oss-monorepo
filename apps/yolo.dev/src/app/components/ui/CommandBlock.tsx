'use client';

interface CommandBlockProps {
  command: string;
  note?: string;
}

export function CommandBlock({ command, note }: CommandBlockProps) {
  return (
    <div>
      <pre className="bg-black/30 p-4 rounded-lg text-sm overflow-x-auto mb-2 text-blue-400">
        <code>{command}</code>
      </pre>
      {note && (
        <p className="text-sm text-zinc-400 italic">{note}</p>
      )}
    </div>
  );
}
