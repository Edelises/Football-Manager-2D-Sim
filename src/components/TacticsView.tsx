import React, { useState } from 'react';
import { Shield, Crosshair, Move, Settings2, Users } from 'lucide-react';

export function TacticsView() {
  const [formation, setFormation] = useState('4-3-3');
  const [mentality, setMentality] = useState('Balanced');

  return (
    <div className="flex gap-6 h-full">
      {/* Left: Pitch Editor */}
      <div className="flex-1 bg-[#1e1e1e] border border-[#333] rounded-sm flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#2a2a2a] shrink-0 z-10">
          <h2 className="text-[#ff7a00] font-bold tracking-wider flex items-center gap-2">
            <Move size={18} /> FORMATION
          </h2>
          <select 
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            className="bg-[#121212] border border-[#444] text-[#e0e0e0] px-3 py-1.5 rounded-sm text-sm focus:outline-none focus:border-[#ff7a00]"
          >
            <option value="4-4-2">4-4-2 Classic</option>
            <option value="4-3-3">4-3-3 Attack</option>
            <option value="4-2-3-1">4-2-3-1 Wide</option>
            <option value="5-3-2">5-3-2 Wingbacks</option>
          </select>
        </div>

        <div className="flex-1 relative bg-[#2d5a27] overflow-hidden">
          {/* Pitch Lines */}
          <div className="absolute inset-4 border-2 border-white/30 rounded-sm pointer-events-none"></div>
          <div className="absolute inset-y-4 left-1/2 w-px bg-white/30 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full pointer-events-none"></div>
          
          {/* Penalty Areas */}
          <div className="absolute top-1/4 bottom-1/4 left-4 w-32 border-2 border-l-0 border-white/30 pointer-events-none"></div>
          <div className="absolute top-1/4 bottom-1/4 right-4 w-32 border-2 border-r-0 border-white/30 pointer-events-none"></div>

          {/* Players (Mocked for 4-3-3) */}
          {[
            { id: 1, pos: 'GK', x: '10%', y: '50%', name: 'Miller' },
            { id: 2, pos: 'LB', x: '25%', y: '20%', name: 'Davis' },
            { id: 3, pos: 'CB', x: '20%', y: '40%', name: 'Williams' },
            { id: 4, pos: 'CB', x: '20%', y: '60%', name: 'Jones' },
            { id: 5, pos: 'RB', x: '25%', y: '80%', name: 'Garcia' },
            { id: 6, pos: 'CDM', x: '40%', y: '50%', name: 'Brown' },
            { id: 7, pos: 'CM', x: '55%', y: '30%', name: 'Johnson' },
            { id: 8, pos: 'CM', x: '55%', y: '70%', name: 'Taylor' },
            { id: 9, pos: 'LW', x: '75%', y: '20%', name: 'Wilson' },
            { id: 10, pos: 'ST', x: '85%', y: '50%', name: 'Smith' },
            { id: 11, pos: 'RW', x: '75%', y: '80%', name: 'Moore' },
          ].map(p => (
            <div 
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing group"
              style={{ left: p.x, top: p.y }}
            >
              <div className="w-8 h-8 rounded-full bg-[#121212] border-2 border-[#ff7a00] flex items-center justify-center text-xs font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
                {p.pos}
              </div>
              <div className="bg-black/80 px-2 py-0.5 rounded-sm text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {p.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Instructions */}
      <div className="w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2">
        <div className="bg-[#1e1e1e] border border-[#333] rounded-sm p-4">
          <h2 className="text-[#ff7a00] font-bold tracking-wider flex items-center gap-2 mb-4 border-b border-[#333] pb-2">
            <Settings2 size={18} /> TEAM INSTRUCTIONS
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs text-[#888] uppercase tracking-wider mb-2 block">Mentality</label>
              <div className="flex bg-[#121212] rounded-sm border border-[#333] overflow-hidden">
                {['Defensive', 'Balanced', 'Attacking'].map(m => (
                  <button 
                    key={m}
                    onClick={() => setMentality(m)}
                    className={`flex-1 py-2 text-xs font-bold transition-colors ${mentality === m ? 'bg-[#ff7a00] text-[#121212]' : 'text-[#888] hover:bg-[#2a2a2a]'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#888] uppercase tracking-wider mb-2 block">In Possession</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#e0e0e0]">Attacking Width</span>
                  <select className="bg-[#121212] border border-[#444] text-xs text-[#aaa] px-2 py-1 rounded-sm focus:border-[#ff7a00] outline-none">
                    <option>Narrow</option>
                    <option>Standard</option>
                    <option>Wide</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#e0e0e0]">Passing Directness</span>
                  <select className="bg-[#121212] border border-[#444] text-xs text-[#aaa] px-2 py-1 rounded-sm focus:border-[#ff7a00] outline-none">
                    <option>Shorter</option>
                    <option>Standard</option>
                    <option>More Direct</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#e0e0e0]">Tempo</span>
                  <select className="bg-[#121212] border border-[#444] text-xs text-[#aaa] px-2 py-1 rounded-sm focus:border-[#ff7a00] outline-none">
                    <option>Lower</option>
                    <option>Standard</option>
                    <option>Higher</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-[#333] pt-4">
              <label className="text-xs text-[#888] uppercase tracking-wider mb-2 block">Out of Possession</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#e0e0e0]">Line of Engagement</span>
                  <select className="bg-[#121212] border border-[#444] text-xs text-[#aaa] px-2 py-1 rounded-sm focus:border-[#ff7a00] outline-none">
                    <option>Lower</option>
                    <option>Standard</option>
                    <option>Higher</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#e0e0e0]">Pressing Intensity</span>
                  <select className="bg-[#121212] border border-[#444] text-xs text-[#aaa] px-2 py-1 rounded-sm focus:border-[#ff7a00] outline-none">
                    <option>Less Urgent</option>
                    <option>Standard</option>
                    <option>More Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#333] rounded-sm p-4">
          <h2 className="text-[#ff7a00] font-bold tracking-wider flex items-center gap-2 mb-4 border-b border-[#333] pb-2">
            <Crosshair size={18} /> SET PIECES
          </h2>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-2 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] rounded-sm text-sm transition-colors">
              <span className="text-[#e0e0e0]">Corners</span>
              <span className="text-[#888] text-xs">Edit Routine</span>
            </button>
            <button className="w-full flex items-center justify-between p-2 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] rounded-sm text-sm transition-colors">
              <span className="text-[#e0e0e0]">Free Kicks</span>
              <span className="text-[#888] text-xs">Edit Routine</span>
            </button>
            <button className="w-full flex items-center justify-between p-2 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] rounded-sm text-sm transition-colors">
              <span className="text-[#e0e0e0]">Penalties</span>
              <span className="text-[#ff7a00] text-xs font-bold">J. Smith</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
