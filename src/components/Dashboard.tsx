import React, { useEffect, useState } from 'react';
import { 
  Package2, 
  CheckCircle2, 
  Timer, 
  AlertTriangle, 
  Activity, 
  Terminal, 
  Cloud, 
  Construction, 
  CheckSquare,
  Merge,
  Rocket,
  GitCommit,
  GitPullRequest,
  Plus,
  X,
  Rss,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

import { MOCK_RELEASES, MOCK_REPOS } from '../constants';
import { Screen } from '../types';
import { fetchPullRequests, GitHubPR } from '../services/githubService';
import CreatePRModal from './CreatePRModal';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
  onSelectRelease: (id: string | null) => void;
  onSelectMerge?: (id: string) => void;
}

export default function Dashboard({ onNavigate, onSelectRelease, onSelectMerge }: DashboardProps) {
  const [recentPRs, setRecentPRs] = useState<GitHubPR[]>([]);
  const [loadingPRs, setLoadingPRs] = useState(true);
  const [isCreatePRModalOpen, setIsCreatePRModalOpen] = useState(false);

  const owner = 'samrogu';
  const repo = 'rapid-config-server';

  useEffect(() => {
    loadRecentPRs();
  }, []);

  const loadRecentPRs = async () => {
    try {
      const prs = await fetchPullRequests(owner, repo);
      setRecentPRs(prs.slice(0, 3));
    } catch (err) {
      console.error('Error fetching PRs for dashboard:', err);
    } finally {
      setLoadingPRs(false);
    }
  };
  const kpis = [
    { label: 'Active Releases', value: MOCK_RELEASES.length.toString(), icon: Package2, trend: '+12%', color: 'primary' },
    { label: 'Success Rate', value: '98.2%', icon: CheckCircle2, trend: 'Optimal', color: 'tertiary' },
    { label: 'Avg. Deploy Time', value: '12:45', icon: Timer, trend: '-4m', color: 'primary' },
    { label: 'Failed Pipelines', value: '0', icon: AlertTriangle, trend: 'Low', color: 'error' },
  ];

  const handleReleaseClick = (id: string) => {
    onSelectRelease(id);
    onNavigate('releases');
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-white tracking-tight">Mission Control</h1>
          <p className="text-on-surface-variant mt-1">Real-time health and orchestration overview for all production clusters.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCreatePRModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-surface-high border border-white/5 text-on-surface text-sm font-semibold flex items-center gap-2 hover:bg-surface-bright transition-colors"
          >
            <GitPullRequest size={18} className="text-primary" />
            Create PR
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
            <Plus size={18} />
            Create Release
          </button>
        </div>
      </div>

      <CreatePRModal 
        isOpen={isCreatePRModalOpen}
        onClose={() => setIsCreatePRModalOpen(false)}
        onSuccess={() => {
          loadRecentPRs();
        }}
        owner={owner}
        initialRepo={repo}
        repositories={MOCK_REPOS.map(r => ({ id: r.id, name: r.name }))}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface-high p-6 rounded-xl border border-white/5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <Icon className={`text-${kpi.color} bg-${kpi.color}/10 p-2 rounded-lg`} size={36} />
                <span className={`text-[10px] font-bold text-${kpi.color === 'primary' ? 'primary' : kpi.color} bg-${kpi.color}/10 px-2 py-0.5 rounded-full`}>
                  {kpi.trend}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">{kpi.label}</p>
                <h3 className="text-3xl font-headline font-bold text-white mt-1">{kpi.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Health Panel & Timeline */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Health Panel */}
          <section className="bg-surface-low rounded-xl p-1 overflow-hidden">
            <div className="bg-surface-high rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline text-lg font-bold text-white">System Health Integrity</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#4ae176] animate-pulse"></div>
                  <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-tighter">Operational</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
                      <CheckSquare size={18} />
                    </div>
                    <span className="text-xs font-bold text-white">Jira Tasks</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">142</span>
                    <span className="text-[10px] text-on-surface-variant mb-1">4 pending review</span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <Construction size={18} />
                    </div>
                    <span className="text-xs font-bold text-white">CI Builds</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">89</span>
                    <span className="text-[10px] text-tertiary mb-1">12 active now</span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary">
                      <Cloud size={18} />
                    </div>
                    <span className="text-xs font-bold text-white">CD Deployments</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">1,402</span>
                    <span className="text-[10px] text-tertiary mb-1">All systems nominal</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-headline text-lg font-bold text-white">Release Timeline</h2>
              <button className="text-xs text-primary font-bold hover:underline">View History</button>
            </div>
            <div className="space-y-3">
              {MOCK_RELEASES.map((release, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleReleaseClick(release.id)}
                  className={`group relative bg-surface-high p-4 rounded-xl border border-white/5 hover:border-primary/20 transition-all flex items-center gap-6 cursor-pointer ${release.status === 'Staging' ? 'deployment-glow border-primary/30' : ''}`}
                >
                  <div className="flex flex-col items-center w-12 shrink-0">
                    <span className="text-xs font-black text-on-surface-variant uppercase">{release.date.split('-')[1]}</span>
                    <span className="text-xl font-headline font-extrabold text-white leading-none">{release.date.split('-')[2]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{release.version} ({release.codename})</h4>
                      <span className={`text-[10px] px-2 py-0.5 bg-surface-highest text-on-surface rounded-full font-bold uppercase tracking-wider`}>
                        {release.status}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{release.description}</p>
                  </div>
                  <div className="flex items-center gap-8 pr-4">
                    <div className="text-right">
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold">Progress</p>
                      <p className="text-xs font-bold text-on-surface">{release.progress}%</p>
                    </div>
                    <div className="w-24 h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                      <div className={`h-full bg-primary w-[${release.progress}%]`} style={{ width: `${release.progress}%` }}></div>
                    </div>
                    <button className="p-1.5 bg-surface-container-lowest rounded-lg hover:text-primary transition-colors">
                      <Terminal size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Activity Stream */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-low rounded-2xl p-6 flex flex-col h-full border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-lg font-bold text-white">Active Stream</h2>
              <Rss className="text-on-surface-variant" size={20} />
            </div>
            <div className="space-y-6 flex-1 relative">
              <div className="absolute left-[15px] top-2 bottom-4 w-px bg-white/5"></div>
              
              {loadingPRs ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="text-primary animate-spin" size={24} />
                </div>
              ) : recentPRs.length > 0 ? (
                recentPRs.map((pr) => (
                  <div 
                    key={pr.id}
                    className="relative pl-10 cursor-pointer group"
                    onClick={() => {
                      if (onSelectMerge) {
                        onSelectMerge(`PR-${pr.number}`);
                      }
                    }}
                  >
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-surface-high border-2 border-primary flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                      <Merge className="text-primary" size={14} />
                    </div>
                    <p className="text-xs text-on-surface leading-relaxed">
                      <span className="font-bold text-white">{pr.user.login}</span> opened PR <span className="text-primary font-mono group-hover:underline">#{pr.number}</span> 
                      into <span className="bg-surface-container-highest px-1.5 py-0.5 rounded text-[10px] font-mono">{pr.base.ref}</span>
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-1 uppercase font-bold tracking-tight">
                      {new Date(pr.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="relative pl-10">
                  <p className="text-xs text-on-surface-variant italic">No recent pull requests found.</p>
                </div>
              )}

              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-surface-high border-2 border-tertiary flex items-center justify-center z-10">
                  <Rocket className="text-tertiary" size={14} />
                </div>
                <p className="text-xs text-on-surface leading-relaxed">
                  <span className="font-bold text-white">System</span> automatically deployed 
                  <span className="font-bold text-tertiary">v2.4.0</span> to <span className="text-white underline decoration-tertiary/30">Staging-04</span>
                </p>
                <p className="text-[10px] text-on-surface-variant mt-1 uppercase font-bold tracking-tight">45 minutes ago</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <h4 className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] mb-4">Integrations</h4>
              <div className="flex gap-3">
                {['database', 'cloud', 'code'].map((icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-white transition-colors cursor-pointer group">
                    <Activity size={20} className="group-hover:scale-110 transition-transform" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest border border-dashed border-white/10 flex items-center justify-center text-slate-600 hover:text-primary cursor-pointer">
                  <Plus size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="glass-panel p-4 rounded-xl border border-white/10 shadow-2xl flex items-center gap-4 max-w-sm">
          <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#4ae176] animate-pulse"></div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white">Cluster Sync Complete</p>
            <p className="text-[10px] text-on-surface-variant">All nodes are synchronized with the latest deployment configuration.</p>
          </div>
          <button className="text-on-surface-variant hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
