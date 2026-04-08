import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitBranch, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ChevronDown,
  Book
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createBranch, fetchBranches, GitHubBranch } from '../services/githubService';

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (branchName: string) => void;
  owner: string;
  repositories: { id: string; name: string }[];
  initialRepo?: string;
  suggestedBranchName?: string;
}

export default function CreateBranchModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  owner, 
  repositories, 
  initialRepo,
  suggestedBranchName 
}: CreateBranchModalProps) {
  const [loading, setLoading] = useState(false);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  
  const [selectedRepo, setSelectedRepo] = useState(initialRepo || (repositories.length > 0 ? repositories[0].name : ''));
  const [branchName, setBranchName] = useState(suggestedBranchName || '');
  const [baseBranch, setBaseBranch] = useState('main');

  useEffect(() => {
    if (isOpen && selectedRepo) {
      loadBranches(selectedRepo);
    }
  }, [isOpen, selectedRepo]);

  useEffect(() => {
    if (suggestedBranchName) {
      setBranchName(suggestedBranchName);
    }
  }, [suggestedBranchName]);

  const loadBranches = async (repoName: string) => {
    setBranchesLoading(true);
    setError(null);
    try {
      const data = await fetchBranches(owner, repoName);
      setBranches(data);
      if (data.length > 0) {
        const mainBranch = data.find(b => b.name === 'main' || b.name === 'master');
        if (mainBranch) setBaseBranch(mainBranch.name);
        else setBaseBranch(data[0].name);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError(`Failed to load branches for ${repoName}.`);
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName || !baseBranch || !selectedRepo) return;

    setLoading(true);
    setError(null);
    try {
      await createBranch(owner, selectedRepo, branchName, baseBranch);
      onSuccess(branchName);
      onClose();
    } catch (err: any) {
      console.error('Error creating branch:', err);
      setError(err.message || 'Failed to create branch.');
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
        className="relative w-full max-w-lg bg-surface-high border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-surface-bright/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <GitBranch className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Create New Branch</h2>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Git Orchestration</p>
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

          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Target Repository</label>
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

          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Branch Name</label>
            <input 
              required
              type="text" 
              value={branchName}
              onChange={(e) => setBranchName(e.target.value.replace(/\s+/g, '-').toLowerCase())}
              placeholder="e.g., feature/auth-fix"
              className="w-full bg-surface-container-lowest border border-white/5 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all text-white placeholder-on-surface-variant/30 font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Base Branch</label>
            <div className="relative">
              <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              <select 
                required
                value={baseBranch}
                onChange={(e) => setBaseBranch(e.target.value)}
                disabled={branchesLoading}
                className="w-full bg-surface-container-lowest border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all text-white appearance-none disabled:opacity-50"
              >
                {branchesLoading ? (
                  <option>Loading branches...</option>
                ) : (
                  branches.map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={16} />
            </div>
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
            disabled={loading || branchesLoading || !branchName}
            className="px-8 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Create Branch</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
