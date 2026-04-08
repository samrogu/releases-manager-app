import React from 'react';
import { 
  LayoutDashboard, 
  Rocket, 
  Search, 
  Bell, 
  HelpCircle, 
  Plus,
  Settings
} from 'lucide-react';
import { Screen } from '../types';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  hideHeader?: boolean;
}

export default function Layout({ children, currentScreen, onScreenChange, hideHeader = false }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'releases', label: 'Releases', icon: Rocket },
    { id: 'workflows', label: 'Workflows', icon: Settings },
  ] as const;

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-low border-r border-white/5 flex flex-col py-6 z-40">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-primary">
            <Rocket size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-tight font-headline">Release Hub</h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">V2.4.0-stable</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onScreenChange(item.id as Screen)}
                className={`w-full px-4 py-3 flex items-center gap-3 rounded-lg transition-all duration-150 group ${
                  isActive 
                    ? 'bg-surface-high text-primary border-l-4 border-primary' 
                    : 'text-on-surface-variant hover:text-white hover:bg-surface-high hover:translate-x-1'
                }`}
              >
                <Icon size={20} fill={isActive ? "currentColor" : "none"} />
                <span className="text-[13px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 mt-auto">
          <button className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/10 active:scale-95 transition-transform">
            <Plus size={18} />
            <span className="text-[13px]">New Deployment</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        {!hideHeader && (
          <header className="h-16 sticky top-0 z-50 bg-surface border-b border-white/10 flex items-center justify-between px-8 shadow-[0px_12px_32px_rgba(6,14,32,0.4)]">
            <div className="flex items-center gap-8 flex-1">
              <span className="text-xl font-bold text-primary tracking-wide font-headline">OpsControl</span>
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="text" 
                  placeholder="Search deployments, PRs, or logs..."
                  className="w-full bg-surface-container-lowest border-none rounded-full py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary/50 placeholder-on-surface-variant/50 transition-all text-on-surface"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-on-surface-variant hover:bg-surface-high rounded-lg transition-colors">
                <Bell size={20} />
              </button>
              <button className="p-2 text-on-surface-variant hover:bg-surface-high rounded-lg transition-colors">
                <HelpCircle size={20} />
              </button>
              <button className="p-2 text-on-surface-variant hover:bg-surface-high rounded-lg transition-colors mr-4">
                <Settings size={20} />
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right">
                  <p className="text-xs font-bold text-white">Alex Rivera</p>
                  <p className="text-[10px] text-on-surface-variant">Release Engineer</p>
                </div>
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAB2Zi5-cqLkEbKs4ks0kdyutUJ7UfFWSkZ0SayNGVYCquDSnt6RYFa5g2h9NxXZPrAZCw8AhZ9wa4Wlu1oFPL1jxKcHdap4DxoJ6G-gjFLX-wBAvInz9dTmiqDmBlKm-Ol9s0AISf3U7T3zhEc2BUNnoYqJZdsqBbG4-O5d9cYVWGbO58FkmvqFGDR5LKnA6gtvmy7PWmCuYDiX8S5lq85MH0rKlVyQ5fTi_POmuVAx7hNsH4YmgzmTnyoOxfcMMLg7n57WY27GCVT" 
                  alt="User Profile" 
                  className="w-8 h-8 rounded-full border border-primary/30"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </header>
        )}

        {/* Content */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${hideHeader ? 'h-screen' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
