'use client';

import { motion } from 'framer-motion';
import { DocsLayout } from '@/app/components/layouts/DocsLayout';

export default function DocsPage() {
  return (
    <DocsLayout>
      <article>
        <h1>Understanding YOLO: A Complete Guide</h1>
        
        <p className="lead">
          YOLO is more than just a methodology or a set of tools—it&apos;s a revolutionary approach to 
          project management that bridges the gap between human developers and AI assistants, making 
          development both more efficient and enjoyable.
        </p>

        <h2>The Philosophy Behind YOLO</h2>
        <p>
          In the era of AI-assisted development, traditional project management approaches often fall short. 
          YOLO was born from the need to create a system that embraces both human creativity and AI capabilities, 
          while maintaining a clear history of project evolution and decision-making.
        </p>

        <h2>Core Principles</h2>
        <ul>
          <li>
            <strong>Nothing is Ever Lost</strong>: Instead of deleting code or documentation, YOLO 
            encourages marking items as deprecated, maintaining a complete historical context.
          </li>
          <li>
            <strong>Relationship-Driven Development</strong>: Every task, feature, and epic is 
            connected in a graph of relationships, making it easy to understand dependencies and impact.
          </li>
          <li>
            <strong>AI-First Documentation</strong>: Documentation is structured to be both human-readable 
            and AI-parseable, enabling better collaboration with AI assistants.
          </li>
        </ul>

        <h2>The YOLO File Structure</h2>
        <h3>The /yolo Directory</h3>
        <p>
          At the heart of every YOLO project is the /yolo directory, containing:
        </p>
        <ul>
          <li>
            <strong>epics/</strong>: High-level project initiatives
            <ul>
              <li>Each file represents one epic</li>
              <li>Contains links to related features</li>
              <li>Includes success criteria and timeline</li>
            </ul>
          </li>
          <li>
            <strong>features/</strong>: Specific functionality implementations
            <ul>
              <li>Linked to parent epics</li>
              <li>Broken down into tasks</li>
              <li>Includes technical requirements</li>
            </ul>
          </li>
          <li>
            <strong>tasks/</strong>: Individual development items
            <ul>
              <li>Concrete, actionable items</li>
              <li>Links to parent features</li>
              <li>Implementation details and acceptance criteria</li>
            </ul>
          </li>
        </ul>

        <h3>Core Documentation Files</h3>
        <p>
          YOLO projects maintain several key files in the root directory:
        </p>
        <ul>
          <li>
            <strong>README.md</strong>: Project overview and getting started guide
          </li>
          <li>
            <strong>CHANGELOG.md</strong>: Detailed history of changes, including deprecated features
          </li>
          <li>
            <strong>WISHES.md</strong>: Future plans and feature requests
          </li>
          <li>
            <strong>STRATEGY.md</strong>: Project direction and architectural decisions
          </li>
          <li>
            <strong>LLM_INSTRUCTIONS</strong>: Guidelines for AI interactions
          </li>
        </ul>

        <h2>The HISTORY.yaml File</h2>
        <p>
          HISTORY.yaml is the cornerstone of YOLO&apos;s tracking system. It maintains a structured record of:
        </p>
        <ul>
          <li>All changes made by AI assistants</li>
          <li>Important development decisions</li>
          <li>Code evolution and refactoring</li>
          <li>Feature implementations and deprecations</li>
        </ul>

        <h2>Sprint Management</h2>
        <p>
          YOLO introduces a unique approach to sprint management through dedicated files:
        </p>
        <ul>
          <li>
            <strong>sprint.current.md</strong>: Active development conversations and decisions
          </li>
          <li>
            <strong>sprint.past.md</strong>: Historical context from previous sprints
          </li>
          <li>
            <strong>sprint.next.md</strong>: Upcoming work and planning discussions
          </li>
        </ul>

        <h2>YOLO Tools</h2>
        <p>
          The YOLO CLI provides various commands to streamline development:
        </p>
        <ul>
          <li>
            <strong>yolo ask</strong>: Get concise, three-point answers to development questions
          </li>
          <li>
            <strong>yolo commit</strong>: Smart Git operations with AI-generated commit messages
          </li>
          <li>
            <strong>yolo sprint</strong>: Manage sprint files and conversation history
          </li>
          <li>
            <strong>yolo epic/feature/task</strong>: Create and manage project items with automatic relationship mapping
          </li>
          <li>
            <strong>yolo code-to-llm</strong>: Prepare code for LLM consumption with smart tokenization
          </li>
        </ul>

        <h2>Best Practices</h2>
        <h3>Documentation Guidelines</h3>
        <ul>
          <li>Keep descriptions clear and concise</li>
          <li>Always include relationship links</li>
          <li>Use consistent formatting</li>
          <li>Update HISTORY.yaml for significant changes</li>
        </ul>

        <h3>Working with AI</h3>
        <ul>
          <li>Maintain clear LLM instructions</li>
          <li>Document AI-generated changes</li>
          <li>Review and validate AI suggestions</li>
          <li>Keep sprint conversations focused</li>
        </ul>

        <h2>Getting Started</h2>
        <p>
          To begin using YOLO in your project:
        </p>
        <ol>
          <li>Install the YOLO CLI</li>
          <li>Initialize the YOLO structure in your project</li>
          <li>Set up your core documentation files</li>
          <li>Create your first epic and related features</li>
          <li>Start tracking changes in HISTORY.yaml</li>
        </ol>

        <div className="mt-12 rounded-lg bg-zinc-100 p-6 dark:bg-zinc-800">
          <h3 className="mt-0">Ready to Start?</h3>
          <p className="mb-0">
            Check out our installation guide to begin your YOLO journey, or explore our 
            detailed documentation sections for more specific guidance.
          </p>
        </div>
      </article>
    </DocsLayout>
  );
}
