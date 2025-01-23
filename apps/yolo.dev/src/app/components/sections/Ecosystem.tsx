'use client';

import { motion } from 'framer-motion';
import { Brain, Wrench, Workflow, GitFork, Bot, Zap } from 'lucide-react';

const ecosystemItems = [
  {
    icon: Brain,
    title: 'Framework',
    description: 'The philosophy and methodology behind YOLO',
    items: [
      'Project Evolution Tracking',
      'AI-First Development Practices',
      'Flexible Documentation Patterns',
      'Team Collaboration Guidelines'
    ],
    color: 'from-purple-500 to-blue-500'
  },
  {
    icon: Wrench,
    title: 'Tools',
    description: 'The practical implementation of YOLO concepts',
    items: [
      'Command Line Interface',
      'VS Code Extension (Coming Soon)',
      'Git Integration',
      'Project Templates'
    ],
    color: 'from-emerald-500 to-cyan-500'
  }
];

const features = [
  {
    icon: Workflow,
    title: 'Seamless Integration',
    description: 'Framework concepts are directly implemented in the tools, making adoption natural and intuitive.'
  },
  {
    icon: GitFork,
    title: 'Version Control Native',
    description: 'Built with modern Git workflows in mind, enhancing your existing version control practices.'
  },
  {
    icon: Bot,
    title: 'AI-Enhanced',
    description: 'Designed to work harmoniously with AI coding assistants and language models.'
  },
  {
    icon: Zap,
    title: 'Immediate Value',
    description: 'Start seeing benefits from day one, with gradual adoption of more advanced features.'
  }
];

export function Ecosystem() {
  return (
    <section className="bg-zinc-900 py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            The YOLO Ecosystem
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-lg text-zinc-400">
            A perfect harmony between methodology and tooling, designed for the modern development workflow
          </p>
        </motion.div>

        <div className="mb-24 grid gap-8 md:grid-cols-2">
          {ecosystemItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative overflow-hidden rounded-2xl bg-zinc-800/50 p-8"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10`} />
              <div className="relative">
                <item.icon className="mb-4 h-8 w-8 text-white" />
                <h3 className="mb-2 text-2xl font-semibold text-white">{item.title}</h3>
                <p className="mb-6 text-zinc-400">{item.description}</p>
                <ul className="space-y-3">
                  {item.items.map((subItem, subIndex) => (
                    <li key={subIndex} className="flex items-center text-zinc-300">
                      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-white" />
                      {subItem}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-xl bg-zinc-800/50 p-6 backdrop-blur-sm"
            >
              <feature.icon className="mb-4 h-6 w-6 text-white" />
              <h3 className="mb-2 text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-zinc-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
