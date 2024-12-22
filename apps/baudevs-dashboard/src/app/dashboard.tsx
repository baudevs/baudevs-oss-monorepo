import { useEffect, useState } from 'react';
import { Typography, Box, Chip, Grid, Paper, Divider, List, ListItem, ListItemText, Avatar } from '@mui/material';
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
                  <Typography variant="subtitle1">{project.name}</Typography>
                  <Chip
                    label={project.type.toUpperCase()}
                    color={project.type === 'app' ? 'primary' : 'default'}
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
                <Typography variant="subtitle2" gutterBottom>Dependencies:</Typography>
                <Box mb={1}>
                  {project.dependencies.map((dep) => (
                    <Chip key={dep} label={dep} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
                <Typography variant="subtitle2" gutterBottom>Contributors:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {project.contributors.map((contributor) => (
                    <Chip
                      key={contributor.email}
                      avatar={<Avatar>{getInitials(contributor.name)}</Avatar>}
                      label={`${contributor.name} (${contributor.commits})`}
                      title={`Last active: ${formatDate(contributor.lastActivity)}`}
                      size="small"
                    />
                  ))}
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