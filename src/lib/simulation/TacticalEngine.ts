import { SimPlayer, MatchContext } from './types';
import { Vector2, PITCH_WIDTH, PITCH_HEIGHT } from '../types';

// 6 Horizontal Zones x 5 Vertical Lanes
// Zones: 0 (GK), 1 (Def), 2 (DM), 3 (CM), 4 (AM), 5 (ST)
// Lanes: 0 (Left), 1 (Left-Center), 2 (Center), 3 (Right-Center), 4 (Right)

interface GridPosition {
  zone: number;
  lane: number;
}

const ROLE_GRID_MAP: Record<string, GridPosition> = {
  'GK': { zone: 0, lane: 2 },
  'DL': { zone: 1, lane: 0 },
  'DC': { zone: 1, lane: 2 }, // Will adjust for multiple DCs
  'DR': { zone: 1, lane: 4 },
  'DMC': { zone: 2, lane: 2 },
  'ML': { zone: 3, lane: 0 },
  'MC': { zone: 3, lane: 2 },
  'MR': { zone: 3, lane: 4 },
  'AML': { zone: 4, lane: 0 },
  'AMC': { zone: 4, lane: 2 },
  'AMR': { zone: 4, lane: 4 },
  'ST': { zone: 5, lane: 2 },
};

export const getTacticalPosition = (player: SimPlayer, context: MatchContext, ballPos: Vector2): Vector2 => {
  // 1. Get Base Grid Position
  let grid = ROLE_GRID_MAP[player.role] || { zone: 3, lane: 2 };
  
  // Adjust for specific formation slots (e.g., 2 DCs, 2 STs)
  // This is a simplified hack. In a real system, the formation object would define this.
  if (player.role === 'DC') {
    // If player number is even/odd or based on ID to split them
    grid = player.id % 2 === 0 ? { zone: 1, lane: 1 } : { zone: 1, lane: 3 }; 
  } else if (player.role === 'ST') {
    grid = player.id % 2 === 0 ? { zone: 5, lane: 1 } : { zone: 5, lane: 3 };
  } else if (player.role === 'MC') {
    grid = player.id % 2 === 0 ? { zone: 3, lane: 1 } : { zone: 3, lane: 3 };
  }

  // 2. Convert Grid to Pitch Coordinates (Base Position)
  const zoneHeight = PITCH_HEIGHT / 6;
  const laneWidth = PITCH_WIDTH / 5;
  
  // Center of the grid cell
  let baseX = (grid.lane * laneWidth) + (laneWidth / 2);
  let baseY = (grid.zone * zoneHeight) + (zoneHeight / 2);

  // Flip for Away Team
  if (player.team === 'away') {
    baseY = PITCH_HEIGHT - baseY;
    baseX = PITCH_WIDTH - baseX;
  }

  // 3. Apply Ball-Relative Shifts (The "Elastic Band" Effect)
  // Calculate ball zone
  const ballZoneY = Math.floor(ballPos.y / zoneHeight);
  
  // Longitudinal Shift (Y-axis)
  // If ball is forward, team moves forward (compression)
  // If ball is back, team drops back
  const teamDir = player.team === 'home' ? 1 : -1;
  const ballYRelative = player.team === 'home' ? ballPos.y : PITCH_HEIGHT - ballPos.y;
  
  // Shift factor: How much the formation stretches/compresses
  // Attackers stay high, Defenders stay low, Mids connect
  let yShift = 0;
  
  // Simple logic: Move towards ball Y but keep formation structure
  const distToBallY = ballPos.y - baseY;
  yShift = distToBallY * 0.3; // Move 30% towards ball Y

  // 4. Apply Lateral Shifts (X-axis)
  // Shift towards ball side to create overloads/compactness
  const distToBallX = ballPos.x - baseX;
  const xShift = distToBallX * 0.2; // Move 20% towards ball X

  // 5. Final Position
  let targetX = baseX + xShift;
  let targetY = baseY + yShift;

  // Clamp
  targetX = Math.max(0, Math.min(PITCH_WIDTH, targetX));
  targetY = Math.max(0, Math.min(PITCH_HEIGHT, targetY));

  return { x: targetX, y: targetY };
};
