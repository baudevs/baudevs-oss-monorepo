'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

export function PricingCard({ 
  title, 
  price, 
  description, 
  features,
  highlighted = false,
  ctaText = "Get Started",
  ctaLink = "#"
}: PricingCardProps) {
  return (
    <motion.div 
      className={`rounded-xl p-8 ${
        highlighted 
          ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/20' 
          : 'bg-gradient-to-br from-zinc-800/50 to-zinc-800/30'
      }`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-bold">
          {price === "Custom" ? price : `$${price}`}
        </span>
        {price !== "Custom" && (
          <span className="text-zinc-400">/month</span>
        )}
      </div>
      <p className="text-zinc-400 mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className={`h-5 w-5 ${highlighted ? 'text-purple-400' : 'text-emerald-400'}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <a 
        href={ctaLink}
        className={`block text-center py-3 px-6 rounded-lg transition-colors ${
          highlighted
            ? 'bg-purple-500 hover:bg-purple-600'
            : 'bg-zinc-700 hover:bg-zinc-600'
        }`}
      >
        {ctaText}
      </a>
    </motion.div>
  );
}
