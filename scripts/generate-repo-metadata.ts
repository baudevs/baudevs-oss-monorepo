import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';

interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
  branch: string;
  files: string[];
  nxProjects: string[];
}

interface GitWorktree {
  path: string;
  branch: string;
  commit: string;
  lastActivity: string;
}

interface NxProject {
  name: string;
  type: 'app' | 'library' | 'package';
  root: string;
  sourceRoot: string;
  tags: string[];
  dependencies: string[];
  lastCommits: GitCommit[];
  contributors: {
    name: string;
    email: string;
    commits: number;
    lastActivity: string;
  }[];
}

interface BranchRelationship {
  from: string;
  to: string;
  type: 'merge' | 'rebase';
  lastSync: string;
  commonAncestor: string;
  divergedCommits: number;
}

interface RepoMetadata {
  repoPath: string;
  defaultBranch: string;
  generatedAt: string;
  gitVersion: string;
  nxVersion: string;
  nodeVersion: string;
  bunVersion: string;
  worktrees: GitWorktree[];
  nxProjects: NxProject[];
  branchRelationships: BranchRelationship[];
  recentActivity: {
    lastPush: string;
    lastPull: string;
    lastMerge: string;
    activeBranches: {
      name: string;
      lastCommit: string;
      author: string;
      commitCount: number;
    }[];
  };
  projectStats: {
    totalApps: number;
    totalLibraries: number;
    totalPackages: number;
    totalFiles: number;
    totalCommits: number;
    totalContributors: number;
  };
}

interface WorkspaceProject {
  root: string;
  sourceRoot: string;
  projectType: 'app' | 'library' | 'package';
  tags?: string[];
}

function execCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (_error) {
    console.error(`Error executing command: ${command}`);
    return '';
  }
}

function getGitWorktrees(): GitWorktree[] {
  const output = execCommand('git worktree list --porcelain');
  const worktrees: GitWorktree[] = [];
  
  output.split('\n\n').forEach(wt => {
    const lines = wt.split('\n');
    const worktree: Partial<GitWorktree> = {};
    
    lines.forEach(line => {
      if (line.startsWith('worktree ')) worktree.path = line.substring(9);
      if (line.startsWith('branch ')) worktree.branch = line.substring(7).replace('refs/heads/', '');
      if (line.startsWith('HEAD ')) worktree.commit = line.substring(5);
    });
    
    if (worktree.path) {
      const lastActivity = execCommand(`cd "${worktree.path}" && git log -1 --format=%cd`);
      worktrees.push({
        path: worktree.path,
        branch: worktree.branch || 'detached',
        commit: worktree.commit || '',
        lastActivity
      });
    }
  });
  
  return worktrees;
}

function getNxProjects(): NxProject[] {
  const workspaceJson = JSON.parse(readFileSync('workspace.json', 'utf-8'));
  const projects: NxProject[] = [];
  
  for (const [name, config] of Object.entries<WorkspaceProject>(workspaceJson.projects)) {
    const projectPath = config.root;
    const projectType = config.projectType;
    
    // Get project dependencies
    const deps = execCommand(`npx nx graph --file=project-graph.json && jq -r '.dependencies."${name}"[]?.target' project-graph.json`).split('\n').filter(Boolean);
    
    // Get project commits
    const commits = execCommand(`git log --format="%H|%an|%ad|%s" -- ${projectPath}`).split('\n')
      .filter(Boolean)
      .map(line => {
        const [hash, author, date, message] = line.split('|');
        const files = execCommand(`git show --name-only --format="" ${hash}`).split('\n').filter(Boolean);
        const nxProjects = files
          .map(file => Object.entries<WorkspaceProject>(workspaceJson.projects).find(([_, p]) => file.startsWith(p.root))?.[0])
          .filter((p): p is string => p !== undefined);
        
        return {
          hash,
          author,
          date,
          message,
          branch: execCommand(`git name-rev --name-only ${hash}`),
          files,
          nxProjects
        };
      });
    
    // Get project contributors
    const contributors = execCommand(`git shortlog -sne --no-merges -- ${projectPath}`)
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const match = line.match(/^\s*(\d+)\s+(.+?)\s+<(.+)>$/);
        if (!match) return null;
        const [_, commits, name, email] = match;
        const lastActivity = execCommand(`git log -1 --format=%cd --author="${email}" -- ${projectPath}`);
        return { name, email, commits: parseInt(commits), lastActivity };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
    
    projects.push({
      name,
      type: projectType,
      root: config.root,
      sourceRoot: config.sourceRoot,
      tags: config.tags || [],
      dependencies: deps,
      lastCommits: commits.slice(0, 10),
      contributors
    });
  }
  
  return projects;
}

