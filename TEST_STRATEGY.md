# Glider Gauntlet — Test Strategy

All tests use **Vitest**. Game logic is separated from Phaser rendering so pure logic can be unit tested without a browser or canvas.

---

## Principles

1. **Extract pure logic** — scoring, collision math, config parsing, state machines — into plain TS functions/classes that don't depend on Phaser. These get fast unit tests.
2. **Integration tests** use a lightweight Phaser headless setup (or mocked scene) for game state transitions.
3. **Manual playtesting** covers visuals, feel, audio sync, and mobile controls — these are not automated.
4. **Use real fixture data** — level configs, score snapshots, saved game state — not synthetic mocks where avoidable.

---

## Module Test Plan

### `src/utils/score.ts` — Score Calculation

| Test | Description |
|------|-------------|
| Base distance scoring | 1 point per 100px, fractional px rounds down |
| Time bonus at par | Exactly par time → 500 bonus |
| Time bonus decay | Each second over par → −10, minimum 0 |
| Life bonus | 200 × remaining lives |
| Power-up bonus | 50 × collected power-ups |
| Total score | Sum of all components with real level fixture |
| Edge: zero lives | Life bonus is 0, not negative |
| Edge: very slow run | Time bonus floors at 0 |

### `src/utils/storage.ts` — localStorage Wrapper

| Test | Description |
|------|-------------|
| Save and load scores | Round-trip top-10 list for a level |
| Score insertion order | New score inserts in correct rank position |
| Top-10 cap | 11th score is dropped |
| Level progression | Unlock state saves and loads correctly |
| Corrupt data | Gracefully handle malformed JSON (reset to defaults) |
| Missing data | First-time load returns empty/default state |

### `src/config/levels.ts` — Level Definitions

| Test | Description |
|------|-------------|
| Schema validation | Each level config has required fields (scrollSpeed, obstacles, checkpoints, parTime) |
| Difficulty scaling | Level N+1 has ≥10% higher scroll speed than level N |
| Obstacle density | Level N+1 has ≥15% more obstacles than level N |
| Checkpoint count | Each level has 2–3 checkpoints |
| Obstacle types | Level 1 uses only StaticLaser + SwingingBall; later levels introduce new types |

### `src/objects/Player.ts` — Player Controller

| Test | Description |
|------|-------------|
| Acceleration model | Velocity increases toward max speed over time (unit test the math) |
| Deceleration | Velocity decays to 0 when no input |
| Viewport clamping | Position is constrained within viewport bounds |
| Invulnerability timer | After hit, player is invulnerable for exactly 1s |
| Lives decrement | Taking damage reduces lives by 1 |
| Lives floor | Lives never go below 0 |
| Max lives cap | ExtraLife power-up does not exceed 5 |

### `src/objects/Obstacle.ts` (and subclasses) — Obstacles

| Test | Description |
|------|-------------|
| StaticLaser | Collision body matches visual position |
| PulsingLaser cycle | On for 1.5s, off for 1.5s, repeating (test state at t=0, 1.5, 3.0) |
| SwingingBall angle | Position follows pendulum equation at given timestamps |
| MovingWall bounds | Oscillation stays within defined min/max Y |
| PulsingZone radius | Expands and contracts within defined range |
| Collision tolerance | Bounding box has 2px tolerance (not pixel-perfect) |

### `src/objects/PowerUp.ts` — Power-Ups

| Test | Description |
|------|-------------|
| Shield duration | Active for exactly 5s, then deactivates |
| Shield absorb | Absorbs 1 hit without losing a life, then deactivates |
| ExtraLife | Adds 1 life, respects max of 5 |
| SlowMotion | Returns 0.5× scroll speed multiplier for 3s, then 1.0× |
| Stacking | Picking up same power-up while active resets timer |
| Spawn positions | Power-ups only spawn at positions defined in level config |

### `src/objects/Checkpoint.ts` — Checkpoints

| Test | Description |
|------|-------------|
| Activation | Passing through sets checkpoint as active respawn point |
| Respawn position | After hit, player respawns at last activated checkpoint position |
| Sequential activation | Activating checkpoint 2 supersedes checkpoint 1 |
| Game Over reset | All checkpoints deactivate on Game Over |
| Re-entry | Passing through an already-activated checkpoint does nothing |

### `src/audio/AudioManager.ts` — Audio Manager

| Test | Description |
|------|-------------|
| Volume persistence | Music and SFX volume levels save/load from localStorage |
| Mute toggle | Muting stops all audio; unmuting restores previous volumes |
| Music crossfade | Transitioning scenes triggers crossfade (test state machine, not audio output) |
| SFX registry | All expected SFX keys are registered and mapped |

### `src/scenes/` — Scene Transitions (Integration)

| Test | Description |
|------|-------------|
| Boot → MainMenu | After loading completes, MainMenu scene starts |
| MainMenu → LevelSelect | "Start Game" transitions to LevelSelect |
| LevelSelect → Game | Selecting an unlocked level starts Game scene with correct level config |
| Game → GameOver | 0 lives triggers GameOver scene with correct score |
| GameOver → Game | "Retry" restarts the same level |
| GameOver → LevelSelect | "Menu" returns to LevelSelect |
| Game → LevelComplete | Reaching level end shows score breakdown, unlocks next level |
| Locked level | Selecting a locked level does nothing |

### HUD (`src/objects/HUD.ts`)

| Test | Description |
|------|-------------|
| Lives display | Heart count matches player lives (test at 3, 2, 1, 0) |
| Score display | Score text updates on score change |
| Power-up indicator | Shows correct icon and countdown when power-up is active |
| Power-up clear | Indicator disappears when power-up expires |

---

## What Is NOT Automatically Tested

These are verified through manual playtesting:

- Visual quality (sprite art, glow effects, particle feel)
- Audio sync and feel (music energy, SFX timing)
- Touch control responsiveness and joystick feel
- Frame rate stability under load (profiled with browser devtools)
- Mobile orientation lock behavior
- Parallax scrolling visual quality
- Overall game feel and difficulty balance
