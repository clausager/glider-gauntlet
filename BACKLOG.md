# Glider Gauntlet — Feature Backlog

Organized by phase from the PRD. Each task is independently deliverable and testable.

---

## Phase 1: Project Scaffolding

- [ ] **P1-01** Initialize Vite + TypeScript + Phaser 3 project with npm scripts (`dev`, `build`, `preview`)
- [ ] **P1-02** Set up folder structure: `src/scenes/`, `src/objects/`, `src/config/`, `src/utils/`, `src/audio/`, `assets/`
- [ ] **P1-03** Create Phaser Game config (1280×720, Arcade physics, Canvas/WebGL auto-detect)
- [ ] **P1-04** Create Boot scene with loading bar (preloads all assets)
- [ ] **P1-05** Create MainMenu scene with "Start Game" button and settings access
- [ ] **P1-06** Set up Vitest with a sample test to confirm the test pipeline works

## Phase 2: Core Mechanics

### Player

- [ ] **P2-01** Create Player class (`Phaser.Physics.Arcade.Sprite`) with 2D movement (WASD + arrow keys)
- [ ] **P2-02** Implement smooth acceleration/deceleration with configurable physics constants
- [ ] **P2-03** Add slight rotation toward movement direction
- [ ] **P2-04** Add animation states: idle, glide, hit, boost (placeholder sprites initially)
- [ ] **P2-05** Constrain player within viewport bounds during auto-scroll

### Auto-Scroll

- [ ] **P2-06** Implement level auto-scroll (camera moves right at configurable speed)
- [ ] **P2-07** Allow player to accelerate/decelerate within viewport (not leave it)

### Obstacles

- [ ] **P2-08** Create base Obstacle class with neon-glow tint and collision body (2px tolerance)
- [ ] **P2-09** Implement StaticLaser (horizontal/vertical beam, fixed position, red glow)
- [ ] **P2-10** Implement PulsingLaser (on/off 1.5s cycle, red glow)
- [ ] **P2-11** Implement SwingingBall (pendulum motion, variable radius, orange glow)
- [ ] **P2-12** Implement MovingWall (vertical oscillation, blocks passage)
- [ ] **P2-13** Implement PulsingZone (expanding/contracting danger area, cyan glow)

### Lives & Hit System

- [ ] **P2-14** Implement lives system (start at 3, display as hearts in HUD)
- [ ] **P2-15** On collision: subtract 1 life, play hit animation, 1s invulnerability with flashing sprite
- [ ] **P2-16** Respawn player at last checkpoint after hit
- [ ] **P2-17** Game Over screen at 0 lives with final score, Retry and Menu buttons

### Checkpoints

- [ ] **P2-18** Create Checkpoint class (glowing portal/ring visual)
- [ ] **P2-19** Detect player passing through checkpoint, store as respawn point
- [ ] **P2-20** Activation animation + SFX on checkpoint reach
- [ ] **P2-21** Reset all checkpoints on Game Over

### HUD

- [ ] **P2-22** Create HUD overlay: lives (hearts), current score, active power-up icon + timer, pause button

## Phase 3: Content & Progression

### Level Config System

- [ ] **P3-01** Define level config schema in `src/config/levels.ts` (scroll speed, obstacles, checkpoints, power-ups, par time)
- [ ] **P3-02** Build level loader that instantiates obstacles/checkpoints/power-ups from config
- [ ] **P3-03** Design Level 1: gentle intro — 2 static lasers, 1 swinging ball, 2 checkpoints
- [ ] **P3-04** Design Level 2: add pulsing lasers, +10% scroll speed, +15% obstacle density
- [ ] **P3-05** Design Level 3: add moving walls, increased density
- [ ] **P3-06** Design Level 4: add pulsing zones, all previous types mixed
- [ ] **P3-07** Design Level 5: all obstacle types, highest density and scroll speed

### Power-Ups

- [ ] **P3-08** Create base PowerUp class with pick-up animation and collision detection
- [ ] **P3-09** Implement Shield power-up (absorbs 1 hit, 5s duration, blue glow around player)
- [ ] **P3-10** Implement ExtraLife power-up (+1 life, max 5, heart icon)
- [ ] **P3-11** Implement SlowMotion power-up (50% scroll speed for 3s, visual time-warp effect)
- [ ] **P3-12** Display active power-up in HUD with countdown timer

### Scoring & Highscore

- [ ] **P3-13** Implement score calculation: distance (1pt/100px) + time bonus + life bonus + power-up bonus
- [ ] **P3-14** localStorage wrapper for saving/loading top-10 scores per level and overall
- [ ] **P3-15** Score breakdown screen on level complete
- [ ] **P3-16** "New Record!" visual feedback when beating personal best

### Level Select

- [ ] **P3-17** Create LevelSelect scene with space-themed level cards
- [ ] **P3-18** Show lock icon on locked levels, unlock next level on completion
- [ ] **P3-19** Display best score and star rating (1–3 stars) on completed levels
- [ ] **P3-20** Persist unlock/progression state in localStorage

## Phase 4: Audio & Polish

### Audio

- [ ] **P4-01** Create AudioManager singleton (manages music + SFX, handles mute/volume)
- [ ] **P4-02** Integrate background music: 1 disco/synth-funk loop per level, crossfade on scene transitions
- [ ] **P4-03** Implement gameplay SFX: thruster hum (looping, pitch-shift on direction), laser buzz, ball whoosh
- [ ] **P4-04** Implement feedback SFX: hit impact with reverb, checkpoint disco-stab, power-up chimes (distinct per type)
- [ ] **P4-05** Implement UI SFX: menu clicks, Game Over jingle, level complete fanfare
- [ ] **P4-06** Add Settings screen with separate Music and SFX volume sliders, accessible from MainMenu and pause overlay

### Visual Polish

- [ ] **P4-07** Add 3-layer parallax scrolling background (near stars, far stars, nebula)
- [ ] **P4-08** Add particle effects: thruster trail, checkpoint sparkles, power-up pickup burst, hit flash
- [ ] **P4-09** Replace placeholder sprites with final astronaut/glider artwork (32×32px)
- [ ] **P4-10** Polish obstacle visuals: neon glow shaders/tints, smooth animations

### Mobile Support

- [ ] **P4-11** Implement responsive scaling (16:9 base with letterboxing)
- [ ] **P4-12** Create virtual joystick for touch input (left side of screen)
- [ ] **P4-13** Force landscape orientation on mobile
- [ ] **P4-14** Ensure all touch targets are minimum 44×44px

### Pause System

- [ ] **P4-15** Implement pause overlay (Escape/P on desktop, pause button on mobile)
- [ ] **P4-16** Pause overlay shows Resume, Settings, and Quit to Menu options

## Phase 5: Build & Deploy

- [ ] **P5-01** Configure Vite production build: tree-shake Phaser, compress assets, source maps
- [ ] **P5-02** Verify bundle size < 2MB
- [ ] **P5-03** Set up Cloudflare Pages deployment (build command, output dir, SPA fallback)
- [ ] **P5-04** Performance audit: 60fps on target devices, load < 3s on 4G
