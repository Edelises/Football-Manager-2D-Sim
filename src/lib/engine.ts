import { Ball, MatchState, PITCH_HEIGHT, PITCH_WIDTH, GOAL_WIDTH, Player, PlayerRole, TeamId, Vector2, BALL_FRICTION, PLAYER_MAX_SPEED, MatchLog, TeamTactics, PlayerStats } from './types';

// --- MATH HELPERS ---
export const dist = (a: Vector2, b: Vector2) => Math.hypot(a.x - b.x, a.y - b.y);
export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

// --- DATA ---
const NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const getRandomName = () => NAMES[Math.floor(Math.random() * NAMES.length)];

// Generate realistic stats based on role
const generateStats = (role: PlayerRole): PlayerStats => {
  const base = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  const stats: PlayerStats = {
    speed: base(60, 90),
    acceleration: base(60, 90),
    stamina: base(70, 95),
    finishing: base(40, 80),
    passing: base(50, 85),
    dribbling: base(50, 85),
    tackling: base(30, 80),
    control: base(50, 90),
    positioning: base(50, 90),
    vision: base(50, 90),
    aggression: base(40, 80),
    composure: base(50, 90)
  };

  return stats;
};

// --- FORMATIONS ---
const FORMATIONS: Record<string, { role: PlayerRole, x: number, y: number }[]> = {
  '4-4-2': [
    { role: 'GK', x: 5, y: 50 },
    { role: 'LB', x: 25, y: 15 }, { role: 'CB', x: 20, y: 38 }, { role: 'CB', x: 20, y: 62 }, { role: 'RB', x: 25, y: 85 },
    { role: 'LW', x: 50, y: 10 }, { role: 'CM', x: 45, y: 38 }, { role: 'CM', x: 45, y: 62 }, { role: 'RW', x: 50, y: 90 },
    { role: 'ST', x: 75, y: 35 }, { role: 'ST', x: 75, y: 65 }
  ],
  '4-3-3': [
    { role: 'GK', x: 5, y: 50 },
    { role: 'LB', x: 25, y: 15 }, { role: 'CB', x: 20, y: 38 }, { role: 'CB', x: 20, y: 62 }, { role: 'RB', x: 25, y: 85 },
    { role: 'CDM', x: 40, y: 50 },
    { role: 'CM', x: 50, y: 30 }, { role: 'CM', x: 50, y: 70 },
    { role: 'LW', x: 75, y: 15 }, { role: 'ST', x: 80, y: 50 }, { role: 'RW', x: 75, y: 85 }
  ]
};

const getFormationPositions = (team: TeamId, formationName: string): { role: PlayerRole, relPos: Vector2 }[] => {
  const template = FORMATIONS[formationName] || FORMATIONS['4-4-2'];
  
  return template.map(p => ({
    role: p.role,
    relPos: {
      x: team === 'home' ? (p.x / 100) * PITCH_WIDTH : PITCH_WIDTH - ((p.x / 100) * PITCH_WIDTH),
      y: (p.y / 100) * PITCH_HEIGHT
    }
  }));
};

export const createInitialState = (): MatchState => {
  const players: Player[] = [];
  let idCounter = 1;

  const setupTeam = (team: TeamId, formation: string) => {
    const positions = getFormationPositions(team, formation);
    positions.forEach((pos, idx) => {
      players.push({
        id: idCounter++,
        team,
        role: pos.role,
        name: getRandomName(),
        position: { ...pos.relPos },
        velocity: { x: 0, y: 0 },
        targetPosition: null,
        state: 'idle',
        number: idx + 1,
        stats: generateStats(pos.role),
        currentStamina: 100,
        cooldown: 0,
        matchRating: 6.0,
        events: {
          goals: 0,
          assists: 0,
          tackles: 0,
          passes: 0,
          saves: 0
        }
      });
    });
  };

  setupTeam('home', '4-3-3');
  setupTeam('away', '4-4-2');

  return {
    players,
    ball: {
      position: { x: PITCH_WIDTH / 2, y: PITCH_HEIGHT / 2 },
      velocity: { x: 0, y: 0 },
      ownerId: null,
      height: 0,
      isLoose: true,
      lastOwnerId: null
    },
    score: { home: 0, away: 0 },
    time: 0,
    isPlaying: false,
    phase: 'kickoff',
    pitchSize: { width: PITCH_WIDTH, height: PITCH_HEIGHT },
    lastTouchTeam: null,
    logs: [{ time: 0, message: 'Match Ready', type: 'info' }],
    events: [],
    homeTactics: { formation: '4-3-3', mentality: 'attacking', width: 'wide', pressing: 'high', defensiveLine: 'high' },
    awayTactics: { formation: '4-4-2', mentality: 'balanced', width: 'normal', pressing: 'mid', defensiveLine: 'mid' },
    deadlockTimer: 0,
    stats: {
      home: { possession: 50, shots: 0, shotsOnTarget: 0, passes: 0, passesCompleted: 0, tackles: 0, fouls: 0, corners: 0 },
      away: { possession: 50, shots: 0, shotsOnTarget: 0, passes: 0, passesCompleted: 0, tackles: 0, fouls: 0, corners: 0 }
    }
  };
};

