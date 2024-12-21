import { ClerkProvider } from '@clerk/nextjs';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">BauCMS Admin</h1>
              <div className="flex items-center gap-4">
                {/* Add user button and other nav items here */}
              </div>
            </div>
          </div>
        </nav>
        {children}
      </div>
    </ClerkProvider>
  );
} 