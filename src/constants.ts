import { Release, JiraTask, RepoStatus, PipelineStage } from './types';

export const MOCK_TASKS: JiraTask[] = [
  { id: 'OPS-1204', title: 'Critical memory leak in Auth Middleware', assignee: 'Alex R.', assigneePhoto: '', priority: 'High', status: 'In Progress', releaseId: '1', branch: 'feature/OPS-1204-memory-leak' },
  { id: 'OPS-1215', title: 'Refactor gRPC connection pooling', assignee: 'Sarah C.', assigneePhoto: '', priority: 'Medium', status: 'Resolved', releaseId: '1' },
  { id: 'OPS-1220', title: 'Update Kubernetes manifests for V2', assignee: 'James W.', assigneePhoto: '', priority: 'High', status: 'To Do', releaseId: '3' },
  { id: 'OPS-1225', title: 'Security patch for API Gateway', assignee: 'Alex R.', assigneePhoto: '', priority: 'High', status: 'Resolved', releaseId: '2' },
];

export const MOCK_REPOS: RepoStatus[] = [
  { 
    id: 'repo-1',
    name: 'ops-core-engine', 
    branch: 'main', 
    status: 'HEALTHY', 
    lastCommit: 'a4f2c91', 
    lastUpdate: '2m ago', 
    releaseId: '1',
    merges: [
      { 
        id: 'PR-4201', 
        title: 'feat: Optimize container orchestration layer for V2', 
        author: 'sarah_dev', 
        status: 'OPEN', 
        approvals: 2, 
        requiredApprovals: 2,
        approvers: [
          { id: 'u1', name: 'Alex Rivera', role: 'Lead Engineer', status: 'APPROVED' },
          { id: 'u2', name: 'Sarah Chen', role: 'DevOps', status: 'APPROVED' }
        ],
        validationFlows: [
          { id: 'v1', name: 'Unit Tests', type: 'AUTOMATED', status: 'SUCCESS' },
          { id: 'v2', name: 'Security Scan', type: 'AUTOMATED', status: 'SUCCESS' },
          { id: 'v3', name: 'Load Test', type: 'AUTOMATED', status: 'RUNNING' }
        ],
        sourceBranch: 'feature/orchestration',
        targetBranch: 'main',
        diffPreview: {
          file: 'src/core/orchestrator.go',
          additions: 45,
          deletions: 12,
          lines: [
            { number: 120, content: 'func (o *Orchestrator) Rebalance() {', type: 'normal' },
            { number: 121, content: '-   o.lock.Lock()', type: 'removed' },
            { number: 121, content: '+   if !o.lock.TryLock() { return }', type: 'added' },
            { number: 122, content: '    defer o.lock.Unlock()', type: 'normal' },
          ]
        }
      },
      { 
        id: 'PR-4198', 
        title: 'fix: auth middleware leak', 
        author: 'Alex R.', 
        status: 'MERGED', 
        approvals: 3, 
        requiredApprovals: 2,
        approvers: [
          { id: 'u1', name: 'Alex Rivera', role: 'Lead Engineer', status: 'APPROVED' },
          { id: 'u3', name: 'James Wilson', role: 'SRE', status: 'APPROVED' }
        ],
        validationFlows: [
          { id: 'v1', name: 'Unit Tests', type: 'AUTOMATED', status: 'SUCCESS' },
          { id: 'v2', name: 'Security Scan', type: 'AUTOMATED', status: 'SUCCESS' }
        ],
        sourceBranch: 'fix/auth-leak',
        targetBranch: 'main'
      }
    ],
    approvals: [
      { env: 'Development', status: 'APPROVED', approvedBy: 'Sarah C.', approvedAt: '2026-04-01' },
      { env: 'Staging', status: 'APPROVED', approvedBy: 'James W.', approvedAt: '2026-04-05' },
      { env: 'Production', status: 'PENDING' },
    ],
    pipelines: [
      { name: 'Build', status: 'success', icon: 'Construction' },
      { name: 'Test', status: 'success', icon: 'TestTube' },
      { name: 'Deploy', status: 'running', icon: 'Rocket' },
    ],
    deploymentRules: []
  },
  { 
    id: 'repo-2',
    name: 'platform-ui-kit', 
    branch: 'v2-dev', 
    status: 'SYNCING', 
    lastCommit: 'bc921x8', 
    lastUpdate: '15m ago', 
    releaseId: '1',
    merges: [
      { 
        id: 'PR-1425', 
        title: 'fix: Resolve memory leak in auth-gateway-service heartbeat', 
        author: 'j_michaels', 
        status: 'OPEN', 
        approvals: 0, 
        requiredApprovals: 2,
        approvers: [],
        validationFlows: [],
        sourceBranch: 'fix/auth-mem-leak',
        targetBranch: 'staging',
        diffPreview: {
          file: 'src/services/auth/heartbeat.go',
          additions: 12,
          deletions: 4,
          lines: [
            { number: 42, content: 'func startHeartbeat(ctx context.Context) {', type: 'normal' },
            { number: 43, content: '    ticker := time.NewTicker(5 * time.Second)', type: 'normal' },
            { number: 44, content: '-   defer ticker.Stop() // WRONG SCOPE', type: 'removed' },
            { number: 44, content: '+   go func() {', type: 'added' },
            { number: 45, content: '+       defer ticker.Stop()', type: 'added' },
            { number: 46, content: '+       for {', type: 'added' },
            { number: 47, content: '            select {', type: 'normal' },
          ]
        }
      },
    ],
    approvals: [
      { env: 'Development', status: 'APPROVED', approvedBy: 'Alex R.', approvedAt: '2026-04-03' },
      { env: 'Staging', status: 'PENDING' },
      { env: 'Production', status: 'PENDING' },
    ],
    pipelines: [
      { name: 'Build', status: 'success', icon: 'Construction' },
      { name: 'Lint', status: 'failed', icon: 'Terminal' },
    ],
    deploymentRules: []
  },
  { 
    id: 'repo-4',
    name: 'rapid-config-server', 
    branch: 'main', 
    status: 'HEALTHY', 
    lastCommit: 'f2a1b3c', 
    lastUpdate: '5m ago', 
    releaseId: '1',
    artifactVersion: 'v1.2.0-build.45',
    merges: [
      { 
        id: 'PR-501', 
        title: 'feat: Implement dynamic config reloading', 
        author: 'samrogu', 
        status: 'OPEN', 
        approvals: 1, 
        requiredApprovals: 2,
        sourceBranch: 'feature/dynamic-reload',
        targetBranch: 'main',
        approvers: [
          { id: 'u1', name: 'Alex R.', role: 'User', status: 'APPROVED' },
          { id: 'g1', name: 'DevOps-Group', role: 'Group', status: 'PENDING' }
        ],
        validationFlows: [
          { id: 'v1', name: 'Unit Tests', type: 'AUTOMATED', status: 'SUCCESS' },
          { id: 'v2', name: 'Security Scan', type: 'AUTOMATED', status: 'RUNNING' },
          { id: 'v3', name: 'Architecture Review', type: 'MANUAL', status: 'PENDING' }
        ],
        diffPreview: {
          file: 'server/config_manager.go',
          additions: 85,
          deletions: 15,
          lines: [
            { number: 10, content: 'func (cm *ConfigManager) Reload() error {', type: 'normal' },
            { number: 11, content: '+   cm.mu.Lock()', type: 'added' },
            { number: 12, content: '+   defer cm.mu.Unlock()', type: 'added' },
            { number: 13, content: '    return cm.loadFromSource()', type: 'normal' },
          ]
        }
      },
    ],
    approvals: [
      { env: 'Development', status: 'APPROVED', approvedBy: 'Sarah C.', approvedAt: '2026-04-06' },
      { env: 'Staging', status: 'PENDING' },
      { env: 'Production', status: 'PENDING' },
    ],
    pipelines: [
      { name: 'Build & Deploy (Dev)', status: 'success', icon: 'Rocket' },
      { name: 'Promote to Staging', status: 'pending', icon: 'ArrowRight' },
      { name: 'Promote to Production', status: 'pending', icon: 'ShieldCheck' },
    ],
    deploymentRules: [
      { env: 'Development', requiredApprovers: 1, allowedGroups: ['Developers'] },
      { env: 'Staging', requiredApprovers: 2, allowedGroups: ['QA', 'DevOps'] },
      { env: 'Production', requiredApprovers: 3, allowedGroups: ['Release-Managers'] }
    ]
  },
];

