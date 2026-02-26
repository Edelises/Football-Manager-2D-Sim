import { SimPlayer, MatchContext, MatchLog, PlayerActionType } from './types';
import { Ball, Vector2, TeamId, PITCH_WIDTH, PITCH_HEIGHT } from '../types';
import { evaluateActions, ActionScore } from './DecisionEngine';
import { db } from '../data/Database';
import { DbPlayer } from '../data/schema';

export interface SimMatchState {
  players: SimPlayer[];
  ball: Ball;
  context: MatchContext;
  logs: MatchLog[];
}

const TICK_RATE = 0.2; // Seconds per tick

// Helper to convert DB Player to Sim Player
const convertToSimPlayer = (dbPlayer: DbPlayer, team: TeamId, simId: number, startPos: Vector2): SimPlayer => {
  return {
    id: simId,
    number: Math.floor(Math.random() * 99) + 1, // Placeholder
    name: `${dbPlayer.firstName.charAt(0)}. ${dbPlayer.lastName}`,
    team,
    position: { ...startPos },
    targetPosition: { ...startPos },
    basePosition: { ...startPos },
    velocity: { x: 0, y: 0 },
    role: dbPlayer.position,
    tacticalRole: { 
      name: dbPlayer.position, 
      code: dbPlayer.position, 
      riskBias: 10, 
      creativeBias: 10, 
      defensiveBias: 10, 
      roamingBias: 10 
    },
    attributes: { ...dbPlayer.attributes },
    hiddenAttributes: { ...dbPlayer.hiddenAttributes },
    state: {
      morale: 80,
      fatigue: 100,
      condition: 100,
      confidence: 80,
      momentumInfluence: 0,
    },
    currentAction: 'idle',
    actionTimer: 0,
    matchRating: 6.0,
    stats: {
      goals: 0,
      assists: 0,
      passesAttempted: 0,
      passesCompleted: 0,
      tacklesAttempted: 0,
      tacklesWon: 0,
      interceptions: 0,
      shots: 0,
      shotsOnTarget: 0,
      distanceCovered: 0,
    },
  };
};

export const createInitialSimState = (homeClubId: string, awayClubId: string): SimMatchState => {
  const players: SimPlayer[] = [];
  let idCounter = 1;

  const homeClub = db.getClub(homeClubId);
  const awayClub = db.getClub(awayClubId);

  if (!homeClub || !awayClub) {
    console.error("Clubs not found in DB");
    // Fallback or error handling
  }

  const addTeam = (team: TeamId, clubId: string) => {
    const club = db.getClub(clubId);
    // Get first 11 players for now (simple selection)
    const squadIds = club.roster.slice(0, 11);
    
    // Simplified formation positions for now
    // In a real implementation, use the Formation Grid System
    const positions: { x: number, y: number }[] = [
      { x: 5, y: 50 }, // GK
      { x: 25, y: 20 }, { x: 20, y: 40 }, { x: 20, y: 60 }, { x: 25, y: 80 }, // Def
      { x: 50, y: 20 }, { x: 45, y: 40 }, { x: 45, y: 60 }, { x: 50, y: 80 }, // Mid
      { x: 75, y: 40 }, { x: 75, y: 60 } // Att
    ];

    squadIds.forEach((pid, i) => {
      const dbPlayer = db.getPlayer(pid);
      const p = positions[i] || { x: 0, y: 0 };
      
      const x = team === 'home' ? (p.x / 100) * PITCH_WIDTH : PITCH_WIDTH - ((p.x / 100) * PITCH_WIDTH);
      const y = (p.y / 100) * PITCH_HEIGHT;
      
      players.push(convertToSimPlayer(dbPlayer, team, idCounter++, { x, y }));
    });
  };

  addTeam('home', homeClubId);
  addTeam('away', awayClubId);

  const initialState: SimMatchState = {
    players,
    ball: {
      position: { x: PITCH_WIDTH / 2, y: PITCH_HEIGHT / 2 },
      velocity: { x: 0, y: 0 },
      ownerId: null,
      height: 0,
      isLoose: true,
      lastOwnerId: null
    },
    context: {
      time: 0,
      tick: 0,
      timer: {
        currentMinute: 0,
        period: 1,
        isPaused: true, // Start paused
        isFinished: false,
        isHalfTime: false,
        settings: {
          fullMatchMinutes: 90,
          halfTimeDuration: 15,
          extraTimeEnabled: true,
          extraTimeMinutesPerHalf: 15,
          penaltiesEnabled: true,
          simulationSpeed: 1
        }
      },
      score: { home: 0, away: 0 },
      possession: { home: 50, away: 50 },
      possessionTime: { home: 0, away: 0 },
      momentum: { home: 0, away: 0 },
      weather: 'dry',
      pitchCondition: 100,
      phase: 'kickoff',
      phaseTimer: 0,
      stats: {
        home: { possession: 50, shots: 0, shotsOnTarget: 0, passes: 0, passesCompleted: 0, tackles: 0, corners: 0, fouls: 0 },
        away: { possession: 50, shots: 0, shotsOnTarget: 0, passes: 0, passesCompleted: 0, tackles: 0, corners: 0, fouls: 0 }
      }
    },
    logs: []
  };

  // Give ball to home team initially
  resetKickoff(initialState, 'home');

  return initialState;
};

