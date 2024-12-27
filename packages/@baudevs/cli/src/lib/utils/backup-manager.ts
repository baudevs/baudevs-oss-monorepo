import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

interface FileChange {
  path: string;
  originalContent: string | null;
  newContent: string;
  timestamp: number;
  type: 'create' | 'modify' | 'delete';
}

interface BackupManifest {
  changes: FileChange[];
  timestamp: number;
  description: string;
}

export class BackupManager {
  private backupDir: string;
  private currentManifest: BackupManifest;

  constructor(projectPath: string = process.cwd()) {
    this.backupDir = join(projectPath, '.bau-backup');
    this.currentManifest = {
      changes: [],
      timestamp: Date.now(),
      description: 'BauCMS installation backup'
    };
  }

  async initialize() {
    if (!existsSync(this.backupDir)) {
      await mkdir(this.backupDir, { recursive: true });
    }
  }

  async trackChange(filePath: string, newContent: string, type: FileChange['type'] = 'modify') {
    let originalContent: string | null = null;

    if (existsSync(filePath)) {
      originalContent = await readFile(filePath, 'utf-8');
    }

    this.currentManifest.changes.push({
      path: filePath,
      originalContent,
      newContent,
      timestamp: Date.now(),
      type
    });

    // Save backup of original file if it existed
    if (originalContent !== null) {
      const backupPath = join(this.backupDir, `${Date.now()}-${filePath.replace(/[\/\\]/g, '-')}`);
      await writeFile(backupPath, originalContent);
    }

    // Save manifest
    await this.saveManifest();
  }

  async saveManifest() {
    const manifestPath = join(this.backupDir, 'manifest.json');
    await writeFile(manifestPath, JSON.stringify(this.currentManifest, null, 2));
  }

  async restoreAll() {
    for (const change of [...this.currentManifest.changes].reverse()) {
      if (change.originalContent === null) {
        // File was created, should be deleted
        // Note: We're not actually deleting here, just logging
        console.log(`Would delete: ${change.path}`);
      } else {
        await writeFile(change.path, change.originalContent);
        console.log(`Restored: ${change.path}`);
      }
    }
  }

  async getChangeSummary(): Promise<string> {
    let summary = 'Changes made by BauCMS:\n\n';

    for (const change of this.currentManifest.changes) {
      summary += `${change.type.toUpperCase()}: ${change.path}\n`;
      if (change.type === 'modify') {
        summary += `- Original content backed up at: ${this.backupDir}\n`;
      }
      summary += '\n';
    }

    return summary;
  }
}
