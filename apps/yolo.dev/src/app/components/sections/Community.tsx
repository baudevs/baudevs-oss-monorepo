'use client';

import { motion } from 'framer-motion';
import { Github, MessageCircle, Book, Users } from 'lucide-react';
import Link from 'next/link';
const stats = [
  {
    icon: Github,
    label: 'GitHub Stars (Our own)',
    value: '1',
    color: 'text-yellow-500',
  },
  {
    icon: Users,
    label: 'Contributors',
    value: '2',
    color: 'text-blue-500',
  },
  {
    icon: MessageCircle,
    label: 'Discord Members (want to help?)',
    value: '0',
    color: 'text-purple-500',
  },
  {
    icon: Book,
    label: 'Documentation Pages',
    value: '~3',
    color: 'text-green-500',
  },
];

const testimonials = [
  {
    quote: "YOLO made me believe in project management again. I mean, it hasn’t happened yet, but it *could*!",
    author: "Future Tech Enthusiast",
    role: "Visionary Developer",
  },
  {
    quote: "I finally understand my projects thanks to YOLO. Well, not yet, but soon, right?",
    author: "Aspirational Manager",
    role: "Dreaming of Organization",
  },
  {
    quote: "YOLO is going to make my team’s life so much easier. Just wait, they’ll thank me... eventually.",
    author: "Hopeful Team Lead",
    role: "Optimistic Planner",
  },
];

export function Community() {
  return (
    <section className="bg-zinc-900 py-24" id="community">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl flex items-center justify-center">
            Join Our <span className="text-xl text-zinc-400 mx-2 inline-flex items-center p-0 relative top-1.5">(still small, hopefully growing)</span> Community
          </h2>
          <p className="mb-12 text-xl text-zinc-400">
            Connect with fellow developers and shape the future of project management
          </p>
        </motion.div>

        <motion.div
          className="mb-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-lg bg-zinc-800/50 p-6 text-center backdrop-blur-sm"
            >
              <stat.icon className={`mx-auto mb-4 h-8 w-8 ${stat.color}`} />
              <div className="mb-2 text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-lg bg-zinc-800/50 p-6 backdrop-blur-sm"
            >
              <p className="mb-4 text-lg text-zinc-300">&quot;{testimonial.quote}&quot;</p>
              <div className="text-sm text-zinc-400">
                <div className="font-semibold text-white">{testimonial.author}</div>
                {testimonial.role}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-lg text-zinc-400 mb-4">
            Built with <span role='img' aria-label='explosion'>💥</span>  , caffeine, and a whole bunch of chaos by the team at BauDevs and Monoverse.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="https://baudevs.social"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              <Github className="h-5 w-5" /> qtagtech
            </Link>
            <Link
              href="https://github.com/storres3rd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              <Github className="h-5 w-5" /> storres3rd
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
