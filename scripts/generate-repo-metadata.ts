import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { parseArgs } from "util";

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

interface NxTarget {
  executor: string;
  options?: Record<string, string | boolean | number>;
  configurations?: Record<string, unknown>;
  dependsOn?: string[];
  inputs?: string[];
  outputs?: string[];
  cache?: boolean;
}

interface NxTargetGroup {
  [groupName: string]: string[];
}

interface NxProject {
  name: string;
  type: 'application' | 'library' | 'package';
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
  metadata: {
    targets: Record<string, NxTarget>;
    packageName: string;
    targetGroups: NxTargetGroup;
  };
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

interface ProjectGraphNode {
  name: string;
  type: 'app' | 'lib';
  data: {
    root: string;
    sourceRoot: string;
    projectType: string;
    tags: string[];
    targets: Record<string, NxTarget>;
    metadata?: {
      js?: {
        packageName: string;
      };
      targetGroups?: NxTargetGroup;
    };
  };
}

interface ProjectGraph {
  graph: {
    nodes: Record<string, ProjectGraphNode>;
    dependencies: Record<string, Array<{ target: string; type: string }>>;
  };
}

// Parse command line arguments
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    author: { type: "string" },
    email: { type: "string" },
    branch: { type: "string" },
    commit: { type: "string" },
    local: { type: "boolean" },
  },
});

// Ensure required arguments are provided
if (!values.author || !values.email || !values.branch || !values.commit) {
  console.error("❌ Missing required arguments");
  process.exit(1);
}

// Get the root directory of the repository
const rootDir = execSync("git rev-parse --show-toplevel").toString().trim();
console.log(`📂 Repository root: ${rootDir}`);

function execCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (_error) {
    console.error(`Error executing command: ${command}`);
    return '';
  }
}

function getGitWorktrees(): GitWorktree[] {
  console.log('🌳 Getting git worktrees...');
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
  console.log('📦 Getting NX projects...');
  // Get all projects using nx show projects
  const projectsOutput = execCommand('bun nx show projects --json');
  const projectNames = JSON.parse(projectsOutput) as string[];
  const projects: NxProject[] = [];

  // Generate project graph once
  const dashboardPublicDir = join(rootDir, 'apps/baudevs-dashboard/public');
  execCommand(`bun nx graph --file=${dashboardPublicDir}/project-graph.json`);
  const projectGraph = JSON.parse(readFileSync(dashboardPublicDir + '/project-graph.json', 'utf-8')) as ProjectGraph;

  for (const name of projectNames) {
    const projectNode = projectGraph.graph.nodes[name];
    if (!projectNode) continue;

    const projectData = projectNode.data;
    const projectPath = projectData.root;

    // Get project dependencies from graph
    const deps = (projectGraph.graph.dependencies[name] || []).map(dep => dep.target);

    // Get project commits
    const commits = execCommand(`git log --format="%H|%an|%ad|%s" -- ${projectPath}`).split('\n')
      .filter(Boolean)
      .map(line => {
        const [hash, author, date, message] = line.split('|');
        const files = execCommand(`git show --name-only --format="" ${hash}`).split('\n').filter(Boolean);
        const nxProjects = files
          .map(file => Object.entries(projectGraph.graph.nodes)
            .find(([_, node]) => file.startsWith(node.data.root))?.[0])
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
      type: projectNode.type === 'app' ? 'application' : projectNode.type === 'lib' ? 'library' : 'package',
      root: projectData.root,
      sourceRoot: projectData.sourceRoot,
      tags: projectData.tags || [],
      dependencies: deps,
      lastCommits: commits.slice(0, 10),
      contributors,
      metadata: {
        targets: projectData.targets || {},
        packageName: projectData.metadata?.js?.packageName || name,
        targetGroups: projectData.metadata?.targetGroups || {}
      }
    });
  }

  return projects;
}

function getBranchRelationships(): BranchRelationship[] {
  console.log('🔄 Getting branch relationships...');
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
  console.log('📅 Getting recent activity...');
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
  console.log('📊 Getting project statistics...');
  return {
    totalApps: projects.filter(p => p.type === 'application').length,
    totalLibraries: projects.filter(p => p.type === 'library').length,
    totalPackages: projects.filter(p => p.type === 'package').length,
    totalFiles: parseInt(execCommand('git ls-files | wc -l') || '0'),
    totalCommits: parseInt(execCommand('git rev-list --count HEAD') || '0'),
    totalContributors: parseInt(execCommand('git shortlog -sne | wc -l') || '0')
  };
}

// Create versions directory if it doesn't exist
const versionsDir = join(rootDir, "versions");
if (!existsSync(versionsDir)) {
  console.log(`📁 Creating versions directory: ${versionsDir}`);
  mkdirSync(versionsDir, { recursive: true });
}

// Read existing metadata history or create new one
const historyPath = join(rootDir, "metadata-history.json");
let history: any[] = [];
if (existsSync(historyPath)) {
  console.log(`📖 Reading existing metadata history: ${historyPath}`);
  history = JSON.parse(readFileSync(historyPath, "utf-8"));
} else {
  console.log(`📝 Creating new metadata history file: ${historyPath}`);
}

// Generate new metadata
console.log("🔍 Generating new metadata...");
const nxProjects = getNxProjects();

const metadata: RepoMetadata = {
  repoPath: rootDir,
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

// Save latest version
const latestPath = join(versionsDir, "latest.json");
console.log(`💾 Saving latest version: ${latestPath}`);
writeFileSync(latestPath, JSON.stringify(metadata, null, 2));

// Update history
history.push({
  timestamp: new Date().toISOString(),
  author: values.author,
  email: values.email,
  branch: values.branch,
  commit: values.commit,
  data: metadata
});
console.log(`💾 Saving metadata history: ${historyPath}`);
writeFileSync(historyPath, JSON.stringify(history, null, 2));

// Copy to dashboard if local flag is set
if (values.local) {
  const dashboardPublicDir = join(rootDir, "apps/baudevs-dashboard/public");
  const dashboardVersionsDir = join(dashboardPublicDir, "versions");

  // Create dashboard versions directory if it doesn't exist
  if (!existsSync(dashboardVersionsDir)) {
    console.log(`📁 Creating dashboard versions directory: ${dashboardVersionsDir}`);
    mkdirSync(dashboardVersionsDir, { recursive: true });
  }

  // Copy latest version to dashboard
  const dashboardLatestPath = join(dashboardPublicDir, "local-metadata.json");
  console.log(`📋 Copying latest version to dashboard: ${dashboardLatestPath}`);
  writeFileSync(dashboardLatestPath, JSON.stringify(metadata, null, 2));

  // Copy history to dashboard
  const dashboardHistoryPath = join(dashboardPublicDir, "metadata-history.json");
  console.log(`📋 Copying metadata history to dashboard: ${dashboardHistoryPath}`);
  writeFileSync(dashboardHistoryPath, JSON.stringify(history, null, 2));
}

console.log("✅ Metadata generation completed successfully");
