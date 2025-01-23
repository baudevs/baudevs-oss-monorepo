'use client';

import { Layout } from '@components/layouts/Layout';
import { Header } from './components/ui/Header';
import { Hero } from './components/sections/Hero';
import { Features } from './components/sections/Features';
import { Installation } from './components/sections/Installation';
import { Community } from './components/sections/Community';
import { Why } from './components/sections/WhyYOLO';
import { Ecosystem } from './components/sections/Ecosystem';
import { Methodology } from './components/sections/Methodology';
import { motion } from 'framer-motion';
import { Check, Download, Zap, Sparkles } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function Home() {
  return (
    <Layout>
      <main>
        <Header />
        <Hero />
        <Why />
        <Methodology />
        <Ecosystem />
        <Features />
        <Installation />
        <Community />

        <section className="py-16 bg-gradient-to-b from-zinc-900/50 to-black">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Get Started in Seconds</h2>
              <p className="text-xl text-zinc-400">Install YOLO with a single command</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-8 max-w-2xl mx-auto">
              <pre className="bg-black/30 p-4 rounded-lg text-sm overflow-x-auto mb-4 text-blue-400">
                curl -fsSL https://raw.githubusercontent.com/baudevs/yolo.baudevs.com/main/install.sh | sh
              </pre>
              <div className="flex justify-between items-center">
                <p className="text-zinc-400">
                  Never used the command line before? No problem!
                </p>
                <a href="/install" className="text-blue-400 hover:underline">
                  View beginner's guide →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <motion.section 
          variants={fadeIn}
          className="py-20 bg-gradient-to-br from-purple-500/10 to-blue-500/10"
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Get Started with YOLO</h2>
              <p className="text-xl text-zinc-400">
                Choose your path to AI-powered development
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div 
                className="rounded-xl bg-zinc-800/50 p-8"
                whileHover={{ scale: 1.02 }}
              >
                <Download className="h-12 w-12 text-emerald-400 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Free CLI Tool</h3>
                <p className="text-zinc-400 mb-6">
                  Start with our powerful CLI tool and bring your own API keys. Perfect for exploring YOLO's capabilities.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-400" />
                    <span>Full access to YOLO features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-400" />
                    <span>Use OpenAI, Mistral, or Claude</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-400" />
                    <span>Pay providers directly</span>
                  </li>
                </ul>
                <a 
                  href="/install" 
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  Download YOLO CLI
                </a>
              </motion.div>

              <motion.div 
                className="rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-8"
                whileHover={{ scale: 1.02 }}
              >
                <Sparkles className="h-12 w-12 text-purple-400 mb-6" />
                <h3 className="text-2xl font-bold mb-4">YOLO Packages</h3>
                <p className="text-zinc-400 mb-6">
                  Supercharge your development with our optimized packages. Save costs and get premium features.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-purple-400" />
                    <span>Choose from any AI (ChatGPT, Claude, Mistral)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-purple-400" />
                    <span>Up to 40% cost savings compared to BYOA - Bring your own API keys -</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-purple-400" />
                    <span>Optimized prompts library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-purple-400" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <a 
                  href="/pricing" 
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-lg bg-purple-500 hover:bg-purple-600 transition-colors"
                >
                  <Zap className="h-5 w-5" />
                  View Packages
                </a>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>
    </Layout>
  );
}
