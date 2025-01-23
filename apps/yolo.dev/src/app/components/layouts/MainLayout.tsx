'use client';

import { motion } from 'framer-motion';
import { Header } from '@components/ui/Header';

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4 }
};

interface MainLayoutProps {
  children: React.ReactNode;
  showHero?: boolean;
  showNav?: boolean;
}

export function MainLayout({ children, showHero = false, showNav = false }: MainLayoutProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className="min-h-screen bg-gradient-to-b from-zinc-900 to-black"
    >
      <Header showNav={showNav} />
      <main>
        {children}
      </main>
    </motion.div>
  );
}
