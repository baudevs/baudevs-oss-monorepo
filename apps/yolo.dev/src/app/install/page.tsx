'use client';

import { motion } from 'framer-motion';
import { MainLayout } from '@components/layouts/MainLayout';
import { CommandBlock } from '@components/ui/CommandBlock';
import { InstallStep } from '@components/ui/InstallStep';
import { 
  Terminal,
  Bot,
  GitBranch,
  Rocket,
  Command,
  Sparkles
} from 'lucide-react';

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function InstallPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black py-20">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="max-w-4xl mx-auto px-4"
        >
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            variants={fadeIn}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Installing YOLO
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              A beginner's guide to installing YOLO on your computer, even if you've never used a command line before.
            </p>
          </motion.div>

          {/* Installation Steps */}
          <motion.div variants={fadeIn}>
            <InstallStep
              title="Step 1: Opening Terminal"
              description="First, let's open Terminal on your Mac:"
              icon={Terminal}
            >
              <ol className="list-decimal pl-6 space-y-2">
                <li>Press <kbd className="px-2 py-1 bg-black/30 rounded">Command (⌘)</kbd> + <kbd className="px-2 py-1 bg-black/30 rounded">Space</kbd> to open Spotlight</li>
                <li>Type "Terminal"</li>
                <li>Click the Terminal app or press Enter</li>
              </ol>
            </InstallStep>

            <InstallStep
              title="Step 2: Installing YOLO"
              description="Copy and paste this command into your terminal:"
              icon={Bot}
            >
              <div className="space-y-4">
                <CommandBlock command="curl -fsSL https://raw.githubusercontent.com/baudevs/yolo.baudevs.com/main/install.sh | sh" />
                <div>
                  <p className="mb-2">This command:</p>
                  <ul className="list-disc pl-6">
                    <li>Downloads our installation script</li>
                    <li>Sets up YOLO on your computer</li>
                    <li>Adds it to your system PATH</li>
                  </ul>
                </div>
              </div>
            </InstallStep>

            <InstallStep
              title="Step 3: Verify Installation"
              description="Check if YOLO was installed correctly:"
              icon={Sparkles}
            >
              <div className="space-y-4">
                <div>
                  <p className="mb-2">Run this command:</p>
                  <CommandBlock command="yolo --version" />
                </div>
                <div>
                  <p className="mb-2">You should see something like:</p>
                  <CommandBlock command="YOLO version 1.2.3" />
                </div>
              </div>
            </InstallStep>

            <InstallStep
              title="Step 4: Quick Setup"
              description="Configure YOLO with this command:"
              icon={GitBranch}
            >
              <div className="space-y-4">
                <CommandBlock command="yolo init" />
                <div>
                  <p className="mb-2">You'll be asked for:</p>
                  <ul className="list-disc pl-6">
                    <li>Your name (for commit messages)</li>
                    <li>Your email</li>
                    <li>Your preferred AI provider</li>
                    <li>Your API keys (optional)</li>
                  </ul>
                </div>
              </div>
            </InstallStep>

            <InstallStep
              title="Step 5: Try It Out!"
              description="Let's verify everything works:"
              icon={Command}
            >
              <div className="space-y-4">
                <div>
                  <p className="mb-2">Run your first command:</p>
                  <CommandBlock command="yolo hello" />
                  <p className="text-sm text-zinc-400 mt-2">You should see a friendly welcome message!</p>
                </div>
              </div>
            </InstallStep>

            <InstallStep
              title="Next Steps"
              description="Try these beginner-friendly commands:"
              icon={Rocket}
            >
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li><code className="text-blue-400">yolo help</code> - See all available commands</li>
                  <li><code className="text-blue-400">yolo new</code> - Start a new project</li>
                  <li><code className="text-blue-400">yolo status</code> - Check your project status</li>
                </ul>
                <p className="text-sm text-zinc-400">
                  Need help? Check out our <a href="/docs" className="text-purple-400 hover:text-purple-300">documentation</a> or join our <a href="/community" className="text-purple-400 hover:text-purple-300">community</a>.
                </p>
              </div>
            </InstallStep>
          </motion.div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
