'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface InstallStepProps {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  icon: LucideIcon;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

export function InstallStep({ 
  title, 
  description, 
  children,
  icon: Icon,
}: InstallStepProps) {
  return (
    <motion.div 
      className="rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-800/30 p-8 mb-8"
      whileHover={{ scale: 1.01 }}
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className="h-8 w-8 text-blue-400" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="prose prose-invert max-w-none mb-6">
        {description}
      </div>
      {children}
    </motion.div>
  );
}