export const updateSimMatch = (state: SimMatchState): SimMatchState => {
  const newState = { ...state };
  
  // Timer Logic
  const { timer } = newState.context;
  if (timer.isPaused || timer.isFinished) return newState;

  // Update Time
  newState.context.tick++;
  newState.context.time += TICK_RATE;
  
  // Convert absolute time to match minutes
  // 1 real second = X match seconds? No, simulation speed is handled by loop iterations.
  // Here we just track absolute time.
  // But wait, the user wants "Simulation Speed" setting.
  // If simulation speed is handled by the loop (calling updateSimMatch multiple times),
  // then TICK_RATE is constant (0.2s of match time).
  // So 1 tick = 0.2s match time.
  // 90 mins = 5400 seconds.
  
  const currentSeconds = newState.context.time;
  timer.currentMinute = Math.floor(currentSeconds / 60);

  // Check Half-Time (45 mins)
  if (timer.period === 1 && timer.currentMinute >= 45) {
    timer.period = 2;
    timer.isHalfTime = true;
    timer.isPaused = true;
    newState.logs.unshift({ time: newState.context.time, message: 'HALF TIME', type: 'info' });
    return newState;
  }

  // Check Full-Time (90 mins)
  if (timer.period === 2 && timer.currentMinute >= 90) {
    if (newState.context.score.home === newState.context.score.away && timer.settings.extraTimeEnabled) {
      timer.period = 3;
      timer.isPaused = true; // Pause before ET
      newState.logs.unshift({ time: newState.context.time, message: 'FULL TIME - EXTRA TIME!', type: 'info' });
    } else {
      timer.isFinished = true;
      timer.isPaused = true;
      newState.logs.unshift({ time: newState.context.time, message: 'FULL TIME', type: 'info' });
    }
    return newState;
  }

  // Check ET Half-Time (105 mins)
  if (timer.period === 3 && timer.currentMinute >= 105) {
    timer.period = 4;
    timer.isPaused = true; // Quick break
    newState.logs.unshift({ time: newState.context.time, message: 'EXTRA TIME HALF TIME', type: 'info' });
    return newState;
  }

  // Check ET Full-Time (120 mins)
  if (timer.period === 4 && timer.currentMinute >= 120) {
    if (newState.context.score.home === newState.context.score.away && timer.settings.penaltiesEnabled) {
      timer.period = 5;
      timer.isPaused = true;
      newState.logs.unshift({ time: newState.context.time, message: 'PENALTIES!', type: 'info' });
    } else {
      timer.isFinished = true;
      timer.isPaused = true;
      newState.logs.unshift({ time: newState.context.time, message: 'FULL TIME (ET)', type: 'info' });
    }
    return newState;
  }

  // Track Possession
  if (newState.ball.ownerId) {
    const owner = newState.players.find(p => p.id === newState.ball.ownerId);
    if (owner) {
      newState.context.possessionTime[owner.team] += TICK_RATE;
    }
  }
  
  const totalPossessionTime = newState.context.possessionTime.home + newState.context.possessionTime.away;
  if (totalPossessionTime > 0) {
    newState.context.possession.home = (newState.context.possessionTime.home / totalPossessionTime) * 100;
    newState.context.possession.away = (newState.context.possessionTime.away / totalPossessionTime) * 100;
    // Sync with stats object for UI
    newState.context.stats.home.possession = newState.context.possession.home;
    newState.context.stats.away.possession = newState.context.possession.away;
  }

  // 1. Update Context (Weather, Momentum decay, etc.)
  updateContext(newState.context);

  if (newState.context.phase === 'goal') {
    if (newState.context.phaseTimer > 0) {
      newState.context.phaseTimer -= TICK_RATE;
      if (newState.context.phaseTimer <= 0) {
         // Time to reset
         const scoringTeam = newState.context.lastScorer === 'home' ? 'home' : 'away';
         resetKickoff(newState, scoringTeam === 'home' ? 'away' : 'home');
      }
      return newState; // Skip physics during goal celebration
    }
  }

  // 2. Player Decision Phase
  newState.players.forEach(player => {
    // Only think if action timer is up
    if (player.actionTimer <= 0) {
      const decision = evaluateActions(player, newState.context, newState.ball.ownerId, newState.ball.position);
      applyDecision(player, decision);
    } else {
      player.actionTimer -= TICK_RATE;
    }
  });

  // 3. Movement Phase (Interpolation)
  newState.players.forEach(player => {
    movePlayer(player, TICK_RATE);
  });

  // 4. Ball Resolution Phase
  resolveBall(newState, TICK_RATE);

  return newState;
};