// --- AI LOGIC ---

export interface AIAction {
  type: 'move' | 'dribble' | 'pass' | 'shoot' | 'tackle' | 'idle';
  target?: Vector2;
  power?: number; // 0-1
}

export const getAIAction = (player: Player, state: MatchState): AIAction => {
  const { ball } = state;
  const distToBall = dist(player.position, ball.position);
  const isHome = player.team === 'home';
  const goalX = isHome ? PITCH_WIDTH : 0;
  const ownGoalX = isHome ? 0 : PITCH_WIDTH;
  const ownGoal = { x: ownGoalX, y: PITCH_HEIGHT / 2 };
  
  // 1. HAS BALL
  if (ball.ownerId === player.id) {
    // Check for shot
    const distToGoal = dist(player.position, { x: goalX, y: PITCH_HEIGHT/2 });
    if (distToGoal < 25) {
      if (Math.random() > 0.98) { // 2% chance per frame
        const targetY = (PITCH_HEIGHT/2) + (Math.random() - 0.5) * (GOAL_WIDTH * 0.8);
        return { type: 'shoot', target: { x: goalX, y: targetY }, power: 0.8 + (Math.random() * 0.2) };
      }
    }

    // Check for pass
    if (Math.random() > 0.95) { // 5% chance per frame
      const teammate = findBestPassCandidate(player, state);
      if (teammate) {
        return { type: 'pass', target: teammate.position, power: 0.6 + (Math.random() * 0.3) };
      }
    }

    // Dribble towards goal
    return { type: 'dribble', target: { x: goalX, y: PITCH_HEIGHT/2 } };
  }

  // 2. BALL IS FREE (CHASE)
  if (ball.ownerId === null) {
    if (player.role === 'GK') {
      if (dist(ball.position, ownGoal) < 15) {
        return { type: 'move', target: ball.position };
      }
    } else if (distToBall < 20) {
       return { type: 'move', target: ball.position };
    }
  }

  // 3. DEFENDING
  const owner = state.players.find(p => p.id === ball.ownerId);
  if (owner && owner.team !== player.team) {
    if (player.role === 'GK') {
      const dx = ball.position.x - ownGoal.x;
      const dy = ball.position.y - ownGoal.y;
      const angle = Math.atan2(dy, dx);
      const gkDist = clamp(dist(ball.position, ownGoal) * 0.1, 1, 4);
      return { type: 'move', target: { x: ownGoal.x + Math.cos(angle) * gkDist, y: ownGoal.y + Math.sin(angle) * gkDist } };
    }

    if (distToBall < 12) {
      return { type: 'move', target: ball.position }; // Press
    }
    // Fall back
    return { type: 'move', target: { x: (player.position.x + ownGoal.x)/2, y: (player.position.y + ball.position.y)/2 } };
  }

  // 4. SUPPORT
  if (owner && owner.team === player.team) {
    if (player.role === 'GK') {
      return { type: 'move', target: { x: ownGoal.x + (isHome ? 5 : -5), y: PITCH_HEIGHT/2 } };
    }
    // Move forward
    const offsetX = isHome ? 15 : -15;
    return { type: 'move', target: { x: ball.position.x + offsetX, y: player.position.y } };
  }

  // 5. IDLE / FORMATION
  const formPos = getFormationPositions(player.team, isHome ? state.homeTactics.formation : state.awayTactics.formation)
    .find(p => p.role === player.role);
  
  if (formPos) {
    if (player.role === 'GK') {
      return { type: 'move', target: { x: formPos.relPos.x, y: formPos.relPos.y } };
    }
    // Shift with ball
    const ballX = state.ball.position.x;
    const shift = (ballX - (PITCH_WIDTH/2)) * 0.4;
    return { type: 'move', target: { x: formPos.relPos.x + shift, y: formPos.relPos.y } };
  }

  return { type: 'idle' };
};

