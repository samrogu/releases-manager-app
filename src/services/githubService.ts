const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  user: {
    login: string;
    avatar_url: string;
  };
  state: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  base: {
    ref: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  body: string;
}

export interface GitHubReview {
  id: number;
  user: {
    login: string;
  };
  state: string;
}

export interface GitHubStatus {
  context: string;
  state: string;
  description: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubComment {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  };
  body: string;
  created_at: string;
}

export interface GitHubBranch {
  name: string;
}

export async function fetchBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches`);
  if (!response.ok) throw new Error('Failed to fetch branches');
  return response.json();
}

export async function fetchPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubPR[]> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=${state}`);
  if (!response.ok) throw new Error('Failed to fetch pull requests');
  return response.json();
}

export async function fetchPRDetails(owner: string, repo: string, pullNumber: number): Promise<GitHubPR> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}`);
  if (!response.ok) throw new Error('Failed to fetch PR details');
  return response.json();
}

export async function fetchPRReviews(owner: string, repo: string, pullNumber: number): Promise<GitHubReview[]> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`);
  if (!response.ok) throw new Error('Failed to fetch PR reviews');
  return response.json();
}

export async function fetchPRStatuses(owner: string, repo: string, ref: string): Promise<GitHubStatus[]> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${ref}/status`);
  if (!response.ok) throw new Error('Failed to fetch PR statuses');
  const data = await response.json();
  return data.statuses || [];
}

export interface GitHubFile {
  sha: string;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
}

export async function fetchPRFiles(owner: string, repo: string, pullNumber: number): Promise<GitHubFile[]> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}/files`);
  if (!response.ok) throw new Error('Failed to fetch PR files');
  return response.json();
}

export async function fetchPRCommits(owner: string, repo: string, pullNumber: number): Promise<GitHubCommit[]> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}/commits`);
  if (!response.ok) throw new Error('Failed to fetch PR commits');
  return response.json();
}

export async function fetchPRComments(owner: string, repo: string, pullNumber: number): Promise<GitHubComment[]> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${pullNumber}/comments`);
  if (!response.ok) throw new Error('Failed to fetch PR comments');
  return response.json();
}

export async function createPullRequest(owner: string, repo: string, title: string, head: string, base: string, body?: string): Promise<GitHubPR> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      title,
      head,
      base,
      body,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create Pull Request');
  }
  return response.json();
}
