'use client';

import { motion } from 'framer-motion';
import { Github, MessageCircle, Book, Users } from 'lucide-react';

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
    quote: "YOLO has transformed how I manage my projects. It's like having a smart friend who's always there to help!",
    author: "Sarah Chen",
    role: "Product Manager",
  },
  {
    quote: "The 3D visualization feature is mind-blowing. It makes understanding project structure so intuitive.",
    author: "Alex Rodriguez",
    role: "Senior Developer",
  },
  {
    quote: "As a student, YOLO has been invaluable in helping me organize my coding projects and learn AI concepts.",
    author: "Jordan Taylor",
    role: "CS Student",
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
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Join Our Growing Community
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
          <a
            href="https://github.com/yolo-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-lg font-semibold text-black transition-colors hover:bg-zinc-200"
          >
            <Github className="h-5 w-5" />
            Star on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
} 