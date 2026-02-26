import React, { useState } from 'react';
import { Filter, ChevronDown, User, Activity, Star } from 'lucide-react';

const MOCK_SQUAD = [
  { id: 1, name: 'J. Smith', pos: 'ST', age: 24, ovr: 84, pot: 89, form: 8.2, fit: 98, morale: 'Superb', val: '£45M', wage: '£85k' },
  { id: 2, name: 'M. Johnson', pos: 'CM', age: 28, ovr: 82, pot: 82, form: 7.1, fit: 85, morale: 'Good', val: '£25M', wage: '£65k' },
  { id: 3, name: 'D. Williams', pos: 'CB', age: 31, ovr: 85, pot: 85, form: 7.5, fit: 92, morale: 'Okay', val: '£18M', wage: '£90k' },
  { id: 4, name: 'L. Brown', pos: 'LW', age: 21, ovr: 76, pot: 88, form: 6.8, fit: 100, morale: 'Good', val: '£12M', wage: '£25k' },
  { id: 5, name: 'A. Garcia', pos: 'RB', age: 26, ovr: 79, pot: 81, form: 7.0, fit: 75, morale: 'Poor', val: '£15M', wage: '£40k' },
  { id: 6, name: 'T. Miller', pos: 'GK', age: 29, ovr: 83, pot: 83, form: 7.4, fit: 100, morale: 'Good', val: '£22M', wage: '£70k' },
];

