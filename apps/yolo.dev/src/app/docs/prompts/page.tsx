'use client';

import { motion } from 'framer-motion';
import { DocsLayout } from '@layouts/DocsLayout';
import { LucideIcon } from 'lucide-react';
import { 
  MessageSquare,
  FileText,
  GitCommit,
  History,
  Brain,
  Sparkles,
  Star,
  Lightbulb,
  Workflow,
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const PromptCard = ({ 
  icon: Icon, 
  title, 
  description, 
  prompt, 
  output 
}: { 
  icon: LucideIcon; 
  title: string; 
  description: string;
  prompt: string;
  output?: string;
}) => (
  <motion.div 
    className="rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-8 mb-8"
    whileHover={{ scale: 1.01 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <motion.span whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
        <Icon className="h-8 w-8 text-purple-400" />
      </motion.span>
      <h3 className="text-2xl font-bold">{title}</h3>
    </div>
    <p className="text-zinc-300 mb-6">{description}</p>
    
    <div className="mb-6">
      <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <Brain className="h-5 w-5 text-blue-400" />
        Prompt Template
      </h4>
      <pre className="bg-black/30 p-4 rounded-lg text-sm text-blue-400 overflow-x-auto whitespace-pre-wrap">
        {prompt}
      </pre>
    </div>

    {output && (
      <div>
        <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          Example Output Structure
        </h4>
        <pre className="bg-black/30 p-4 rounded-lg text-sm text-yellow-400 overflow-x-auto whitespace-pre-wrap">
          {output}
        </pre>
      </div>
    )}
  </motion.div>
);

export default function PromptsPage() {
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
              Standard Prompts
              <motion.span 
                whileHover={{ rotate: 360 }} 
                transition={{ duration: 0.6 }}
              >
                <MessageSquare className="h-12 w-12 text-purple-500" />
              </motion.span>
            </h1>
            <p className="text-xl text-zinc-400">
              Master the art of AI communication with our curated prompt templates{' '}
              <span role="img" aria-label="sparkles">✨</span>
            </p>
          </motion.div>

          <motion.section variants={fadeIn}>
            <PromptCard 
              icon={FileText}
              title="YOLO Documentation"
              description="Generate comprehensive project documentation following YOLO methodology"
              prompt={`As my developer, I want you to document everything we just did using the YOLO methodology, which is based on the yolo folder in this project, having all epics, features and tasks, the README, CHANGELOG, with standard commit and semver standards, and the history.yaml documenting everything we have done. Plus the WISHES having all that will come, organized from the epics, features and tasks in the yolo folder. Remember we never delete anything, we just mark as implemented, completed, deprecated, deleted, etc.`}
              output={`📁 .yolo/
├── epics/
│   └── E001-project-setup.md
├── features/
│   └── F001-initial-structure.md
├── tasks/
│   └── T001-create-folders.md
├── history.yaml
├── README.md
├── CHANGELOG.md
└── WISHES.md`}
            />

            <PromptCard 
              icon={GitCommit}
              title="Smart Commit Message"
              description="Generate semantic commit messages with detailed descriptions"
              prompt={`Analyze the following changes and generate a commit message following conventional commits format. Include a detailed description of the changes, breaking changes if any, and related issue references. The message should be clear, concise, and follow semver standards.

Changes to analyze:
[paste changes or provide context]`}
              output={`feat(auth): implement JWT authentication system

- Add token generation and validation
- Implement refresh token logic
- Add middleware for route protection

BREAKING CHANGE: Auth header format changed
Fixes #123`}
            />

            <PromptCard 
              icon={History}
              title="History Entry"
              description="Create a detailed history.yaml entry for tracking changes"
              prompt={`Create a history.yaml entry for the following changes. Include timestamp, type (epic/feature/task), summary, impact, status, and any related items. The entry should be detailed enough to understand the context and purpose of the changes later.

Changes to document:
[paste changes or provide context]`}
              output={`entries:
  - timestamp: "2025-01-23T16:15:00+01:00"
    type: feature
    id: F001
    summary: "Add authentication system"
    impact: "Improved security"
    status: "implemented"
    related:
      epic: E001
      tasks: [T001, T002]
    note: "JWT-based auth system added"`}
            />

            <PromptCard 
              icon={Workflow}
              title="Task Breakdown"
              description="Break down features into actionable tasks"
              prompt={`Break down the following feature into specific, actionable tasks. Each task should be small enough to be completed in one sitting, have clear success criteria, and maintain relationships with the parent feature. Consider technical dependencies and suggest a logical order.

Feature to break down:
[feature description]`}
              output={`Tasks:
1. T001: Set up database schema
   - Success: Tables created
   - Dependencies: None

2. T002: Implement API endpoints
   - Success: Endpoints tested
   - Dependencies: T001

3. T003: Add validation
   - Success: Input validated
   - Dependencies: T002`}
            />

            <PromptCard 
              icon={Star}
              title="Feature Request"
              description="Document feature requests in WISHES.md"
              prompt={`Document the following feature request in WISHES.md format. Include a clear description, potential impact, suggested implementation approach, and any related existing features or epics. Remember to maintain relationships and keep the history traceable.

Feature request:
[feature description]`}
              output={`## Feature: Enhanced Search
Status: proposed
Priority: high
Related: E002, F005

### Description
Implement elasticsearch for better search

### Impact
- Improved performance
- Better user experience

### Implementation Notes
Consider using elastic cloud`}
            />

            <PromptCard 
              icon={Lightbulb}
              title="AI Suggestions"
              description="Get AI-powered suggestions for improvements"
              prompt={`Analyze the current implementation and suggest improvements. Consider code quality, performance, security, and user experience. Provide specific, actionable suggestions with examples where possible. Remember to maintain the project's existing patterns and standards.

Area to analyze:
[code or feature to analyze]`}
              output={`Suggestions:
1. Performance
   - Add caching layer
   - Implement pagination

2. Security
   - Add rate limiting
   - Enhance validation

3. Code Quality
   - Extract common logic
   - Add unit tests`}
            />
          </motion.section>
        </motion.div>
      </article>
    </DocsLayout>
  );
}