const updateContext = (context: MatchContext) => {
  // Decay momentum
  if (context.momentum.home > 0) context.momentum.home -= 0.1 * TICK_RATE;
  if (context.momentum.home < 0) context.momentum.home += 0.1 * TICK_RATE;
  // ... away momentum
};

const applyDecision = (player: SimPlayer, decision: ActionScore) => {
  player.currentAction = decision.action;
  
  // Set duration based on action type
  switch (decision.action) {
    case 'pass_short': player.actionTimer = 0.5; break;
    case 'pass_long': player.actionTimer = 0.8; break;
    case 'shoot': player.actionTimer = 0.8; break;
    case 'dribble': player.actionTimer = 0.4; break;
    case 'tackle': player.actionTimer = 1.0; break;
    case 'press': player.actionTimer = 0.3; break;
    case 'contain': player.actionTimer = 0.3; break;
    case 'intercept': player.actionTimer = 0.4; break;
    case 'chase': player.actionTimer = 0.2; break;
    default: player.actionTimer = 0.2; break;
  }
  
  // Set target if needed
  if (decision.target) {
    player.targetPosition = decision.target;
  }
};

const movePlayer = (player: SimPlayer, dt: number) => {
  // Only move if action requires movement
  if (player.currentAction === 'pass_short' || player.currentAction === 'pass_long' || player.currentAction === 'shoot' || player.currentAction === 'hold') {
    return;
  }

  // Simple linear interpolation for now, but guided by attributes (Pace/Accel)
  const dx = player.targetPosition.x - player.position.x;
  const dy = player.targetPosition.y - player.position.y;
  const dist = Math.hypot(dx, dy);
  
  if (dist > 0.1) {
    let speed = (player.attributes.pace / 20) * 10; // Max 10m/s
    
    // Dribbling is slower
    if (player.currentAction === 'dribble') {
      speed *= 0.8;
    }
    
    const moveDist = Math.min(dist, speed * dt);
    const ratio = moveDist / dist;
    
    player.position.x += dx * ratio;
    player.position.y += dy * ratio;
    
    // Clamp to pitch
    player.position.x = Math.max(0, Math.min(PITCH_WIDTH, player.position.x));
    player.position.y = Math.max(0, Math.min(PITCH_HEIGHT, player.position.y));
  }
};

