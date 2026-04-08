/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Screen } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Releases from './components/Releases';
import MergeDetail from './components/MergeDetail';
import WorkflowManager from './components/WorkflowManager';
import { 
  Construction, 
  TestTube, 
  Terminal, 
  ShieldCheck, 
  Cloud, 
  Rocket 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkflowTemplate } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('releases');
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null);
  const [selectedMergeId, setSelectedMergeId] = useState<string | null>(null);
  
  const [globalWorkflows, setGlobalWorkflows] = useState<Record<string, WorkflowTemplate>>({
    'Standard Delivery': {
      id: 'wf-1',
      name: 'Standard Delivery',
      description: 'Standard CI/CD pipeline for microservices',
      currentVersion: 2,
      versions: [
        {
          id: 'v1',
          version: 1,
          timestamp: '2026-03-01T10:00:00Z',
          author: 'Alex Rivera',
          description: 'Initial workflow definition',
          steps: [
            { id: 'ci-build', name: 'Build', type: 'CI', status: 'success', icon: Construction },
            { id: 'ci-test', name: 'Unit Tests', type: 'CI', status: 'success', icon: TestTube },
            { id: 'cd-prod', name: 'Deploy Prod', type: 'CD', status: 'pending', icon: ShieldCheck },
          ]
        },
        {
          id: 'v2',
          version: 2,
          timestamp: '2026-04-01T14:30:00Z',
          author: 'Sarah Chen',
          description: 'Added security scan and staging environment',
          steps: [
            { id: 'ci-build', name: 'Build', type: 'CI', status: 'success', icon: Construction },
            { id: 'ci-test', name: 'Unit Tests', type: 'CI', status: 'success', icon: TestTube },
            { id: 'ci-lint', name: 'Linting', type: 'CI', status: 'success', icon: Terminal },
            { id: 'ci-security', name: 'Security Scan', type: 'CI', status: 'running', icon: ShieldCheck },
            { id: 'cd-dev', name: 'Deploy Dev', type: 'CD', status: 'waiting_approval', icon: Cloud },
            { id: 'cd-staging', name: 'Deploy Staging', type: 'CD', status: 'pending', icon: Rocket },
            { id: 'cd-prod', name: 'Deploy Prod', type: 'CD', status: 'pending', icon: ShieldCheck },
          ]
        }
      ]
    },
    'Fast Track': {
      id: 'wf-2',
      name: 'Fast Track',
      description: 'Accelerated pipeline for hotfixes',
      currentVersion: 1,
      versions: [
        {
          id: 'v1',
          version: 1,
          timestamp: '2026-03-15T09:00:00Z',
          author: 'James Wilson',
          description: 'Direct to production pipeline',
          steps: [
            { id: 'ci-build', name: 'Build', type: 'CI', status: 'success', icon: Construction },
            { id: 'cd-prod', name: 'Direct Deploy', type: 'CD', status: 'waiting_approval', icon: Rocket },
          ]
        }
      ]
    }
  });

  const renderScreen = () => {
    if (selectedMergeId) {
      return (
        <MergeDetail 
          isOpen={!!selectedMergeId} 
          onClose={() => setSelectedMergeId(null)} 
          selectedMergeId={selectedMergeId} 
        />
      );
    }

    const props = { 
      onNavigate: setCurrentScreen,
      selectedReleaseId,
      onSelectRelease: setSelectedReleaseId,
      onSelectMerge: setSelectedMergeId,
      globalWorkflows,
      onUpdateGlobalWorkflows: setGlobalWorkflows
    };
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard {...props} />;
      case 'releases':
        return <Releases {...props} />;
      case 'workflows':
        return <WorkflowManager workflows={globalWorkflows} onUpdateWorkflows={setGlobalWorkflows} />;
      default:
        return <Releases {...props} />;
    }
  };

  return (
    <Layout 
      currentScreen={currentScreen} 
      onScreenChange={setCurrentScreen}
      hideHeader={!!selectedMergeId}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMergeId ? 'merge-detail' : currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="min-h-full"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
