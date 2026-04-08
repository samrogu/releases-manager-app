import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  ShieldCheck, 
  Construction, 
  TestTube, 
  Terminal, 
  Cloud, 
  Rocket,
  ChevronRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'CI' | 'CD';
  status: 'pending' | 'running' | 'success' | 'failed' | 'waiting_approval';
  icon: any;
  approver?: string;
}

interface WorkflowViewProps {
  repoName: string;
  steps: WorkflowStep[];
  onApprove: (stepId: string) => void;
}

export default function WorkflowView({ repoName, steps, onApprove }: WorkflowViewProps) {
  const ciSteps = steps.filter(s => s.type === 'CI');
  const cdSteps = steps.filter(s => s.type === 'CD');

  const renderStep = (step: WorkflowStep, index: number, total: number) => {
    const isLast = index === total - 1;
    const Icon = step.icon;

    return (
      <div key={step.id} className="flex items-center">
        <div className="flex flex-col items-center group relative">
          {/* Node */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
              step.status === 'success' ? 'bg-tertiary/10 border-tertiary text-tertiary shadow-[0_0_15px_rgba(74,225,118,0.2)]' :
              step.status === 'running' ? 'bg-primary/10 border-primary text-primary animate-pulse shadow-[0_0_15px_rgba(123,208,255,0.2)]' :
              step.status === 'waiting_approval' ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
              step.status === 'failed' ? 'bg-error/10 border-error text-error shadow-[0_0_15px_rgba(255,82,82,0.2)]' :
              'bg-surface-highest border-white/5 text-on-surface-variant'
            }`}
          >
            {step.status === 'running' ? <Loader2 className="animate-spin" size={20} /> : <Icon size={20} />}
          </motion.div>

          {/* Label */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
            <p className={`text-[10px] font-black uppercase tracking-widest ${
              step.status === 'success' ? 'text-tertiary' :
              step.status === 'running' ? 'text-primary' :
              step.status === 'waiting_approval' ? 'text-amber-500' :
              'text-on-surface-variant'
            }`}>
              {step.name}
            </p>
            {step.status === 'waiting_approval' && (
              <button 
                onClick={() => onApprove(step.id)}
                className="mt-1 px-2 py-0.5 bg-amber-500 text-on-primary text-[8px] font-black rounded-full hover:scale-105 transition-transform"
              >
                APPROVE
              </button>
            )}
          </div>
        </div>

        {/* Connector */}
        {!isLast && (
          <div className="w-12 h-[2px] bg-white/5 mx-2 relative overflow-hidden">
            {step.status === 'success' && (
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-tertiary/50 to-transparent"
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-surface-high rounded-3xl p-8 border border-white/5 space-y-12 overflow-x-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_#4ae176]"></div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Workflow: {repoName}</h3>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-tertiary/20 border border-tertiary/40"></div>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase">Success</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary/20 border border-primary/40"></div>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase">Running</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40"></div>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase">Waiting</span>
          </div>
        </div>
      </div>

      {/* CI Flow */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest bg-surface-highest px-3 py-1 rounded-full">Continuous Integration</span>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>
        <div className="flex items-center px-4 py-8">
          {ciSteps.map((step, i) => renderStep(step, i, ciSteps.length))}
        </div>
      </div>

      {/* CD Flow */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest bg-surface-highest px-3 py-1 rounded-full">Continuous Deployment</span>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>
        <div className="flex items-center px-4 py-8">
          {cdSteps.map((step, i) => renderStep(step, i, cdSteps.length))}
        </div>
      </div>
    </div>
  );
}
