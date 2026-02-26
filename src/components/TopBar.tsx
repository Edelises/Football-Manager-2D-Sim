import React from 'react';
import { Home, Bell, DollarSign, Calendar, Settings, Search } from 'lucide-react';

export function TopBar() {
  return (
    <header className="h-14 bg-[#1e1e1e] border-b border-[#333] flex items-center px-4 justify-between shrink-0 shadow-md z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-[#ff7a00] font-bold text-xl tracking-wider">
          <div className="w-8 h-8 rounded-sm bg-[#ff7a00] flex items-center justify-center text-[#121212]">
            <Home size={20} />
          </div>
          <span>FM2026</span>
        </div>
        
        <div className="h-6 w-px bg-[#333] mx-2"></div>
        
        <div className="flex items-center gap-4 text-sm text-[#aaa]">
          <div className="flex items-center gap-2 hover:text-[#e0e0e0] cursor-pointer transition-colors">
            <DollarSign size={16} className="text-[#ff7a00]" />
            <span>£145M / £2.4M p/w</span>
          </div>
          <div className="flex items-center gap-2 hover:text-[#e0e0e0] cursor-pointer transition-colors">
            <Calendar size={16} className="text-[#ff7a00]" />
            <span>14 AUG 2026</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-[#121212] border border-[#333] rounded-sm py-1.5 pl-9 pr-4 text-sm text-[#e0e0e0] focus:outline-none focus:border-[#ff7a00] transition-colors w-64"
          />
        </div>
        
        <button className="relative p-2 text-[#aaa] hover:text-[#ff7a00] transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff7a00] rounded-full"></span>
        </button>
        
        <button className="p-2 text-[#aaa] hover:text-[#ff7a00] transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
