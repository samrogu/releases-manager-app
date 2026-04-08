import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Plus, 
  Search, 
  Settings2, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  GitBranch,
  Activity,
  History as HistoryIcon,
  User,
  Clock,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import WorkflowYamlEditor from './WorkflowYamlEditor';
import PipelineEditor from './PipelineEditor';
import { WorkflowTemplate, WorkflowVersion } from '../types';

interface WorkflowManagerProps {
  workflows: Record<string, WorkflowTemplate>;
  onUpdateWorkflows: (workflows: Record<string, WorkflowTemplate>) => void;
}

export default function WorkflowManager({ workflows, onUpdateWorkflows }: WorkflowManagerProps) {
  const [selectedWorkflowName, setSelectedWorkflowName] = useState<string | null>(Object.keys(workflows)[0] || null);
  const [activeVersionNum, setActiveVersionNum] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'editor' | 'history'>('editor');

  const selectedWorkflow = selectedWorkflowName ? workflows[selectedWorkflowName] : null;

  useEffect(() => {
    if (selectedWorkflow) {
      setActiveVersionNum(selectedWorkflow.currentVersion);
    }
  }, [selectedWorkflowName]);

  const activeVersion = selectedWorkflow?.versions.find(v => v.version === activeVersionNum);

  const handleSaveWorkflow = (name: string, steps: any[], changeDescription: string = 'Updated workflow') => {
    const existingWf = workflows[name];
    const nextVersion = existingWf ? existingWf.currentVersion + 1 : 1;
    
    const newVersion: WorkflowVersion = {
      id: `v${nextVersion}-${Date.now()}`,
      version: nextVersion,
      timestamp: new Date().toISOString(),
      author: 'Alex Rivera', // Mock author
      description: changeDescription,
      steps: steps
    };

    const updatedWf: WorkflowTemplate = existingWf ? {
      ...existingWf,
      currentVersion: nextVersion,
      versions: [newVersion, ...existingWf.versions]
    } : {
      id: `wf-${Date.now()}`,
      name: name,
      description: 'Custom workflow template',
      currentVersion: 1,
      versions: [newVersion]
    };

    onUpdateWorkflows({
      ...workflows,
      [name]: updatedWf
    });
    
    setSelectedWorkflowName(name);
    setActiveVersionNum(nextVersion);
    setIsCreating(false);
    setViewMode('editor');
  };

  const handleDeleteWorkflow = (name: string) => {
    const newWorkflows = { ...workflows };
    delete newWorkflows[name];
    onUpdateWorkflows(newWorkflows);
    if (selectedWorkflowName === name) {
      setSelectedWorkflowName(Object.keys(newWorkflows)[0] || null);
    }
  };

  const filteredWorkflows = Object.keys(workflows).filter(name => 
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-white tracking-tight">Workflow Factory</h1>
          <p className="text-on-surface-variant mt-1">Design and manage global CI/CD templates for all releases.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar: Template List */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-high rounded-2xl border border-white/5 p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              <input 
                type="text" 
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-low border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:ring-2 focus:ring-primary/30 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              {filteredWorkflows.map((name) => {
                const wf = workflows[name];
                return (
                  <button
                    key={name}
                    onClick={() => {
                      setSelectedWorkflowName(name);
                      setIsCreating(false);
                      setViewMode('editor');
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group ${
                      selectedWorkflowName === name && !isCreating
                        ? 'bg-primary/10 border-primary/30 text-primary' 
                        : 'bg-surface-low border-white/5 text-on-surface-variant hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedWorkflowName === name && !isCreating ? 'bg-primary text-on-primary' : 'bg-surface-highest text-on-surface-variant'
                      }`}>
                        <Terminal size={16} />
                      </div>
                      <div className="text-left">
                        <p className={`text-xs font-bold ${selectedWorkflowName === name && !isCreating ? 'text-white' : ''}`}>{name}</p>
                        <p className="text-[10px] opacity-60">v{wf.currentVersion} • {wf.versions[0].steps.length} steps</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className={`transition-transform ${selectedWorkflowName === name && !isCreating ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-high rounded-2xl border border-white/5 p-6 space-y-4">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">System Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-surface-low rounded-xl border border-white/5">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">Total Templates</p>
                <p className="text-xl font-black text-white">{Object.keys(workflows).length}</p>
              </div>
              <div className="p-3 bg-surface-low rounded-xl border border-white/5">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">Active Usage</p>
                <p className="text-xl font-black text-tertiary">12 Releases</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Editor */}
        <div className="col-span-12 lg:col-span-8">
          <AnimatePresence mode="wait">
            {isCreating || selectedWorkflow ? (
              <motion.div
                key={isCreating ? 'creating' : selectedWorkflowName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="bg-surface-high rounded-3xl border border-white/5 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Settings2 size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-headline font-bold text-white">
                            {isCreating ? 'New Workflow Template' : selectedWorkflowName}
                          </h2>
                          {!isCreating && (
                            <span className="bg-surface-highest text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-mono">
                              v{activeVersionNum} {activeVersionNum === selectedWorkflow?.currentVersion && '(Latest)'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant">{selectedWorkflow?.description || 'Configure steps, approvals, and automation rules.'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isCreating && (
                        <div className="flex bg-surface-low p-1 rounded-xl border border-white/5">
                          <button 
                            onClick={() => setViewMode('editor')}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'editor' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-white'}`}
                          >
                            Editor
                          </button>
                          <button 
                            onClick={() => setViewMode('history')}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'history' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-white'}`}
                          >
                            History
                          </button>
                        </div>
                      )}
                      {!isCreating && (
                        <button 
                          onClick={() => handleDeleteWorkflow(selectedWorkflowName!)}
                          className="p-3 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all"
                          title="Delete Template"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {viewMode === 'editor' ? (
                      <motion.div 
                        key="editor"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 xl:grid-cols-2 gap-8"
                      >
                        <WorkflowYamlEditor 
                          initialYaml={isCreating ? undefined : `name: "${selectedWorkflowName}"\nsteps:\n${activeVersion?.steps.map(s => `  - name: "${s.name}"\n    type: "${s.type}"\n    icon: "${s.icon.name || 'Construction'}"\n    approval: ${s.requiresApproval}`).join('\n')}`}
                          onSave={(wf) => handleSaveWorkflow(wf.name, wf.steps, 'Updated via YAML editor')}
                        />
                        <div className="space-y-6">
                          <div className="bg-surface-low rounded-2xl border border-white/5 p-6">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Activity size={14} className="text-primary" /> Visual Preview
                            </h3>
                            <PipelineEditor 
                              initialSteps={isCreating ? [] : activeVersion?.steps || []}
                              onSave={(steps) => handleSaveWorkflow(selectedWorkflowName || 'New Workflow', steps, 'Updated via visual editor')}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="history"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Version List */}
                          <div className="lg:col-span-1 space-y-3">
                            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Version History</h3>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                              {selectedWorkflow?.versions.map((v) => (
                                <button
                                  key={v.id}
                                  onClick={() => setActiveVersionNum(v.version)}
                                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                                    activeVersionNum === v.version 
                                      ? 'bg-primary/10 border-primary/30' 
                                      : 'bg-surface-low border-white/5 hover:border-white/20'
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${activeVersionNum === v.version ? 'text-primary' : 'text-on-surface-variant'}`}>
                                      Version {v.version}
                                    </span>
                                    {v.version === selectedWorkflow.currentVersion && (
                                      <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded text-[8px] font-black uppercase">Default</span>
                                    )}
                                  </div>
                                  <p className="text-xs font-bold text-white mb-3 line-clamp-2">{v.description}</p>
                                  <div className="flex items-center gap-4 text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">
                                    <div className="flex items-center gap-1">
                                      <User size={10} />
                                      {v.author}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock size={10} />
                                      {new Date(v.timestamp).toLocaleDateString()}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Version Detail Preview */}
                          <div className="lg:col-span-2 space-y-6">
                            <div className="bg-surface-low rounded-3xl border border-white/5 p-8 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-8 opacity-5">
                                <HistoryIcon size={120} />
                              </div>
                              
                              <div className="relative z-10 space-y-8">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-2xl font-headline font-black text-white">Version {activeVersion?.version}</h3>
                                    <p className="text-sm text-on-surface-variant mt-1">Snapshot from {activeVersion && new Date(activeVersion.timestamp).toLocaleString()}</p>
                                  </div>
                                  {activeVersionNum !== selectedWorkflow?.currentVersion && (
                                    <button 
                                      onClick={() => handleSaveWorkflow(selectedWorkflowName!, activeVersion?.steps || [], `Restored from version ${activeVersionNum}`)}
                                      className="px-6 py-2.5 bg-tertiary text-on-tertiary text-[10px] font-black rounded-xl shadow-lg shadow-tertiary/20 hover:scale-[1.05] active:scale-95 transition-all"
                                    >
                                      RESTORE AS DEFAULT
                                    </button>
                                  )}
                                </div>

                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Change Log</h4>
                                  <div className="p-4 bg-surface-highest/50 rounded-2xl border border-white/5">
                                    <p className="text-sm text-white leading-relaxed italic">"{activeVersion?.description}"</p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Workflow Structure</h4>
                                  <div className="flex flex-wrap gap-3">
                                    {activeVersion?.steps.map((step, i) => (
                                      <div key={i} className="flex items-center gap-3 bg-surface-highest px-4 py-3 rounded-2xl border border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                          {React.createElement(step.icon, { size: 16 })}
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black text-white uppercase tracking-widest">{step.name}</p>
                                          <p className="text-[9px] text-on-surface-variant font-bold uppercase">{step.type}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <div className="bg-surface-high rounded-3xl border border-white/5 p-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-surface-highest flex items-center justify-center text-on-surface-variant/20">
                  <Terminal size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-headline font-bold text-white">No Template Selected</h2>
                  <p className="text-on-surface-variant max-w-sm">Select an existing template from the sidebar or create a new one to get started.</p>
                </div>
                <button 
                  onClick={() => setIsCreating(true)}
                  className="px-8 py-3 bg-primary text-on-primary rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all"
                >
                  Create Your First Template
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
