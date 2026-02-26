/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import MatchView from './components/MatchView2D';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { SquadView } from './components/SquadView';
import { TacticsView } from './components/TacticsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-[#121212] text-[#e0e0e0] font-sans overflow-hidden">
        {/* Top Navigation */}
        <TopBar />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-[#1a1a1a] p-6 relative">
            {activeTab === 'home' && <Dashboard />}
            {activeTab === 'squad' && <SquadView />}
            {activeTab === 'tactics' && <TacticsView />}
            {activeTab === 'matches' && (
              <div className="h-full flex flex-col items-center justify-center">
                <MatchView />
              </div>
            )}
            {/* Fallback for other tabs */}
            {['transfers', 'training', 'competitions', 'staff', 'finances', 'reports'].includes(activeTab) && (
              <div className="flex items-center justify-center h-full text-[#ff7a00] opacity-50 text-2xl font-mono uppercase tracking-widest">
                {activeTab} Module Offline
              </div>
            )}
          </main>
        </div>

        {/* Footer / Quick Info Bar */}
        <footer className="h-8 bg-[#0a0a0a] border-t border-[#333] flex items-center px-4 text-xs font-mono text-[#888]">
          <div className="flex-1">STATUS: ONLINE</div>
          <div className="flex-1 text-center text-[#ff7a00]">NEXT FIXTURE: MANCHESTER UTD (A)</div>
          <div className="flex-1 text-right">VERSION: 2.0.26</div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}


