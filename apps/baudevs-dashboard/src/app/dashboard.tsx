import { useEffect, useState } from 'react';
import { Typography, Box, Chip, Grid, Paper, Divider, List, ListItem, ListItemText, Avatar, Select, MenuItem } from '@mui/material';
import { ErrorBoundary } from './components/ErrorBoundary';

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

interface ProjectChange {
  project: string;
  type: 'added' | 'removed' | 'modified';
}

interface DependencyChange {
  project: string;
  dependency: string;
  type: 'added' | 'removed';
}

interface StatChange {
  diff: number;
  percentage: number;
}

interface ComparisonData {
  projectChanges: ProjectChange[];
  dependencyChanges: DependencyChange[];
  statsChanges: Record<string, StatChange>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

function VersionComparison() {
  const [history, setHistory] = useState<MetadataHistory | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<[string, string]>(['', '']);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

  useEffect(() => {
    fetch('/metadata-history.json')
      .then(res => res.json())
      .then((data: MetadataHistory) => {
        setHistory(data);
        if (data.versions.length >= 2) {
          setSelectedVersions([
            data.versions[data.versions.length - 1].id,
            data.versions[data.versions.length - 2].id
          ]);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedVersions[0] || !selectedVersions[1]) return;

    Promise.all([
      fetch(`/versions/${selectedVersions[0]}.json`).then(res => res.json()),
      fetch(`/versions/${selectedVersions[1]}.json`).then(res => res.json())
    ]).then(([version1, version2]: [VersionMetadata, VersionMetadata]) => {
      const comparison = compareVersions(version1.data, version2.data);
      setComparisonData(comparison);
    });
  }, [selectedVersions]);

  if (!history) return null;

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Version History</Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Version 1</Typography>
          <Select
            fullWidth
            value={selectedVersions[0]}
            onChange={(e) => setSelectedVersions([e.target.value as string, selectedVersions[1]])}
          >
            {history.versions.map(v => (
              <MenuItem key={v.id} value={v.id}>
                {new Date(v.timestamp).toLocaleString()} - {v.author} ({v.branch})
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Version 2</Typography>
          <Select
            fullWidth
            value={selectedVersions[1]}
            onChange={(e) => setSelectedVersions([selectedVersions[0], e.target.value as string])}
          >
            {history.versions.map(v => (
              <MenuItem key={v.id} value={v.id}>
                {new Date(v.timestamp).toLocaleString()} - {v.author} ({v.branch})
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      {comparisonData && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>Changes</Typography>
          
          {/* Project Changes */}
          {comparisonData.projectChanges.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">Project Changes</Typography>
              <List>
                {comparisonData.projectChanges.map((change, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={change.project}
                      secondary={change.type}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: change.type === 'added' ? 'success.main' : 
                                 change.type === 'removed' ? 'error.main' : 
                                 change.type === 'modified' ? 'warning.main' : 'text.primary'
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Dependency Changes */}
          {comparisonData.dependencyChanges.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">Dependency Changes</Typography>
              <List>
                {comparisonData.dependencyChanges.map((change, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={`${change.project}: ${change.type === 'added' ? '+' : '-'} ${change.dependency}`}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: change.type === 'added' ? 'success.main' : 'error.main'
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Stats Changes */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Statistics Changes</Typography>
            <Grid container spacing={2}>
              {Object.entries(comparisonData.statsChanges).map(([stat, change]) => (
                <Grid item xs={12} sm={6} md={4} key={stat}>
                  <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default' }}>
                    <Typography variant="body2">{stat}</Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: change.diff > 0 ? 'success.main' : 
                               change.diff < 0 ? 'error.main' : 'text.primary'
                      }}
                    >
                      {change.diff > 0 ? '+' : ''}{change.diff} ({change.percentage}%)
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

function compareVersions(version1: RepoMetadata, version2: RepoMetadata): ComparisonData {
  const projectChanges: ProjectChange[] = [];
  const dependencyChanges: DependencyChange[] = [];
  const statsChanges: Record<string, StatChange> = {};

  // Compare projects
  const allProjects = new Set([
    ...version1.nxProjects.map(p => p.name),
    ...version2.nxProjects.map(p => p.name)
  ]);

  allProjects.forEach(projectName => {
    const project1 = version1.nxProjects.find(p => p.name === projectName);
    const project2 = version2.nxProjects.find(p => p.name === projectName);

    if (!project1) {
      projectChanges.push({ project: projectName, type: 'added' });
    } else if (!project2) {
      projectChanges.push({ project: projectName, type: 'removed' });
    } else if (JSON.stringify(project1) !== JSON.stringify(project2)) {
      projectChanges.push({ project: projectName, type: 'modified' });
    }

    // Compare dependencies
    if (project1 && project2) {
      const deps1 = new Set(project1.dependencies);
      const deps2 = new Set(project2.dependencies);

      project1.dependencies.forEach(dep => {
        if (!deps2.has(dep)) {
          dependencyChanges.push({
            project: projectName,
            dependency: dep,
            type: 'removed'
          });
        }
      });

      project2.dependencies.forEach(dep => {
        if (!deps1.has(dep)) {
          dependencyChanges.push({
            project: projectName,
            dependency: dep,
            type: 'added'
          });
        }
      });
    }
  });

  // Compare stats
  Object.entries(version1.projectStats).forEach(([key, value]) => {
    const oldValue = value;
    const newValue = version2.projectStats[key as keyof RepoMetadata['projectStats']];
    const diff = newValue - oldValue;
    const percentage = oldValue === 0 ? 100 : Math.round((diff / oldValue) * 100);

    statsChanges[key] = { diff, percentage };
  });

  return {
    projectChanges,
    dependencyChanges,
    statsChanges
  };
}

function DashboardContent() {
  const [data, setData] = useState<RepoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/repoMetadata.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        }
        return res.json();
      })
      .then((json: RepoMetadata) => setData(json))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <Typography color="error">Failed to load data: {error}</Typography>;
  }
  if (!data) {
    return <Typography>Loading data...</Typography>;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Monorepo Dashboard
      </Typography>

      {/* Version Comparison */}
      <VersionComparison />

      {/* Repository Info */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Repository Info</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Repo Path</Typography>
            <Typography noWrap>{data.repoPath}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Default Branch</Typography>
            <Typography>{data.defaultBranch}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Generated At</Typography>
            <Typography>{formatDate(data.generatedAt)}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Versions</Typography>
            <Typography>Git: {data.gitVersion}</Typography>
            <Typography>Nx: {data.nxVersion}</Typography>
            <Typography>Node: {data.nodeVersion}</Typography>
            <Typography>Bun: {data.bunVersion}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Project Stats */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Project Statistics</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h4">{data.projectStats.totalApps}</Typography>
            <Typography color="text.secondary">Apps</Typography>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h4">{data.projectStats.totalLibraries}</Typography>
            <Typography color="text.secondary">Libraries</Typography>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h4">{data.projectStats.totalPackages}</Typography>
            <Typography color="text.secondary">Packages</Typography>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h4">{data.projectStats.totalFiles}</Typography>
            <Typography color="text.secondary">Files</Typography>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h4">{data.projectStats.totalCommits}</Typography>
            <Typography color="text.secondary">Commits</Typography>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h4">{data.projectStats.totalContributors}</Typography>
            <Typography color="text.secondary">Contributors</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Activity */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Recent Activity</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">Last Push</Typography>
            <Typography>{formatDate(data.recentActivity.lastPush)}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">Last Pull</Typography>
            <Typography>{formatDate(data.recentActivity.lastPull)}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">Last Merge</Typography>
            <Typography>{formatDate(data.recentActivity.lastMerge)}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>Active Branches</Typography>
        <List>
          {data.recentActivity.activeBranches.map((branch) => (
            <ListItem key={branch.name}>
              <ListItemText
                primary={branch.name}
                secondary={`${branch.author} - ${branch.commitCount} commits`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Git Worktrees */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Git Worktrees</Typography>
        <Grid container spacing={2}>
          {data.worktrees.map((wt) => (
            <Grid item xs={12} md={6} key={wt.path}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle1">{wt.branch}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {wt.path}
                </Typography>
                <Typography variant="caption">
                  Last Activity: {formatDate(wt.lastActivity)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Nx Projects */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Nx Projects</Typography>
        <Grid container spacing={2}>
          {data.nxProjects.map((project) => (
            <Grid item xs={12} md={6} key={project.name}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1">
                    {project.metadata.packageName || project.name}
                  </Typography>
                  <Chip
                    label={project.type.toUpperCase()}
                    color={project.type === 'application' ? 'primary' : project.type === 'library' ? 'secondary' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {project.root}
                </Typography>
                <Box mb={1}>
                  {project.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
                
                {/* Target Groups */}
                {Object.entries(project.metadata.targetGroups).map(([groupName, scripts]) => (
                  <Box key={groupName} mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      {groupName}:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {Array.isArray(scripts) && scripts.map((script) => (
                        <Chip
                          key={script}
                          label={script}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                ))}

                {/* Dependencies */}
                {project.dependencies.length > 0 && (
                  <Box mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      Dependencies ({project.dependencies.length}):
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {project.dependencies.slice(0, 5).map((dep) => (
                        <Chip
                          key={dep}
                          label={dep}
                          size="small"
                          variant="outlined"
                          color="info"
                        />
                      ))}
                      {project.dependencies.length > 5 && (
                        <Chip
                          label={`+${project.dependencies.length - 5} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                )}

                {/* Contributors */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Top Contributors:
                  </Typography>
                  <Box display="flex" gap={0.5}>
                    {project.contributors.slice(0, 3).map((contributor) => (
                      <Chip
                        key={contributor.email}
                        avatar={<Avatar>{getInitials(contributor.name)}</Avatar>}
                        label={`${contributor.commits} commits`}
                        size="small"
                        title={`${contributor.name} - Last active: ${formatDate(contributor.lastActivity)}`}
                      />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Branch Relationships */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Branch Relationships</Typography>
        <List>
          {data.branchRelationships.map((rel, idx) => (
            <ListItem key={idx}>
              <ListItemText
                primary={
                  <Box component="span" sx={{ fontFamily: 'monospace' }}>
                    {rel.from} 
                    <Box component="span" sx={{ mx: 1, color: 'text.secondary' }}>
                      -[{rel.type}]-{`>`}
                    </Box> 
                    {rel.to}
                  </Box>
                }
                secondary={
                  <>
                    Last Sync: {formatDate(rel.lastSync)}
                    {rel.divergedCommits > 0 && ` • ${rel.divergedCommits} commits diverged`}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}