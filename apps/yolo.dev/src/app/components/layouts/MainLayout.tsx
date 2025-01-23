'use client';

import { motion } from 'framer-motion';
import { MegaMenu } from '@components/ui/MegaMenu';

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4 }
};

interface MainLayoutProps {
  children: React.ReactNode;
  showHero?: boolean;
}

export function MainLayout({ children, showHero = false }: MainLayoutProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className="min-h-screen bg-gradient-to-b from-zinc-900 to-black"
    >
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <MegaMenu />
        </div>
      </header>
      <main>
        {children}
      </main>
    </motion.div>
  );
}
