'use client';

import { motion } from 'framer-motion';
import { DocsLayout } from '@layouts/DocsLayout';
import { 
  GitBranch, 
  History, 
  Workflow, 
  Settings,
  Terminal,
  Key,
  User,
  MessageSquare,
  Smile,
  Frown,
  Angry,
  Code,
  FileJson
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function CoreConceptsPage() {
  return (
    <DocsLayout>
      <article className="max-w-5xl mx-auto px-4">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center gap-4">
              Core Concepts
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <Code className="h-12 w-12 text-blue-500" />
              </motion.span>
            </h1>
            <p className="text-xl text-zinc-400">
              Understanding the fundamental concepts that make YOLO powerful and unique{' '}
              <span role="img" aria-label="sparkles">✨</span>
            </p>
          </motion.div>

          {/* Version Control Section */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <GitBranch className="h-8 w-8 text-green-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">Version Control</h2>
            </div>

            <motion.div 
              className="rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-8 mb-8"
              whileHover={{ scale: 1.01 }}
            >
              <p className="text-lg text-zinc-300">
                YOLO enhances your Git workflow with AI-powered commit messages that are meaningful,
                conventional, and comprehensive.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <Terminal className="h-6 w-6 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Smart Commit Messages</h3>
                <pre className="bg-black/30 p-4 rounded-lg text-sm text-green-400 mb-4">
                  $ yolo commit -a
                  ✨ feat(auth): implement JWT authentication
                  - Add token generation
                  - Implement refresh logic
                  - Add security middleware
                </pre>
              </motion.div>

              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <Code className="h-6 w-6 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Conventional Format</h3>
                <ul className="space-y-2 text-zinc-300">
                  <li>✓ Semantic versioning</li>
                  <li>✓ Detailed descriptions</li>
                  <li>✓ Issue references</li>
                  <li>✓ Breaking change warnings</li>
                </ul>
              </motion.div>
            </div>
          </motion.section>

          {/* History Tracking Section */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <History className="h-8 w-8 text-purple-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">History Tracking</h2>
            </div>

            <motion.div 
              className="rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-8 mb-8"
              whileHover={{ scale: 1.01 }}
            >
              <FileJson className="h-6 w-6 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">history.yaml</h3>
              <pre className="bg-black/30 p-4 rounded-lg text-sm text-purple-400 overflow-x-auto">
{`version: 1
entries:
  - timestamp: "2025-01-23T15:58:01+01:00"
    type: feature
    id: F001
    summary: "Add user authentication"
    related:
      epic: E001
      tasks: [T001, T002]`}
              </pre>
            </motion.div>
          </motion.section>

          {/* Workflows Section */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <Workflow className="h-8 w-8 text-orange-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">Workflows</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-semibold mb-3">Epics</h3>
                <p className="text-zinc-400 mb-4">Large, strategic initiatives that contain multiple features</p>
                <pre className="bg-black/30 p-2 rounded text-sm text-orange-400">yolo epic create</pre>
              </motion.div>

              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-semibold mb-3">Features</h3>
                <p className="text-zinc-400 mb-4">Concrete functionality implementations linked to epics</p>
                <pre className="bg-black/30 p-2 rounded text-sm text-orange-400">yolo feature create</pre>
              </motion.div>

              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-semibold mb-3">Tasks</h3>
                <p className="text-zinc-400 mb-4">Specific, actionable items within features</p>
                <pre className="bg-black/30 p-2 rounded text-sm text-orange-400">yolo task create</pre>
              </motion.div>
            </div>
          </motion.section>

          {/* Configuration Section */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <Settings className="h-8 w-8 text-blue-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <Key className="h-6 w-6 text-yellow-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">API Configuration</h3>
                <ul className="space-y-2 text-zinc-300">
                  <li>✓ OpenAI API key support</li>
                  <li>✓ Multiple provider options</li>
                  <li>✓ Enterprise licensing</li>
                  <li>✓ Usage tracking</li>
                </ul>
              </motion.div>

              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <MessageSquare className="h-6 w-6 text-pink-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">AI Personality</h3>
                <div className="flex gap-4 mb-4">
                  <span className="flex items-center gap-2">
                    <Smile className="h-5 w-5 text-green-400" /> Professional
                  </span>
                  <span className="flex items-center gap-2">
                    <Frown className="h-5 w-5 text-yellow-400" /> Nerdy
                  </span>
                  <span className="flex items-center gap-2">
                    <Angry className="h-5 w-5 text-red-400" /> Chaotic
                  </span>
                </div>
              </motion.div>
            </div>

            <motion.div 
              className="rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-8"
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="text-xl font-semibold mb-3">Configuration Locations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Global Config</h4>
                  <pre className="bg-black/30 p-2 rounded text-sm text-blue-400">~/.config/yolo/config.yaml</pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Project Config</h4>
                  <pre className="bg-black/30 p-2 rounded text-sm text-blue-400">.yolo/config.yaml</pre>
                </div>
              </div>
            </motion.div>
          </motion.section>
        </motion.div>
      </article>
    </DocsLayout>
  );
}