export const MOCK_PIPELINES: PipelineStage[] = [
  { name: 'Build', status: 'success', duration: '42s', icon: 'Construction' },
  { name: 'Test', status: 'success', duration: '1m 12s', icon: 'TestTube' },
  { name: 'Scan', status: 'running', icon: 'ShieldCheck' },
  { name: 'Pack', status: 'pending', icon: 'Package' },
];

export const MOCK_RELEASES: Release[] = [
  {
    id: '1',
    version: 'v2.4.1-rc3',
    codename: 'Phoenix',
    status: 'Staging',
    description: 'Quarterly Platform Stability Patch. Unified Release Hub for core services update across US-EAST and EU-WEST.',
    progress: 75,
    date: '2026-04-10',
    tasks: MOCK_TASKS,
    repositories: MOCK_REPOS,
    pipelines: MOCK_PIPELINES
  },
  {
    id: '2',
    version: 'v2.4.0-stable',
    codename: 'Icarus',
    status: 'Production',
    description: 'Core engine update with API v3 support and improved worker node performance.',
    progress: 100,
    date: '2026-03-24',
    tasks: [MOCK_TASKS[1]],
    repositories: [MOCK_REPOS[0]],
    pipelines: MOCK_PIPELINES.map(p => ({ ...p, status: 'success' }))
  },
  {
    id: '3',
    version: 'v2.5.0-alpha',
    codename: 'Daedalus',
    status: 'Development',
    description: 'Next generation orchestration layer with native multi-cloud support.',
    progress: 15,
    date: '2026-05-15',
    tasks: [MOCK_TASKS[2]],
    repositories: MOCK_REPOS,
    pipelines: MOCK_PIPELINES.map(p => ({ ...p, status: 'pending' }))
  }
];
