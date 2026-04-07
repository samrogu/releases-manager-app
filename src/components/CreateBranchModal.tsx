import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitBranch, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ChevronDown,
  Book,
  Clipboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchBranches, GitHubBranch } from '../services/githubService';

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (repoName: string, branchName: string, baseBranch: string) => void;
  owner: string;
  repositories: { id: string; name: string; branch: string }[];
  taskId: string;
  taskTitle: string;
}

export default function CreateBranchModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  owner, 
  repositories,
  taskId,
  taskTitle 
}: CreateBranchModalProps) {
  const [loading, setLoading] = useState(false);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  
  const [selectedRepo, setSelectedRepo] = useState(repositories.length > 0 ? repositories[0].name : '');
  const [baseBranch, setBaseBranch] = useState('main');
  const [newBranchName, setNewBranchName] = useState('');

  useEffect(() => {
    if (isOpen) {
      const slug = taskTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setNewBranchName(`feature/${taskId}-${slug}`);
      
      if (selectedRepo) {
        loadBranches(selectedRepo);
      }
    }
  }, [isOpen, selectedRepo, taskId, taskTitle]);

  const loadBranches = async (repoName: string) => {
    setBranchesLoading(true);
    setError(null);
    try {
      // Find the default branch for this repo from our local data first
      const repoData = repositories.find(r => r.name === repoName);
      if (repoData) {
        setBaseBranch(repoData.branch);
      }

      const data = await fetchBranches(owner, repoName);
      setBranches(data);
      
      // If we fetched branches, and our current baseBranch isn't in the list, 
      // try to find a sensible default
      if (data.length > 0 && !data.find(b => b.name === baseBranch)) {
        const mainBranch = data.find(b => b.name === 'main' || b.name === 'master');
        if (mainBranch) setBaseBranch(mainBranch.name);
        else setBaseBranch(data[0].name);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
      // We don't block if branches fail to load, just use the local default
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || !selectedRepo || !baseBranch) return;

    setLoading(true);
    try {
      // Copy to clipboard
      navigator.clipboard.writeText(newBranchName);
      
      onSuccess(selectedRepo, newBranchName, baseBranch);
      onClose();
    } catch (err: any) {
      setError('Failed to process branch creation.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-surface/80 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl bg-surface-high border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-surface-bright/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <GitBranch className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Create Branch</h2>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{taskId} • {taskTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 text-on-surface-variant hover:text-white rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-2xl flex items-start gap-3 text-error">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Select Repository</label>
              <div className="relative">
                <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                <select 
                  required
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all text-white appearance-none"
                >
                  {repositories.map(repo => (
                    <option key={repo.id} value={repo.name}>{repo.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={16} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Base Branch</label>
                <div className="relative">
                  <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                  <select 
                    required
                    value={baseBranch}
                    onChange={(e) => setBaseBranch(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all text-white appearance-none"
                  >
                    {branchesLoading ? (
                      <option>Loading branches...</option>
                    ) : branches.length > 0 ? (
                      branches.map(b => (
                        <option key={b.name} value={b.name}>{b.name}</option>
                      ))
                    ) : (
                      <option value={baseBranch}>{baseBranch}</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">New Branch Name</label>
                <div className="relative">
                  <input 
                    required
                    type="text" 
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <span className="text-primary font-bold">Tip:</span> The branch name will be copied to your clipboard. You'll be redirected to GitHub to create the branch from the <span className="text-white font-mono">{baseBranch}</span> base.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-white/5 bg-surface-bright/30 flex items-center justify-end gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:text-white transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || !newBranchName}
            className="px-8 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            <span>Create & Open GitHub</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
