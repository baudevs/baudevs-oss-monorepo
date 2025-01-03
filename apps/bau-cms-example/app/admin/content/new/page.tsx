import { ContentForm } from './content-form';

export default function NewContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Content</h1>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="px-4 py-5 sm:p-6">
          <ContentForm />
        </div>
      </div>
    </div>
  );
}
