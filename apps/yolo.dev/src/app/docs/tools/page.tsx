'use client';

import { motion } from 'framer-motion';
import { DocsLayout } from '@layouts/DocsLayout';
import { 
  Terminal,
  GitCommit,
  History,
  Workflow,
  Settings,
  MessageCircle,
  Brain,
  AlertCircle,
  Command,
  PlusCircle,
  ListChecks,
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const CommandBlock = ({ command, description, example }: { command: string; description: string; example?: string }) => (
  <motion.div 
    className="rounded-lg bg-zinc-800/50 p-6 mb-4"
    whileHover={{ scale: 1.02 }}
  >
    <pre className="font-mono text-emerald-400 mb-2">{command}</pre>
    <p className="text-zinc-400 mb-2">{description}</p>
    {example && (
      <pre className="bg-black/30 p-3 rounded text-sm text-emerald-400 overflow-x-auto">
        {example}
      </pre>
    )}
  </motion.div>
);

export default function ToolsCliPage() {
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
              Tools & CLI
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <Terminal className="h-12 w-12 text-emerald-500" />
              </motion.span>
            </h1>
            <p className="text-xl text-zinc-400">
              Master YOLO&apos;s powerful command-line interface{' '}
              <span role="img" aria-label="terminal">💻</span>
            </p>
          </motion.div>

          {/* Version Control Commands */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <GitCommit className="h-8 w-8 text-blue-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">Version Control</h2>
            </div>

            <CommandBlock 
              command="yolo commit [-a|--all] [-m|--message] [-s|--summarized]"
              description="Create AI-powered commit messages with smart analysis"
              example={`$ yolo commit -a
✨ feat(auth): implement JWT authentication
- Add token generation
- Implement refresh logic
- Add security middleware`}
            />

            <CommandBlock 
              command="yolo status"
              description="Show the current state of your YOLO workspace"
              example={`$ yolo status
📦 Current Epic: User Authentication (E001)
🎯 Active Feature: JWT Implementation (F003)
✅ Completed Tasks: 2/5`}
            />
          </motion.section>

          {/* Workflow Management */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <Workflow className="h-8 w-8 text-purple-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">Workflow Management</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <PlusCircle className="h-6 w-6 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Creation Commands</h3>
                <pre className="bg-black/30 p-4 rounded text-sm text-purple-400">
{`yolo epic create "Epic description"
yolo feature create "Feature description"
yolo task create "Task description"`}
                </pre>
              </motion.div>

              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <ListChecks className="h-6 w-6 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">List Commands</h3>
                <pre className="bg-black/30 p-4 rounded text-sm text-green-400">
{`yolo epic list [--status=<status>]
yolo feature list [--epic=<epic-id>]
yolo task list [--feature=<feature-id>]`}
                </pre>
              </motion.div>
            </div>

            <CommandBlock 
              command="yolo update <item-id> --status=<status>"
              description="Update the status of any workflow item"
              example={`$ yolo update F001 --status=in-progress
✅ Updated feature F001: "Add user authentication"
Status changed to: in-progress`}
            />
          </motion.section>

          {/* AI Interaction */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <Brain className="h-8 w-8 text-pink-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">AI Interaction</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <MessageCircle className="h-6 w-6 text-pink-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Ask Questions</h3>
                <pre className="bg-black/30 p-4 rounded text-sm text-pink-400">
{`yolo ask "How should I structure
the authentication system?"

yolo explain login.go
yolo suggest --type=refactor`}
                </pre>
              </motion.div>

              <motion.div 
                className="rounded-lg bg-zinc-800/50 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <AlertCircle className="h-6 w-6 text-yellow-400 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Get Help</h3>
                <pre className="bg-black/30 p-4 rounded text-sm text-yellow-400">
{`yolo help [command]
yolo docs search "topic"
yolo examples [command]`}
                </pre>
              </motion.div>
            </div>
          </motion.section>

          {/* Configuration */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <Settings className="h-8 w-8 text-orange-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">Configuration</h2>
            </div>

            <motion.div 
              className="rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 p-8"
              whileHover={{ scale: 1.01 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CommandBlock 
                  command="yolo config init [--interactive]"
                  description="Initialize YOLO configuration"
                  example={`$ yolo config init --interactive
? Select AI provider › OpenAI
? Enter API key › ********
? Choose personality › Professional
✅ Configuration saved!`}
                />

                <CommandBlock 
                  command="yolo config set <key> <value>"
                  description="Set specific configuration values"
                  example={`$ yolo config set ai.personality nerdy
$ yolo config set commit.emoji true`}
                />
              </div>
            </motion.div>
          </motion.section>

          {/* Quick Reference */}
          <motion.section variants={fadeIn}>
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <Command className="h-8 w-8 text-blue-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">Quick Reference</h2>
            </div>

            <motion.div 
              className="rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-8"
              whileHover={{ scale: 1.01 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Common Commands</h4>
                  <pre className="bg-black/30 p-2 rounded text-sm text-blue-400">
{`yolo init
yolo status
yolo commit
yolo ask`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Workflow</h4>
                  <pre className="bg-black/30 p-2 rounded text-sm text-blue-400">
{`yolo epic
yolo feature
yolo task
yolo update`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Configuration</h4>
                  <pre className="bg-black/30 p-2 rounded text-sm text-blue-400">
{`yolo config
yolo setup
yolo doctor
yolo upgrade`}
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