const findBestPassCandidate = (player: Player, state: MatchState): Player | null => {
  const isHome = player.team === 'home';
  let bestCand: Player | null = null;
  let bestScore = -Infinity;

  state.players.forEach(p => {
    if (p.team !== player.team || p.id === player.id) return;
    
    const d = dist(player.position, p.position);
    if (d > 40 || d < 5) return;

    const forwardProgress = isHome ? (p.position.x - player.position.x) : (player.position.x - p.position.x);
    const score = forwardProgress;
    
    if (score > bestScore) {
      bestScore = score;
      bestCand = p;
    }
  });

  return bestCand;
};

// --- GAME LOOP LOGIC ---

export const updateMatch = (state: MatchState, dt: number): MatchState => {
  const newState = { ...state };
  newState.time += dt;

  // 1. AI & Game Logic (Decisions, Rules, Scoring)
  updateGameLogic(newState, dt);

  // 2. Physics (Movement & Actions)
  updatePhysics(newState, dt);

  return newState;
};

export const updateGameLogic = (state: MatchState, dt: number) => {
  // Players Decide
  state.players.forEach(player => {
    if (player.cooldown > 0) player.cooldown -= dt;
    
    // Check Goals / Out of Bounds (Rules)
    checkBoundaries(state);
    
    // Deadlock (Rules)
    resolveDeadlock(state, dt);
    
    // Stamina (Logic)
    updateStamina(player, dt);
  });

  // Possession Stats
  if (state.ball.ownerId) {
    const owner = state.players.find(p => p.id === state.ball.ownerId);
    if (owner) {
      state.stats[owner.team].possession += dt;
    }
  } else if (state.lastTouchTeam) {
    state.stats[state.lastTouchTeam].possession += dt;
  }
};

export const updatePhysics = (state: MatchState, dt: number) => {
  // Player Movement & Actions
  state.players.forEach(player => {
    const action = getAIAction(player, state); 
    executeAction(player, action, state, dt);
  });

  // Ball Physics
  playBallPhysics(state, dt);
};

const executeAction = (player: Player, action: AIAction, state: MatchState, dt: number) => {
  // Movement
  if (action.target) {
    const dx = action.target.x - player.position.x;
    const dy = action.target.y - player.position.y;
    const distToTarget = Math.hypot(dx, dy);

    if (distToTarget > 0.5) {
      const maxSpeed = (player.stats.speed / 100) * PLAYER_MAX_SPEED;
      let targetSpeed = maxSpeed;

      // State modifiers
      if (player.state === 'sprinting' || player.state === 'moving') targetSpeed *= 1.1; 
      if (action.type === 'dribble') targetSpeed *= 0.85;

      const dirX = dx / distToTarget;
      const dirY = dy / distToTarget;

      // Acceleration
      const accel = (player.stats.acceleration / 100) * 20; // m/s^2
      const targetVx = dirX * targetSpeed;
      const targetVy = dirY * targetSpeed;

      const lerpFactor = clamp(accel * dt, 0, 1);
      player.velocity.x += (targetVx - player.velocity.x) * lerpFactor;
      player.velocity.y += (targetVy - player.velocity.y) * lerpFactor;

      player.position.x += player.velocity.x * dt;
      player.position.y += player.velocity.y * dt;
    } else {
      player.velocity.x *= 0.8;
      player.velocity.y *= 0.8;
    }
  } else {
    player.velocity.x *= 0.9;
    player.velocity.y *= 0.9;
  }

  // Kicking / Actions
  if (state.ball.ownerId === player.id && player.cooldown <= 0) {
    if (action.type === 'pass' || action.type === 'shoot') {
      kickBall(player, action, state);
    }
  }
};

