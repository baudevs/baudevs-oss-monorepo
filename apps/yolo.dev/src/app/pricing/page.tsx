'use client';

import { motion } from 'framer-motion';
import { PricingCard } from '@components/ui/PricingCard';
import { MainLayout } from '@components/layouts/MainLayout';
import { LucideIcon } from 'lucide-react';
import { 
  Zap, 
  Check,
  Download,
  Sparkles,
  BarChart,
  Clock,
  Users,
  Shield,
  MessageSquare
} from 'lucide-react';

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

interface ComparisonFeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const ComparisonFeature = ({ icon: Icon, title, description }: ComparisonFeatureProps) => (
  <motion.div 
    className="rounded-lg bg-zinc-800/50 p-6"
    whileHover={{ scale: 1.02 }}
  >
    <Icon className="h-8 w-8 text-purple-400 mb-4" />
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-zinc-400">{description}</p>
  </motion.div>
);

export default function PricingPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-900 text-white py-20">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4"
        >
          {/* Header */}
          <motion.div variants={fadeIn} className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Choose Your YOLO Journey
            </h1>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Start for free with your own API keys, or supercharge your development with our optimized packages
            </p>
          </motion.div>

          {/* Self-hosted vs YOLO Packages */}
          <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-8 mb-20">
            <motion.div 
              className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-8"
              whileHover={{ scale: 1.02 }}
            >
              <Download className="h-12 w-12 text-emerald-400 mb-6" />
              <h2 className="text-2xl font-bold mb-4">Community Edition (Free BYOA)</h2>
              <p className="text-zinc-400 mb-6">
                Perfect for getting started. Bring your own API keys (OpenAI, Claude, Mistral) and pay providers directly.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-400" />
                  <span>Full access to YOLO CLI</span>
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
              <h2 className="text-2xl font-bold mb-4">YOLO Pro</h2>
              <p className="text-zinc-400 mb-6">
                Enhanced development with optimized packages and significant cost savings.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-purple-400" />
                  <span>Switch between AI models</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-purple-400" />
                  <span>Pre-purchased token packages</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-purple-400" />
                  <span>Up to 40% cost savings compared to BYOA (Bring you  own API keys)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-purple-400" />
                  <span>Advanced features & support</span>
                </li>
              </ul>
              <a 
                href="#packages" 
                className="inline-flex items-center gap-2 py-3 px-6 rounded-lg bg-purple-500 hover:bg-purple-600 transition-colors"
              >
                <Zap className="h-5 w-5" />
                View Packages
              </a>
            </motion.div>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div variants={fadeIn} className="mb-20" id="packages">
            <h2 className="text-3xl font-bold text-center mb-12">YOLO Packages</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <PricingCard 
                title="Starter"
                price="6"
                description="Perfect for individual developers"
                features={[
                  "5K tokens monthly",
                  "All core YOLO features",
                  "Single developer license",
                  "Email support",
                  "No Token rollover"
                ]}
              />

              <PricingCard 
                title="Developer"
                price="25"
                description="Ideal for active developers"
                features={[
                  "All in Starter, plus:",
                  "100K tokens monthly",
                  "Advanced prompts",
                  "Usage analytics",
                  "Priority email support",
                  "Custom prompts library",
                  "Token rollover protection up to 10K tokens for 3 months"
                ]}
                highlighted
              />

              <PricingCard 
                title="Team"
                price="299"
                description="Great for small teams"
                features={[
                  "All in Personal Pro for all developers, plus:",
                  "2M tokens monthly",
                  "Up to 5 developer licenses",
                  "Team management",
                  "Slack support",
                  "Webhooks",
                  "Custom integrations",
                  "Token rollover"
                ]}
              />

              <PricingCard 
                title="Enterprise"
                price="Custom"
                description="Tailored solutions for large teams"
                features={[
                  "Custom token allocation",
                  "Unlimited developers",
                  "24/7 dedicated support",
                  "On-premises options",
                  "Custom feature development"
                ]}
                ctaText="Contact Sales"
                ctaLink="mailto:sales@baudevs.com"
              />
            </div>
          </motion.div>

          {/* Feature Comparison */}
          <motion.div variants={fadeIn}>
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose YOLO Packages?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ComparisonFeature 
                icon={BarChart}
                title="Cost Optimization"
                description="Save up to 40% on token costs with our pre-purchased packages"
              />
              <ComparisonFeature 
                icon={Clock}
                title="Token Rollover"
                description="Unused tokens roll over for up to 3 months, ensuring no waste"
              />
              <ComparisonFeature 
                icon={Users}
                title="Team Management"
                description="Easily manage licenses and monitor usage across your team"
              />
              <ComparisonFeature 
                icon={Shield}
                title="Enterprise Security"
                description="Advanced security features including SSO and audit logs"
              />
              <ComparisonFeature 
                icon={MessageSquare}
                title="Priority Support"
                description="Get help when you need it with our dedicated support team"
              />
              <ComparisonFeature 
                icon={Sparkles}
                title="Optimized Prompts"
                description="Access our library of optimized prompts for better results"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
