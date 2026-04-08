import React, { useState } from 'react';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  CheckCircle2, 
  Terminal, 
  ShieldCheck, 
  Construction, 
  TestTube, 
  Cloud, 
  Rocket,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { motion, Reorder } from 'motion/react';

interface PipelineStep {
  id: string;
  name: string;
  type: 'CI' | 'CD';
  icon: any;
  requiresApproval: boolean;
}

interface PipelineEditorProps {
  initialSteps: PipelineStep[];
  onSave: (steps: PipelineStep[]) => void;
}

const AVAILABLE_ICONS = [
  { id: 'Construction', icon: Construction },
  { id: 'TestTube', icon: TestTube },
  { id: 'Terminal', icon: Terminal },
  { id: 'ShieldCheck', icon: ShieldCheck },
  { id: 'Cloud', icon: Cloud },
  { id: 'Rocket', icon: Rocket },
];

export default function PipelineEditor({ initialSteps, onSave }: PipelineEditorProps) {
  const [steps, setSteps] = useState<PipelineStep[]>(initialSteps);
  const [isAdding, setIsAdding] = useState(false);
  const [newStep, setNewStep] = useState<Partial<PipelineStep>>({
    type: 'CI',
    requiresApproval: false,
    icon: Construction
  });

  const handleAddStep = () => {
    if (!newStep.name) return;
    const step: PipelineStep = {
      id: `step-${Date.now()}`,
      name: newStep.name,
      type: newStep.type as 'CI' | 'CD',
      icon: newStep.icon,
      requiresApproval: !!newStep.requiresApproval
    };
    setSteps([...steps, step]);
    setIsAdding(false);
    setNewStep({ type: 'CI', requiresApproval: false, icon: Construction });
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Pipeline Definition</h3>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">Configure your CI/CD workflow</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-black rounded-xl border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-2"
        >
          <Plus size={14} />
          ADD STEP
        </button>
      </div>

      <Reorder.Group axis="y" values={steps} onReorder={setSteps} className="space-y-3">
        {steps.map((step) => (
          <Reorder.Item 
            key={step.id} 
            value={step}
            className="bg-surface-low border border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="text-on-surface-variant/30 group-hover:text-primary transition-colors" size={18} />
            
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              step.type === 'CI' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-tertiary/10 border-tertiary/20 text-tertiary'
            }`}>
              <step.icon size={20} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-bold text-white">{step.name}</h4>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                  step.type === 'CI' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'
                }`}>
                  {step.type}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                {step.requiresApproval && (
                  <div className="flex items-center gap-1 text-[9px] text-amber-500 font-bold uppercase">
                    <UserCheck size={10} /> Requires Approval
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => removeStep(step.id)}
              className="p-2 text-on-surface-variant hover:text-error transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-surface-bright border border-primary/30 rounded-2xl space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Step Name</label>
              <input 
                type="text" 
                value={newStep.name || ''}
                onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                placeholder="e.g., Security Scan"
                className="w-full bg-surface-container-lowest border border-white/5 rounded-xl py-2.5 px-4 text-xs focus:ring-2 focus:ring-primary/30 outline-none transition-all text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Type</label>
              <select 
                value={newStep.type}
                onChange={(e) => setNewStep({ ...newStep, type: e.target.value as 'CI' | 'CD' })}
                className="w-full bg-surface-container-lowest border border-white/5 rounded-xl py-2.5 px-4 text-xs focus:ring-2 focus:ring-primary/30 outline-none transition-all text-white appearance-none"
              >
                <option value="CI">Continuous Integration</option>
                <option value="CD">Continuous Deployment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Icon</label>
              <div className="flex gap-2 p-2 bg-surface-container-lowest rounded-xl border border-white/5">
                {AVAILABLE_ICONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNewStep({ ...newStep, icon: item.icon })}
                    className={`p-2 rounded-lg transition-all ${
                      newStep.icon === item.icon ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={16} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input 
                type="checkbox" 
                id="approval"
                checked={newStep.requiresApproval}
                onChange={(e) => setNewStep({ ...newStep, requiresApproval: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-surface-container-lowest text-primary focus:ring-primary/30"
              />
              <label htmlFor="approval" className="text-xs font-bold text-white cursor-pointer">Requires Manual Approval</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-white transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddStep}
              className="px-6 py-2 bg-primary text-on-primary rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Add Step
            </button>
          </div>
        </motion.div>
      )}

      <div className="pt-6 border-t border-white/5">
        <button 
          onClick={() => onSave(steps)}
          className="w-full py-3 bg-white text-surface font-black rounded-xl text-xs shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-widest"
        >
          Save Workflow Configuration
        </button>
      </div>
    </div>
  );
}
