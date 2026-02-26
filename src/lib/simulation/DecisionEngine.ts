import { SimPlayer, MatchContext, PlayerActionType } from './types';
import { Vector2, PITCH_WIDTH, PITCH_HEIGHT } from '../types';
import { getTacticalPosition } from './TacticalEngine';

export interface ActionScore {
  action: PlayerActionType;
  score: number;
  target?: Vector2;
  params?: any;
}

// 6.1 Context Score Formula
// ContextScore = TacticalWeight + PlayerTraitBias + AttributeMod + FatigueMod + MatchSitMod + RandomNoise
const calculateScore = (baseScore: number, player: SimPlayer, context: MatchContext): number => {
  let score = baseScore;
  
  // Tactical Weight (Simplified: Role Bias)
  // In a full system, this would come from the Tactical Engine's instructions
  
  // Player Trait Bias (Hidden Attributes)
  // e.g., Risk Bias
  
  // Fatigue Mod
  const fatigueFactor = player.state.fatigue / 100;
  score *= fatigueFactor;
  
  // Random Noise (-5% to +5%)
  const noise = 1 + (Math.random() * 0.1 - 0.05);
  score *= noise;
  
  return score;
};

export const evaluateActions = (player: SimPlayer, context: MatchContext, ballOwnerId: number | null, ballPosition: Vector2): ActionScore => {
  const isOwner = ballOwnerId === player.id;
  const candidates: ActionScore[] = [];

  if (isOwner) {
    // IN POSSESSION
    candidates.push(scorePassShort(player, context));
    candidates.push(scorePassLong(player, context));
    candidates.push(scoreDribble(player, context));
    candidates.push(scoreShoot(player, context, ballPosition));
    candidates.push(scoreHold(player, context));
  } else {
    // OUT OF POSSESSION
    if (ballOwnerId && ballOwnerId !== player.id) {
       // Opponent has ball
       const distToBall = Math.hypot(player.position.x - ballPosition.x, player.position.y - ballPosition.y);
       
       if (distToBall < 5) {
         candidates.push(scoreTackle(player, context));
       }
       
       if (distToBall < 15) {
         candidates.push(scorePress(player, context));
         candidates.push(scoreContain(player, context));
       }
       
       // Always consider positioning/intercepting
       candidates.push(scoreIntercept(player, context, ballPosition));
       candidates.push(scorePositioning(player, context, ballPosition));
    } else {
       // Loose ball
       candidates.push(scoreChase(player, context, ballPosition));
       candidates.push(scorePositioning(player, context, ballPosition));
    }
  }

  // Sort by score
  candidates.sort((a, b) => b.score - a.score);
  
  // Weighted random choice from top 3
  const top3 = candidates.slice(0, 3);
  if (top3.length === 0) return { action: 'idle', score: 0 };
  
  let totalScore = 0;
  for (const c of top3) totalScore += c.score;
  
  let r = Math.random() * totalScore;
  for (const c of top3) {
    r -= c.score;
    if (r <= 0) return c;
  }
  return top3[0];
};

// --- Action Scorers ---

const scorePassShort = (player: SimPlayer, context: MatchContext): ActionScore => {
  let base = (player.attributes.passing * 0.4) + (player.attributes.technique * 0.2) + (player.attributes.vision * 0.15);
  base *= (player.tacticalRole.creativeBias / 10); // Tactical Mod
  const score = calculateScore(base, player, context);
  return { action: 'pass_short', score, target: { x: player.position.x + 10, y: player.position.y } }; // Placeholder target
};

const scorePassLong = (player: SimPlayer, context: MatchContext): ActionScore => {
  let base = (player.attributes.passing * 0.3) + (player.attributes.vision * 0.3) + (player.attributes.technique * 0.2);
  // Riskier
  base *= 0.8; 
  const score = calculateScore(base, player, context);
  return { action: 'pass_long', score, target: { x: player.position.x + 30, y: player.position.y } }; 
};

const scoreDribble = (player: SimPlayer, context: MatchContext): ActionScore => {
  let base = (player.attributes.dribbling * 0.4) + (player.attributes.pace * 0.2) + (player.attributes.agility * 0.2);
  base *= (player.tacticalRole.riskBias / 10);
  const score = calculateScore(base, player, context);
  return { action: 'dribble', score, target: { x: player.position.x + 5, y: player.position.y } };
};

const scoreShoot = (player: SimPlayer, context: MatchContext, ballPos: Vector2): ActionScore => {
  let base = (player.attributes.finishing * 0.4) + (player.attributes.composure * 0.3) + (player.attributes.technique * 0.2);
  // Distance penalty (placeholder)
  // In real system: check distance to goal
  const score = calculateScore(base, player, context);
  return { action: 'shoot', score: score * 0.5, target: { x: 100, y: 34 } }; 
};

const scoreHold = (player: SimPlayer, context: MatchContext): ActionScore => {
  let base = (player.attributes.strength * 0.4) + (player.attributes.balance * 0.3) + (player.attributes.technique * 0.2);
  const score = calculateScore(base, player, context);
  return { action: 'hold', score };
};

const scoreTackle = (player: SimPlayer, context: MatchContext): ActionScore => {
  let base = (player.attributes.tackling * 0.4) + (player.attributes.strength * 0.2) + (player.attributes.aggression * 0.2);
  const score = calculateScore(base, player, context);
  return { action: 'tackle', score };
};

const scorePress = (player: SimPlayer, context: MatchContext): ActionScore => {
  let base = (player.attributes.workRate * 0.3) + (player.attributes.stamina * 0.2) + (player.attributes.aggression * 0.2);
  const score = calculateScore(base, player, context);
  return { action: 'press', score };
};

const scoreContain = (player: SimPlayer, context: MatchContext): ActionScore => {
  let base = (player.attributes.positioning * 0.3) + (player.attributes.concentration * 0.3) + (player.attributes.decisions * 0.2);
  const score = calculateScore(base, player, context);
  return { action: 'contain', score };
};

const scoreIntercept = (player: SimPlayer, context: MatchContext, ballPos: Vector2): ActionScore => {
  let base = (player.attributes.anticipation * 0.4) + (player.attributes.acceleration * 0.2) + (player.attributes.decisions * 0.2);
  const score = calculateScore(base, player, context);
  return { action: 'intercept', score, target: ballPos }; // Move to intercept
};

const scoreChase = (player: SimPlayer, context: MatchContext, ballPos: Vector2): ActionScore => {
  let base = (player.attributes.acceleration * 0.3) + (player.attributes.pace * 0.3) + (player.attributes.determination * 0.2);
  const score = calculateScore(base, player, context);
  return { action: 'chase', score, target: ballPos };
};

const scorePositioning = (player: SimPlayer, context: MatchContext, ballPos: Vector2): ActionScore => {
  let base = (player.attributes.positioning * 0.4) + (player.attributes.anticipation * 0.3) + (player.attributes.decisions * 0.2);
  const target = getTacticalPosition(player, context, ballPos);
  const score = calculateScore(base, player, context);
  return { action: 'move', score, target };
};
