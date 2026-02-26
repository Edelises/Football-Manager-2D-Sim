import React from 'react';
import { Mail, TrendingUp, Calendar, Trophy, Users, DollarSign } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Left Column: News */}
      <div className="col-span-3 flex flex-col gap-4">
        <div className="bg-[#1e1e1e] border border-[#333] rounded-sm p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-[#333] pb-2">
            <h2 className="text-[#ff7a00] font-bold tracking-wider flex items-center gap-2">
              <Mail size={18} /> INBOX
            </h2>
            <span className="text-xs text-[#888]">3 UNREAD</span>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto">
            {[
              { title: 'Training Report', desc: 'Smith shows great improvement.', time: '2h ago', unread: true },
              { title: 'Scout Update', desc: 'Found a promising winger in Brazil.', time: '5h ago', unread: true },
              { title: 'Board Meeting', desc: 'Expectations for the season.', time: '1d ago', unread: true },
              { title: 'Press Conference', desc: 'Pre-match questions.', time: '1d ago', unread: false },
            ].map((msg, i) => (
              <div key={i} className={`p-3 rounded-sm border-l-2 cursor-pointer transition-colors ${msg.unread ? 'border-[#ff7a00] bg-[#2a2a2a] hover:bg-[#333]' : 'border-[#444] bg-[#1a1a1a] opacity-70 hover:opacity-100'}`}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm ${msg.unread ? 'text-[#e0e0e0] font-semibold' : 'text-[#aaa]'}`}>{msg.title}</h3>
                  <span className="text-[10px] text-[#666]">{msg.time}</span>
                </div>
                <p className="text-xs text-[#888] line-clamp-2">{msg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Column: League & Form */}
      <div className="col-span-6 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-sm p-4">
            <h2 className="text-[#ff7a00] font-bold tracking-wider flex items-center gap-2 mb-4 border-b border-[#333] pb-2">
              <Trophy size={18} /> PREMIER LEAGUE
            </h2>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-[#666] border-b border-[#333]">
                  <th className="pb-2 font-normal">Pos</th>
                  <th className="pb-2 font-normal">Team</th>
                  <th className="pb-2 font-normal text-right">GD</th>
                  <th className="pb-2 font-normal text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { pos: 1, team: 'Man City', gd: '+12', pts: 15 },
                  { pos: 2, team: 'Arsenal', gd: '+8', pts: 13 },
                  { pos: 3, team: 'Liverpool', gd: '+7', pts: 12 },
                  { pos: 4, team: 'Your Club', gd: '+5', pts: 10, highlight: true },
                  { pos: 5, team: 'Chelsea', gd: '+2', pts: 9 },
                ].map((row) => (
                  <tr key={row.pos} className={`border-b border-[#222] ${row.highlight ? 'bg-[#ff7a00]/10 text-[#ff7a00] font-medium' : 'text-[#aaa]'}`}>
                    <td className="py-2">{row.pos}</td>
                    <td className="py-2">{row.team}</td>
                    <td className="py-2 text-right">{row.gd}</td>
                    <td className="py-2 text-right">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#1e1e1e] border border-[#333] rounded-sm p-4 flex flex-col">
            <h2 className="text-[#ff7a00] font-bold tracking-wider flex items-center gap-2 mb-4 border-b border-[#333] pb-2">
              <TrendingUp size={18} /> TEAM FORM
            </h2>
            <div className="flex-1 flex items-end justify-between gap-2 pt-4">
              {['W', 'D', 'W', 'W', 'L'].map((res, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      res === 'W' ? 'bg-green-500/80 h-24' : 
                      res === 'D' ? 'bg-yellow-500/80 h-16' : 
                      'bg-red-500/80 h-8'
                    }`}
                  ></div>
                  <span className={`text-xs font-bold ${
                    res === 'W' ? 'text-green-500' : 
                    res === 'D' ? 'text-yellow-500' : 
                    'text-red-500'
                  }`}>{res}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#333] rounded-sm p-4 flex-1">
          <h2 className="text-[#ff7a00] font-bold tracking-wider flex items-center gap-2 mb-4 border-b border-[#333] pb-2">
            <Calendar size={18} /> NEXT FIXTURE
          </h2>
          <div className="flex items-center justify-between h-full px-8 pb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 bg-[#333] rounded-full flex items-center justify-center text-2xl font-bold text-[#ff7a00]">YC</div>
              <span className="font-medium">Your Club</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-[#888] tracking-widest">PREMIER LEAGUE</span>
              <span className="text-2xl font-bold text-[#e0e0e0]">VS</span>
              <span className="text-sm text-[#ff7a00]">SAT 15:00</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 bg-[#8b0000] rounded-full flex items-center justify-center text-2xl font-bold text-white">MU</div>
              <span className="font-medium">Man Utd</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Spotlight & Stats */}
      <div className="col-span-3 flex flex-col gap-6">
        <div className="bg-[#1e1e1e] border border-[#333] rounded-sm p-4">
          <h2 className="text-[#ff7a00] font-bold tracking-wider flex items-center gap-2 mb-4 border-b border-[#333] pb-2">
            <Users size={18} /> SPOTLIGHT
          </h2>
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#333] rounded-full mb-3 border-2 border-[#ff7a00] overflow-hidden">
              <img src="https://picsum.photos/seed/player1/100/100" alt="Player" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
            </div>
            <h3 className="text-lg font-bold text-[#e0e0e0]">J. Smith</h3>
            <span className="text-sm text-[#ff7a00] mb-4">Striker - 84 OVR</span>
            
            <div className="w-full space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#888]">Form</span>
                  <span className="text-green-400">Excellent</span>
                </div>
                <div className="h-1.5 w-full bg-[#333] rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[90%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#888]">Morale</span>
                  <span className="text-blue-400">Superb</span>
                </div>
                <div className="h-1.5 w-full bg-[#333] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[95%]"></div>
                </div>
              </div>
              <div className="pt-2 flex justify-between text-sm border-t border-[#333] mt-2">
                <div className="flex flex-col items-center">
                  <span className="text-[#888] text-xs">Goals</span>
                  <span className="font-bold">8</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[#888] text-xs">Assists</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[#888] text-xs">Avg</span>
                  <span className="font-bold text-[#ff7a00]">7.8</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#333] rounded-sm p-4 flex-1">
          <h2 className="text-[#ff7a00] font-bold tracking-wider flex items-center gap-2 mb-4 border-b border-[#333] pb-2">
            <DollarSign size={18} /> CLUB STATS
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-2 bg-[#2a2a2a] rounded-sm">
              <span className="text-sm text-[#aaa]">Attendance</span>
              <span className="font-mono font-bold text-[#e0e0e0]">54,210</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-[#2a2a2a] rounded-sm">
              <span className="text-sm text-[#aaa]">Merch Sales</span>
              <span className="font-mono font-bold text-green-400">+12%</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-[#2a2a2a] rounded-sm">
              <span className="text-sm text-[#aaa]">Board Confidence</span>
              <span className="font-mono font-bold text-[#ff7a00]">85%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
