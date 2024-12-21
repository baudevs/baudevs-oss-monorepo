import React from "react";
import { FileText, Settings, Users } from "lucide-react";
import Link from "next/link";

const navigation = [
  { name: 'Content', href: '/admin/content', icon: FileText },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <nav className="space-y-1 w-64">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          <item.icon
            className="flex-shrink-0 -ml-1 mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
            aria-hidden="true"
          />
          <span className="truncate">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
} 