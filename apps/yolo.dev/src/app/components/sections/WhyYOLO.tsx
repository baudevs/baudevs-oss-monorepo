'use client';

import { motion } from 'framer-motion';
import { Eye, FileText, History, Lightbulb, FolderTree } from 'lucide-react';

const sections = [
  {
    icon: Eye,
    title: 'YOLO: You Observe, Log, and Oversee',
    description: 'A simple but powerful approach to AI-driven software development that helps you track every step of your journey.',
    color: 'text-indigo-500',
  },
  {
    icon: History,
    title: 'Never Lose Context',
    description: 'Keep a complete history of your project evolution without fear of losing crucial information.',
    color: 'text-emerald-500',
  },
  {
    icon: FileText,
    title: 'Simple Documentation',
    description: 'Maintain clear, readable files that tell the story of your project&apos;s growth.',
    color: 'text-rose-500',
  },
  {
    icon: FolderTree,
    title: 'Clear Structure',
    description: 'Follow straightforward folder structures and naming conventions that anyone can understand.',
    color: 'text-amber-500',
  },
  {
    icon: Lightbulb,
    title: 'Fun & Adaptable',
    description: 'Make development enjoyable while easily adapting to different AI tools and LLMs.',
    color: 'text-cyan-500',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export function Why() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose YOLO?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              A fun & straightforward approach to AI project evolution that makes development accessible to everyone.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {sections.map((section, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`${section.color} mb-4`}>
                  <section.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {section.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
