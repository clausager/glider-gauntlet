# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Glider Gauntlet is a 2D browser-based space obstacle course game. A small astronaut with a glider navigates through progressively harder levels in outer space, dodging lasers, swinging balls, and other hazards. Built with **Phaser 3 + TypeScript + Vite**, deployed to **Cloudflare Pages**.

## Tech Stack

- **Game Engine:** Phaser 3.x (Arcade physics, Canvas/WebGL auto-detect)
- **Language:** TypeScript (strict mode, no `any` types)
- **Bundler:** Vite (HMR in dev, tree-shaken production builds)
- **Testing:** Vitest for unit tests on pure logic; integration tests for game state
- **Hosting:** Cloudflare Pages (global CDN)
- **Persistence:** localStorage for highscores and level progression

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server with HMR
npm run build        # Production build (output: dist/)
npm run preview      # Preview production build locally
npx vitest           # Run tests
npx vitest run       # Run tests once (CI mode)
npx vitest [file]    # Run a single test file
```

## Architecture

### Project Structure

```
src/
  scenes/      — Phaser scenes: Boot, MainMenu, LevelSelect, Game, GameOver
  objects/     — Game objects: Player, Obstacle (subclasses), PowerUp, Checkpoint, HUD
  config/      — Level definitions (JSON-like), physics constants, scoring rules
  utils/       — Input handling, score calculation, localStorage wrapper
  audio/       — AudioManager, music loops, SFX triggers
assets/
  sprites/     — Character, obstacles, power-ups, checkpoints (sprite sheets)
  audio/       — Disco/synth-funk tracks, sound effects
  backgrounds/ — Space backgrounds, parallax star layers
```

### Key Design Decisions

- **Level configs are data-driven** (`src/config/levels.ts`): obstacle placements, checkpoint positions, power-up spawns, scroll speed, and par time are all defined as config objects — tweak difficulty without code changes.
- **Auto-scrolling levels**: levels scroll right automatically. Player moves freely in 2D within the viewport but cannot leave it. Scroll speed increases +10% per level, obstacle density +15%.
- **Phaser scene flow**: Boot → MainMenu → LevelSelect → Game → GameOver (with retry loop back to Game or LevelSelect).
- **Scoring formula**: 1pt per 100px traversed + time bonus (max 500, −10/s over par) + 200 per remaining life + 50 per power-up collected. Top-10 per level stored in localStorage.

### Game Objects

- **Player**: `Phaser.Physics.Arcade.Sprite` with smooth acceleration/deceleration, slight rotation toward movement direction, states: idle/glide/hit/boost.
- **Obstacles** (base class + subclasses): StaticLaser, PulsingLaser (1.5s on/off), SwingingBall (pendulum), MovingWall (vertical oscillation), PulsingZone (expand/contract). Collision uses Arcade physics with 2px tolerance bounding boxes.
- **Power-ups**: Shield (absorbs 1 hit, 5s), ExtraLife (+1, max 5), SlowMotion (50% scroll speed, 3s).
- **Checkpoints**: 2–3 per level at section transitions, act as respawn points. Reset on Game Over.

### Controls

- **Desktop**: Arrow keys / WASD for movement, Escape/P to pause
- **Mobile**: Virtual joystick (left side), pause button in HUD, forced landscape orientation

## Code Conventions

- Strict TypeScript — no `any` types
- All in-game text, UI labels, and menus in **English**
- Use Phaser best practices (scene lifecycle, object pooling where appropriate)
- Write Vitest unit tests for all pure logic (scoring, collision helpers, config parsing); use real fixture data
- Game viewport: 1280×720 base resolution, 16:9 with letterboxing on other ratios
- Target 60fps; touch input latency < 50ms
- Production bundle must stay under 2MB
- Audio: separate Music and SFX volume sliders; use royalty-free disco/synth-funk from opengameart.org or freesound.org

## Key Documents

- `BACKLOG.md` — Feature backlog broken into 50+ tasks across 5 phases, with task IDs (P1-01, P2-01, etc.)
- `TEST_STRATEGY.md` — Per-module test plan with specific test cases for each module
- `glider-gauntlet-prd-v03.docx` — Full PRD with game design spec, user stories, and implementation guide

## Visual Style

Space/neon-glow aesthetic: deep space backgrounds with 3-layer parallax scrolling (near stars, far stars, nebula). Obstacles have colored neon glow (red lasers, orange balls, cyan zones). Checkpoints are glowing portals with particle effects. Minimal HUD overlay with lives (hearts), score, active power-up icon + timer.
