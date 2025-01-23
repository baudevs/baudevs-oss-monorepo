'use client';

import { motion } from 'framer-motion';
import { DocsLayout } from '@layouts/DocsLayout';
import { Bot, Sparkles, Brain, History, Omega, Cake} from 'lucide-react';

export default function EvolutionPage() {
  return (
    <DocsLayout>
      <article>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="flex items-center gap-3 font-bold text-2xl md:text-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            The YOLO Story <motion.span whileHover={{ scale: 1.2 }}><Sparkles className="h-10 w-10 m-2 text-yellow-500" /></motion.span>
          </motion.h1>

          <motion.div 
            className="mb-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 m-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="lead mb-0">
              &quot;Programming should be fun! And with AI, it can be absolutely wild. 
              We just needed a way to keep track of all the crazy ideas and 
              amazing things we build together with our AI friends.&quot;
            </p>
          </motion.div>

          <motion.h2 
            className="flex items-center gap-2 mb-2 mt-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.span whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
              <Bot className="h-6 w-6" />
            </motion.span>
            <span className="text-xl text-zinc-400 mx-1 inline-flex items-center p-0 relative top-0.5">The AI Development Rollercoaster</span>
          </motion.h2>
          <p>
            It all started when we noticed something funny: AI coding assistants are 
            incredible, but they&apos;re also... well, let&apos;s say &quot;creatively chaotic.&quot; 
            One minute you&apos;re building a simple API, and the next thing you know, 
            GitHub Copilot is convinced you&apos;re creating a quantum computer simulation. 
            Classic AI moment! <span role="img" aria-label="smiley">😅</span>
          </p>

          <motion.div 
            className="my-8 rounded-lg bg-zinc-100 p-6 dark:bg-zinc-800/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="mt-0 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              The AI Shenanigans We&apos;ve Seen
            </h3>
            <ul className="mb-0 list-none space-y-3">
              <li>
                <strong>Copilot:</strong> &quot;Oh, you want to validate an email? 
                Let me implement an entire email server real quick!&quot;
              </li>
              <li>
                <strong>Cursor:</strong> &quot;I see you&apos;re writing a README. 
                How about we refactor your entire codebase while we&apos;re at it?&quot;
              </li>
              <li>
                <strong>ChatGPT:</strong> &quot;You mentioned the word &apos;database&apos; once, 
                so I&apos;ve decided to write you a distributed blockchain system.&quot;
              </li>
            </ul>
          </motion.div>

          <motion.h2 
            className="flex items-center gap-2 mb-2 mt-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <motion.span whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
              <Cake className="h-6 w-6" />
            </motion.span>
            <span className="text-xl text-zinc-400 mx-1 inline-flex items-center p-0 relative top-0.5">The Birth of HISTORY.yaml</span>
          </motion.h2>
          <p>
            Here&apos;s where our story gets interesting. Juan, an experienced developer who 
            practically lives in AI-powered IDEs, and Santos, an electronic 
            music producer turning programmer a.k.a Monoverse, had a revelation: Why not create a system 
            that makes AI development as fun as a jam session, but with actual version control and a system behind it?
          </p>
          <h3 className="mb-4 text-4xl font-bold text-white md:text-3xl flex items-center justify-center relative top-2.5">
            Then, It all <span className="text-xl text-zinc-400 mx-1 inline-flex items-center p-0 relative top-0.5">
              (ADHD)</span> happened:
          </h3>
          <p>
            
          </p>

          <motion.div 
            className="my-8 rounded-lg border border-zinc-200 p-6 dark:border-zinc-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="mt-0 mb-4 font-bold text-white md:text-xl">The Original HISTORY.yaml</h3>
            <pre className="overflow-auto rounded bg-zinc-100 p-4 dark:bg-zinc-800">
              <code>{`version: 0.0.1
date: 2024-12-25
changes:
  - type: inception
    description: "🎄 Christmas coding session gone wild"
    impact: "YOLO was born!"
    status: "implemented"
    note: "Santos: 'What if we make project management... fun?'"

  - type: feature
    description: "Added first HISTORY.yaml tracker"
    impact: "Now we can see what our AI friends are up to"
    status: "implemented"
    note: "Juan: 'This is like version control for AI chaos!'"

  - type: enhancement
    description: "Made it actually useful"
    impact: "From joke project to essential tool"
    status: "implemented"
    note: "Both: 'Wait... this actually works really well!'"

  - type: revelation
    description: "Realized we're onto something big"
    impact: "YOLO is becoming a methodology"
    files:
      - HISTORY.yaml
      - README.md
    note: "The moment we realized we needed to share this with everyone"`}
            </code>
          </pre>
          </motion.div>
          <motion.h2 
            className="flex items-center gap-2 mb-2 mt-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <motion.span whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
              <History className="h-6 w-6" />
            </motion.span>
            <span className="text-xl text-zinc-400 mx-1 inline-flex items-center p-0 relative top-0.5">From Chaos to Method, soon: Perfection!</span>
          </motion.h2>

          <p className="mt-2">
            What started as a fun way to track AI&apos;s creative tangents evolved into something 
            bigger. We realized that by embracing the chaos and making it trackable, we could 
            actually deliver projects faster and have more fun doing it!
          </p>

          <motion.div 
            className="mt-8 grid gap-6 md:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <motion.div 
              className="rounded-lg bg-zinc-100 p-6 dark:bg-zinc-800/50"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="mt-0">Juan&apos;s Take</h3>
              <p className="mb-0">
                &quot;After years of traditional development, working with AI felt like having a 
                super-powered intern who occasionally decides to rewrite everything in 
                Brainfuck. YOLO helps keep the superpowers while avoiding the... unexpected 
                surprises.&quot;
              </p>
            </motion.div>
            <motion.div 
              className="rounded-lg bg-zinc-100 p-6 dark:bg-zinc-800/50"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="mt-0">Monoverse&apos;s Perspective</h3>
              <p className="mb-0">
                &quot;Coming from music production, I wanted coding to have that same creative 
                flow. With YOLO, it&apos;s like having a jam session with AI - we can try crazy 
                ideas but still keep the project on track.&quot;
              </p>
            </motion.div>
          </motion.div>

          <motion.h2 
            className="flex items-center gap-2 mb-2 mt-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
          >
            <motion.span whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
              <Omega className="h-6 w-6" />
            </motion.span>
            <span className="text-xl text-zinc-400 mx-1 inline-flex items-center p-0 relative top-0.5">The YOLO Philosophy</span>
          </motion.h2>
          <p className="mt-2">
            YOLO isn&apos;t just about tracking changes or managing projects. It&apos;s about making 
            development fun again. It&apos;s about saying &quot;Yes, let&apos;s try that crazy idea&quot; 
            while having a safety net that keeps everything organized.
          </p>

          <motion.div 
            className="mt-8 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            <h3 className="mt-0">Why &quot;YOLO&quot;?</h3>
            <p className="mb-0">
              Because sometimes you just have to embrace the chaos, try something new, 
              and trust that with good tracking and a sense of adventure, amazing things 
              will happen. After all, You Only Live Once (pun intended) - might as well make coding 
              as fun as possible!
            </p>
          </motion.div>
        </motion.div>
      </article>
    </DocsLayout>
  );
}
