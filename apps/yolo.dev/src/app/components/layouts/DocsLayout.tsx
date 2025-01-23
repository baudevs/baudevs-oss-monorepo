'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@lib/utils';

interface DocsLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    title: 'Introduction',
    href: '/docs',
  },
  {
    title: 'Getting Started',
    href: '/docs/getting-started',
  },
  {
    title: 'Core Concepts',
    href: '/docs/concepts',
  },
  {
    title: 'Project Structure',
    href: '/docs/structure',
  },
  {
    title: 'Tools & CLI',
    href: '/docs/tools',
  },
  {
    title: 'Best Practices',
    href: '/docs/best-practices',
  },
  {
    title: 'Prompt Templates',
    href: '/docs/prompts',
  },
];

export function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-50 pt-20 dark:bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8 py-8 lg:flex-row">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:w-64"
          >
            <nav className="sticky top-24 space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block rounded-lg px-4 py-2 text-sm transition-colors',
                    pathname === item.href
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </motion.aside>

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="prose prose-zinc max-w-none flex-1 dark:prose-invert lg:prose-lg"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