const kickBall = (player: Player, action: AIAction, state: MatchState) => {
  if (!action.target) return;

  const dx = action.target.x - player.position.x;
  const dy = action.target.y - player.position.y;
  const distToTarget = Math.hypot(dx, dy);
  
  const dirX = dx / distToTarget;
  const dirY = dy / distToTarget;

  const power = action.power || 0.5;
  const speed = power * 30; // Max kick speed 30m/s

  // Error / Accuracy
  const isShot = action.type === 'shoot';
  const stat = isShot ? player.stats.finishing : player.stats.passing;
  const error = (100 - stat) / (isShot ? 150 : 500);
  const angleError = (Math.random() - 0.5) * error;
  
  const finalDirX = dirX * Math.cos(angleError) - dirY * Math.sin(angleError);
  const finalDirY = dirX * Math.sin(angleError) + dirY * Math.cos(angleError);

  state.ball.velocity.x = finalDirX * speed;
  state.ball.velocity.y = finalDirY * speed;
  state.ball.ownerId = null;
  state.ball.lastOwnerId = player.id;
  state.ball.isLoose = true;
  state.ball.height = power * 2; // Loft
  
  player.cooldown = 0.5;
  player.state = action.type === 'shoot' ? 'shooting' : 'passing';

  // Stats
  if (action.type === 'pass') {
    state.stats[player.team].passes++;
    player.events.passes++;
  } else if (action.type === 'shoot') {
    state.stats[player.team].shots++;
    // Check if on target (simple check)
    const goalY1 = (PITCH_HEIGHT - GOAL_WIDTH)/2;
    const goalY2 = (PITCH_HEIGHT + GOAL_WIDTH)/2;
    // Raycast to goal line
    // Simple approximation: if target was goal, count as on target
    if (action.target.x === 0 || action.target.x === PITCH_WIDTH) {
       state.stats[player.team].shotsOnTarget++;
    }
  }
};

const updateStamina = (player: Player, dt: number) => {
  if (player.state === 'sprinting' || player.state === 'tackling') { // chasing/pressing?
    player.currentStamina -= 2 * dt;
  } else if (player.state === 'idle') {
    player.currentStamina += 1 * dt;
  }
  player.currentStamina = clamp(player.currentStamina, 0, 100);
};

const playBallPhysics = (state: MatchState, dt: number) => {
  const { ball } = state;

  if (ball.ownerId === null) {
    // Physics
    const drag = 0.5 * dt;
    ball.velocity.x -= ball.velocity.x * drag;
    ball.velocity.y -= ball.velocity.y * drag;

    if (ball.height <= 0.1) {
      // Apply friction based on dt (assuming 60fps baseline)
      const friction = Math.pow(BALL_FRICTION, dt * 60);
      ball.velocity.x *= friction;
      ball.velocity.y *= friction;
    }

    if (ball.height > 0) {
      ball.height -= 9.81 * dt;
      if (ball.height < 0) {
        ball.height = 0;
        if (Math.hypot(ball.velocity.x, ball.velocity.y) > 2) {
           ball.height = Math.hypot(ball.velocity.x, ball.velocity.y) * 0.1;
        }
      }
    }

    if (Math.hypot(ball.velocity.x, ball.velocity.y) < 0.1 && ball.height <= 0) {
      ball.velocity.x = 0;
      ball.velocity.y = 0;
      ball.isLoose = false;
    }

    ball.position.x += ball.velocity.x * dt;
    ball.position.y += ball.velocity.y * dt;

    checkBallClaims(state);

  } else {
    // Ball follows owner
    const owner = state.players.find(p => p.id === ball.ownerId);
    if (owner) {
      ball.isLoose = false;
      ball.height = 0;
      ball.lastOwnerId = owner.id;
      
      const angle = Math.atan2(owner.velocity.y, owner.velocity.x);
      const speed = Math.hypot(owner.velocity.x, owner.velocity.y);
      const dribbleDist = 0.5 + (speed * 0.2);
      
      ball.position.x = owner.position.x + Math.cos(angle) * dribbleDist;
      ball.position.y = owner.position.y + Math.sin(angle) * dribbleDist;
      ball.velocity = { ...owner.velocity };
    } else {
      ball.ownerId = null;
    }
  }
};

