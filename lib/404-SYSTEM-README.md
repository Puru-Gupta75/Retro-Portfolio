# 404 Interactive System Documentation

## Overview
A fully interactive 404 error page that transforms system failures into discoverable gaming experiences with persistent leaderboards and hidden easter eggs.

## Architecture

```
USER → 404 PAGE
  ↓
RANDOM ERROR DISPLAY
  ↓
TERMINAL ACCESS
  ↓
COMMAND ENGINE → GAMES / SECRETS / NAVIGATION
  ↓
NICKNAME PROMPT → GAMEPLAY → GAME OVER
  ↓
LEADERBOARD SYSTEM (localStorage → Firestore ready)
```

## Core Systems

### 1. Error Generator (`lib/errorGenerator.ts`)
- Generates randomized system errors on each 404 load
- 12 different error types (KERNEL_PANIC, MEMORY_CORRUPTION, etc.)
- Random trace IDs and failure messages
- Creates authentic system anomaly experience

### 2. Command Engine (`lib/commandEngine.ts`)
**Shared across entire application** (system terminal + 404 terminal)

#### Navigation Commands
- `home` - Return to main interface
- `archive` - Access project archive
- `labs` - Enter experimental labs
- `system` - View system diagnostics

#### Game Commands
- `play snake` - Launch Snake game
- `play pong` - Launch Pong game
- `play runner` - Launch Runner game
- `play memory` - Launch Memory Match game
- `leaderboard [game]` - View high scores

#### Utility Commands
- `help` - Display available commands
- `clear` - Clear terminal output
- `fix` - Attempt system repair (404 only)

#### Secret Commands (Hidden)
- `sudo` / `root` - Elevated access attempts
- `unlock` - Unlock sequence
- `hidden_port` - Access hidden labs portal

### 3. Game System

#### Pre-Game Flow
1. User enters `play [game]` command
2. Nickname prompt appears
3. Player enters handle (max 20 chars)
4. Game launches

#### Games

**Snake** (`components/games/SnakeGame.tsx`)
- Grid-based classic snake
- Eat food (*) to grow
- Score = length × 10
- WASD or Arrow keys
- Collision detection (walls + self)

**Pong** (`components/games/PongGame.tsx`)
- Vertical paddle vs AI
- Score = successful hits
- Difficulty increases over time
- W/S or Arrow keys
- Game over when ball passes player paddle

**Runner** (`components/games/RunnerGame.tsx`)
- Auto-scrolling obstacle avoider
- Jump over red obstacles
- Score = obstacles cleared
- Speed increases over time
- SPACE/W/↑ to jump

**Memory Match** (`components/games/MemoryGame.tsx`)
- 16 cards (8 pairs)
- Match symbols A-H
- Score = 1000 - (moves × 10) - time
- Click to flip cards
- Timed completion

#### Post-Game Flow
1. Game over screen displays
2. Check if high score
3. Option to save score
4. Play again or exit to terminal

### 4. Leaderboard System (`lib/leaderboard.ts`)

#### Current Implementation (localStorage)
```typescript
{
  game: "snake",
  scores: [
    { name: "puru", score: 120, timestamp: 1234567890 },
    ...
  ]
}
```

#### Features
- Top 10 scores per game
- Sorted by score (descending)
- Timestamp tracking
- Name length limit (20 chars)
- High score detection

#### Firestore Migration Ready
```typescript
// Future adapter interface included
export interface LeaderboardAdapter {
  getScores: (game: string) => Promise<Score[]>;
  saveScore: (game: string, name: string, score: number) => Promise<boolean>;
}
```

**Migration path**: Swap localStorage functions with Firestore queries - no component refactoring needed.

### 5. Easter Egg System

#### Idle Detection
- After 8 seconds of inactivity
- 70% chance to reveal hidden_port
- Displays in terminal output
- Logs as SECRET event

#### Random Glitch Text
- Triggers every ~10 seconds
- 15% probability
- Displays "... corrupted_signal ..."
- 2-second duration
- Red text overlay

#### Secret Commands
- `sudo` / `root` - Permission denied with hint
- `unlock` - Reveals hidden_port access
- `hidden_port` - Direct navigation to /labs

