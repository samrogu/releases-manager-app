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
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('releases');
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null);
  const [selectedMergeId, setSelectedMergeId] = useState<string | null>(null);

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
      onSelectMerge: setSelectedMergeId
    };
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard {...props} />;
      case 'releases':
        return <Releases {...props} />;
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