const checkBallClaims = (state: MatchState) => {
  const { ball } = state;
  let bestClaimant: Player | null = null;
  let minDist = 100;

  state.players.forEach(p => {
    const reach = p.role === 'GK' ? 3.0 : 1.5;
    const d = dist(p.position, ball.position);
    if (d < reach) { // Reachable
      // Check control stat vs ball speed
      const ballSpeed = Math.hypot(ball.velocity.x, ball.velocity.y);
      const difficulty = ballSpeed * 2.5;
      
      // Bonus for current owner to keep it
      const ownerBonus = (ball.ownerId === p.id) ? 50 : 0;
      const gkBonus = p.role === 'GK' ? 30 : 0;
      
      const roll = Math.random() * 100 + p.stats.control + ownerBonus + gkBonus;
      
      if (roll > difficulty) {
        if (d < minDist) {
          minDist = d;
          bestClaimant = p;
        }
      } else {
        // Bad touch or save
        if (d < reach && p.cooldown <= 0 && ball.ownerId !== p.id) {
           if (p.role === 'GK') {
             ball.velocity.x = (Math.random() - 0.5) * 15;
             ball.velocity.y = (Math.random() - 0.5) * 15;
             p.events.saves++;
           } else {
             ball.velocity.x += (Math.random() - 0.5) * 5;
             ball.velocity.y += (Math.random() - 0.5) * 5;
           }
           p.cooldown = 0.5;
        }
      }
    }
  });

  if (bestClaimant && (bestClaimant as Player).id !== ball.ownerId) {
    const claimant = bestClaimant as Player;
    const prevOwnerId = ball.ownerId || ball.lastOwnerId;
    const prevOwner = prevOwnerId ? state.players.find(p => p.id === prevOwnerId) : null;

    if (prevOwner && prevOwner.id !== claimant.id) {
       if (prevOwner.team === claimant.team) {
           // Pass Completed (only if ball was loose, otherwise it's a handoff)
           if (ball.ownerId === null) {
              state.stats[prevOwner.team].passesCompleted++;
           }
       } else {
           // Tackle / Interception / Save
           if (claimant.role === 'GK') {
               claimant.events.saves++;
           } else {
               claimant.events.tackles++;
               state.stats[claimant.team].tackles++;
           }
       }
    }

    ball.ownerId = claimant.id;
    state.lastTouchTeam = claimant.team;
    claimant.state = 'dribbling';
    state.deadlockTimer = 0;
  }
};

const resolveDeadlock = (state: MatchState, dt: number) => {
  if (state.ball.ownerId === null && Math.hypot(state.ball.velocity.x, state.ball.velocity.y) < 0.5) {
    state.deadlockTimer += dt;
  } else {
    state.deadlockTimer = 0;
  }

  if (state.deadlockTimer > 3.0) {
    // Force nearest player to chase
    let nearest: Player | null = null;
    let minDist = 1000;
    state.players.forEach(p => {
      const d = dist(p.position, state.ball.position);
      if (d < minDist) {
        minDist = d;
        nearest = p;
      }
    });

    if (nearest) {
      (nearest as Player).targetPosition = state.ball.position;
      (nearest as Player).state = 'moving'; // was chasing
    }
  }
};