#### Rare Events (Future)
- System breach detection
- Auto-redirect triggers
- Unlock special modes

### 6. Terminal Engine (`components/EasterEggEngine.tsx`)

#### Features
- Command input with history (↑/↓)
- Tab autocomplete
- Output log with auto-scroll
- Command execution via shared engine
- Game launch integration
- Leaderboard display
- Navigation handling

#### Easter Egg Integration
- Idle timer for hidden port
- Random glitch overlays
- Secret command logging
- Event tracking

### 7. Mobile Optimization

#### Simplified 404 View
- No terminal
- No games
- No easter eggs
- Simple error message
- Single "RETURN HOME" button

#### Detection
Uses `useDeviceType` hook:
- Mobile: < 640px
- Tablet: 640-1024px
- Desktop: > 1024px

## System Integration

### Logging
All actions logged via `systemLogger`:
```typescript
logEvent("404 ERROR → INVALID ROUTE", "ERROR");
logEvent("GAME STARTED → SNAKE", "INFO");
logEvent("COMMAND → help", "ACTION");
logEvent("SECRET_COMMAND → sudo_attempt", "SECRET");
```

### State Management
- Game state: 'terminal' | 'nickname' | 'playing' | 'gameover'
- Player persistence across game sessions
- Score tracking and validation
- Terminal history preservation

## Performance Considerations

### Game Loops
- Uses `requestAnimationFrame` for smooth rendering
- Proper cleanup on unmount
- FPS capping where needed
- No memory leaks

### Terminal
- Output array management
- Auto-scroll optimization
- History limit (implicit via array)
- Debounced resize handlers

### Storage
- localStorage with try-catch
- SSR-safe checks (`typeof window`)
- Graceful fallbacks
- No blocking operations

## Usage Examples

### Basic Navigation
```
> help
> play snake
> leaderboard
> home
```

### Game Session
```
> play pong
[Nickname prompt appears]
> puru
[Game starts]
[Game over]
[Save score? Y/N]
> leaderboard pong
```

### Secret Discovery
```
[Wait 8 seconds]
> hidden_port_detected
> hidden_port
[Redirects to /labs]
```

## Future Enhancements

### Firestore Integration
1. Create Firestore collections: `leaderboards/{game}/scores`
2. Implement LeaderboardAdapter
3. Add real-time score updates
4. Global leaderboards across users

### Additional Games
- Tetris
- Breakout
- Space Invaders
- Maze solver

### Enhanced Easter Eggs
- Konami code detection
- Time-based secrets (midnight access)
- Achievement system
- Unlock progression

### Multiplayer
- Real-time competitive modes
- Ghost racing (replay system)
- Cooperative challenges
- Live tournaments

## File Structure
```
lib/
  ├── errorGenerator.ts      # Random error generation
  ├── commandEngine.ts        # Global command system
  └── leaderboard.ts          # Score persistence

components/
  ├── EasterEggEngine.tsx     # Terminal interface
  ├── NicknamePrompt.tsx      # Pre-game name entry
  ├── GameOverScreen.tsx      # Post-game score save
  └── games/
      ├── SnakeGame.tsx
      ├── PongGame.tsx
      ├── RunnerGame.tsx
      └── MemoryGame.tsx

app/
  └── not-found.tsx           # Main 404 orchestrator
```

## Testing Checklist

- [ ] Random error generation on each reload
- [ ] Terminal command execution
- [ ] Game launch from terminal
- [ ] Nickname prompt before gameplay
- [ ] All 4 games playable
- [ ] Score saving to localStorage
- [ ] Leaderboard display
- [ ] High score detection
- [ ] Easter egg idle trigger
- [ ] Glitch text appearance
- [ ] Secret commands
- [ ] Mobile simplified view
- [ ] Navigation commands
- [ ] Terminal history (↑/↓)
- [ ] Tab autocomplete
- [ ] ESC to exit games
- [ ] System log integration

## Credits
Built as a creative systems layer for portfolio differentiation.
Designed for discovery, not obvious UI.
