import React, { useEffect, useState } from 'react';
import { 
  GitPullRequest, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  ShieldCheck, 
  Activity, 
  FileCode, 
  ExternalLink,
  ChevronRight,
  MessageSquare,
  GitCommit,
  X,
  Loader2,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Approver, ValidationCheck } from '../types';
import { 
  fetchPRDetails, 
  fetchPRReviews, 
  fetchPRStatuses, 
  fetchPRFiles, 
  fetchPRCommits, 
  fetchPRComments,
  GitHubPR, 
  GitHubFile,
  GitHubCommit,
  GitHubComment
} from '../services/githubService';

interface MergeDetailProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMergeId: string | null; // This will be the PR number for GitHub
}

export default function MergeDetail({ isOpen, onClose, selectedMergeId }: MergeDetailProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prData, setPrData] = useState<GitHubPR | null>(null);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [validations, setValidations] = useState<ValidationCheck[]>([]);
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [comments, setComments] = useState<GitHubComment[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'changes' | 'conversation'>('overview');

  const owner = 'samrogu';
  const repo = 'rapid-config-server';

  useEffect(() => {
    if (isOpen && selectedMergeId) {
      loadPRData();
    }
  }, [isOpen, selectedMergeId]);

  const loadPRData = async () => {
    setLoading(true);
    setError(null);
    try {
      const prNumber = parseInt(selectedMergeId!.replace('PR-', ''));
      
      const details = await fetchPRDetails(owner, repo, prNumber);
      setPrData(details);

      const [reviews, statuses, prFiles, prCommits, prComments] = await Promise.all([
        fetchPRReviews(owner, repo, prNumber),
        fetchPRStatuses(owner, repo, details?.head?.sha || ''),
        fetchPRFiles(owner, repo, prNumber),
        fetchPRCommits(owner, repo, prNumber),
        fetchPRComments(owner, repo, prNumber)
      ]);

      setFiles(prFiles);
      setCommits(prCommits);
      setComments(prComments);

      // Map reviews to approvers
      const mappedApprovers: Approver[] = reviews.map(r => ({
        id: r.id.toString(),
        name: r.user.login,
        role: 'Contributor',
        status: r.state === 'APPROVED' ? 'APPROVED' : r.state === 'CHANGES_REQUESTED' ? 'REJECTED' : 'PENDING'
      }));
      setApprovers(mappedApprovers);

      // Map statuses to validations
      const mappedValidations: ValidationCheck[] = statuses.map((s, i) => ({
        id: i.toString(),
        name: s.context,
        type: 'AUTOMATED',
        status: s.state === 'success' ? 'SUCCESS' : s.state === 'pending' ? 'RUNNING' : 'FAILED',
        details: s.description
      }));
      setValidations(mappedValidations);

    } catch (err) {
      console.error('Error loading PR data:', err);
      setError('Failed to load merge request details from GitHub.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="min-h-full bg-surface flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="h-16 flex items-center justify-between px-8 bg-surface-high border-b border-white/10 shrink-0 sticky top-0 z-30 shadow-lg shadow-black/20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 hover:bg-surface-bright text-on-surface-variant hover:text-white rounded-lg transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold">Back</span>
          </button>
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <GitPullRequest className="text-primary" size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">Merge Request</span>
              <span className="text-sm font-black text-white tracking-tight leading-none">#{prData?.number}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={prData?.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-surface-bright text-white rounded-lg font-bold border border-white/5 hover:bg-white/10 transition-all flex items-center gap-2 text-xs"
          >
            <ExternalLink size={16} />
            <span>View GitHub</span>
          </a>
          <button className="px-5 py-2 bg-primary text-on-primary rounded-lg font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 text-xs">
            <CheckCircle2 size={16} />
            <span>Approve & Merge</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 md:p-12 space-y-10 max-w-7xl mx-auto w-full">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 size={48} className="text-primary animate-spin" />
              <p className="text-on-surface-variant font-medium">Fetching GitHub Data...</p>
            </div>
          ) : error || !prData ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <AlertCircle size={64} className="text-error opacity-50" />
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Data Sync Failed</h2>
                <p className="text-on-surface-variant max-w-md">{error || 'The requested merge request could not be located.'}</p>
              </div>
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-primary text-on-primary rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Header Info */}
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-2 py-0.5 rounded">Merge Request</span>
                    <span className="text-on-surface-variant/30">•</span>
                    <span className="text-xs text-on-surface-variant">Created {new Date(prData.created_at).toLocaleDateString()}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">{prData.title}</h1>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-on-surface-variant">
                  <div className="flex items-center gap-2 bg-surface-high/50 px-3 py-1.5 rounded-full border border-white/5">
                    <img src={prData.user.avatar_url} alt={prData.user.login} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                    <span className="text-sm font-bold text-on-surface">{prData.user.login}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs md:text-sm">
                    <span className="text-primary font-bold bg-primary/5 px-2 py-0.5 rounded">{prData.head.ref}</span>
                    <ChevronRight size={14} className="text-on-surface-variant" />
                    <span className="text-on-surface font-bold bg-surface-high px-2 py-0.5 rounded">{prData.base.ref}</span>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center gap-2 border-b border-white/10">
                {[
                  { id: 'overview', label: 'Overview', icon: Activity },
                  { id: 'commits', label: 'Commits', icon: GitCommit, count: commits.length },
                  { id: 'changes', label: 'Changes', icon: FileCode, count: files.length },
                  { id: 'conversation', label: 'Conversation', icon: MessageSquare, count: comments.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all relative ${
                      activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant hover:text-white'
                    }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="bg-surface-high px-1.5 py-0.5 rounded text-[9px] font-mono">{tab.count}</span>
                    )}
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_#3b82f6]" 
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left: Tab Content */}
                <div className="xl:col-span-8 space-y-10">
                  {activeTab === 'overview' && (
                    <>
                      {/* Description Section */}
                      <div className="bg-surface-container-low rounded-[1.5rem] border border-white/5 overflow-hidden shadow-xl">
                        <div className="px-6 py-4 bg-surface-high/50 border-b border-white/5 flex items-center gap-3">
                          <MessageSquare className="text-primary" size={18} />
                          <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Description</h3>
                        </div>
                        <div className="p-6 text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar">
                          {prData.body || 'No description provided.'}
                        </div>
                      </div>

                      {/* Activity Feed (Moved here for Overview) */}
                      <div className="bg-surface-container-low rounded-[1.5rem] border border-white/5 p-6 md:p-8 space-y-6 shadow-xl">
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.15em] flex items-center gap-3">
                          <Activity size={18} className="text-primary" /> Recent Activity
                        </h3>
                        
                        <div className="space-y-6 relative">
                          <div className="absolute left-4 top-2 bottom-2 w-px bg-white/5"></div>
                          
                          {approvers.length > 0 ? approvers.map((app, i) => (
                            <div key={i} className="flex gap-4 relative">
                              <div className="w-8 h-8 rounded-full bg-surface-bright flex items-center justify-center border border-white/10 shrink-0 z-10">
                                <User size={14} className="text-primary" />
                              </div>
                              <div className="space-y-1 pt-1">
                                <p className="text-sm text-on-surface">
                                  <span className="font-bold text-white">{app.name}</span> {app.status === 'APPROVED' ? 'approved' : app.status === 'REJECTED' ? 'requested changes' : 'reviewed'} these changes
                                </p>
                                <p className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Review Event</p>
                              </div>
                            </div>
                          )) : (
                            <div className="flex gap-4 relative">
                              <div className="w-8 h-8 rounded-full bg-surface-bright flex items-center justify-center border border-white/10 shrink-0 z-10">
                                <Clock size={14} className="text-on-surface-variant" />
                              </div>
                              <div className="space-y-1 pt-1">
                                <p className="text-sm text-on-surface-variant italic">No review activity recorded yet.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'commits' && (
                    <div className="bg-surface-container-low rounded-[1.5rem] border border-white/5 overflow-hidden shadow-xl">
                      <div className="px-6 py-4 bg-surface-high/50 border-b border-white/5 flex items-center gap-3">
                        <GitCommit className="text-primary" size={18} />
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Commits ({commits.length})</h3>
                      </div>
                      <div className="divide-y divide-white/5">
                        {commits.length > 0 ? commits.map((commit, idx) => (
                          <div key={idx} className="p-6 flex items-start gap-4 hover:bg-white/5 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center border border-white/10 shrink-0">
                              <img src={commit.author?.avatar_url} alt={commit.author?.login} className="w-full h-full rounded-full" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{commit.commit.message}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{commit.author?.login || commit.commit.author.name}</span>
                                <span className="text-on-surface-variant/30">•</span>
                                <span className="text-[10px] text-on-surface-variant">{new Date(commit.commit.author.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="text-[10px] font-mono text-on-surface-variant bg-surface-high px-2 py-1 rounded border border-white/5">
                              {commit.sha.substring(0, 7)}
                            </div>
                          </div>
                        )) : (
                          <div className="p-10 text-center text-on-surface-variant italic text-sm">
                            No commits found.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'changes' && (
                    <div className="bg-surface-container-low rounded-[1.5rem] border border-white/5 overflow-hidden shadow-xl">
                      <div className="px-6 py-4 bg-surface-high/50 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileCode className="text-primary" size={18} />
                          <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Changes ({files.length})</h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-tertiary">+{files.reduce((acc, f) => acc + f.additions, 0)}</span>
                          <span className="text-[10px] font-bold text-error">-{files.reduce((acc, f) => acc + f.deletions, 0)}</span>
                        </div>
                      </div>
                      <div className="divide-y divide-white/5">
                        {files.length > 0 ? files.map((file, idx) => (
                          <div key={idx} className="p-0">
                            <div className="px-6 py-3 bg-surface-highest/20 flex items-center justify-between border-b border-white/5">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <FileCode size={14} className="text-on-surface-variant shrink-0" />
                                <span className="text-xs font-mono text-on-surface font-bold truncate">{file.filename}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-[10px] font-bold text-tertiary">+{file.additions}</span>
                                <span className="text-[10px] font-bold text-error">-{file.deletions}</span>
                              </div>
                            </div>
                            {file.patch ? (
                              <div className="p-4 font-mono text-[11px] overflow-x-auto bg-surface-container-lowest/30 leading-relaxed custom-scrollbar max-h-[400px]">
                                {file.patch.split('\n').map((line, lIdx) => {
                                  const isAdded = line.startsWith('+');
                                  const isRemoved = line.startsWith('-');
                                  const isHeader = line.startsWith('@@');
                                  return (
                                    <div 
                                      key={lIdx} 
                                      className={`whitespace-pre px-4 py-0.5 border-l-4 transition-colors ${
                                        isAdded ? 'bg-tertiary/10 text-tertiary border-tertiary/40' :
                                        isRemoved ? 'bg-error/10 text-error border-error/40' :
                                        isHeader ? 'bg-primary/5 text-primary/50 italic border-primary/20' :
                                        'text-on-surface-variant/60 border-transparent hover:bg-white/5'
                                      }`}
                                    >
                                      <span className="opacity-30 mr-6 select-none inline-block w-6 text-right text-[9px]">{lIdx + 1}</span>
                                      {line}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-[10px] text-on-surface-variant italic">
                                Binary file or no diff available.
                              </div>
                            )}
                          </div>
                        )) : (
                          <div className="p-10 text-center text-on-surface-variant italic text-sm">
                            No file changes found.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'conversation' && (
                    <div className="bg-surface-container-low rounded-[1.5rem] border border-white/5 overflow-hidden shadow-xl">
                      <div className="px-6 py-4 bg-surface-high/50 border-b border-white/5 flex items-center gap-3">
                        <MessageSquare className="text-primary" size={18} />
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Conversation ({comments.length})</h3>
                      </div>
                      <div className="p-6 space-y-8">
                        {comments.length > 0 ? comments.map((comment, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center border border-white/10 shrink-0">
                              <img src={comment.user.avatar_url} alt={comment.user.login} className="w-full h-full rounded-full" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-white">{comment.user.login}</span>
                                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Commented</span>
                                </div>
                                <span className="text-[10px] text-on-surface-variant">{new Date(comment.created_at).toLocaleString()}</span>
                              </div>
                              <div className="bg-surface-high/50 p-4 rounded-2xl border border-white/5 text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                                {comment.body}
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="p-10 text-center text-on-surface-variant italic text-sm">
                            No comments yet.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Status and Metadata */}
                <div className="xl:col-span-4 space-y-8">
                  {/* Status Card */}
                  <div className="bg-surface-container-low rounded-[1.5rem] border border-white/5 p-6 md:p-8 space-y-8 shadow-xl">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Merge Readiness</h4>
                      <div className={`p-5 rounded-2xl border border-white/5 flex items-center gap-4 ${
                        prData.state === 'open' ? 'bg-tertiary/5' : 'bg-surface-high'
                      }`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          prData.state === 'open' ? 'bg-tertiary/10 text-tertiary' : 'bg-surface-bright text-on-surface-variant'
                        }`}>
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p className="text-md font-black text-white">{prData.state === 'open' ? 'Ready to Review' : 'Closed'}</p>
                          <p className="text-[10px] text-on-surface-variant">Status: {prData.state.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Validation Pipeline</h4>
                      <div className="space-y-2">
                        {validations.length > 0 ? validations.map((check, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-surface-high/50 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${
                                check.status === 'SUCCESS' ? 'bg-tertiary shadow-[0_0_8px_#4ae176]' :
                                check.status === 'RUNNING' ? 'bg-primary animate-pulse shadow-[0_0_8px_#3b82f6]' :
                                'bg-surface-highest'
                              }`}></div>
                              <span className="text-xs font-bold text-white truncate">{check.name}</span>
                            </div>
                            <span className="text-[9px] font-black text-on-surface-variant uppercase bg-surface-highest px-1.5 py-0.5 rounded shrink-0">{check.status}</span>
                          </div>
                        )) : (
                          <p className="text-[10px] text-on-surface-variant italic text-center py-2">No active CI/CD checks found.</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Approvers</h4>
                      <div className="space-y-2">
                        {approvers.length > 0 ? approvers.map((approver, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-surface-high/50 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-surface-bright flex items-center justify-center border border-white/10">
                                <User size={14} className="text-on-surface-variant" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-white">{approver.name}</p>
                                <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">{approver.role}</p>
                              </div>
                            </div>
                            <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest ${
                              approver.status === 'APPROVED' ? 'bg-tertiary/10 text-tertiary border border-tertiary/20' :
                              approver.status === 'REJECTED' ? 'bg-error/10 text-error border border-error/20' :
                              'bg-surface-highest text-on-surface-variant border border-white/5'
                            }`}>
                              {approver.status}
                            </div>
                          </div>
                        )) : (
                          <p className="text-[10px] text-on-surface-variant italic text-center py-2">Awaiting reviews.</p>
                        )}
                      </div>
                    </div>

                    {/* Metadata Info */}
                    <div className="pt-6 border-t border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-on-surface-variant font-bold uppercase tracking-widest">Created</span>
                        <span className="text-on-surface font-black">{new Date(prData.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-on-surface-variant font-bold uppercase tracking-widest">Last Update</span>
                        <span className="text-on-surface font-black">{new Date(prData.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  );
}