function getBranchRelationships(): BranchRelationship[] {
  const branches = execCommand('git branch --format="%(refname:short)"').split('\n').filter(Boolean);
  const relationships: BranchRelationship[] = [];
  
  for (const b1 of branches) {
    for (const b2 of branches) {
      if (b1 === b2) continue;
      
      try {
        const mergeBase = execCommand(`git merge-base "${b1}" "${b2}"`);
        if (!mergeBase) continue;
        
        const divergedCommits = parseInt(execCommand(`git rev-list --count "${b1}"..."${b2}"`) || '0');
        const lastSync = execCommand(`git log -1 --format=%cd "${mergeBase}"`);
        
        let type: 'merge' | 'rebase' = 'merge';
        const b1Hash = execCommand(`git rev-parse "${b1}"`);
        const b2Log = execCommand(`git log "${b2}" --format=%H`);
        
        if (b2Log.includes(b1Hash)) {
          type = 'rebase';
        }
        
        relationships.push({
          from: b1,
          to: b2,
          type,
          lastSync,
          commonAncestor: mergeBase,
          divergedCommits
        });
      } catch (_error) {
        // Skip if branches don't have a relationship
        continue;
      }
    }
  }
  
  return relationships;
}

function getRecentActivity() {
  return {
    lastPush: execCommand('git reflog show --format=%cd origin/HEAD -n 1') || new Date().toISOString(),
    lastPull: execCommand('git reflog show --format=%cd FETCH_HEAD -n 1') || new Date().toISOString(),
    lastMerge: execCommand('git log --merges -1 --format=%cd') || new Date().toISOString(),
    activeBranches: execCommand('git for-each-ref --sort=-committerdate refs/heads/ --format="%(refname:short)"')
      .split('\n')
      .slice(0, 10)
      .map(branch => ({
        name: branch,
        lastCommit: execCommand(`git log -1 --format=%H "${branch}"`) || '',
        author: execCommand(`git log -1 --format=%an "${branch}"`) || '',
        commitCount: parseInt(execCommand(`git rev-list --count "${branch}"`) || '0')
      }))
  };
}

function getProjectStats(projects: NxProject[]) {
  return {
    totalApps: projects.filter(p => p.type === 'app').length,
    totalLibraries: projects.filter(p => p.type === 'library').length,
    totalPackages: projects.filter(p => p.type === 'package').length,
    totalFiles: parseInt(execCommand('git ls-files | wc -l') || '0'),
    totalCommits: parseInt(execCommand('git rev-list --count HEAD') || '0'),
    totalContributors: parseInt(execCommand('git shortlog -sne | wc -l') || '0')
  };
}

async function generateRepoMetadata() {
  const nxProjects = getNxProjects();
  
  const metadata: RepoMetadata = {
    repoPath: process.cwd(),
    defaultBranch: execCommand('git symbolic-ref --short HEAD') || 'main',
    generatedAt: new Date().toISOString(),
    gitVersion: execCommand('git --version'),
    nxVersion: JSON.parse(readFileSync('package.json', 'utf-8')).devDependencies['nx'] || '',
    nodeVersion: process.version,
    bunVersion: execCommand('bun --version'),
    worktrees: getGitWorktrees(),
    nxProjects,
    branchRelationships: getBranchRelationships(),
    recentActivity: getRecentActivity(),
    projectStats: getProjectStats(nxProjects)
  };
  
  writeFileSync('repoMetadata.json', JSON.stringify(metadata, null, 2));
  console.log('✅ Generated repoMetadata.json successfully!');
}

generateRepoMetadata().catch(console.error); 