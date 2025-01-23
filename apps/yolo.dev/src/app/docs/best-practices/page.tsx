'use client';

import { motion } from 'framer-motion';
import { DocsLayout } from '@layouts/DocsLayout';
import { 
  CheckCircle,
  MessageSquare,
  GitBranch,
  FileText,
  Brain,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Clock,
  Target,
  Repeat,
  BookOpen
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const PracticeCard = ({ icon: Icon, title, items }: { icon: any; title: string; items: string[] }) => (
  <motion.div 
    className="rounded-lg bg-zinc-800/50 p-6"
    whileHover={{ scale: 1.02 }}
  >
    <Icon className="h-6 w-6 text-blue-400 mb-4" />
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-zinc-300">
          <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

export default function BestPracticesPage() {
  return (
    <DocsLayout>
      <article className="max-w-5xl mx-auto px-4">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center gap-4">
              Best Practices
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <BookOpen className="h-12 w-12 text-green-500" />
              </motion.span>
            </h1>
            <p className="text-xl text-zinc-400">
              Master YOLO with these proven practices and guidelines{' '}
              <span role="img" aria-label="sparkles">✨</span>
            </p>
          </motion.div>

          {/* Talking to AI Section */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">Talking to AI</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div 
                className="rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-semibold mb-4">Good Examples</h3>
                <pre className="bg-black/30 p-4 rounded text-sm text-green-400 mb-2">
{`yolo ask "How should I implement JWT
authentication in the login endpoint?"

yolo explain login.go --context "Using JWT"`}
                </pre>
              </motion.div>

              <motion.div 
                className="rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-semibold mb-4">Avoid These</h3>
                <pre className="bg-black/30 p-4 rounded text-sm text-red-400 mb-2">
{`yolo ask "How do I code?"

yolo explain login.go
(without context)`}
                </pre>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PracticeCard 
                icon={Brain}
                title="AI Communication"
                items={[
                  "Be specific in your questions",
                  "Provide relevant context",
                  "Use appropriate commands",
                  "Review AI suggestions carefully"
                ]}
              />

              <PracticeCard 
                icon={AlertTriangle}
                title="Common Pitfalls"
                items={[
                  "Avoid vague questions",
                  "Don't skip context",
                  "Review before implementing",
                  "Keep prompts up to date"
                ]}
              />
            </div>
          </motion.section>

          {/* Version Control Section */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <GitBranch className="h-8 w-8 text-purple-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">Version Control</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PracticeCard 
                icon={Clock}
                title="Commit Timing"
                items={[
                  "Commit after each logical change",
                  "When tests pass",
                  "Before switching tasks",
                  "After refactoring"
                ]}
              />

              <PracticeCard 
                icon={Target}
                title="Commit Scope"
                items={[
                  "Keep changes focused",
                  "Split large changes",
                  "Group related modifications",
                  "Include relevant tests"
                ]}
              />
            </div>
          </motion.section>

          {/* Documentation Section */}
          <motion.section variants={fadeIn} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <FileText className="h-8 w-8 text-yellow-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">Documentation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PracticeCard 
                icon={Zap}
                title="Keep It Updated"
                items={[
                  "Update docs with code changes",
                  "Use AI for documentation",
                  "Keep README.md current",
                  "Document AI interactions"
                ]}
              />

              <PracticeCard 
                icon={ShieldCheck}
                title="Quality Standards"
                items={[
                  "Clear and concise writing",
                  "Include examples",
                  "Maintain consistency",
                  "Regular reviews"
                ]}
              />
            </div>
          </motion.section>

          {/* Workflow Management */}
          <motion.section variants={fadeIn}>
            <div className="flex items-center gap-3 mb-6">
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <Repeat className="h-8 w-8 text-emerald-500" />
              </motion.span>
              <h2 className="text-3xl font-bold">Workflow Management</h2>
            </div>

            <motion.div 
              className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-8"
              whileHover={{ scale: 1.01 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Planning</h4>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Break down epics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Define clear tasks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Set priorities
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Execution</h4>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Follow task order
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Regular updates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Track progress
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Review</h4>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Regular reviews
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Update status
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Document learnings
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.section>
        </motion.div>
      </article>
    </DocsLayout>
  );
}
