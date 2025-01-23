'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Book, Download, ChevronDown, FileCode, GitBranch, History, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface MegaMenuItem {
  label: string;
  items: {
    icon:  string;
    title: string;
    description: string;
    href: string;
  }[];
}

const menuItems: MegaMenuItem[] = [
  {
    label: 'YOLO in Detail',
    items: [
      {
        icon: Book,
        title: 'Documentation',
        description: 'Learn about YOLO methodology and best practices',
        href: '/docs', // updated href
      },
      {
        icon: History,
        title: 'Project Evolution',
        description: 'The story of how YOLO came to be',
        href: '/docs/evolution',
      },
      {
        icon: FileCode,
        title: 'File Structure',
        description: 'Explore the YOLO file organization system',
        href: '/docs/structure',
      },
      {
        icon: GitBranch,
        title: 'Version Control',
        description: 'See how YOLO works with Git and other VCS',
        href: '/version-control',
      },
    ],
  },
  {
    label: 'Download the YOLO CLI',
    items: [
      {
        icon: Terminal,
        title: 'CLI Installation',
        description: 'Get started with the YOLO command line tool',
        href: '/cli',
      },
      {
        icon: Download,
        title: 'Download Options',
        description: 'Choose the right package for your system',
        href: '/download',
      },
      {
        icon: Download,
        title: 'Install YOLO',
        description: 'Quick installation guide for all environments',
        href: '/install',
      },
    ],
  },
];

export function MegaMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="relative">
      <nav className="flex space-x-8">
        {menuItems.map((menu) => (
          <div
            key={menu.label}
            className="relative"
            onMouseEnter={() => setActiveMenu(menu.label)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              className="flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {menu.label}
              <ChevronDown className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {activeMenu === menu.label && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 top-full z-50 mt-2 w-screen max-w-md -translate-x-1/2 px-4"
                >
                  <div className="overflow-hidden rounded-2xl bg-zinc-900 shadow-lg ring-1 ring-black/5">
                    <div className="relative grid gap-6 p-6">
                      {menu.items.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          className="-m-3 flex items-center rounded-lg p-3 transition duration-150 ease-in-out hover:bg-zinc-800"
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-white sm:h-12 sm:w-12">
                            <item.icon className="h-6 w-6" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-white">
                              {item.title}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </div>
  );
}
