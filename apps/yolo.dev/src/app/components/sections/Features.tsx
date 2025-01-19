'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Box, Bot, LineChart } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Interactive Project Setup',
    description: 'Start your journey with a friendly chat',
    color: 'text-blue-500',
  },
  {
    icon: Box,
    title: '3D Project Visualization',
    description: 'See your ideas come to life',
    color: 'text-green-500',
  },
  {
    icon: Bot,
    title: 'AI-Powered Assistance',
    description: 'Your AI friend helps at every step',
    color: 'text-purple-500',
  },
  {
    icon: LineChart,
    title: 'Progress Tracking',
    description: 'Watch your project grow beautifully',
    color: 'text-yellow-500',
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

export function Features() {
  return (
    <section className="bg-zinc-900 py-24" id="features">
      <div className="container mx-auto px-4">
        <motion.h2
          className="mb-12 text-center text-4xl font-bold text-white md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Features that Make Project Management Fun
        </motion.h2>

        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="rounded-xl bg-zinc-800/50 p-6 backdrop-blur-sm"
              variants={itemVariants}
            >
              <feature.icon className={`mb-4 h-8 w-8 ${feature.color}`} />
              <h3 className="mb-2 text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-zinc-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 