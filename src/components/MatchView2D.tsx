import React, { useEffect, useRef, useState } from 'react';
import { createInitialState, updateMatch } from '../lib/engine';
import { MatchState, PITCH_WIDTH, PITCH_HEIGHT, GOAL_WIDTH } from '../lib/types';

const SCALE = 8;
const CANVAS_WIDTH = PITCH_WIDTH * SCALE;
const CANVAS_HEIGHT = PITCH_HEIGHT * SCALE;

export default function MatchView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [matchState, setMatchState] = useState<MatchState>(createInitialState());
  const requestRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const accumulatorRef = useRef(0);

  // Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (!isPlaying) {
        lastTime = currentTime; // Reset time to prevent jump on resume
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Cap dt to avoid spiral of death
      const dt = Math.min(deltaTime, 0.1);

      accumulatorRef.current += dt * speed;
      const physicsStep = 0.016;

      if (accumulatorRef.current >= physicsStep) {
        setMatchState(prev => {
          let next = prev;
          while (accumulatorRef.current >= physicsStep) {
            next = updateMatch(next, physicsStep);
            accumulatorRef.current -= physicsStep;
          }
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, speed]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Pitch Grid Pattern
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    // Pitch Lines
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Center Line
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();

    // Center Circle
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 9.15 * SCALE, 0, Math.PI * 2);
    ctx.stroke();

    // Goals (Nets)
    const goalY = (PITCH_HEIGHT - GOAL_WIDTH) / 2 * SCALE;
    const goalH = GOAL_WIDTH * SCALE;
    
    // Home Goal Net
    ctx.strokeStyle = 'rgba(255, 122, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(-2 * SCALE, goalY, 2 * SCALE, goalH);
    // Net pattern
    for(let i=0; i<=2*SCALE; i+=4) {
        ctx.moveTo(-i, goalY);
        ctx.lineTo(-i, goalY + goalH);
    }
    for(let i=0; i<=goalH; i+=4) {
        ctx.moveTo(-2*SCALE, goalY + i);
        ctx.lineTo(0, goalY + i);
    }
    ctx.stroke();

    // Away Goal Net
    ctx.strokeStyle = 'rgba(224, 224, 224, 0.3)';
    ctx.beginPath();
    ctx.rect(CANVAS_WIDTH, goalY, 2 * SCALE, goalH);
    // Net pattern
    for(let i=0; i<=2*SCALE; i+=4) {
        ctx.moveTo(CANVAS_WIDTH + i, goalY);
        ctx.lineTo(CANVAS_WIDTH + i, goalY + goalH);
    }
    for(let i=0; i<=goalH; i+=4) {
        ctx.moveTo(CANVAS_WIDTH, goalY + i);
        ctx.lineTo(CANVAS_WIDTH + 2*SCALE, goalY + i);
    }
    ctx.stroke();

    // Goal Posts (Thick lines)
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;
    
    // Home Posts
    ctx.beginPath();
    ctx.moveTo(0, goalY);
    ctx.lineTo(-2 * SCALE, goalY);
    ctx.lineTo(-2 * SCALE, goalY + goalH);
    ctx.lineTo(0, goalY + goalH);
    ctx.stroke();

    // Away Posts
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH, goalY);
    ctx.lineTo(CANVAS_WIDTH + 2 * SCALE, goalY);
    ctx.lineTo(CANVAS_WIDTH + 2 * SCALE, goalY + goalH);
    ctx.lineTo(CANVAS_WIDTH, goalY + goalH);
    ctx.stroke();

    // Players
    matchState.players.forEach(p => {
      const x = p.position.x * SCALE;
      const y = p.position.y * SCALE;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.arc(x + 2, y + 2, 6, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = p.team === 'home' ? '#ff7a00' : '#e0e0e0';
      
      // Highlight active player
      if (p.state === 'dribbling' || p.state === 'shooting' || p.state === 'passing') {
        ctx.strokeStyle = '#ffffff'; // White ring
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#121212';
        ctx.lineWidth = 1.5;
      }

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Number
      ctx.fillStyle = p.team === 'home' ? '#121212' : '#121212';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.number.toString(), x, y);

      // Name (if close to ball or has ball)
      // const distToBall = Math.hypot(p.position.x - matchState.ball.position.x, p.position.y - matchState.ball.position.y);
      // if (distToBall < 10) {
      //   ctx.fillStyle = '#fff';
      //   ctx.font = '10px Arial';
      //   ctx.fillText(p.name, x, y - 10);
      // }
    });

    // Ball
    const bx = matchState.ball.position.x * SCALE;
    const by = matchState.ball.position.y * SCALE;
    
    // Ball Shadow (based on height)
    const shadowOffset = 2 + (matchState.ball.height * 5);
    const shadowSize = Math.max(1, 3 - matchState.ball.height);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(bx + shadowOffset, by + shadowOffset, shadowSize, 0, Math.PI * 2);
    ctx.fill();

    // Ball Body (Scale with height to fake 3D)
    const ballScale = 3 + (matchState.ball.height * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff7a00';
    ctx.shadowBlur = matchState.ball.height > 0 ? 10 : 0;
    ctx.beginPath();
    ctx.arc(bx, by - (matchState.ball.height * 10), ballScale, 0, Math.PI * 2); // Y-offset for height
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.5;
    ctx.stroke();

  }, [matchState]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const reset = () => {
    setIsPlaying(false);
    setSpeed(1);
    setMatchState(createInitialState());
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 w-full h-full">
        
        {/* Left Panel */}
        <div className="hidden lg:block bg-[#1e1e1e] p-4 rounded-sm border border-[#333] h-full overflow-y-auto">
          <h3 className="text-[#ff7a00] font-bold mb-4 text-sm tracking-wider border-b border-[#333] pb-2">HOME SQUAD</h3>
          <div className="space-y-2 text-sm">
            {matchState.players.filter(p => p.team === 'home').map(p => (
              <div key={p.id} className="flex justify-between items-center p-1 hover:bg-[#2a2a2a] rounded-sm transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-6 text-[#666] font-mono">{p.number}</span>
                  <span className={p.id === matchState.ball.ownerId ? 'text-[#ff7a00] font-bold' : 'text-[#e0e0e0]'}>{p.name}</span>
                  {p.events.goals > 0 && <span className="text-[#ff7a00] text-xs">⚽{p.events.goals}</span>}
                </div>
                <span className="text-xs px-2 py-0.5 bg-[#121212] border border-[#333] rounded-sm text-[#888]">{p.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel */}
        <div className="flex flex-col items-center h-full overflow-y-auto">
          <div className="mb-6 flex items-center gap-8 bg-[#1e1e1e] p-4 rounded-sm shadow-lg border border-[#333] w-full justify-center">
            <div className="text-center w-32">
              <div className="text-sm text-[#888] font-bold uppercase tracking-wider">Home</div>
              <div className="text-4xl font-mono font-bold text-[#ff7a00]">{matchState.score.home}</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-xl font-mono bg-[#121212] px-4 py-2 rounded-sm text-[#e0e0e0] border border-[#444] shadow-[0_0_10px_rgba(255,122,0,0.1)]">
                {Math.floor(matchState.time / 60).toString().padStart(2, '0')}:{(Math.floor(matchState.time) % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-[#ff7a00] mt-2 uppercase tracking-widest font-bold">{matchState.phase}</div>
            </div>

            <div className="text-center w-32">
              <div className="text-sm text-[#888] font-bold uppercase tracking-wider">Away</div>
              <div className="text-4xl font-mono font-bold text-[#e0e0e0]">{matchState.score.away}</div>
            </div>
          </div>

          <div className="relative rounded-sm overflow-hidden shadow-2xl border-2 border-[#333] bg-[#121212] shrink-0">
            <canvas 
              ref={canvasRef} 
              width={CANVAS_WIDTH} 
              height={CANVAS_HEIGHT}
              className="block cursor-crosshair"
            />
            {matchState.phase === 'goal' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="text-6xl font-black text-[#ff7a00] tracking-widest animate-pulse">GOAL!!!</div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-4 items-center bg-[#1e1e1e] p-2 rounded-sm border border-[#333]">
            <button 
              onClick={togglePlay}
              className="px-6 py-2 bg-[#ff7a00] hover:bg-[#e66e00] text-[#121212] rounded-sm font-bold transition-all active:scale-95 uppercase tracking-wider"
            >
              {isPlaying ? 'PAUSE' : 'START MATCH'}
            </button>
            
            <button 
              onClick={reset}
              className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] text-[#e0e0e0] rounded-sm font-bold transition-all active:scale-95 uppercase tracking-wider"
            >
              RESET
            </button>

            <div className="h-6 w-px bg-[#444] mx-2"></div>

            <div className="flex bg-[#121212] rounded-sm p-1 border border-[#333]">
              {[1, 2, 5, 10].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-1 rounded-sm text-sm font-bold transition-colors ${speed === s ? 'bg-[#ff7a00] text-[#121212]' : 'text-[#888] hover:text-[#e0e0e0] hover:bg-[#2a2a2a]'}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
          
          {/* Match Log */}
          <div className="mt-6 w-full bg-[#1e1e1e] rounded-sm border border-[#333] p-4 h-32 overflow-y-auto font-mono text-xs shrink-0">
            {matchState.logs && matchState.logs.length > 0 ? matchState.logs.map((log, i) => (
               <div key={i} className={`mb-1 ${log.type === 'goal' ? 'text-[#ff7a00] font-bold' : 'text-[#aaa]'}`}>
                 <span className="opacity-50 mr-2 text-[#666]">
                   {Math.floor(log.time / 60).toString().padStart(2, '0')}:{(Math.floor(log.time) % 60).toString().padStart(2, '0')}
                 </span>
                 {log.message}
               </div>
            )) : <div className="text-[#666]">No logs yet...</div>}
          </div>

          {/* Stats Panel */}
          <div className="mt-6 w-full grid grid-cols-2 gap-6 pb-8 shrink-0">
             <div className="bg-[#1e1e1e] p-4 rounded-sm border border-[#333]">
                <h4 className="text-[#ff7a00] font-bold mb-4 text-center tracking-wider border-b border-[#333] pb-2">HOME STATS</h4>
                <StatRow label="Possession" value={`${Math.round((matchState.stats.home.possession / (matchState.time || 1)) * 100)}%`} />
                <StatRow label="Shots" value={matchState.stats.home.shots} />
                <StatRow label="On Target" value={matchState.stats.home.shotsOnTarget} />
                <StatRow label="Passes" value={`${matchState.stats.home.passesCompleted}/${matchState.stats.home.passes}`} />
                <StatRow label="Tackles" value={matchState.stats.home.tackles} />
             </div>
             <div className="bg-[#1e1e1e] p-4 rounded-sm border border-[#333]">
                <h4 className="text-[#e0e0e0] font-bold mb-4 text-center tracking-wider border-b border-[#333] pb-2">AWAY STATS</h4>
                <StatRow label="Possession" value={`${Math.round((matchState.stats.away.possession / (matchState.time || 1)) * 100)}%`} />
                <StatRow label="Shots" value={matchState.stats.away.shots} />
                <StatRow label="On Target" value={matchState.stats.away.shotsOnTarget} />
                <StatRow label="Passes" value={`${matchState.stats.away.passesCompleted}/${matchState.stats.away.passes}`} />
                <StatRow label="Tackles" value={matchState.stats.away.tackles} />
             </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden lg:block bg-[#1e1e1e] p-4 rounded-sm border border-[#333] h-full overflow-y-auto">
          <h3 className="text-[#e0e0e0] font-bold mb-4 text-sm tracking-wider border-b border-[#333] pb-2">AWAY SQUAD</h3>
          <div className="space-y-2 text-sm">
            {matchState.players.filter(p => p.team === 'away').map(p => (
              <div key={p.id} className="flex justify-between items-center p-1 hover:bg-[#2a2a2a] rounded-sm transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-6 text-[#666] font-mono">{p.number}</span>
                  <span className={p.id === matchState.ball.ownerId ? 'text-[#ff7a00] font-bold' : 'text-[#e0e0e0]'}>{p.name}</span>
                  {p.events.goals > 0 && <span className="text-[#ff7a00] text-xs">⚽{p.events.goals}</span>}
                </div>
                <span className="text-xs px-2 py-0.5 bg-[#121212] border border-[#333] rounded-sm text-[#888]">{p.role}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const StatRow = ({ label, value }: { label: string, value: string | number }) => (
  <div className="flex justify-between text-sm py-2 border-b border-[#333] last:border-0">
    <span className="text-[#888]">{label}</span>
    <span className="font-mono font-bold text-[#e0e0e0]">{value}</span>
  </div>
);
