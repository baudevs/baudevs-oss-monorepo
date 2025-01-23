'use client';

import { motion } from 'framer-motion';
import Scene from '@components/3d/Scene';
import Link from 'next/link';

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
            YOLO: Framework & Tools
            <br />
            for the AI Era
          </motion.h1>

          <motion.p
            className="mb-8 text-xl text-zinc-300 md:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            A revolutionary methodology and toolset that makes AI-driven development 
            <br />
            as fun as it should be. From concept to code, we've got you covered.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="#framework"
              className="inline-block rounded-full bg-white px-8 py-3 text-lg font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              Explore the Framework
            </Link>
            <Link
              href="#installation"
              className="inline-block rounded-full bg-zinc-800 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-zinc-700"
            >
              Get the Tools
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
