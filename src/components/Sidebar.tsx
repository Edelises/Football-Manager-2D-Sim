import React from 'react';
import { 
  LayoutDashboard, Users, Shield, ArrowRightLeft, 
  Dumbbell, CalendarDays, Trophy, Briefcase, 
  Landmark, BarChart3 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'squad', label: 'Squad', icon: Users },
  { id: 'tactics', label: 'Tactics', icon: Shield },
  { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
  { id: 'training', label: 'Training', icon: Dumbbell },
  { id: 'matches', label: 'Matches', icon: CalendarDays },
  { id: 'competitions', label: 'Competitions', icon: Trophy },
  { id: 'staff', label: 'Staff', icon: Briefcase },
  { id: 'finances', label: 'Finances', icon: Landmark },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#121212] border-r border-[#333] flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 flex flex-col gap-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-[#1e1e1e] text-[#ff7a00] font-medium' 
                  : 'text-[#888] hover:bg-[#1a1a1a] hover:text-[#e0e0e0]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff7a00] shadow-[0_0_8px_#ff7a00]"></div>
              )}
              <Icon size={18} className={isActive ? 'text-[#ff7a00]' : 'group-hover:text-[#ff7a00] transition-colors'} />
              <span className="tracking-wide text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
