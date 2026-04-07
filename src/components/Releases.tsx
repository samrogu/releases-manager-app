import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  FileText, 
  Play, 
  Wand2, 
  CheckCircle2, 
  Merge, 
  ShieldCheck, 
  Settings2, 
  Link2, 
  ExternalLink,
  Book,
  Terminal,
  Settings as SettingsIcon,
  Plus,
  Send,
  X,
  LayoutDashboard,
  ClipboardList,
  GitBranch,
  Activity as ActivityIcon,
  MessageSquare,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { MOCK_RELEASES } from '../constants';
import { Screen, Release, MergeRequest } from '../types';
import { fetchPullRequests } from '../services/githubService';
import CreatePRModal from './CreatePRModal';

interface ReleasesProps {
  onNavigate: (screen: Screen) => void;
  selectedReleaseId: string | null;
  onSelectRelease: (id: string | null) => void;
  onSelectMerge?: (id: string) => void;
}

type TabType = 'overview' | 'tasks' | 'repositories' | 'pipelines' | 'activity' | 'settings';

export default function Releases({ onNavigate, selectedReleaseId, onSelectRelease, onSelectMerge }: ReleasesProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [approvals, setApprovals] = useState<Record<string, Record<string, boolean>>>({});
  const [githubPRs, setGithubPRs] = useState<MergeRequest[]>([]);
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [isCreatePRModalOpen, setIsCreatePRModalOpen] = useState(false);

  const selectedRelease = MOCK_RELEASES.find(r => r.id === selectedReleaseId);

  useEffect(() => {
    if (selectedReleaseId) {
      loadGithubPRs();
    }
  }, [selectedReleaseId]);

  const loadGithubPRs = async () => {
    setLoadingPRs(true);
    try {
      const prs = await fetchPullRequests('samrogu', 'rapid-config-server');
      const mappedPRs: MergeRequest[] = prs.map(pr => ({
        id: `PR-${pr.number}`,
        title: pr.title,
        author: pr.user.login,
        status: pr.state === 'open' ? 'OPEN' : 'MERGED',
        approvals: 0,
        requiredApprovals: 2,
        approvers: [],
        validationFlows: [],
        sourceBranch: pr.head.ref,
        targetBranch: pr.base.ref
      }));
      setGithubPRs(mappedPRs);
    } catch (err) {
      console.error('Error loading PRs for releases:', err);
    } finally {
      setLoadingPRs(false);
    }
  };

  const toggleApproval = (repoId: string, env: string) => {
    setApprovals(prev => ({
      ...prev,
      [repoId]: {
        ...prev[repoId],
        [env]: !prev[repoId]?.[env]
      }
    }));
  };

  if (!selectedRelease) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-headline text-3xl font-extrabold text-white tracking-tight">Release Hub</h1>
            <p className="text-on-surface-variant mt-1">Manage and orchestrate all platform releases.</p>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
            <Plus size={18} />
            New Release
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_RELEASES.map((release) => (
            <motion.div
              key={release.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectRelease(release.id)}
              className="bg-surface-high p-6 rounded-2xl border border-white/5 cursor-pointer hover:border-primary/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-0.5 bg-primary-container text-primary rounded text-[10px] font-bold uppercase tracking-widest">
                    {release.version}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    release.status === 'Production' ? 'text-tertiary' : 
                    release.status === 'Staging' ? 'text-primary' : 'text-on-surface-variant'
                  }`}>
                    {release.status}
                  </span>
                </div>
                <h3 className="text-xl font-headline font-bold text-white group-hover:text-primary transition-colors">
                  {release.codename}
                </h3>
                <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">
                  {release.description}
                </p>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase">
                  <span>Progress</span>
                  <span>{release.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${release.status === 'Production' ? 'bg-tertiary' : 'bg-primary'}`} 
                    style={{ width: `${release.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                      <CheckCircle2 size={12} /> {release.tasks.length}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                      <Book size={12} /> {release.repositories.length}
                    </div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">{release.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Contextual Integrity Header */}
      <div className="bg-surface-low border-b border-white/5 px-8 py-3 -mx-8 -mt-8 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onSelectRelease(null)}
            className="text-on-surface-variant hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <ArrowRight size={16} className="rotate-180" /> Back to Hub
          </button>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Release Integrity: <span className="text-tertiary">Optimal</span></span>
          </div>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-tertiary">
              <CheckCircle2 size={14} /> {selectedRelease.tasks.length}/{selectedRelease.tasks.length} Jira Tasks
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
              <Merge size={14} /> 3/4 PRs Merged
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-tertiary">
              <ShieldCheck size={14} /> CI/CD Green
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase">Target: {selectedRelease.version}</span>
          <div className="w-32 h-1.5 bg-surface-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4" style={{ width: `${selectedRelease.progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Release Title & Description */}
      <section className="mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 bg-primary-container text-primary rounded text-[10px] font-bold uppercase tracking-widest">{selectedRelease.version}</span>
              <span className="flex items-center gap-1.5 text-tertiary text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#4ae176]"></span>
                Active Stage: {selectedRelease.status}
              </span>
            </div>
            <h1 className="text-4xl font-headline font-extrabold text-white tracking-tight leading-tight">{selectedRelease.codename}</h1>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_4_20px_rgba(123,208,255,0.2)] text-xs">
              <Play size={16} fill="currentColor" />
              Deploy
            </button>
            <button className="px-4 py-2 bg-surface-high text-on-surface rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-bright transition-colors border border-white/5 text-xs">
              <SettingsIcon size={16} />
              Config
            </button>
          </div>
        </div>
      </section>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-1 bg-surface-high p-1 rounded-2xl border border-white/5 w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'tasks', label: 'Jira Tasks', icon: ClipboardList, count: selectedRelease.tasks.length },
          { id: 'repositories', label: 'Repositories', icon: GitBranch, count: selectedRelease.repositories.length },
          { id: 'pipelines', label: 'Pipelines', icon: Terminal },
          { id: 'activity', label: 'Activity', icon: MessageSquare },
          { id: 'settings', label: 'Settings', icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                  : 'text-on-surface-variant hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${isActive ? 'bg-white/20 text-white' : 'bg-surface-highest text-on-surface-variant'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Command Center Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[500px]"
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8 space-y-8">
                <div className="bg-surface-high rounded-2xl p-8 border border-white/5">
                  <h3 className="text-xl font-headline font-bold text-white mb-4">Release Summary</h3>
                  <p className="text-on-surface-variant text-lg leading-relaxed">{selectedRelease.description}</p>
                  
                  <div className="grid grid-cols-3 gap-6 mt-10">
                    <div className="bg-surface-low p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Health Status</p>
                      <p className="text-xl font-bold text-tertiary">Nominal</p>
                    </div>
                    <div className="bg-surface-low p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Security Scan</p>
                      <p className="text-xl font-bold text-white">Passed</p>
                    </div>
                    <div className="bg-surface-low p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Compliance</p>
                      <p className="text-xl font-bold text-primary">Verified</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-surface-high rounded-2xl p-6 border border-white/5">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <ShieldCheck className="text-tertiary" size={18} />
                      Quality Gate
                    </h4>
                    <ul className="space-y-3">
                      {[
                        { label: 'Unit Tests', status: 'Passed', val: '100%' },
                        { label: 'Code Coverage', status: 'Passed', val: '84.2%' },
                        { label: 'Linting', status: 'Passed', val: '0 errors' },
                      ].map((item, i) => (
                        <li key={i} className="flex justify-between items-center text-xs">
                          <span className="text-on-surface-variant">{item.label}</span>
                          <span className="font-bold text-white">{item.val}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-surface-high rounded-2xl p-6 border border-white/5">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <ActivityIcon className="text-primary" size={18} />
                      Resource Usage
                    </h4>
                    <ul className="space-y-3">
                      {[
                        { label: 'CPU Load', status: 'Normal', val: '12%' },
                        { label: 'Memory', status: 'Normal', val: '4.2GB' },
                        { label: 'Network', status: 'Normal', val: '124MB/s' },
                      ].map((item, i) => (
                        <li key={i} className="flex justify-between items-center text-xs">
                          <span className="text-on-surface-variant">{item.label}</span>
                          <span className="font-bold text-white">{item.val}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-surface-high rounded-2xl p-6 border border-white/5">
                  <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Release Milestones</h3>
                  <div className="space-y-6 relative">
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/5"></div>
                    {[
                      { label: 'Alpha Completion', date: 'Oct 12', done: true },
                      { label: 'Beta Testing', date: 'Oct 18', done: true },
                      { label: 'Security Audit', date: 'Oct 22', done: true },
                      { label: 'Production Rollout', date: 'Oct 24', done: false },
                    ].map((m, i) => (
                      <div key={i} className="relative pl-8">
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 ${m.done ? 'bg-tertiary border-tertiary' : 'bg-surface-high border-white/10'}`}>
                          {m.done && <CheckCircle2 size={12} className="text-on-tertiary" />}
                        </div>
                        <p className={`text-xs font-bold ${m.done ? 'text-white' : 'text-on-surface-variant'}`}>{m.label}</p>
                        <p className="text-[10px] text-on-surface-variant">{m.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-surface-high rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 bg-surface-bright flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <h2 className="text-lg font-headline font-bold text-white">Linked Jira Issues</h2>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">{selectedRelease.tasks.length} TOTAL</span>
                </div>
                <button className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
                  <Link2 size={16} /> Manage Links
                </button>
              </div>
              <div className="p-6 space-y-3">
                {selectedRelease.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-surface-low rounded-xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="text-[10px] font-mono font-bold text-on-surface-variant w-16">{task.id}</div>
                      <h4 className="text-sm font-semibold text-on-surface">{task.title}</h4>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-surface-bright border border-white/10"></div>
                        <span className="text-xs text-on-surface-variant">{task.assignee}</span>
                      </div>
                      <span className={`px-2.5 py-1 bg-surface-container-highest text-on-surface border border-white/5 rounded text-[9px] font-black uppercase`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'repositories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Book className="text-primary" size={24} />
                  <h2 className="text-xl font-headline font-bold text-white">Release Repositories</h2>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{selectedRelease.repositories.length} ACTIVE</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsCreatePRModalOpen(true)}
                    className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Create Pull Request
                  </button>
                  <button 
                    className="px-4 py-2 bg-surface-high text-on-surface text-xs font-bold rounded-xl border border-white/5 hover:bg-surface-bright transition-colors"
                  >
                    Global Comparison
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {selectedRelease.repositories.map((repo, idx) => (
                  <div key={idx} className="bg-surface-high rounded-2xl border border-white/5 overflow-hidden">
                    {/* Repo Header */}
                    <div className="px-6 py-4 bg-surface-bright flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center border border-white/5">
                          <GitBranch className="text-primary" size={20} />
                        </div>
                        <div>
                          <h3 className="text-md font-bold text-white">{repo.name}</h3>
                          <p className="text-[10px] text-on-surface-variant font-mono">{repo.branch} • {repo.lastCommit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${repo.status === 'HEALTHY' ? 'bg-tertiary' : 'bg-error'} animate-pulse`}></span>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{repo.status}</span>
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* 1. Merges / PRs */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-2">
                            <Merge size={14} className="text-primary" /> Active Merges
                          </h4>
                          {repo.artifactVersion && (
                            <span className="text-[9px] font-mono bg-surface-highest px-1.5 py-0.5 rounded text-on-surface-variant border border-white/5">
                              {repo.artifactVersion}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {loadingPRs && repo.name === 'rapid-config-server' ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="text-primary animate-spin" size={20} />
                            </div>
                          ) : (repo.name === 'rapid-config-server' ? githubPRs : repo.merges).length > 0 ? (repo.name === 'rapid-config-server' ? githubPRs : repo.merges).map((merge, mIdx) => (
                            <div 
                              key={mIdx} 
                              onClick={() => {
                                if (onSelectMerge) {
                                  onSelectMerge(merge.id);
                                }
                              }}
                              className="bg-surface-low p-3 rounded-xl border border-white/5 group hover:border-primary/30 transition-all cursor-pointer"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-mono text-primary font-bold">{merge.id}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${merge.status === 'OPEN' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'}`}>
                                  {merge.status}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-white mb-2">{merge.title}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-on-surface-variant">by {merge.author}</span>
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 size={12} className={merge.approvals >= merge.requiredApprovals ? 'text-tertiary' : 'text-on-surface-variant'} />
                                  <span className="text-[10px] font-bold text-on-surface-variant">{merge.approvals}/{merge.requiredApprovals}</span>
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center py-4 bg-surface-low rounded-xl border border-dashed border-white/5">
                              <p className="text-[10px] text-on-surface-variant italic">No active merges</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. Environment Approvals & Promotion */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-2">
                          <ShieldCheck size={14} className="text-tertiary" /> Env Approvals & Promotion
                        </h4>
                        <div className="space-y-3">
                          {repo.approvals.map((app, aIdx) => {
                            const isApproved = approvals[repo.id]?.[app.env] || app.status === 'APPROVED';
                            const rule = repo.deploymentRules?.find(r => r.env === app.env);
                            const isPromotion = app.env !== 'Development';
                            
                            return (
                              <div key={aIdx} className="flex items-center justify-between p-3 bg-surface-low rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${isApproved ? 'bg-tertiary shadow-[0_0_8px_#4ae176]' : 'bg-surface-highest'}`}></div>
                                  <div>
                                    <span className="text-xs font-bold text-white">{app.env}</span>
                                    {rule && (
                                      <p className="text-[8px] text-on-surface-variant font-medium">Req: {rule.requiredApprovers} approvals</p>
                                    )}
                                  </div>
                                </div>
                                {isApproved ? (
                                  <div className="text-right flex items-center gap-2">
                                    <div>
                                      <p className="text-[9px] text-tertiary font-bold">APPROVED</p>
                                      <p className="text-[8px] text-on-surface-variant">{app.approvedBy || 'Current User'}</p>
                                    </div>
                                    <button 
                                      onClick={() => toggleApproval(repo.id, app.env)}
                                      className="text-on-surface-variant hover:text-error transition-colors"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => toggleApproval(repo.id, app.env)}
                                    className={`px-3 py-1 text-[9px] font-black rounded-lg border transition-all ${
                                      isPromotion 
                                        ? 'bg-tertiary/10 text-tertiary border-tertiary/20 hover:bg-tertiary/20' 
                                        : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                                    }`}
                                  >
                                    {isPromotion ? 'PROMOTE' : 'APPROVE'}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Repo Pipelines */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-2">
                          <Terminal size={14} className="text-primary" /> Repo Pipelines
                        </h4>
                        <div className="space-y-3">
                          {repo.pipelines.map((pipe, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                pipe.status === 'success' ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' :
                                pipe.status === 'running' ? 'bg-primary/10 border-primary/20 text-primary animate-pulse' :
                                'bg-surface-low border-white/5 text-on-surface-variant'
                              }`}>
                                {pipe.status === 'success' ? <CheckCircle2 size={16} /> : <ActivityIcon size={16} />}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-white">{pipe.name}</span>
                                  <span className="text-[9px] text-on-surface-variant uppercase font-bold">{pipe.status}</span>
                                </div>
                                <div className="w-full h-1 bg-surface-container-lowest rounded-full overflow-hidden">
                                  <div className={`h-full ${pipe.status === 'success' ? 'bg-tertiary' : 'bg-primary'} ${pipe.status === 'running' ? 'w-1/2' : 'w-full'}`}></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pipelines' && (
            <div className="bg-surface-high rounded-2xl border border-white/5 overflow-hidden max-w-4xl">
              <div className="px-6 py-4 bg-surface-bright flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Terminal className="text-primary" size={20} />
                  <h2 
                    className="text-lg font-headline font-bold text-white"
                  >
                    Execution Pipeline
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {selectedRelease.pipelines.map((pipeline, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings2 className="text-primary" size={18} />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{pipeline.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-mono ${pipeline.status === 'success' ? 'text-tertiary' : 'text-primary'}`}>
                          {pipeline.status.toUpperCase()}
                        </span>
                        <div className="w-32 h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                          <div className={`h-full ${pipeline.status === 'success' ? 'bg-tertiary' : 'bg-primary'} w-full`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="h-px bg-white/5"></div>
                <button className="w-full py-3 bg-primary/10 text-primary text-xs font-bold rounded-xl border border-primary/20 hover:bg-primary/20 transition-all">Trigger Force Sync</button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-surface-high rounded-2xl border border-white/5 flex flex-col p-6 max-w-2xl">
              <h2 className="text-lg font-headline font-bold text-white mb-6">Release Activity Feed</h2>
              <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2 mb-6 min-h-[300px]">
                {[
                  { user: 'David Miller', time: '10M', msg: 'gRPC pooling logic verified in staging. UI patches pending Sarah\'s merge.' },
                  { user: 'Sarah Chen', time: '25M', msg: 'Merged PR #4201 into release branch. Ready for final scan.' },
                  { user: 'System', time: '1H', msg: 'Automated health check passed for all worker nodes.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-bright border border-white/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {item.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="bg-surface-low p-4 rounded-2xl rounded-tl-none flex-1 border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{item.user}</span>
                        <span className="text-[9px] text-on-surface-variant uppercase font-bold">{item.time}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{item.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative">
                <textarea className="w-full bg-surface-container-lowest border border-white/5 focus:ring-1 focus:ring-primary/50 rounded-xl p-4 text-xs text-on-surface min-h-[100px] resize-none placeholder:text-on-surface-variant/50" placeholder="Update the team..."></textarea>
                <button className="absolute bottom-3 right-3 bg-primary text-on-primary p-2 rounded-xl hover:brightness-110 active:scale-95 transition-all">
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-surface-high rounded-2xl border border-white/5 p-8 max-w-2xl space-y-8">
              <div className="space-y-2">
                <h2 className="text-xl font-headline font-bold text-white">Release Configuration</h2>
                <p className="text-sm text-on-surface-variant">Manage environment rules, notification hooks, and deployment windows for this release.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Deployment Windows</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-low rounded-xl border border-white/5">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Start Date</p>
                      <p className="text-sm font-bold text-white">Apr 10, 2026</p>
                    </div>
                    <div className="p-4 bg-surface-low rounded-xl border border-white/5">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Freeze Period</p>
                      <p className="text-sm font-bold text-white">None active</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Notification Channels</h3>
                  <div className="space-y-2">
                    {['#ops-deployments', '#release-phoenix-warroom'].map((channel, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-surface-low rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <MessageSquare size={16} />
                          </div>
                          <span className="text-xs font-bold text-white">{channel}</span>
                        </div>
                        <span className="text-[10px] font-bold text-tertiary uppercase">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer Action Bar */}
      <div className="bg-surface-highest/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-8 sticky bottom-4 z-50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle className="text-white/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
              <circle className="text-primary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="176" strokeDashoffset="44" strokeWidth="4"></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary uppercase">{selectedRelease.progress}%</div>
          </div>
          <div>
            <div className="text-xs font-black text-white uppercase tracking-widest mb-1">Deployment Readiness</div>
            <p className="text-[10px] text-on-surface-variant font-medium">3 of 4 stages cleared. Final Canary shift pending approval.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[9px] text-on-surface-variant font-bold uppercase tracking-tighter">Est. Completion</div>
            <div className="text-lg font-headline font-bold text-white tabular-nums">04:22:15</div>
          </div>
          <div className="h-10 w-px bg-white/10 mx-2"></div>
          <button className="bg-primary text-on-primary px-8 py-3 rounded-xl text-xs font-black shadow-[0_0_20px_rgba(123,208,255,0.4)] hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest">
            Approve Next Phase
          </button>
          <button className="text-error hover:bg-error/10 border border-error/20 px-4 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-widest">
            Abrupt Stop
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isCreatePRModalOpen && (
          <CreatePRModal 
            isOpen={isCreatePRModalOpen}
            onClose={() => setIsCreatePRModalOpen(false)}
            onSuccess={() => {
              loadGithubPRs();
              // Optional: show a success toast
            }}
            owner="samrogu"
            initialRepo="rapid-config-server"
            repositories={selectedRelease.repositories.map(r => ({ id: r.id, name: r.name }))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
