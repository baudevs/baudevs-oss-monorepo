'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Terminal } from 'lucide-react';

const commands = [
  { text: '$ brew install yolo-cli', delay: 0 },
  { text: '🍺 Installing YOLO CLI...', delay: 1 },
  { text: '✨ Installation complete!', delay: 2 },
  { text: '$ yolo init my-cool-project', delay: 3 },
  { text: '🚀 Creating a new project...', delay: 4 },
  { text: '🎮 Setting up 3D visualization...', delay: 5 },
  { text: '🤖 Configuring AI assistant...', delay: 6 },
  { text: '✅ Project ready! Let\'s build something amazing!', delay: 7 },
];

export function Installation() {
  const [copied, setCopied] = useState(false);

  const copyCommand = async (command: string) => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-black py-24" id="installation">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Terminal className="mx-auto mb-6 h-12 w-12 text-blue-500" />
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Get Started in Seconds
          </h2>
          <p className="mb-12 text-xl text-zinc-400">
            Just two commands to start your project adventure
          </p>
        </motion.div>

        <motion.div
          className="mx-auto max-w-3xl overflow-hidden rounded-lg bg-zinc-900 p-4 font-mono"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <button
              onClick={() => copyCommand('brew install yolo-cli && yolo init my-cool-project')}
              className="rounded bg-zinc-800 px-3 py-1 text-sm text-zinc-400 transition-colors hover:bg-zinc-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {commands.map((cmd, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: cmd.delay * 0.15 }}
                className="text-sm text-zinc-300"
              >
                {cmd.text}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
} 