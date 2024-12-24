#!/usr/bin/env bun
import { copyFileSync, chmodSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const HOOKS_SOURCE_DIR = join(process.cwd(), 'scripts', 'hooks');
const GIT_HOOKS_DIR = join(process.cwd(), '.git', 'hooks');

console.log('📦 Installing git hooks...');

// Ensure git hooks directory exists
if (!existsSync(GIT_HOOKS_DIR)) {
  mkdirSync(GIT_HOOKS_DIR, { recursive: true });
}

// Install post-commit hook
const sourceFile = join(HOOKS_SOURCE_DIR, 'post-commit');
const targetFile = join(GIT_HOOKS_DIR, 'post-commit');

try {
  copyFileSync(sourceFile, targetFile);
  chmodSync(targetFile, 0o755); // Make executable
  console.log('✅ Successfully installed post-commit hook');
} catch (error) {
  console.error('❌ Failed to install post-commit hook:', error);
  process.exit(1);
}
