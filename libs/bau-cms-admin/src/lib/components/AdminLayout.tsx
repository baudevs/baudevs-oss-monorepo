import React, { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { Sidebar } from "./Sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">BauCMS</h1>
              </div>
            </div>
            <div className="flex items-center">
              <UserButton afterSignOutUrl="/"/>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
} 