export function SquadView() {
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

  return (
    <div className="flex gap-6 h-full">
      {/* Main List */}
      <div className={`flex-1 flex flex-col gap-4 transition-all duration-300 ${selectedPlayer ? 'w-2/3' : 'w-full'}`}>
        <div className="flex justify-between items-center bg-[#1e1e1e] border border-[#333] p-4 rounded-sm shrink-0">
          <h1 className="text-2xl font-bold text-[#ff7a00] tracking-wider">FIRST TEAM SQUAD</h1>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] rounded-sm text-sm transition-colors">
              <Filter size={16} /> Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] rounded-sm text-sm transition-colors">
              Sort By <ChevronDown size={16} />
            </button>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#333] rounded-sm flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#2a2a2a] text-[#888] sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Pos</th>
                  <th className="px-4 py-3 font-medium text-center">Age</th>
                  <th className="px-4 py-3 font-medium text-center">OVR</th>
                  <th className="px-4 py-3 font-medium text-center">POT</th>
                  <th className="px-4 py-3 font-medium text-center">Form</th>
                  <th className="px-4 py-3 font-medium text-center">Fit %</th>
                  <th className="px-4 py-3 font-medium">Morale</th>
                  <th className="px-4 py-3 font-medium text-right">Value</th>
                  <th className="px-4 py-3 font-medium text-right">Wage</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SQUAD.map((p) => (
                  <tr 
                    key={p.id} 
                    onClick={() => setSelectedPlayer(p.id)}
                    className={`border-b border-[#333] cursor-pointer transition-colors ${selectedPlayer === p.id ? 'bg-[#ff7a00]/20 border-l-4 border-l-[#ff7a00]' : 'hover:bg-[#2a2a2a] border-l-4 border-l-transparent'}`}
                  >
                    <td className="px-4 py-3 font-medium text-[#e0e0e0]">{p.name}</td>
                    <td className="px-4 py-3 text-[#ff7a00] font-bold">{p.pos}</td>
                    <td className="px-4 py-3 text-center text-[#aaa]">{p.age}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-[#333] px-2 py-1 rounded-sm text-white font-mono">{p.ovr}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-yellow-500 font-mono">{p.pot}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={p.form >= 7.5 ? 'text-green-400' : p.form >= 7.0 ? 'text-yellow-400' : 'text-red-400'}>
                        {p.form.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="w-16 h-2 bg-[#333] rounded-full mx-auto overflow-hidden">
                        <div 
                          className={`h-full ${p.fit > 90 ? 'bg-green-500' : p.fit > 80 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          style={{ width: `${p.fit}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#aaa]">{p.morale}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#aaa]">{p.val}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#aaa]">{p.wage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Player Detail Sidebar */}
      {selectedPlayer && (
        <div className="w-1/3 bg-[#1e1e1e] border border-[#333] rounded-sm flex flex-col overflow-hidden shrink-0 animate-in slide-in-from-right-8 duration-300">
          {(() => {
            const player = MOCK_SQUAD.find(p => p.id === selectedPlayer)!;
            return (
              <>
                <div className="p-6 border-b border-[#333] flex items-start gap-4 bg-[#2a2a2a]">
                  <div className="w-20 h-20 bg-[#121212] rounded-sm border border-[#444] flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={`https://picsum.photos/seed/player${player.id}/100/100`} alt={player.name} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[#e0e0e0] leading-none mb-1">{player.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-[#ff7a00] font-bold mb-3">
                      <span>{player.pos}</span>
                      <span className="text-[#666]">•</span>
                      <span className="text-[#aaa] font-normal">{player.age} yrs</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-[#121212] px-3 py-1 rounded-sm border border-[#333] flex flex-col items-center">
                        <span className="text-[10px] text-[#888] uppercase">OVR</span>
                        <span className="font-mono font-bold text-white">{player.ovr}</span>
                      </div>
                      <div className="bg-[#121212] px-3 py-1 rounded-sm border border-[#333] flex flex-col items-center">
                        <span className="text-[10px] text-[#888] uppercase">POT</span>
                        <span className="font-mono font-bold text-yellow-500">{player.pot}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPlayer(null)} className="text-[#666] hover:text-white">✕</button>
                </div>

                <div className="flex border-b border-[#333] bg-[#1a1a1a]">
                  {['Overview', 'Attributes', 'Contract'].map(tab => (
                    <button key={tab} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${tab === 'Overview' ? 'border-[#ff7a00] text-[#ff7a00]' : 'border-transparent text-[#888] hover:text-[#e0e0e0]'}`}>
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#2a2a2a] p-3 rounded-sm border border-[#333]">
                      <div className="text-xs text-[#888] mb-1 flex items-center gap-2"><Activity size={14}/> Fitness</div>
                      <div className="flex items-end gap-2">
                        <span className="text-xl font-mono font-bold text-[#e0e0e0]">{player.fit}%</span>
                        <span className="text-xs text-green-400 mb-1">Match Fit</span>
                      </div>
                    </div>
                    <div className="bg-[#2a2a2a] p-3 rounded-sm border border-[#333]">
                      <div className="text-xs text-[#888] mb-1 flex items-center gap-2"><Star size={14}/> Form</div>
                      <div className="flex items-end gap-2">
                        <span className="text-xl font-mono font-bold text-[#e0e0e0]">{player.form.toFixed(1)}</span>
                        <span className="text-xs text-[#aaa] mb-1">Last 5</span>
                      </div>
                    </div>
                  </div>

                  {/* Attributes Preview */}
                  <div>
                    <h3 className="text-sm font-bold text-[#ff7a00] uppercase tracking-wider mb-3 border-b border-[#333] pb-1">Key Attributes</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Pace', val: 88 },
                        { label: 'Shooting', val: 85 },
                        { label: 'Passing', val: 72 },
                        { label: 'Dribbling', val: 81 },
                        { label: 'Defending', val: 35 },
                        { label: 'Physical', val: 78 },
                      ].map(attr => (
                        <div key={attr.label} className="flex items-center gap-3">
                          <span className="text-xs text-[#aaa] w-20">{attr.label}</span>
                          <div className="flex-1 h-2 bg-[#333] rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${attr.val > 80 ? 'bg-green-500' : attr.val > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${attr.val}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-mono w-6 text-right text-[#e0e0e0]">{attr.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-4 border-t border-[#333] flex gap-3">
                    <button className="flex-1 bg-[#ff7a00] hover:bg-[#e66e00] text-[#121212] font-bold py-2 rounded-sm text-sm transition-colors">
                      Action Menu
                    </button>
                    <button className="flex-1 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] text-[#e0e0e0] font-bold py-2 rounded-sm text-sm transition-colors">
                      Compare
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
