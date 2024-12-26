import { useEffect, useState, useRef } from 'react';
import { Typography, Box, Chip, Grid, Paper, Divider, List, ListItem, ListItemText, Avatar, Select, MenuItem, ToggleButtonGroup, ToggleButton, CircularProgress, Alert } from '@mui/material';
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
  authorEmail: string;
  isRemote: boolean;
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
  summary?: {
    text: string;
    loading: boolean;
    error?: string;
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

function generateAISummaryPrompt(version1: VersionMetadata, version2: VersionMetadata, changes: ComparisonData): string {
  // Get key commits from both versions
  const getKeyChanges = (v1: VersionMetadata, v2: VersionMetadata): string[] => {
    const allCommits = new Set<string>();
    const keyChanges: string[] = [];

    // Collect all commits from both versions' projects
    v1.data.nxProjects.forEach(project =>
      project.lastCommits.forEach(commit => allCommits.add(commit.hash))
    );
    v2.data.nxProjects.forEach(project =>
      project.lastCommits.forEach(commit => allCommits.add(commit.hash))
    );

    // Get unique commits and their details
    allCommits.forEach(hash => {
      const commit = v2.data.nxProjects
        .flatMap(p => p.lastCommits)
        .find(c => c.hash === hash);

      if (commit) {
        keyChanges.push(`- ${commit.message} (affects: ${commit.nxProjects.join(', ')})`);
      }
    });

    return keyChanges;
  };

  // Get project-specific changes
  const getProjectDetails = (changes: ComparisonData, v1: VersionMetadata, v2: VersionMetadata): string[] => {
    return changes.projectChanges.map(change => {
      const project1 = v1.data.nxProjects.find(p => p.name === change.project);
      const project2 = v2.data.nxProjects.find(p => p.name === change.project);

      if (change.type === 'added' && project2) {
        return `- ${change.project} (Added): ${project2.metadata.packageName || project2.name}
          • Type: ${project2.type}
          • Tags: ${project2.tags.join(', ')}
          • Dependencies: ${project2.dependencies.join(', ')}`;
      }

      if (change.type === 'removed' && project1) {
        return `- ${change.project} (Removed): ${project1.metadata.packageName || project1.name}`;
      }

      if (change.type === 'modified' && project1 && project2) {
        const modifiedChanges: string[] = [];
        if (project1.type !== project2.type) modifiedChanges.push(`Type changed: ${project1.type} -> ${project2.type}`);
        if (project1.metadata.packageName !== project2.metadata.packageName)
          modifiedChanges.push(`Package name changed: ${project1.metadata.packageName} -> ${project2.metadata.packageName}`);

        const addedTags = project2.tags.filter(t => !project1.tags.includes(t));
        const removedTags = project1.tags.filter(t => !project2.tags.includes(t));
        if (addedTags.length) modifiedChanges.push(`Added tags: ${addedTags.join(', ')}`);
        if (removedTags.length) modifiedChanges.push(`Removed tags: ${removedTags.join(', ')}`);

        return `- ${change.project} (Modified):
          ${modifiedChanges.map(c => `  • ${c}`).join('\n')}`;
      }

      return `- ${change.project} (${change.type})`;
    });
  };

  const keyChanges = getKeyChanges(version1, version2);
  const projectDetails = getProjectDetails(changes, version1, version2);

  const dependencyChangesText = changes.dependencyChanges.map(c => {
    const affectedProject = version2.data.nxProjects.find(p => p.name === c.project);
    return `- ${c.project} (${affectedProject?.type || 'unknown'}): ${c.type === 'added' ? 'added' : 'removed'} dependency on ${c.dependency}`;
  }).join('\n');

  const statsChangesText = Object.entries(changes.statsChanges)
    .map(([stat, change]) => {
      const direction = change.diff > 0 ? 'increased' : 'decreased';
      return `- ${stat}: ${direction} by ${Math.abs(change.diff)} (${change.percentage}% change)`;
    })
    .join('\n');

  return `As a monorepo analysis expert, analyze the following changes between two versions of our monorepo:

Version Information:
- From: ${version1.branch} (${version1.gitCommit.slice(0, 7)}) by ${version1.author} at ${version1.timestamp}
- To: ${version2.branch} (${version2.gitCommit.slice(0, 7)}) by ${version2.author} at ${version2.timestamp}
- Environment: ${version2.isRemote ? 'Remote CI/CD' : 'Local Development'}

Key Git Commits:
${keyChanges.join('\n')}

Project Changes:
${projectDetails.join('\n')}

Dependency Changes:
${dependencyChangesText}

Statistical Changes:
${statsChangesText}

Please provide a detailed analysis focusing on:
1. Impact of the changes on the monorepo structure and dependencies
2. Key architectural changes and their implications
3. Potential risks or areas needing attention
4. Specific recommendations for the team based on these changes
5. Any patterns in the development workflow revealed by these changes

Keep the analysis technical but actionable, highlighting what developers should focus on.`;
}

async function getAISummary(version1: VersionMetadata, version2: VersionMetadata, changes: ComparisonData): Promise<string> {
  const prompt = generateAISummaryPrompt(version1, version2, changes);

  try {
    const response = await fetch('/api/ai-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) throw new Error('Failed to generate summary');
    const data = await response.json();
    return data.summary;
  } catch (error) {
    throw new Error('Failed to generate AI summary: ' + (error as Error).message);
  }
}

function StatsChangeCard({ stat, change }: { stat: string; change: StatChange }) {
  const formatStat = (stat: string) => {
    return stat
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Apps', 'Applications');
  };

  const getIcon = () => {
    if (change.diff > 0) return '📈';
    if (change.diff < 0) return '📉';
    return '📊';
  };

  const getDescription = () => {
    const direction = change.diff > 0 ? 'increased' : change.diff < 0 ? 'decreased' : 'unchanged';
    const amount = Math.abs(change.diff);
    return `${direction} by ${amount} (${change.percentage}% change)`;
  };

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: change.diff > 0 ? 'success.light' :
                      change.diff < 0 ? 'error.light' :
                      'divider'
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="h4" sx={{ lineHeight: 1 }}>{getIcon()}</Typography>
          <Typography variant="body1" fontWeight="medium">
            {formatStat(stat)}
          </Typography>
        </Box>
        <Typography
          variant="h5"
          sx={{
            color: change.diff > 0 ? 'success.main' :
                   change.diff < 0 ? 'error.main' :
                   'text.primary',
            fontWeight: 'medium'
          }}
        >
          {change.diff > 0 ? '+' : ''}{change.diff}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getDescription()}
        </Typography>
      </Paper>
    </Grid>
  );
}

