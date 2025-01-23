'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface TutorialStepProps {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  note?: string;
  code?: string;
}

export function TutorialStep({ 
  icon: Icon, 
  title, 
  description, 
  note,
  code
}: TutorialStepProps) {
  return (
    <motion.div 
      className="mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className="h-8 w-8 text-purple-500" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="prose prose-invert max-w-none mb-6">
        {description}
      </div>
      {code && (
        <pre className="bg-black/30 p-4 rounded-lg text-sm overflow-x-auto mb-4 text-blue-400">
          {code}
        </pre>
      )}
      {note && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-sm text-purple-200"><span role="img" aria-label="Lightbulb">💡</span> {note}</p>
        </div>
      )}
    </motion.div>
  );
}
