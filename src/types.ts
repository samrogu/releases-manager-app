export interface Release {
  id: string;
  version: string;
  codename: string;
  status: 'Staging' | 'Production' | 'Development' | 'Failed';
  description: string;
  progress: number;
  date: string;
  tasks: JiraTask[];
  repositories: RepoStatus[];
  pipelines: PipelineStage[];
}

export type Screen = 'dashboard' | 'releases' | 'workflows';

export interface WorkflowVersion {
  id: string;
  version: number;
  timestamp: string;
  author: string;
  description: string;
  steps: any[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  versions: WorkflowVersion[];
  currentVersion: number;
}

export interface JiraTask {
  id: string;
  title: string;
  assignee: string;
  assigneePhoto: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'In Progress' | 'Resolved' | 'To Do';
  releaseId?: string;
  branchName?: string;
}

export interface Approver {
  id: string;
  name: string;
  role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ValidationCheck {
  id: string;
  name: string;
  type: 'AUTOMATED' | 'MANUAL';
  status: 'SUCCESS' | 'RUNNING' | 'PENDING' | 'FAILED';
  details?: string;
}

export interface MergeRequest {
  id: string;
  title: string;
  author: string;
  authorPhoto?: string;
  status: 'OPEN' | 'MERGED' | 'CLOSED';
  approvals: number;
  requiredApprovals: number;
  approvers: Approver[];
  validationFlows: ValidationCheck[];
  sourceBranch: string;
  targetBranch: string;
  diffPreview?: {
    file: string;
    additions: number;
    deletions: number;
    lines: { number: number; content: string; type: 'added' | 'removed' | 'normal' }[];
  };
}

export interface EnvironmentApproval {
  env: 'Development' | 'Staging' | 'Production';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
}

export interface DeploymentRule {
  env: 'Development' | 'Staging' | 'Production';
  requiredApprovers: number;
  allowedGroups?: string[];
  autoPromotion?: boolean;
}

export interface RepoStatus {
  id: string;
  name: string;
  branch: string;
  status: 'HEALTHY' | 'SYNCING' | 'CONFLICT';
  lastCommit: string;
  lastUpdate: string;
  releaseId?: string;
  merges: MergeRequest[];
  approvals: EnvironmentApproval[];
  pipelines: PipelineStage[];
  deploymentRules: DeploymentRule[];
  artifactVersion?: string;
}

export interface PipelineStage {
  name: string;
  status: 'success' | 'running' | 'pending' | 'failed';
  duration?: string;
  icon: string;
}

export interface Activity {
  id: string;
  user: string;
  userPhoto: string;
  action: string;
  timestamp: string;
  details?: string;
  isBot?: boolean;
}

export interface ExecutionRun {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'running' | 'waiting_approval';
  startedAt: string;
  duration: string;
  steps: { name: string; status: 'success' | 'failed' | 'running' | 'pending' }[];
}
