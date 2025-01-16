'use client';

import { motion } from 'framer-motion';
import Scene from '@components/3d/Scene';


export function Hero() {
  return (
    <section className="relative h-screen w-full bg-gradient-to-b from-black to-zinc-900 text-white">
      <div className="absolute inset-0">
        <Scene />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            className="mb-6 text-5xl font-bold md:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Make Project Management Fun
          </motion.h1>

          <motion.p
            className="mb-8 text-xl text-zinc-300 md:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your friendly project companion that makes managing projects easy - perfect for everyone!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a
              href="#installation"
              className="inline-block rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Start Your Project Adventure! <span role='img' aria-label='rocket'>🚀</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
