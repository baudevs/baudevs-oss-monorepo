'use client';

import { motion } from 'framer-motion';
import { TutorialStep } from '@components/ui/TutorialStep';
import { MainLayout } from '@components/layouts/MainLayout';
import { DocsLayout } from '@layouts/DocsLayout';
import { 
  Terminal,
  Bot,
  Code,
  Laptop,
  Sparkles,
  PlayCircle,
  Command,
  Brain,
  Rocket,
  Download,
  Zap,
  Check,
  GitBranch,
  PlusCircle
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

export default function GettingStartedPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
        <DocsLayout>
          <article className="max-w-5xl mx-auto px-4">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn} className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center gap-4">
                  Welcome to Coding!
                  <motion.span 
                    whileHover={{ rotate: 360 }} 
                    transition={{ duration: 0.6 }}
                  >
                    <Rocket className="h-12 w-12 text-purple-500" />
                  </motion.span>
                </h1>
                <p className="text-xl text-zinc-400 mb-6">
                  Hey there! Whether you're writing your first line of code or you're a seasoned dev who's tired of writing commit messages,
                  you're in the right place! YOLO is here to make coding more fun and less tedious{' '}
                  <span role="img" aria-label="sparkles">✨</span>
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  <motion.div 
                    className="rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Bot className="h-5 w-5 text-purple-400" />
                      New to Coding?
                    </h3>
                    <p className="text-zinc-300">
                      Don't worry! We'll walk you through everything, starting from absolute basics. 
                      With AI by your side, learning to code has never been easier!
                    </p>
                  </motion.div>
                  <motion.div 
                    className="rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Code className="h-5 w-5 text-emerald-400" />
                      Experienced Developer?
                    </h3>
                    <p className="text-zinc-300">
                      Skip the basics and jump straight to automating those tedious tasks. 
                      Let AI handle the commit messages while you focus on what matters!
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              <TutorialStep 
                icon={Terminal}
                title="First Things First: Your Development Environment"
                description={
                  <>
                    <p className="mb-4">
                      Think of your development environment as your digital workshop. We'll help you set it up step by step, 
                      no prior knowledge needed! 
                    </p>
                    <p className="mb-4">
                      Don't worry if some terms sound unfamiliar - we'll explain everything as we go along. By the end of this guide, 
                      you'll have a professional coding setup that both beginners and experts love to use!
                    </p>
                  </>
                }
              />

              <TutorialStep 
                icon={Laptop}
                title="Installing iTerm2 - Your Command Center"
                description={
                  <>
                    <p className="mb-4">
                      iTerm2 is like a super-powered version of your Mac's Terminal. Think of it as your computer's control room, 
                      where you can type commands to make magic happen! ✨
                    </p>
                    <p className="mb-4">
                      Even if you've never used a terminal before, don't worry! We'll guide you through each step, 
                      and soon you'll be typing commands like a pro.
                    </p>
                    <ol className="list-decimal pl-4 space-y-2">
                      <li>Visit the <a href="https://iterm2.com/" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">iTerm2 website</a></li>
                      <li>Click the big "Download" button (it's usually in the top right)</li>
                      <li>Once downloaded, open the file (it might be in your Downloads folder)</li>
                      <li>Drag the iTerm2 icon to your Applications folder - that's it!</li>
                    </ol>
                  </>
                }
                note="If you see any security warnings, that's normal! macOS is just being careful. Click 'Open' when prompted."
              />

              <TutorialStep 
                icon={Sparkles}
                title="The Magic Setup Script"
                description={
                  <>
                    <p className="mb-4">
                      Now for the fun part! We've created a special script that sets up everything you need. 
                      It's like having a technical friend do all the setup for you! 
                    </p>
                    <p className="mb-4">Here's what our magical script will install:</p>
                    <ul className="list-disc pl-4 space-y-2 mb-4">
                      <li><span className="font-semibold">Homebrew</span>: Think of it as the App Store for developers</li>
                      <li><span className="font-semibold">Zsh & Oh My Zsh</span>: Makes your terminal beautiful and smart</li>
                      <li><span className="font-semibold">Python</span>: A friendly programming language to start with</li>
                      <li><span className="font-semibold">Node.js</span>: Powers modern web development</li>
                      <li><span className="font-semibold">Git</span>: Keeps track of all your code changes</li>
                    </ul>
                    <p>Don't worry about understanding everything yet - just know that these are the tools the pros use!</p>
                  </>
                }
                code={`# Just copy and paste these commands into iTerm2:
curl -o setup.sh https://raw.githubusercontent.com/baudevs/setup/main/setup.sh
chmod +x setup.sh
./setup.sh`}
                note="The script will ask for your password - this is normal! Your Mac needs permission to install these tools."
              />

              <TutorialStep 
                icon={GitBranch}
                title="Git: Your Code's Time Machine"
                description={
                  <>
                    <p className="mb-4">
                      Remember when you could press ⌘+Z to undo changes? Git is like that, but WAY more powerful! 
                      It's your code's time machine, and it's essential for modern development.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">What Git Does</h4>
                        <ul className="list-disc pl-4 space-y-2">
                          <li>Saves all versions of your code</li>
                          <li>Helps you work with others</li>
                          <li>Lets you experiment safely</li>
                          <li>Tracks who changed what</li>
                        </ul>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Why You'll Love It</h4>
                        <ul className="list-disc pl-4 space-y-2">
                          <li>Never lose your work</li>
                          <li>Try new ideas without fear</li>
                          <li>Collaborate easily</li>
                          <li>Industry standard tool</li>
                        </ul>
                      </div>
                    </div>
                    <p>
                      And here's the best part: YOLO makes Git even better by automating those tricky commit messages! 
                      Let AI handle the boring stuff while you focus on coding.
                    </p>
                  </>
                }
                code={`# Git is already installed by our script, but here's how to set it up:
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Try your first git command:
git --version`}
                note="Don't worry about memorizing Git commands - YOLO will help you with that!"
              />

              <TutorialStep 
                icon={PlusCircle}
                title="Install YOLO- Your AI Coding Assistant"
                description={
                  <>
                    <p className="mb-4">
                      Time to install your new favorite coding companion! We've made installation super simple 
                      with our install script.
                    </p>
                    
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg p-6 mb-6">
                      <h4 className="text-lg font-semibold mb-3"><span aria-label="rocket" role="img">🚀</span> Quick Install</h4>
                      <pre className="bg-black/30 p-3 rounded mb-3 text-sm">
                        curl -fsSL https://raw.githubusercontent.com/baudevs/yolo.baudevs.com/main/install.sh | sh
                      </pre>
                      <p className="text-sm">
                        Need more detailed instructions? Check out our complete{' '}
                        <a href="/install" className="text-blue-400 hover:underline">installation guide</a>.
                      </p>
                    </div>

                    <div className="bg-zinc-800 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Command className="h-5 w-5" />
                        Verify Installation
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="mb-2">Check your installation:</p>
                          <pre className="bg-black/30 p-2 rounded text-sm mb-2">
                            yolo --version
                          </pre>
                        </div>
                        <div>
                          <p className="mb-2">Try a simple command:</p>
                          <pre className="bg-black/30 p-2 rounded text-sm mb-2">
                            yolo hello
                          </pre>
                        </div>
                      </div>
                    </div>
                  </>
                }
                note="If you see any messages asking for your password, that's normal! Just type your password and press Enter."
              />

              <TutorialStep 
                icon={Brain}
                title="Your AI Coding Companions"
                description={
                  <>
                    <p className="mb-4">
                      Here's where the magic really happens! We live in an amazing time where AI can help us code better and faster.
                      Think of these tools as your coding super-powers! 🦸‍♂️
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div className="bg-purple-500/10 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Bot className="h-5 w-5" /> ChatGPT
                        </h4>
                        <p className="text-sm mb-2">Your personal coding tutor! It can:</p>
                        <ul className="text-sm list-disc pl-4 space-y-1">
                          <li>Explain complex concepts simply</li>
                          <li>Help debug your code</li>
                          <li>Suggest improvements</li>
                          <li>Answer any coding question</li>
                        </ul>
                        <a href="https://chat.openai.com" className="text-sm text-purple-400 hover:underline mt-2 inline-block" target="_blank" rel="noopener noreferrer">Start Chatting →</a>
                      </div>
                      <div className="bg-blue-500/10 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Zap className="h-5 w-5" /> GitHub Copilot
                        </h4>
                        <p className="text-sm mb-2">Your coding co-pilot! It will:</p>
                        <ul className="text-sm list-disc pl-4 space-y-1">
                          <li>Suggest code as you type</li>
                          <li>Complete repetitive tasks</li>
                          <li>Help with boilerplate code</li>
                          <li>Work in your editor</li>
                        </ul>
                        <a href="https://github.com/features/copilot" className="text-sm text-blue-400 hover:underline mt-2 inline-block" target="_blank" rel="noopener noreferrer">Get Copilot →</a>
                      </div>
                    </div>
                  </>
                }
                note="Remember: AI is a helper, not a replacement. Use it to learn and understand, not just copy-paste!"
              />

              <TutorialStep 
                icon={Code}
                title="Choose Your Code Editor"
                description={
                  <>
                    <p className="mb-4">
                      Just like artists need a canvas, developers need a code editor. We've picked the most beginner-friendly 
                      options that still pack all the power you'll need as you grow!
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div className="bg-emerald-500/10 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Cursor - The Smart Editor</h4>
                        <p className="text-sm mb-2">Perfect for beginners and pros alike!</p>
                        <ul className="text-sm list-disc pl-4 space-y-1 mb-2">
                          <li>Built-in AI assistance</li>
                          <li>Modern, clean interface</li>
                          <li>Great for all languages</li>
                          <li>Free to use!</li>
                        </ul>
                        <a href="https://cursor.sh" className="text-sm text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">Download Cursor →</a>
                      </div>
                      <div className="bg-orange-500/10 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Replit - Code in Your Browser</h4>
                        <p className="text-sm mb-2">Start coding instantly!</p>
                        <ul className="text-sm list-disc pl-4 space-y-1 mb-2">
                          <li>No setup needed</li>
                          <li>Built-in AI help</li>
                          <li>Learn by doing</li>
                          <li>Share your code easily</li>
                        </ul>
                        <a href="https://replit.com" className="text-sm text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer">Try Replit →</a>
                      </div>
                    </div>
                  </>
                }
              />

              <TutorialStep 
                icon={PlayCircle}
                title="Ready to Code? Let's Go!"
                description={
                  <>
                    <p className="mb-6">
                      You've got your tools, you've got AI by your side, and you're ready to start coding! 
                      Here are some fun ways to begin your journey:
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Start with Python</h4>
                        <p className="text-sm mb-2">The friendliest way to begin!</p>
                        <pre className="bg-black/30 p-2 rounded mt-2 text-xs">
                          print("Hello, World! 🌎")
                        </pre>
                      </div>
                      <div className="bg-gradient-to-br from-pink-500/10 to-red-500/10 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Build a Website</h4>
                        <p className="text-sm mb-2">Create something you can share!</p>
                        <pre className="bg-black/30 p-2 rounded mt-2 text-xs">
                          {"<h1>My First Website 🚀</h1>"}
                        </pre>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Try YOLO</h4>
                        <p className="text-sm mb-2">Let AI help you code!</p>
                        <pre className="bg-black/30 p-2 rounded mt-2 text-xs">
                          yolo commit
                        </pre>
                      </div>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-6">
                      <h4 className="font-semibold mb-2">Remember:</h4>
                      <ul className="list-disc pl-4 space-y-2">
                        <li>Everyone starts somewhere - don't be afraid to experiment!</li>
                        <li>Use AI tools to learn and understand, not just to get answers</li>
                        <li>Join our community to learn from others</li>
                        <li>Have fun! Coding is creative and rewarding</li>
                      </ul>
                    </div>
                  </>
                }
                note="Stuck? Just ask ChatGPT or our community for help. We're all here to learn together! 🤝"
              />
            </motion.div>
          </article>
        </DocsLayout>
      </div>
    </MainLayout>
  );
}
