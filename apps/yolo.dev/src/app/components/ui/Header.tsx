'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Github } from 'lucide-react';
import Image from 'next/image';
import Logo from '@assets/YOLO_MAKE_AI_CODING_FUN.png';
import Link from 'next/link';
const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Installation', href: '#installation' },
  { label: 'Community', href: '#community' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed left-0 right-0 top-0 z-50 transition-colors ${
        isScrolled ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href='/' className="text-2xl font-bold text-white">
          <Image priority={true} src={Logo} alt="YOLO" width={200} height={50} />
        </Link>

        <nav className="hidden space-x-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/baudevs/yolo.baudevs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">Star on GitHub</span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
