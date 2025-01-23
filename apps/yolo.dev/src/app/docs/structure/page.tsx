'use client';

import { motion } from 'framer-motion';
import { DocsLayout } from '@layouts/DocsLayout';
import { 
  FolderTree,
  FileJson,
  FileText,
  FileCode,
  Star,
  History,
  Lightbulb,
  Rocket,
  Bot
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function ProjectStructurePage() {
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
              Project Structure
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <FolderTree className="h-12 w-12 text-blue-500" />
              </motion.span>
            </h1>
            <p className="text-xl text-zinc-400">
              Understanding YOLO&apos;s file organization and project structure{' '}
              <span role="img" aria-label="folder">📁</span>
            </p>
          </motion.div>

          {/* YOLO Folder Section */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <FileCode className="h-8 w-8 text-yellow-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">The .yolo Directory</h2>
            </div>

            <motion.div 
              className="rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-8 mb-8"
              whileHover={{ scale: 1.01 }}
            >
              <pre className="bg-black/30 p-4 rounded-lg text-sm text-yellow-400 mb-4">
{`.yolo/
├── epics/        # Epic markdown files
├── features/     # Feature markdown files
├── tasks/        # Task markdown files
├── history.yaml  # Detailed history tracking
├── config.yaml   # YOLO configuration
└── templates/    # Custom templates`}
              </pre>
            </motion.div>
          </motion.section>

          {/* Key Files Section */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <FileText className="h-8 w-8 text-purple-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">Key Files</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <History className="h-6 w-6 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">history.yaml</h3>
                <p className="text-zinc-400 mb-4">Tracks your project&apos;s evolution and AI interactions</p>
                <pre className="bg-black/30 p-4 rounded text-sm text-blue-400">
{`version: 1
entries:
  - timestamp: "2025-01-23"
    type: feature
    summary: "Add auth"`}
                </pre>
              </motion.div>

              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <Star className="h-6 w-6 text-yellow-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">CHANGELOG.md</h3>
                <p className="text-zinc-400 mb-4">Automatically generated changelog from your history</p>
                <pre className="bg-black/30 p-4 rounded text-sm text-yellow-400">
{`## [1.0.0] - 2025-01-23
### Added
- User authentication
- API endpoints`}
                </pre>
              </motion.div>

              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <Rocket className="h-6 w-6 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">README.md</h3>
                <p className="text-zinc-400">Project overview and getting started guide</p>
              </motion.div>

              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <Lightbulb className="h-6 w-6 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">WISHES.md</h3>
                <p className="text-zinc-400">Future improvements and feature requests</p>
              </motion.div>

              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <FileJson className="h-6 w-6 text-pink-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">STRATEGY.md</h3>
                <p className="text-zinc-400">Project roadmap and technical decisions</p>
              </motion.div>

              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <Bot className="h-6 w-6 text-orange-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">LLM_INSTRUCTIONS.md</h3>
                <p className="text-zinc-400">Guidelines for AI interactions and custom prompts</p>
              </motion.div>
            </div>
          </motion.section>

          {/* File Templates Section */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <FileText className="h-8 w-8 text-green-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">File Templates</h2>
            </div>

            <motion.div 
              className="rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-8"
              whileHover={{ scale: 1.01 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Epic Template</h4>
                  <pre className="bg-black/30 p-2 rounded text-sm text-green-400">
{`# Epic: [Title]
## Description
## Features
## Timeline`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Feature Template</h4>
                  <pre className="bg-black/30 p-2 rounded text-sm text-green-400">
{`# Feature: [Title]
## Epic: [Link]
## Tasks
## Status`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Task Template</h4>
                  <pre className="bg-black/30 p-2 rounded text-sm text-green-400">
{`# Task: [Title]
## Feature: [Link]
## Steps
## Done When`}
                  </pre>
                </div>
              </div>
            </motion.div>
          </motion.section>
        </motion.div>
      </article>
    </DocsLayout>
  );
}
