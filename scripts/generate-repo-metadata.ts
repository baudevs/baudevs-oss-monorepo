import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

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

interface VersionMetadata {
  id: string;
  timestamp: string;
  gitCommit: string;
  branch: string;
  author: string;
  data: RepoMetadata;
}

interface MetadataHistory {
  versions: VersionMetadata[];
  latestId: string;
}

const dashboardPublicPath = join(__dirname, '..', 'apps', 'baudevs-dashboard', 'public');


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
  // Get all projects using nx show projects
  const projectsOutput = execCommand('bun nx show projects --json');
  const projectNames = JSON.parse(projectsOutput) as string[];
  const projects: NxProject[] = [];
  
  // Generate project graph once
  execCommand(`bun nx graph --file=${dashboardPublicPath}/project-graph.json`);
  const projectGraph = JSON.parse(readFileSync(dashboardPublicPath + '/project-graph.json', 'utf-8')) as ProjectGraph;
  
  for (const name of projectNames) {
    const projectNode = projectGraph.graph.nodes[name];
    console.log(projectNode);
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
    totalApps: projects.filter(p => p.type === 'application').length,
    totalLibraries: projects.filter(p => p.type === 'library').length,
    totalPackages: projects.filter(p => p.type === 'package').length,
    totalFiles: parseInt(execCommand('git ls-files | wc -l') || '0'),
    totalCommits: parseInt(execCommand('git rev-list --count HEAD') || '0'),
    totalContributors: parseInt(execCommand('git shortlog -sne | wc -l') || '0')
  };
}

function generateVersionId(): string {
  return `${Date.now()}-${execCommand('git rev-parse --short HEAD')}`;
}

function saveVersionedMetadata(metadata: RepoMetadata): void {
  const versionId = generateVersionId();
  const currentBranch = execCommand('git rev-parse --abbrev-ref HEAD');
  const currentCommit = execCommand('git rev-parse HEAD');
  const author = execCommand('git config user.name');
  
  const versionMetadata: VersionMetadata = {
    id: versionId,
    timestamp: new Date().toISOString(),
    gitCommit: currentCommit,
    branch: currentBranch,
    author,
    data: metadata
  };

  // Save the current version
  const versionPath = join(dashboardPublicPath, 'versions');
  const graphPath = join(versionPath, 'graphs');
  
  // Create directories if they don't exist
  execCommand(`mkdir -p ${versionPath} ${graphPath}`);

  // Save metadata and graph for this version
  writeFileSync(
    join(versionPath, `${versionId}.json`),
    JSON.stringify(versionMetadata, null, 2)
  );
  
  // Copy the current graph to versioned storage
  execCommand(`cp ${join(dashboardPublicPath, 'project-graph.json')} ${join(graphPath, `${versionId}.json`)}`);

  // Update history file
  const historyPath = join(dashboardPublicPath, 'metadata-history.json');
  let history: MetadataHistory;
  
  try {
    history = JSON.parse(readFileSync(historyPath, 'utf-8'));
  } catch {
    history = { versions: [], latestId: '' };
  }

  // Add new version to history
  history.versions.push({
    id: versionId,
    timestamp: versionMetadata.timestamp,
    gitCommit: versionMetadata.gitCommit,
    branch: versionMetadata.branch,
    author: versionMetadata.author,
    data: metadata
  });

  // Keep only last 50 versions
  if (history.versions.length > 50) {
    const removedVersions = history.versions.splice(0, history.versions.length - 50);
    // Clean up old version files
    removedVersions.forEach(version => {
      try {
        execCommand(`rm ${join(versionPath, `${version.id}.json`)}`);
        execCommand(`rm ${join(graphPath, `${version.id}.json`)}`);
      } catch (error) {
        console.error(`Failed to remove old version ${version.id}:`, error);
      }
    });
  }

  history.latestId = versionId;
  writeFileSync(historyPath, JSON.stringify(history, null, 2));

  // Also save as latest for backward compatibility
  writeFileSync(join(dashboardPublicPath, 'repoMetadata.json'), JSON.stringify(metadata, null, 2));
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
  
  saveVersionedMetadata(metadata);
  console.log('✅ Generated versioned repoMetadata.json successfully!');
}

generateRepoMetadata().catch(console.error); 