const resetKickoff = (state: SimMatchState, teamToKick: TeamId) => {
  state.ball.position = { x: PITCH_WIDTH / 2, y: PITCH_HEIGHT / 2 };
  state.ball.velocity = { x: 0, y: 0 };
  state.ball.ownerId = null;
  state.ball.isLoose = true;
  
  // Reset players to formation
  state.players.forEach(p => {
    p.position = { ...p.basePosition };
    p.targetPosition = { ...p.basePosition };
    p.velocity = { x: 0, y: 0 };
    p.currentAction = 'idle';
  });
  
  state.context.phase = 'kickoff';

  // Give ball to a player from the kicking team (e.g., a striker)
  const kicker = state.players.find(p => p.team === teamToKick && (p.role === 'ST' || p.role === 'MC'));
  if (kicker) {
    state.ball.ownerId = kicker.id;
    state.ball.position = { ...kicker.position };
    state.ball.isLoose = false;
    kicker.currentAction = 'dribble';
  }
};

const resolveBall = (state: SimMatchState, dt: number) => {
  const { ball } = state;

  // If owner, ball moves with player
  if (ball.ownerId) {
    const owner = state.players.find(p => p.id === ball.ownerId);
    if (owner) {
      ball.position.x = owner.position.x;
      ball.position.y = owner.position.y;
      ball.velocity = { x: 0, y: 0 };
      
      // Execute action if timer up
      if (owner.actionTimer <= 0) {
         if ((owner.currentAction === 'pass_short' || owner.currentAction === 'pass_long') && owner.targetPosition) {
            // Calculate success
            ball.ownerId = null;
            ball.isLoose = true;
            ball.lastOwnerId = owner.id;
            
            // Calculate velocity to target
            const dx = owner.targetPosition.x - ball.position.x;
            const dy = owner.targetPosition.y - ball.position.y;
            const dist = Math.hypot(dx, dy);
            
            let speed = 10 + (owner.attributes.passing / 2); // Base speed 10-20 m/s
            if (owner.currentAction === 'pass_long') speed *= 1.4;

            // Add error based on technique/vision
            const error = (20 - owner.attributes.technique) * 0.02; // 0-0.4 radians error
            const angle = Math.atan2(dy, dx) + (Math.random() * error - error/2);

            ball.velocity.x = Math.cos(angle) * speed;
            ball.velocity.y = Math.sin(angle) * speed;
            
            owner.currentAction = 'idle';
            owner.stats.passesAttempted++;
            state.context.stats[owner.team].passes++;
            state.logs.unshift({
              time: state.context.time,
              message: `${owner.name} passes`,
              type: 'info'
            });
         } else if (owner.currentAction === 'shoot' && owner.targetPosition) {
            ball.ownerId = null;
            ball.isLoose = true;
            ball.lastOwnerId = owner.id;
            
            const dx = owner.targetPosition.x - ball.position.x;
            const dy = owner.targetPosition.y - ball.position.y;
            const dist = Math.hypot(dx, dy);
            const speed = 20 + (owner.attributes.strength / 2); // Shot power 20-30 m/s
            
            // Add error based on finishing/composure
            const error = (20 - owner.attributes.finishing) * 0.03; // 0-0.6 radians error
            const angle = Math.atan2(dy, dx) + (Math.random() * error - error/2);
            
            ball.velocity.x = Math.cos(angle) * speed;
            ball.velocity.y = Math.sin(angle) * speed;
            
            owner.currentAction = 'idle';
            owner.stats.shots++;
            state.context.stats[owner.team].shots++;
            state.logs.unshift({
              time: state.context.time,
              message: `${owner.name} shoots!`,
              type: 'chance'
            });
         } else if (owner.currentAction === 'dribble' && owner.targetPosition) {
            // Dribbling is handled by movement, ball stays with owner
            // Maybe check for tackle here?
         }
      }
    }
  } else {
    // Loose ball physics (simple friction)
    ball.position.x += ball.velocity.x * dt;
    ball.position.y += ball.velocity.y * dt;
    ball.velocity.x *= 0.95;
    ball.velocity.y *= 0.95;
    
    // Check for out of bounds
    if (ball.position.x < 0 || ball.position.x > PITCH_WIDTH || ball.position.y < 0 || ball.position.y > PITCH_HEIGHT) {
      // Goal check
      if (ball.position.y > (PITCH_HEIGHT - 7.32) / 2 && ball.position.y < (PITCH_HEIGHT + 7.32) / 2) {
        if (ball.position.x < 0) {
          // Away Goal!
          state.context.score.away++;
          state.context.phase = 'goal';
          state.context.phaseTimer = 3.0; // 3 seconds celebration
          state.context.lastScorer = 'away';
          state.logs.unshift({ time: state.context.time, message: 'GOAL FOR AWAY TEAM!', type: 'goal' });
          return;
        } else if (ball.position.x > PITCH_WIDTH) {
          // Home Goal!
          state.context.score.home++;
          state.context.phase = 'goal';
          state.context.phaseTimer = 3.0; // 3 seconds celebration
          state.context.lastScorer = 'home';
          state.logs.unshift({ time: state.context.time, message: 'GOAL FOR HOME TEAM!', type: 'goal' });
          return;
        }
      }
      
      // Simple bounce/clamp for now
      ball.position.x = Math.max(0, Math.min(PITCH_WIDTH, ball.position.x));
      ball.position.y = Math.max(0, Math.min(PITCH_HEIGHT, ball.position.y));
      ball.velocity.x *= -0.5;
      ball.velocity.y *= -0.5;
    }

    // Check for new owner (Interception/Reception)
    let bestCandidate: SimPlayer | null = null;
    let bestDist = 2.0; // Reception radius

    state.players.forEach(p => {
      const d = Math.hypot(p.position.x - ball.position.x, p.position.y - ball.position.y);
      if (d < bestDist) {
        // Check if can control
        // If ball is fast, need high first touch
        const ballSpeed = Math.hypot(ball.velocity.x, ball.velocity.y);
        const difficulty = ballSpeed * 2;
        const roll = Math.random() * 100 + p.attributes.firstTouch;
        
        if (roll > difficulty) {
           bestDist = d;
           bestCandidate = p;
        }
      }
    });

    if (bestCandidate) {
      ball.ownerId = (bestCandidate as SimPlayer).id;
      ball.isLoose = false;
      (bestCandidate as SimPlayer).currentAction = 'dribble';
      // If intercepted from opponent
      if (ball.lastOwnerId) {
         const lastOwner = state.players.find(p => p.id === ball.lastOwnerId);
         if (lastOwner && lastOwner.team !== (bestCandidate as SimPlayer).team) {
            (bestCandidate as SimPlayer).stats.interceptions++;
            state.logs.unshift({
              time: state.context.time,
              message: `${(bestCandidate as SimPlayer).name} intercepts!`,
              type: 'info'
            });
         } else if (lastOwner && lastOwner.team === (bestCandidate as SimPlayer).team) {
            // Pass completed
            lastOwner.stats.passesCompleted++;
            state.context.stats[lastOwner.team].passesCompleted++;
         }
      }
    }
  }
};
