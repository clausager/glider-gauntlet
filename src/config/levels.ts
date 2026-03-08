export type ObstacleType = 'static-laser' | 'pulsing-laser' | 'swinging-ball' | 'moving-wall' | 'pulsing-zone' | 'homing-mine' | 'laser-turret' | 'asteroid';

export interface ObstacleConfig {
  type: ObstacleType;
  x: number;
  y: number;
  params?: Record<string, number | string>;
}

export interface CheckpointConfig {
  x: number;
  y: number;
}

export interface PowerUpConfig {
  type: 'shield' | 'extra-life' | 'slow-motion';
  x: number;
  y: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  scrollSpeed: number;
  parTime: number; // seconds
  obstacles: ObstacleConfig[];
  checkpoints: CheckpointConfig[];
  powerUps: PowerUpConfig[];
  levelLength: number; // total width in pixels
}

const BASE_SCROLL_SPEED = 120;
const H = 720; // game height reference

export const levels: LevelConfig[] = [
  {
    id: 1,
    name: 'First Flight',
    scrollSpeed: BASE_SCROLL_SPEED,
    parTime: 60,
    levelLength: 8000,
    obstacles: [
      // Section 1: Horizontal lasers at different heights to force vertical movement
      { type: 'static-laser', x: 1200, y: 180, params: { orientation: 'horizontal' } },
      { type: 'static-laser', x: 1200, y: 540, params: { orientation: 'horizontal' } },
      // Gap in the middle — player must fly through

      // Swinging ball covering middle area
      { type: 'swinging-ball', x: 2000, y: 100, params: { radius: 200, speed: 2 } },

      // Section 2: Vertical laser wall with gap
      { type: 'static-laser', x: 2800, y: 120, params: { orientation: 'vertical', length: 200 } },
      { type: 'static-laser', x: 2800, y: 520, params: { orientation: 'vertical', length: 200 } },

      // More horizontal barriers
      { type: 'static-laser', x: 3600, y: 300, params: { orientation: 'horizontal' } },
      { type: 'swinging-ball', x: 3600, y: 550, params: { radius: 150, speed: 2.5 } },

      // Section 3: Moving lasers — some drift toward you, some chase you
      { type: 'static-laser', x: 4400, y: 150, params: { orientation: 'horizontal', driftX: -80 } },
      { type: 'static-laser', x: 4200, y: 550, params: { orientation: 'horizontal', driftX: 60 } },
      { type: 'static-laser', x: 5400, y: 200, params: { orientation: 'horizontal', driftX: -100 } },

      // Swinging ball guarding center path
      { type: 'swinging-ball', x: 5000, y: 300, params: { radius: 160, speed: 3 } },

      // Section 4: Tight corridor with a fast incoming laser
      { type: 'static-laser', x: 6200, y: 100, params: { orientation: 'horizontal' } },
      { type: 'static-laser', x: 6200, y: 450, params: { orientation: 'horizontal' } },
      { type: 'static-laser', x: 6500, y: 300, params: { orientation: 'horizontal', driftX: -150 } },
      { type: 'swinging-ball', x: 6800, y: 250, params: { radius: 120, speed: 2.5 } },
      { type: 'static-laser', x: 7200, y: 200, params: { orientation: 'horizontal' } },
      { type: 'static-laser', x: 7200, y: 600, params: { orientation: 'horizontal' } },
    ],
    checkpoints: [
      { x: 3200, y: 360 },
      { x: 5800, y: 360 },
    ],
    powerUps: [
      { type: 'shield', x: 1800, y: 360 },
      { type: 'extra-life', x: 5200, y: 400 },
    ],
  },
  {
    id: 2,
    name: 'Laser Grid',
    scrollSpeed: BASE_SCROLL_SPEED * 1.1,
    parTime: 55,
    levelLength: 9000,
    obstacles: [
      // Opening: Pulsing laser gate — time your entry
      { type: 'pulsing-laser', x: 1000, y: 360, params: { orientation: 'horizontal', cycleTime: 1.5 } },

      // Horizontal beams at top+bottom, ball sweeping middle
      { type: 'static-laser', x: 1600, y: 120, params: { orientation: 'horizontal' } },
      { type: 'static-laser', x: 1600, y: 600, params: { orientation: 'horizontal' } },
      { type: 'swinging-ball', x: 1800, y: 360, params: { radius: 200, speed: 2.5 } },

      // Pulsing laser corridor
      { type: 'pulsing-laser', x: 2400, y: 200, params: { orientation: 'horizontal', cycleTime: 1.5 } },
      { type: 'pulsing-laser', x: 2400, y: 500, params: { orientation: 'horizontal', cycleTime: 1.5 } },
      { type: 'static-laser', x: 2800, y: 360, params: { orientation: 'vertical' } },

      // Gauntlet: alternating pulsing lasers — some drifting
      { type: 'pulsing-laser', x: 3400, y: 250, params: { orientation: 'horizontal', cycleTime: 1.2, driftX: -90 } },
      { type: 'pulsing-laser', x: 3700, y: 480, params: { orientation: 'horizontal', cycleTime: 1.2, driftX: 70 } },
      { type: 'pulsing-laser', x: 4000, y: 200, params: { orientation: 'horizontal', cycleTime: 1.0, driftX: -120 } },

      // Vertical wall + balls
      { type: 'static-laser', x: 4600, y: 150, params: { orientation: 'vertical', length: 250 } },
      { type: 'static-laser', x: 4600, y: 550, params: { orientation: 'vertical', length: 200 } },
      { type: 'swinging-ball', x: 5000, y: 200, params: { radius: 180, speed: 3 } },
      { type: 'swinging-ball', x: 5000, y: 500, params: { radius: 150, speed: 2.5 } },

      // Laser cage section
      { type: 'static-laser', x: 5800, y: 100, params: { orientation: 'horizontal' } },
      { type: 'static-laser', x: 5800, y: 620, params: { orientation: 'horizontal' } },
      { type: 'pulsing-laser', x: 6000, y: 360, params: { orientation: 'horizontal', cycleTime: 1.5 } },

      // Asteroid scatter — drifting rocks in the path
      { type: 'asteroid', x: 5400, y: 250, params: { driftY: 30, rotSpeed: 1.5, scale: 1.2 } },
      { type: 'asteroid', x: 5600, y: 450, params: { driftY: -25, rotSpeed: -1, scale: 1.0 } },
      { type: 'asteroid', x: 5900, y: 350, params: { driftY: 20, rotSpeed: 2, scale: 0.8 } },

      // Final sprint: fast incoming lasers + pulsing gates
      { type: 'static-laser', x: 6400, y: 400, params: { orientation: 'horizontal', driftX: -200 } },
      { type: 'static-laser', x: 6500, y: 200, params: { orientation: 'horizontal', driftX: -160 } },
      { type: 'pulsing-laser', x: 6600, y: 300, params: { orientation: 'horizontal', cycleTime: 1.0 } },
      { type: 'static-laser', x: 7000, y: 150, params: { orientation: 'horizontal' } },
      { type: 'static-laser', x: 7000, y: 550, params: { orientation: 'horizontal' } },
      { type: 'asteroid', x: 7200, y: 350, params: { driftY: 40, rotSpeed: 1.8, scale: 1.4 } },
      { type: 'pulsing-laser', x: 7400, y: 360, params: { orientation: 'horizontal', cycleTime: 0.8 } },
      { type: 'swinging-ball', x: 7800, y: 300, params: { radius: 180, speed: 3.5 } },
      { type: 'static-laser', x: 8200, y: 200, params: { orientation: 'horizontal' } },
      { type: 'static-laser', x: 8200, y: 500, params: { orientation: 'horizontal' } },
    ],
    checkpoints: [
      { x: 3000, y: 360 },
      { x: 5500, y: 360 },
      { x: 7600, y: 360 },
    ],
    powerUps: [
      { type: 'shield', x: 2200, y: 360 },
      { type: 'slow-motion', x: 4400, y: 350 },
      { type: 'extra-life', x: 6800, y: 400 },
    ],
  },
  {
    id: 3,
    name: 'Moving Maze',
    scrollSpeed: BASE_SCROLL_SPEED * 1.21,
    parTime: 50,
    levelLength: 10000,
    obstacles: [
      // Moving walls creating shifting corridors
      { type: 'moving-wall', x: 1200, y: 200, params: { rangeY: 300, speed: 90 } },
      { type: 'moving-wall', x: 1200, y: 520, params: { rangeY: 300, speed: 90 } },

      { type: 'static-laser', x: 1800, y: 150, params: { orientation: 'horizontal', driftX: -100 } },
      { type: 'moving-wall', x: 2200, y: 360, params: { rangeY: 400, speed: 100 } },
      { type: 'swinging-ball', x: 2200, y: 150, params: { radius: 140, speed: 3 } },
      // Fast laser shot from ahead
      { type: 'static-laser', x: 2600, y: 500, params: { orientation: 'horizontal', driftX: -180 } },

      // Double wall squeeze
      { type: 'moving-wall', x: 3000, y: 250, params: { rangeY: 300, speed: 110 } },
      { type: 'moving-wall', x: 3200, y: 470, params: { rangeY: 300, speed: 80 } },
      { type: 'pulsing-laser', x: 3100, y: 360, params: { orientation: 'horizontal', cycleTime: 1.5, driftX: -60 } },

      // Ball + wall gauntlet
      { type: 'swinging-ball', x: 3800, y: 300, params: { radius: 180, speed: 3 } },
      { type: 'moving-wall', x: 4200, y: 200, params: { rangeY: 250, speed: 100 } },
      { type: 'moving-wall', x: 4200, y: 520, params: { rangeY: 250, speed: 120 } },

      // Narrow passage with moving walls
      { type: 'static-laser', x: 5000, y: 100, params: { orientation: 'horizontal' } },
      { type: 'static-laser', x: 5000, y: 620, params: { orientation: 'horizontal' } },
      { type: 'moving-wall', x: 5200, y: 360, params: { rangeY: 350, speed: 130 } },

      // Wall cascade
      { type: 'moving-wall', x: 6000, y: 200, params: { rangeY: 200, speed: 90 } },
      { type: 'moving-wall', x: 6300, y: 360, params: { rangeY: 250, speed: 110 } },
      { type: 'moving-wall', x: 6600, y: 520, params: { rangeY: 200, speed: 100 } },
      { type: 'pulsing-laser', x: 6300, y: 150, params: { orientation: 'horizontal', cycleTime: 1.2 } },

      // Homing mines — dodge while navigating walls
      { type: 'homing-mine', x: 7000, y: 200, params: { speed: 70, range: 280 } },
      { type: 'homing-mine', x: 7000, y: 520, params: { speed: 70, range: 280 } },

      // Final section: walls + balls + asteroids
      { type: 'moving-wall', x: 7400, y: 300, params: { rangeY: 350, speed: 120 } },
      { type: 'asteroid', x: 7600, y: 150, params: { driftY: 35, rotSpeed: 1.5, scale: 1.3 } },
      { type: 'asteroid', x: 7600, y: 550, params: { driftY: -30, rotSpeed: -1.2, scale: 1.1 } },
      { type: 'swinging-ball', x: 7800, y: 200, params: { radius: 160, speed: 3.5 } },
      { type: 'swinging-ball', x: 7800, y: 520, params: { radius: 160, speed: 3 } },
      { type: 'moving-wall', x: 8400, y: 360, params: { rangeY: 400, speed: 140 } },
      { type: 'homing-mine', x: 8600, y: 360, params: { speed: 80, range: 300 } },
      { type: 'static-laser', x: 8800, y: 250, params: { orientation: 'horizontal' } },
      { type: 'static-laser', x: 8800, y: 470, params: { orientation: 'horizontal' } },
    ],
    checkpoints: [
      { x: 2800, y: 360 },
      { x: 5600, y: 360 },
      { x: 8000, y: 360 },
    ],
    powerUps: [
      { type: 'shield', x: 2600, y: 360 },
      { type: 'slow-motion', x: 4800, y: 350 },
      { type: 'extra-life', x: 7200, y: 360 },
    ],
  },
  {
    id: 4,
    name: 'Pulse Storm',
    scrollSpeed: BASE_SCROLL_SPEED * 1.33,
    parTime: 50,
    levelLength: 11000,
    obstacles: [
      // Pulsing zones block large areas — weave between them
      { type: 'pulsing-zone', x: 1200, y: 200, params: { minRadius: 50, maxRadius: 160, speed: 2 } },
      { type: 'pulsing-zone', x: 1200, y: 520, params: { minRadius: 50, maxRadius: 160, speed: 2.5 } },

      { type: 'static-laser', x: 1800, y: 360, params: { orientation: 'horizontal', driftX: -120 } },
      { type: 'pulsing-zone', x: 2200, y: 360, params: { minRadius: 60, maxRadius: 180, speed: 2 } },
      // Fast incoming lasers between zones
      { type: 'static-laser', x: 2600, y: 200, params: { orientation: 'horizontal', driftX: -200 } },
      { type: 'static-laser', x: 2800, y: 550, params: { orientation: 'horizontal', driftX: -160 } },

      // Mixed zones + lasers
      { type: 'pulsing-zone', x: 3000, y: 150, params: { minRadius: 40, maxRadius: 140, speed: 2.5 } },
      { type: 'pulsing-zone', x: 3000, y: 570, params: { minRadius: 40, maxRadius: 140, speed: 3 } },
      { type: 'pulsing-laser', x: 3000, y: 360, params: { orientation: 'horizontal', cycleTime: 1.5, driftX: -80 } },

      // Zone corridor
      { type: 'pulsing-zone', x: 3800, y: 250, params: { minRadius: 50, maxRadius: 150, speed: 2 } },
      { type: 'pulsing-zone', x: 4100, y: 500, params: { minRadius: 50, maxRadius: 150, speed: 2.5 } },
      { type: 'moving-wall', x: 4400, y: 360, params: { rangeY: 300, speed: 100 } },

      // Laser turret — spinning beam sweeps the corridor
      { type: 'laser-turret', x: 5000, y: 360, params: { speed: 1.2, beamLength: 280, startAngle: 0 } },

      // Dense zone field + asteroids
      { type: 'pulsing-zone', x: 5500, y: 180, params: { minRadius: 50, maxRadius: 130, speed: 3 } },
      { type: 'asteroid', x: 5600, y: 350, params: { driftY: 30, rotSpeed: 1.5, scale: 1.2 } },
      { type: 'pulsing-zone', x: 5700, y: 400, params: { minRadius: 60, maxRadius: 150, speed: 2.5 } },
      { type: 'pulsing-zone', x: 5900, y: 580, params: { minRadius: 50, maxRadius: 130, speed: 2 } },
      { type: 'asteroid', x: 5800, y: 150, params: { driftY: 25, rotSpeed: -2, scale: 1.0 } },

      // Wall + zone combos + homing mines
      { type: 'moving-wall', x: 6400, y: 200, params: { rangeY: 250, speed: 110 } },
      { type: 'homing-mine', x: 6500, y: 360, params: { speed: 75, range: 300 } },
      { type: 'pulsing-zone', x: 6600, y: 500, params: { minRadius: 60, maxRadius: 170, speed: 3 } },
      { type: 'pulsing-laser', x: 6800, y: 250, params: { orientation: 'horizontal', cycleTime: 1.2 } },

      // Dual turrets section
      { type: 'laser-turret', x: 7200, y: 200, params: { speed: 1.5, beamLength: 220, startAngle: 0 } },
      { type: 'laser-turret', x: 7200, y: 520, params: { speed: -1.5, beamLength: 220, startAngle: 3.14 } },

      // Gauntlet ending
      { type: 'pulsing-zone', x: 7800, y: 200, params: { minRadius: 50, maxRadius: 140, speed: 3 } },
      { type: 'homing-mine', x: 7900, y: 360, params: { speed: 80, range: 320 } },
      { type: 'pulsing-zone', x: 7800, y: 520, params: { minRadius: 50, maxRadius: 140, speed: 2.5 } },
      { type: 'pulsing-zone', x: 8200, y: 360, params: { minRadius: 60, maxRadius: 160, speed: 3 } },
      { type: 'moving-wall', x: 8600, y: 300, params: { rangeY: 350, speed: 130 } },
      { type: 'pulsing-laser', x: 9000, y: 200, params: { orientation: 'horizontal', cycleTime: 1.0 } },
      { type: 'pulsing-laser', x: 9000, y: 520, params: { orientation: 'horizontal', cycleTime: 1.0 } },
      { type: 'swinging-ball', x: 9400, y: 360, params: { radius: 200, speed: 3.5 } },
      { type: 'pulsing-zone', x: 9800, y: 250, params: { minRadius: 60, maxRadius: 170, speed: 3 } },
      { type: 'pulsing-zone', x: 9800, y: 500, params: { minRadius: 60, maxRadius: 170, speed: 2.5 } },
    ],
    checkpoints: [
      { x: 2600, y: 360 },
      { x: 5800, y: 360 },
      { x: 8400, y: 360 },
    ],
    powerUps: [
      { type: 'shield', x: 1600, y: 360 },
      { type: 'slow-motion', x: 4000, y: 360 },
      { type: 'extra-life', x: 7000, y: 360 },
      { type: 'shield', x: 9200, y: 360 },
    ],
  },
  {
    id: 5,
    name: 'The Gauntlet',
    scrollSpeed: BASE_SCROLL_SPEED * 1.5,
    parTime: 50,
    levelLength: 12000,
    obstacles: [
      // Every obstacle type mixed — no safe lanes

      // Opening volley
      { type: 'static-laser', x: 800, y: 200, params: { orientation: 'horizontal' } },
      { type: 'static-laser', x: 800, y: 520, params: { orientation: 'horizontal' } },
      { type: 'swinging-ball', x: 1200, y: 360, params: { radius: 200, speed: 3 } },

      // Pulsing gate + zone
      { type: 'pulsing-laser', x: 1800, y: 300, params: { orientation: 'horizontal', cycleTime: 1.0 } },
      { type: 'pulsing-zone', x: 2000, y: 550, params: { minRadius: 50, maxRadius: 150, speed: 3 } },
      { type: 'moving-wall', x: 2200, y: 200, params: { rangeY: 300, speed: 120 } },

      // Triple threat — incoming lasers from ahead
      { type: 'static-laser', x: 2800, y: 150, params: { orientation: 'horizontal', driftX: -220 } },
      { type: 'swinging-ball', x: 2800, y: 350, params: { radius: 160, speed: 3.5 } },
      { type: 'static-laser', x: 2800, y: 600, params: { orientation: 'horizontal', driftX: -180 } },
      // Chaser laser from behind
      { type: 'static-laser', x: 2400, y: 400, params: { orientation: 'horizontal', driftX: 250 } },

      // Moving wall corridor with pulsing drift laser
      { type: 'moving-wall', x: 3400, y: 250, params: { rangeY: 300, speed: 130 } },
      { type: 'moving-wall', x: 3600, y: 470, params: { rangeY: 300, speed: 110 } },
      { type: 'pulsing-laser', x: 3500, y: 360, params: { orientation: 'horizontal', cycleTime: 0.8, driftX: -140 } },
      { type: 'static-laser', x: 3300, y: 200, params: { orientation: 'horizontal', driftX: 200 } },

      // Homing mine ambush
      { type: 'homing-mine', x: 3900, y: 150, params: { speed: 85, range: 320 } },
      { type: 'homing-mine', x: 3900, y: 570, params: { speed: 85, range: 320 } },

      // Zone field with turret center
      { type: 'pulsing-zone', x: 4200, y: 180, params: { minRadius: 60, maxRadius: 160, speed: 3 } },
      { type: 'pulsing-zone', x: 4200, y: 540, params: { minRadius: 60, maxRadius: 160, speed: 2.5 } },
      { type: 'laser-turret', x: 4500, y: 360, params: { speed: 1.8, beamLength: 260, startAngle: 0 } },

      // Asteroid belt
      { type: 'asteroid', x: 5000, y: 150, params: { driftY: 40, rotSpeed: 2, scale: 1.5 } },
      { type: 'asteroid', x: 5150, y: 360, params: { driftY: -30, rotSpeed: -1.5, scale: 1.3 } },
      { type: 'asteroid', x: 5300, y: 550, params: { driftY: 25, rotSpeed: 1.8, scale: 1.1 } },
      { type: 'asteroid', x: 5100, y: 250, params: { driftY: -35, rotSpeed: -2, scale: 0.9 } },
      { type: 'asteroid', x: 5250, y: 450, params: { driftY: 20, rotSpeed: 1.2, scale: 1.4 } },

      // Laser gauntlet with mines
      { type: 'pulsing-laser', x: 5600, y: 200, params: { orientation: 'horizontal', cycleTime: 0.8 } },
      { type: 'homing-mine', x: 5700, y: 360, params: { speed: 90, range: 280 } },
      { type: 'pulsing-laser', x: 5800, y: 400, params: { orientation: 'horizontal', cycleTime: 1.0 } },
      { type: 'pulsing-laser', x: 6000, y: 250, params: { orientation: 'horizontal', cycleTime: 0.8 } },
      { type: 'pulsing-laser', x: 6200, y: 500, params: { orientation: 'horizontal', cycleTime: 1.0 } },

      // Turret corridor
      { type: 'laser-turret', x: 6600, y: 200, params: { speed: 2.0, beamLength: 240, startAngle: 0 } },
      { type: 'laser-turret', x: 6600, y: 520, params: { speed: -2.0, beamLength: 240, startAngle: 1.57 } },
      { type: 'moving-wall', x: 6800, y: 360, params: { rangeY: 300, speed: 140 } },

      // Swinging balls + asteroids
      { type: 'swinging-ball', x: 7200, y: 200, params: { radius: 150, speed: 4 } },
      { type: 'swinging-ball', x: 7200, y: 520, params: { radius: 150, speed: 3.5 } },
      { type: 'asteroid', x: 7400, y: 360, params: { driftY: 30, rotSpeed: 2, scale: 1.6 } },

      // Zone gauntlet + homing mines
      { type: 'pulsing-zone', x: 7800, y: 180, params: { minRadius: 60, maxRadius: 150, speed: 3.5 } },
      { type: 'homing-mine', x: 8000, y: 360, params: { speed: 95, range: 350 } },
      { type: 'pulsing-zone', x: 8000, y: 400, params: { minRadius: 60, maxRadius: 150, speed: 3 } },
      { type: 'pulsing-zone', x: 8200, y: 580, params: { minRadius: 50, maxRadius: 140, speed: 3.5 } },
      { type: 'moving-wall', x: 8400, y: 360, params: { rangeY: 400, speed: 150 } },

      // Final gauntlet — everything at once, fast moving lasers
      { type: 'static-laser', x: 8800, y: 120, params: { orientation: 'horizontal' } },
      { type: 'static-laser', x: 8800, y: 600, params: { orientation: 'horizontal' } },
      // Rapid fire incoming lasers
      { type: 'static-laser', x: 9000, y: 250, params: { orientation: 'horizontal', driftX: -280 } },
      { type: 'static-laser', x: 9100, y: 480, params: { orientation: 'horizontal', driftX: -250 } },
      { type: 'static-laser', x: 9200, y: 350, params: { orientation: 'horizontal', driftX: -300 } },
      { type: 'laser-turret', x: 9000, y: 360, params: { speed: 2.5, beamLength: 280, startAngle: 0 } },
      { type: 'homing-mine', x: 9400, y: 200, params: { speed: 100, range: 350 } },
      { type: 'homing-mine', x: 9400, y: 520, params: { speed: 100, range: 350 } },
      // Chaser lasers from behind
      { type: 'static-laser', x: 9200, y: 300, params: { orientation: 'horizontal', driftX: 300 } },
      { type: 'static-laser', x: 9300, y: 500, params: { orientation: 'horizontal', driftX: 260 } },
      { type: 'asteroid', x: 9800, y: 300, params: { driftY: -40, rotSpeed: 2.5, scale: 1.8 } },
      { type: 'asteroid', x: 9800, y: 450, params: { driftY: 35, rotSpeed: -2, scale: 1.5 } },
      { type: 'pulsing-zone', x: 10200, y: 360, params: { minRadius: 60, maxRadius: 170, speed: 4 } },
      { type: 'moving-wall', x: 10400, y: 200, params: { rangeY: 300, speed: 150 } },
      { type: 'moving-wall', x: 10400, y: 520, params: { rangeY: 300, speed: 140 } },
      // More incoming fire
      { type: 'pulsing-laser', x: 10600, y: 300, params: { orientation: 'horizontal', cycleTime: 0.5, driftX: -260 } },
      { type: 'pulsing-laser', x: 10700, y: 450, params: { orientation: 'horizontal', cycleTime: 0.5, driftX: -240 } },
      { type: 'laser-turret', x: 10800, y: 360, params: { speed: -3.0, beamLength: 300, startAngle: 0 } },
      { type: 'pulsing-laser', x: 11000, y: 200, params: { orientation: 'horizontal', cycleTime: 0.6 } },
      { type: 'pulsing-laser', x: 11000, y: 520, params: { orientation: 'horizontal', cycleTime: 0.6 } },
      { type: 'homing-mine', x: 11200, y: 360, params: { speed: 110, range: 400 } },
      { type: 'asteroid', x: 11400, y: 250, params: { driftY: 45, rotSpeed: 3, scale: 2.0 } },
      { type: 'asteroid', x: 11400, y: 480, params: { driftY: -40, rotSpeed: -2.5, scale: 1.7 } },
    ],
    checkpoints: [
      { x: 3000, y: 360 },
      { x: 6000, y: 360 },
      { x: 9200, y: 360 },
    ],
    powerUps: [
      { type: 'shield', x: 1500, y: 360 },
      { type: 'slow-motion', x: 3800, y: 360 },
      { type: 'extra-life', x: 5800, y: 360 },
      { type: 'shield', x: 8400, y: 360 },
      { type: 'slow-motion', x: 10600, y: 360 },
    ],
  },
];