const checkBoundaries = (state: MatchState) => {
  const { ball } = state;
  
  // GOAL CHECK
  if (ball.position.x < 0 || ball.position.x > PITCH_WIDTH) {
    if (ball.position.y > (PITCH_HEIGHT - GOAL_WIDTH)/2 && ball.position.y < (PITCH_HEIGHT + GOAL_WIDTH)/2) {
      // GOAL!
      const scoringTeam = ball.position.x > PITCH_WIDTH ? 'home' : 'away';
      if (scoringTeam === 'home') state.score.home++;
      else state.score.away++;
      
      state.phase = 'goal';
      state.isPlaying = false;
      
      // Log Goal
      let scorer = state.players.find(p => p.id === ball.lastOwnerId);
      if (!scorer || scorer.team !== scoringTeam) {
        // Own goal or unknown? For now assume last touch was scorer if same team
        // If last touch was opponent, it's an own goal (or we just credit nearest attacker)
        // Let's keep it simple: Last owner of scoring team gets credit
        scorer = state.players.find(p => p.team === scoringTeam && p.state === 'shooting'); 
      }

      const scorerName = scorer ? scorer.name : 'Unknown';
      
      if (scorer) {
        scorer.events.goals++;
        state.events.push({ time: state.time, type: 'goal', team: scoringTeam, playerId: scorer.id });
      }

      state.logs.unshift({
        time: state.time,
        message: `GOAL! ${scoringTeam.toUpperCase()} scores! (${scorerName})`,
        type: 'goal'
      });

      resetPositions(state);
      return;
    }
  }

  // OUT OF BOUNDS
  if (ball.position.y < 0 || ball.position.y > PITCH_HEIGHT) {
    // Throw In
    ball.velocity = { x: 0, y: 0 };
    ball.position.y = clamp(ball.position.y, 0.2, PITCH_HEIGHT - 0.2);
    ball.ownerId = null;
    ball.isLoose = true;
    
    const isHomeThrow = state.lastTouchTeam === 'away';
    state.logs.unshift({ 
      time: state.time, 
      message: `Throw In (${isHomeThrow ? 'Home' : 'Away'})`, 
      type: 'info' 
    });
    
    // Teleport nearest taker?
    // For now, let them chase.
  }

  if (ball.position.x < 0 || ball.position.x > PITCH_WIDTH) {
    // Goal Line
    ball.velocity = { x: 0, y: 0 };
    ball.ownerId = null;
    ball.isLoose = true;

    const isRightEnd = ball.position.x > PITCH_WIDTH;
    const lastTouchHome = state.lastTouchTeam === 'home';
    
    // Determine Corner vs Goal Kick
    if (isRightEnd) {
      // Ball went out right side (Home Goal is right? No, Home Goal is usually left/right depending on side)
      // In engine.ts: 
      // Home Goal is at x=PITCH_WIDTH? 
      // checkBoundaries says: if (ball.position.x > PITCH_WIDTH) ... scoringTeam = 'home'
      // So Home attacks Right?
      // Wait. 
      // if (ball.position.x > PITCH_WIDTH) -> Home Scores.
      // So Home attacks Right (Positive X).
      // Away attacks Left (Negative X).
      
      if (lastTouchHome) {
        // Home touched last and went out their attacking end -> Goal Kick for Away
        state.logs.unshift({ time: state.time, message: 'Goal Kick (Away)', type: 'info' });
        ball.position = { x: PITCH_WIDTH - 5, y: PITCH_HEIGHT / 2 }; // GK spot
        // Teleport Away GK
        const gk = state.players.find(p => p.team === 'away' && p.role === 'GK');
        if (gk) {
           gk.position = { ...ball.position };
           gk.velocity = { x: 0, y: 0 };
           ball.ownerId = gk.id;
        }
      } else {
        // Away touched last and went out their defending end -> Corner for Home
        state.logs.unshift({ time: state.time, message: 'Corner (Home)', type: 'chance' });
        state.stats.home.corners++;
        ball.position = { x: PITCH_WIDTH - 1, y: ball.position.y > PITCH_HEIGHT/2 ? PITCH_HEIGHT - 1 : 1 };
      }
    } else {
      // Left End (Away attacks here)
      if (!lastTouchHome) {
        // Away touched last and went out their attacking end -> Goal Kick for Home
        state.logs.unshift({ time: state.time, message: 'Goal Kick (Home)', type: 'info' });
        ball.position = { x: 5, y: PITCH_HEIGHT / 2 };
        const gk = state.players.find(p => p.team === 'home' && p.role === 'GK');
        if (gk) {
           gk.position = { ...ball.position };
           gk.velocity = { x: 0, y: 0 };
           ball.ownerId = gk.id;
        }
      } else {
        // Home touched last and went out their defending end -> Corner for Away
        state.logs.unshift({ time: state.time, message: 'Corner (Away)', type: 'chance' });
        state.stats.away.corners++;
        ball.position = { x: 1, y: ball.position.y > PITCH_HEIGHT/2 ? PITCH_HEIGHT - 1 : 1 };
      }
    }
  }
};

const resetPositions = (state: MatchState) => {
  // Reset for kickoff
  const fresh = createInitialState();
  state.players.forEach((p, i) => {
    p.position = fresh.players[i].position;
    p.velocity = { x: 0, y: 0 };
    p.targetPosition = null;
  });
  state.ball.position = { x: PITCH_WIDTH/2, y: PITCH_HEIGHT/2 };
  state.ball.velocity = { x: 0, y: 0 };
  state.ball.ownerId = null;
};
