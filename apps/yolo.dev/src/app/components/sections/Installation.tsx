'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Terminal } from 'lucide-react';

const commands = [
  { text: '$ curl -L https://raw.githubusercontent.com/baudevs/yolo.baudevs.com/main/install.sh | sh', delay: 0 },
  { text: '📥 Downloading YOLO for macOS...', delay: 1 },
  { text: '$ chmod +x yolo && mv yolo /usr/local/bin/yolo', delay: 4 },
  { text: '🔒 Making YOLO executable and moving it to PATH...', delay: 5 },
  { text: '$ yolo init', delay: 8 },
  { text: '🚀 Initializing YOLO project...', delay: 10 },
  { text: '✅ Done! Your YOLO journey begins here.', delay: 14 },
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
            How to YOLO Your Way to Awesomeness
          </h2>
          <p className="mb-12 text-xl text-zinc-400">
            Let&apos;s get your YOLO script running faster than your morning coffee kicks in. <span role="img" aria-label="smiley">😎</span> Just follow these ridiculously easy steps:
          </p>
          <div className="mb-12 bg-gray-100 border border-gray-300 rounded-xl p-4 shadow-md max-w-md mx-auto mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              <span role="img" aria-label="Warning">🚨</span> Heads Up: Mac-Only Club (For Now)
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              YOLO currently works only on macOS. Not sure what you&apos;re using? Click the <span role="img" aria-label="Apple logo">🍎</span> in the top-left corner of your screen, select <span className="font-medium text-gray-800">"About This Mac"</span>, and confirm you&apos;re on macOS. If not, sit tight—we&apos;re coming to your OS soon! <span role="img" aria-label="sparkles">✨</span>
            </p>
          </div>
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
              onClick={() => copyCommand('curl -L https://raw.githubusercontent.com/baudevs/yolo.baudevs.com/main/install.sh | sh -o yolo && chmod +x yolo && mv yolo /usr/local/bin/yolo')}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <h3 className="text-2xl font-bold text-white">
            We Know You Got This
          </h3>
          <p className="text-lg text-zinc-400 mt-2">
            We just wanted to make it fun to explain. YOLO on! <span role="img" aria-label="party">🎉</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
