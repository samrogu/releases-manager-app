import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  Play, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Copy,
  Terminal,
  ShieldCheck,
  Construction,
  TestTube,
  Cloud,
  Rocket
} from 'lucide-react';
import { motion } from 'motion/react';
import yaml from 'js-yaml';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'CI' | 'CD';
  icon: any;
  requiresApproval: boolean;
  status: 'pending' | 'running' | 'success' | 'failed' | 'waiting_approval';
}

interface WorkflowYamlEditorProps {
  initialYaml?: string;
  onSave: (workflow: { name: string; steps: WorkflowStep[] }) => void;
}

const ICON_MAP: Record<string, any> = {
  Construction,
  TestTube,
  Terminal,
  ShieldCheck,
  Cloud,
  Rocket
};

const DEFAULT_YAML = `name: "Standard Delivery Pipeline"
steps:
  - name: "Code Build"
    type: "CI"
    icon: "Construction"
  - name: "Unit Testing"
    type: "CI"
    icon: "TestTube"
  - name: "Security Audit"
    type: "CI"
    icon: "ShieldCheck"
    approval: true
  - name: "Staging Deploy"
    type: "CD"
    icon: "Cloud"
    approval: true
  - name: "Production Release"
    type: "CD"
    icon: "Rocket"
    approval: true`;

export default function WorkflowYamlEditor({ initialYaml = DEFAULT_YAML, onSave }: WorkflowYamlEditorProps) {
  const [code, setCode] = useState(initialYaml);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  const validateAndParse = (value: string) => {
    try {
      const parsed: any = yaml.load(value);
      if (!parsed || typeof parsed !== 'object') throw new Error('Invalid YAML structure');
      if (!parsed.name) throw new Error('Workflow name is required');
      if (!Array.isArray(parsed.steps)) throw new Error('Steps must be an array');

      parsed.steps.forEach((step: any, i: number) => {
        if (!step.name) throw new Error(`Step ${i + 1} is missing a name`);
        if (!['CI', 'CD'].includes(step.type)) throw new Error(`Step "${step.name}" has invalid type (must be CI or CD)`);
      });

      setError(null);
      setIsValid(true);
      return parsed;
    } catch (err: any) {
      setError(err.message);
      setIsValid(false);
      return null;
    }
  };

  const handleSave = () => {
    const parsed = validateAndParse(code);
    if (parsed) {
      const steps: WorkflowStep[] = parsed.steps.map((s: any, i: number) => ({
        id: `step-${Date.now()}-${i}`,
        name: s.name,
        type: s.type,
        icon: ICON_MAP[s.icon] || Construction,
        requiresApproval: !!s.approval,
        status: 'pending'
      }));
      onSave({ name: parsed.name, steps });
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-high rounded-3xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-surface-bright border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <FileCode className="text-primary" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Workflow Definition (YAML)</h3>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Define steps and approvals</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCode(DEFAULT_YAML)}
            className="p-2 text-on-surface-variant hover:text-white transition-colors"
            title="Reset to Default"
          >
            <Copy size={16} />
          </button>
          <button 
            onClick={handleSave}
            disabled={!isValid}
            className="px-4 py-2 bg-primary text-on-primary text-[10px] font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
          >
            <Save size={14} />
            APPLY CONFIG
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-h-[400px]">
        <div className="relative flex-1">
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              validateAndParse(e.target.value);
            }}
            spellCheck={false}
            className="w-full h-full bg-surface-container-lowest p-6 font-mono text-xs text-on-surface leading-relaxed outline-none resize-none custom-scrollbar"
            placeholder="# Define your workflow here..."
          />
          
          {/* Error Overlay */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 p-4 bg-error/10 border border-error/20 rounded-2xl flex items-start gap-3 text-error backdrop-blur-md"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
            </motion.div>
          )}

          {/* Success Indicator */}
          {!error && isValid && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-tertiary/10 border border-tertiary/20 rounded-full text-tertiary">
              <CheckCircle2 size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Valid Configuration</span>
            </div>
          )}
        </div>

        {/* Legend / Help */}
        <div className="p-4 bg-surface-bright/30 border-t border-white/5">
          <h4 className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Available Icons</h4>
          <div className="flex flex-wrap gap-4">
            {Object.keys(ICON_MAP).map(key => {
              const Icon = ICON_MAP[key];
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-surface-highest flex items-center justify-center text-on-surface-variant">
                    <Icon size={12} />
                  </div>
                  <span className="text-[9px] font-mono text-on-surface-variant">{key}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
