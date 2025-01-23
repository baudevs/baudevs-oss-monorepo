'use client';

import { motion } from 'framer-motion';
import { 
  FolderTree, 
  FileText, 
  GitCommit, 
  MessageSquare, 
  History, 
  Sparkles,
  Bot,
  GitBranch,
  FileCode,
  MessagesSquare
} from 'lucide-react';

const coreFiles = [
  {
    icon: FolderTree,
    title: 'Project Structure',
    description: 'The /yolo folder hierarchy',
    details: [
      'Epics, Features, and Tasks as individual files',
      'AI-generated or human-written detailed descriptions',
      'Automatic relationship mapping between items',
      'Graph-based task dependencies'
    ],
    color: 'from-blue-500 to-indigo-500'
  },
  {
    icon: FileText,
    title: 'Core Documentation',
    description: 'Essential project files',
    details: [
      'Enhanced README with clear context',
      'CHANGELOG with deprecated markers',
      'WISHES for future planning',
      'STRATEGY for project direction'
    ],
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: History,
    title: 'HISTORY.yaml',
    description: 'The heart of YOLO tracking',
    details: [
      'Complete AI interaction history',
      'Detailed change tracking',
      'Configurable granularity',
      'Structured YAML format'
    ],
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: MessageSquare,
    title: 'Sprint Management',
    description: 'Conversation tracking',
    details: [
      'sprint.current.md for active work',
      'sprint.past.md for reference',
      'sprint.next.md for planning',
      'Complete LLM chat history'
    ],
    color: 'from-orange-500 to-red-500'
  }
];

const toolFeatures = [
  {
    icon: Bot,
    title: 'Ask Command',
    description: 'Get concise 3-bullet answers to any development question'
  },
  {
    icon: GitCommit,
    title: 'Smart Commits',
    description: 'Automated Git operations with AI-powered commit messages'
  },
  {
    icon: GitBranch,
    title: 'Relationship Builder',
    description: 'Automatic mapping of epics, features, and tasks'
  },
  {
    icon: FileCode,
    title: 'Code to LLM',
    description: 'Intelligent code tokenization for LLM consumption'
  },
  {
    icon: MessagesSquare,
    title: 'Sprint Manager',
    description: 'Effortless sprint file management and chat history'
  },
  {
    icon: Sparkles,
    title: 'Prompt Library',
    description: 'Quick access to commonly used LLM prompts'
  }
];

export function Methodology() {
  return (
    <section className="bg-gradient-to-b from-zinc-900 to-black py-24" id="methodology">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            The YOLO Way
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-lg text-zinc-400">
            A modern approach to project management that embraces AI while keeping humans in control
          </p>
        </motion.div>

        <div className="mb-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {coreFiles.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-zinc-800/50 p-6"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 transition-opacity group-hover:opacity-10`} />
              <div className="relative">
                <item.icon className="mb-4 h-6 w-6 text-white" />
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mb-4 text-zinc-400">{item.description}</p>
                <ul className="space-y-2">
                  {item.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-sm text-zinc-300">
                      <span className="mr-2 h-1 w-1 rounded-full bg-white" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-zinc-800/30 p-8"
        >
          <h3 className="mb-8 text-center text-2xl font-semibold text-white">
            Powerful Tools at Your Fingertips
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {toolFeatures.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-start gap-4 rounded-xl bg-zinc-800/50 p-4"
              >
                <tool.icon className="mt-1 h-5 w-5 text-white" />
                <div>
                  <h4 className="text-lg font-medium text-white">{tool.title}</h4>
                  <p className="text-sm text-zinc-400">{tool.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
