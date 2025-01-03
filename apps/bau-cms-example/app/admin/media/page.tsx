import { createBauCMS, type Media } from '@baudevs/bau-cms-core';
import { Upload } from 'lucide-react';

async function getMediaList() {
  const cms = createBauCMS({
    database: {
      url: process.env.DATABASE_URL || 'file:./baucms.db',
    },
  });

  return cms.listMedia();
}

export default async function MediaLibrary() {
  const media = await getMediaList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500">
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </button>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="px-4 py-5 sm:p-6">
          {media.length === 0 ? (
            <div className="text-center">
              <p className="mt-1 text-sm text-gray-500">No media files found</p>
              <div className="mt-6">
                <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload your first file
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {media.map((item: Media) => (
                <div key={item.id} className="group relative">
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                    {item.mimeType.startsWith('image/') ? (
                      <img
                        src={item.path}
                        alt={item.filename}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-sm text-gray-500">
                          {item.mimeType}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 block truncate text-sm font-medium text-gray-900">
                    {item.filename}
                  </p>
                  <p className="block text-sm font-medium text-gray-500">
                    {formatFileSize(item.size)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
