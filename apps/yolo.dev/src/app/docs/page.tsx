'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@lib/utils';
import { Header } from '@components/ui/Header';
import { 
  Book, 
  Rocket, 
  Terminal, 
  Code2, 
  GitBranch, 
  History,
  Sparkles,
  Wrench,
  Workflow,
  Lightbulb
} from 'lucide-react';


const sidebarItems = [
  {
    title: 'Introduction',
    href: '/docs',
  },
  {
    title: 'Getting Started',
    href: '/docs/getting-started-with-ai-programming',
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

export default function DocsPage() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Header showNav={false} />
      <div className="container mx-auto px-4 pt-20">
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
            <motion.div 
              className="mb-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                YOLO Documentation
                <motion.span whileHover={{ scale: 1.2, rotate: 180 }} transition={{ duration: 0.6 }}>
                  <Book className="h-10 w-10 text-blue-500" />
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-xl text-zinc-400 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Your guide to making development wild and organized at the same time{' '}
                <span role="img" aria-label="rocket">🚀</span>
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div 
                className="rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.span whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                    <Rocket className="h-6 w-6 text-purple-500" />
                  </motion.span>
                  <h2 className="text-xl font-semibold">Quick Start</h2>
                </div>
                <p className="text-zinc-400">
                  Get up and running with YOLO in minutes. Perfect for developers who want to dive right in{' '}
                  <span role="img" aria-label="diving">🏊‍♂️</span>
                </p>
              </motion.div>

              <Link href="/docs/tools">
                <motion.div 
                  className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <motion.span whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                      <Terminal className="h-6 w-6 text-emerald-500" />
                    </motion.span>
                    <h2 className="text-xl font-semibold">CLI Guide</h2>
                  </div>
                  <p className="text-zinc-400">
                    Master the YOLO command-line interface and become a project management ninja{' '}
                    <span role="img" aria-label="ninja">🥷</span>
                  </p>
                </motion.div>
              </Link>
            </motion.div>

            <motion.section 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <motion.span whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                  <Code2 className="h-6 w-6 text-yellow-500" />
                </motion.span>
                Core Concepts
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  className="rounded-lg bg-zinc-800/50 p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <GitBranch className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold">Version Control</h3>
                  </div>
                  <p className="text-zinc-400">Learn how YOLO works alongside Git to track your AI adventures</p>
                </motion.div>

                <motion.div 
                  className="rounded-lg bg-zinc-800/50 p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <History className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-semibold">History Tracking</h3>
                  </div>
                  <p className="text-zinc-400">Master the art of tracking AI-assisted development history</p>
                </motion.div>

                <motion.div 
                  className="rounded-lg bg-zinc-800/50 p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Workflow className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-semibold">Workflows</h3>
                  </div>
                  <p className="text-zinc-400">Discover efficient ways to manage AI-powered development</p>
                </motion.div>

                <motion.div 
                  className="rounded-lg bg-zinc-800/50 p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Wrench className="h-5 w-5 text-orange-400" />
                    <h3 className="text-lg font-semibold">Configuration</h3>
                  </div>
                  <p className="text-zinc-400">Customize YOLO to fit your development style</p>
                </motion.div>
              </div>
            </motion.section>

            <motion.div 
              className="rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-8 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.span whileHover={{ scale: 1.2 }} transition={{ duration: 0.3 }}>
                  <Lightbulb className="h-8 w-8 text-yellow-500" />
                </motion.span>
                <h2 className="text-2xl font-bold">Pro Tips</h2>
              </div>
              <p className="text-zinc-400 mb-4">
                Level up your YOLO game with these expert tips{' '}
                <span role="img" aria-label="sparkles">✨</span>
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-300">
                <li>Use descriptive commit messages in your HISTORY.yaml</li>
                <li>Leverage AI suggestions but keep your project goals in mind</li>
                <li>Regular commits help track AI-driven changes effectively</li>
              </ul>
            </motion.div>

            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <p className="text-zinc-400">
                Ready to start your YOLO journey?{' '}
                <span role="img" aria-label="pointing down">👇</span>
              </p>
              <Link href="/pricing">
              <motion.button 
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 mx-auto hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-5 w-5" />
                Get Started
              </motion.button>
              </Link>
            </motion.div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