function VersionComparison() {
  const [history, setHistory] = useState<MetadataHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<[string, string]>(['', '']);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [filter, setFilter] = useState<'all' | 'local' | 'remote'>('all');
  const [aiSummary, setAiSummary] = useState<{
    text: string;
    loading: boolean;
    error?: string;
  }>({ text: '', loading: false });

  // Cache for AI summaries
  const summaryCache = useRef<Map<string, string>>(new Map());
  const lastComparisonKey = useRef<string>('');

  const getCacheKey = (v1: string, v2: string) => `${v1}_${v2}`;

  // Load history only once
  useEffect(() => {
    fetch('/metadata-history.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load metadata: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((historyArray: Array<{
        timestamp: string;
        author: string;
        email: string;
        branch: string;
        commit: string;
        data: RepoMetadata;
      }>) => {
        // Transform the array into our expected format
        const versions = historyArray.map(entry => ({
          id: `${entry.commit}-${entry.branch}-${entry.author}`,
          timestamp: entry.timestamp,
          gitCommit: entry.commit,
          branch: entry.branch,
          author: entry.author,
          authorEmail: entry.email,
          isRemote: entry.branch === 'main' || entry.branch === 'staging',
          data: entry.data
        }));

        const history: MetadataHistory = {
          versions,
          latestId: versions[0]?.id || ''
        };

        setHistory(history);
        if (history.versions.length >= 2) {
          const selectedVersions: [string, string] = [
            history.versions[0].id,
            history.versions[1].id
          ];
          setSelectedVersions(selectedVersions);
        }
      })
      .catch(err => {
        console.error('Error loading metadata:', err);
        setError(err.message);
      });
  }, []);

  // Handle version comparison and AI summary separately
  useEffect(() => {
    if (!selectedVersions[0] || !selectedVersions[1] || !history) return;

    const version1 = history.versions.find(v => v.id === selectedVersions[0]);
    const version2 = history.versions.find(v => v.id === selectedVersions[1]);

    if (!version1 || !version2) return;

    const comparison = compareVersions(version1.data, version2.data);
    setComparisonData(comparison);

    // Generate cache key for this comparison
    const cacheKey = getCacheKey(version1.id, version2.id);

    // If this is the same comparison as before, don't fetch again
    if (cacheKey === lastComparisonKey.current) return;

    // Check cache before making API call
    const cachedSummary = summaryCache.current.get(cacheKey);
    if (cachedSummary) {
      setAiSummary({ text: cachedSummary, loading: false });
      lastComparisonKey.current = cacheKey;
      return;
    }

    // Only fetch if we don't have a cached result
    const fetchSummary = async () => {
      setAiSummary({ text: '', loading: true });
      try {
        const summary = await getAISummary(version1, version2, comparison);
        summaryCache.current.set(cacheKey, summary);
        lastComparisonKey.current = cacheKey;
        setAiSummary({ text: summary, loading: false });
      } catch (error) {
        setAiSummary({
          text: '',
          loading: false,
          error: (error as Error).message
        });
      }
    };

    fetchSummary();
  }, [selectedVersions, history]);

  const handleVersionChange = (index: 0 | 1, value: string) => {
    setSelectedVersions(prev => {
      const newVersions: [string, string] = [...prev] as [string, string];
      newVersions[index] = value;
      return newVersions;
    });
  };

  const filteredVersions = history?.versions.filter(v => {
    if (filter === 'all') return true;
    return filter === 'local' ? !v.isRemote : v.isRemote;
  }) || [];

  if (!history) {
    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }
    return null;
  }

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Version History</Typography>
        <Box>
          <ToggleButtonGroup
            size="small"
            value={filter}
            exclusive
            onChange={(_, value) => value && setFilter(value)}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="local">Local</ToggleButton>
            <ToggleButton value="remote">Remote</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Version 1</Typography>
          <Select
            fullWidth
            value={selectedVersions[0]}
            onChange={(e) => handleVersionChange(0, e.target.value as string)}
          >
            {filteredVersions.map(v => (
              <MenuItem key={v.id} value={v.id}>
                {new Date(v.timestamp).toLocaleString()} - {v.author} ({v.branch})
                {v.isRemote ? ' 🌐' : ' 💻'}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Version 2</Typography>
          <Select
            fullWidth
            value={selectedVersions[1]}
            onChange={(e) => handleVersionChange(1, e.target.value as string)}
          >
            {filteredVersions.map(v => (
              <MenuItem key={v.id} value={v.id}>
                {new Date(v.timestamp).toLocaleString()} - {v.author} ({v.branch})
                {v.isRemote ? ' 🌐' : ' 💻'}
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
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Statistical Changes
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {Object.entries(comparisonData.statsChanges).map(([stat, change]) => (
                <StatsChangeCard key={stat} stat={stat} change={change} />
              ))}
            </Grid>

            {/* AI Summary */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="h6">AI Analysis</Typography>
                {aiSummary?.loading && (
                  <CircularProgress size={20} />
                )}
              </Box>
              {aiSummary?.error ? (
                <Alert severity="error">{aiSummary.error}</Alert>
              ) : aiSummary?.text ? (
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    '& p': { mb: 1 }
                  }}
                >
                  {aiSummary.text}
                </Typography>
              ) : !aiSummary?.loading && (
                <Typography color="text.secondary">
                  Select two versions to compare and get an AI-powered analysis.
                </Typography>
              )}
            </Paper>
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
  const [isLocalData, setIsLocalData] = useState(false);

  useEffect(() => {
    // Try to load local metadata first
    fetch('/local-metadata.json')
      .then((res) => {
        if (!res.ok) throw new Error('No local metadata');
        setIsLocalData(true);
        return res.json();
      })
      .catch(() => {
        // Fall back to remote metadata
        return fetch('/repoMetadata.json')
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status} - ${res.statusText}`);
            }
            setIsLocalData(false);
            return res.json();
          });
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
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Monorepo Dashboard
        {isLocalData && (
          <Chip
            size="small"
            color="warning"
            label="Local Data"
            title="You're viewing local metadata. Changes from other developers might not be reflected."
          />
        )}
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
