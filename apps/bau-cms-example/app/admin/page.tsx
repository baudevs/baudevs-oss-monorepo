import { FileText, Image, Users } from 'lucide-react';
import cms from '@/lib/database';

export default async function AdminDashboard() {
  const [contents, media, users] = await Promise.all([
    cms.content.list({ limit: 5 }),
    cms.media.list({ limit: 5 }),
    cms.auth.listUsers({ limit: 5 }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold">Content</h2>
              <p className="text-gray-600">Latest content items</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {contents.map((content) => (
              <li key={content.id} className="text-sm">
                {content.title}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <Image className="w-8 h-8 text-green-500" />
            <div>
              <h2 className="text-lg font-semibold">Media</h2>
              <p className="text-gray-600">Latest media items</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {media.map((item) => (
              <li key={item.id} className="text-sm">
                {item.filename}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <h2 className="text-lg font-semibold">Users</h2>
              <p className="text-gray-600">Latest users</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {users.map((user) => (
              <li key={user.id} className="text-sm">
                {user.email}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
