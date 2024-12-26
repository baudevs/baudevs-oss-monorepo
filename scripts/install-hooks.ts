#!/usr/bin/env bun
/// <reference types="bun-types" />

import { copyFileSync, chmodSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// ANSI color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const NC = '\x1b[0m'; // No Color

// Print BauDevs logo
console.log(`${BLUE}${BOLD}
   ___               ___
  (  _\`\\            (  _\`\\
  | (_) )  _ _ _   _| | ) |  __  _   _  ___
  |  _ <'/'_\` ( ) ( | | | )/'__\`( ) ( /',__)
  | (_) ( (_| | (_) | |_) (  ___| \\_/ \\__, \\
  (____/\`\\__,_\`\\___/(____/\`\\____\`\\___/(____/
${NC}\n`);

// Print header
console.log(`${BLUE}${BOLD}╔═══════════════════════ 🪝 Git Hooks Installer ═══════════════════════╗${NC}`);

const HOOKS_SOURCE_DIR = join(process.cwd(), 'scripts', 'hooks');
const GIT_HOOKS_DIR = join(process.cwd(), '.git', 'hooks');

// Print paths table
console.log(`\n${CYAN}${BOLD}▶ 📂 Installation Paths${NC}`);
console.log(`${CYAN}${BOLD}──────────────────────────────────────────────────────────────${NC}`);
console.log(`┌─────────────┬────────────────────────────────────────────��───┐`);
console.log(`│ Source      │ ${BOLD}${HOOKS_SOURCE_DIR}${NC}`);
console.log(`│ Destination │ ${BOLD}${GIT_HOOKS_DIR}${NC}`);
console.log(`└─────────────┴────────────────────────────────────────────────┘\n`);

// Create hooks directory if needed
if (!existsSync(GIT_HOOKS_DIR)) {
  console.log(`${YELLOW}${BOLD}📁 Creating hooks directory...${NC}`);
  mkdirSync(GIT_HOOKS_DIR, { recursive: true });
}

// Install hooks
console.log(`${CYAN}${BOLD}▶ 🔧 Installing Hooks${NC}`);
console.log(`${CYAN}${BOLD}──────────────────────────────────────────────────────────────${NC}`);

const hooks = [
  { name: 'post-commit', emoji: '📝', mode: 0o755 }
];

// Installation status table
console.log(`┌────────────┬─────────┬──────────────────────────────────────┐`);
console.log(`│ Hook       │ Status  │ Details                              │`);
console.log(`├────────────┼─────────┼─────���────────────────────────────────┤`);

let hasErrors = false;

hooks.forEach(hook => {
  const sourceFile = join(HOOKS_SOURCE_DIR, hook.name);
  const targetFile = join(GIT_HOOKS_DIR, hook.name);

  try {
    copyFileSync(sourceFile, targetFile);
    chmodSync(targetFile, hook.mode);
    console.log(`│ ${hook.emoji} ${hook.name.padEnd(7)} │ ${GREEN}✓ Done${NC}  │ Installed and set as executable      │`);
  } catch (error) {
    hasErrors = true;
    console.log(`│ ${hook.emoji} ${hook.name.padEnd(7)} │ ${RED}✗ Error${NC} │ ${(error as Error).message.slice(0, 32).padEnd(32)} │`);
  }
});

console.log(`└────────────┴─────────┴──────────────────────────────────────┘\n`);

// Final status
if (hasErrors) {
  console.log(`${RED}${BOLD}❌ Installation completed with errors${NC}\n`);
  process.exit(1);
} else {
  console.log(`${GREEN}${BOLD}✅ All hooks installed successfully${NC}\n`);
}
