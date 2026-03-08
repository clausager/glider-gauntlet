import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/game';
import { audioManager, AudioManager } from '@/audio/AudioManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    this.createLoadingBar();
    // Load all music tracks
    for (const track of AudioManager.getTrackFiles()) {
      this.load.audio(track.key, track.url);
    }
  }

  create(): void {
    this.createPlaceholderTextures();
    audioManager.setPhaserSound(this.sound);
    this.scene.start('MainMenu');
  }

  private createLoadingBar(): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;
    const barWidth = 400;
    const barHeight = 30;

    const bgBar = this.add.rectangle(centerX, centerY, barWidth, barHeight, 0x222222);
    bgBar.setStrokeStyle(2, 0x00ffff);

    const fillBar = this.add.rectangle(
      centerX - barWidth / 2 + 2,
      centerY,
      0,
      barHeight - 4,
      0x00ffff,
    );
    fillBar.setOrigin(0, 0.5);

    const loadingText = this.add.text(centerX, centerY - 50, 'LOADING...', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#00ffff',
    });
    loadingText.setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      fillBar.width = (barWidth - 4) * value;
    });
  }

  private createPlaceholderTextures(): void {
    // --- Player: sleek space glider (64x64) ---
    const pg = this.add.graphics();
    const cx = 32, cy = 32;
    // Engine glow (behind everything)
    pg.fillStyle(0xff4400, 0.3);
    pg.fillEllipse(cx - 2, cy + 16, 16, 12);
    pg.fillStyle(0xffaa00, 0.2);
    pg.fillEllipse(cx - 2, cy + 20, 10, 10);
    // Main fuselage — pointed nose, wider rear
    pg.fillStyle(0x2a3a5c, 1);
    pg.fillTriangle(cx + 20, cy, cx - 14, cy - 6, cx - 14, cy + 6);
    // Fuselage detail stripe
    pg.fillStyle(0x3a5a8c, 1);
    pg.fillTriangle(cx + 18, cy, cx - 10, cy - 3, cx - 10, cy + 3);
    // Cockpit canopy
    pg.fillStyle(0x00ddff, 0.9);
    pg.fillEllipse(cx + 8, cy, 10, 5);
    pg.fillStyle(0x88eeff, 0.6);
    pg.fillEllipse(cx + 10, cy - 1, 6, 3); // canopy highlight
    // Upper wing — swept back
    pg.fillStyle(0x00eebb, 0.95);
    pg.fillTriangle(cx - 2, cy - 4, cx - 18, cy - 24, cx - 14, cy - 4);
    // Upper wing accent
    pg.fillStyle(0x00cc99, 0.7);
    pg.fillTriangle(cx - 4, cy - 5, cx - 16, cy - 20, cx - 13, cy - 5);
    // Upper wing tip glow
    pg.fillStyle(0x00ffdd, 0.5);
    pg.fillCircle(cx - 17, cy - 22, 3);
    // Lower wing — swept back
    pg.fillStyle(0x00eebb, 0.95);
    pg.fillTriangle(cx - 2, cy + 4, cx - 18, cy + 24, cx - 14, cy + 4);
    // Lower wing accent
    pg.fillStyle(0x00cc99, 0.7);
    pg.fillTriangle(cx - 4, cy + 5, cx - 16, cy + 20, cx - 13, cy + 5);
    // Lower wing tip glow
    pg.fillStyle(0x00ffdd, 0.5);
    pg.fillCircle(cx - 17, cy + 22, 3);
    // Rear fins
    pg.fillStyle(0x1a2a4c, 1);
    pg.fillTriangle(cx - 12, cy - 3, cx - 20, cy - 10, cx - 16, cy - 2);
    pg.fillTriangle(cx - 12, cy + 3, cx - 20, cy + 10, cx - 16, cy + 2);
    // Engine nozzle
    pg.fillStyle(0x444466, 1);
    pg.fillRect(cx - 16, cy - 4, 4, 8);
    pg.fillStyle(0xff6600, 0.9);
    pg.fillRect(cx - 17, cy - 3, 2, 6);
    // Thruster flame
    pg.fillStyle(0xff6600, 0.8);
    pg.fillTriangle(cx - 17, cy - 3, cx - 17, cy + 3, cx - 26, cy);
    pg.fillStyle(0xffaa00, 0.5);
    pg.fillTriangle(cx - 17, cy - 2, cx - 17, cy + 2, cx - 23, cy);
    pg.fillStyle(0xffdd44, 0.3);
    pg.fillTriangle(cx - 17, cy - 1, cx - 17, cy + 1, cx - 21, cy);
    pg.generateTexture('player', 64, 64);
    pg.destroy();

    // --- Checkpoint: glowing portal ring (64x64) ---
    const cpGfx = this.add.graphics();
    // Outer glow
    cpGfx.lineStyle(6, 0x00ff88, 0.3);
    cpGfx.strokeEllipse(32, 32, 60, 56);
    // Main ring
    cpGfx.lineStyle(4, 0x00ff88, 0.9);
    cpGfx.strokeEllipse(32, 32, 50, 46);
    // Inner highlight
    cpGfx.lineStyle(2, 0xaaffdd, 0.6);
    cpGfx.strokeEllipse(32, 32, 40, 36);
    // Center glow
    cpGfx.fillStyle(0x00ff88, 0.1);
    cpGfx.fillEllipse(32, 32, 36, 32);
    cpGfx.generateTexture('checkpoint', 64, 64);
    cpGfx.destroy();

    // Checkpoint active
    const cpAct = this.add.graphics();
    cpAct.lineStyle(6, 0xffff00, 0.4);
    cpAct.strokeEllipse(32, 32, 60, 56);
    cpAct.lineStyle(4, 0xffff00, 1);
    cpAct.strokeEllipse(32, 32, 50, 46);
    cpAct.lineStyle(2, 0xffffaa, 0.7);
    cpAct.strokeEllipse(32, 32, 40, 36);
    cpAct.fillStyle(0xffff00, 0.15);
    cpAct.fillEllipse(32, 32, 36, 32);
    cpAct.generateTexture('checkpoint-active', 64, 64);
    cpAct.destroy();

    // --- Power-ups (32x32) ---
    // Shield
    const shG = this.add.graphics();
    shG.fillStyle(0x4488ff, 0.15);
    shG.fillCircle(16, 16, 14);
    shG.lineStyle(3, 0x4488ff, 0.9);
    shG.strokeCircle(16, 16, 12);
    shG.lineStyle(1, 0x88ccff, 0.5);
    shG.strokeCircle(16, 16, 14);
    // Shield icon
    shG.fillStyle(0x88ccff, 0.8);
    shG.fillRoundedRect(10, 8, 12, 14, 2);
    shG.fillTriangle(10, 22, 22, 22, 16, 28);
    shG.generateTexture('powerup-shield', 32, 32);
    shG.destroy();

    // Extra life
    const liG = this.add.graphics();
    liG.fillStyle(0xff4444, 0.15);
    liG.fillCircle(16, 16, 14);
    liG.lineStyle(2, 0xff4444, 0.8);
    liG.strokeCircle(16, 16, 12);
    // Heart shape
    liG.fillStyle(0xff4444, 0.9);
    liG.fillCircle(12, 13, 5);
    liG.fillCircle(20, 13, 5);
    liG.fillTriangle(7, 15, 25, 15, 16, 26);
    liG.generateTexture('powerup-extra-life', 32, 32);
    liG.destroy();

    // Slow motion
    const smG = this.add.graphics();
    smG.fillStyle(0xffaa00, 0.15);
    smG.fillCircle(16, 16, 14);
    smG.lineStyle(3, 0xffaa00, 0.9);
    smG.strokeCircle(16, 16, 12);
    // Clock icon
    smG.lineStyle(2, 0xffcc44, 0.9);
    smG.strokeCircle(16, 16, 7);
    smG.lineBetween(16, 16, 16, 11); // hour hand
    smG.lineBetween(16, 16, 20, 16); // minute hand
    smG.generateTexture('powerup-slow-motion', 32, 32);
    smG.destroy();

    // --- Laser beam (wider, with glow layers) ---
    const laG = this.add.graphics();
    laG.fillStyle(0xff0000, 0.3);
    laG.fillRect(0, 0, 8, 8);
    laG.fillStyle(0xff0000, 0.7);
    laG.fillRect(1, 1, 6, 6);
    laG.fillStyle(0xff4444, 1);
    laG.fillRect(2, 2, 4, 4);
    laG.fillStyle(0xff8888, 1);
    laG.fillRect(3, 3, 2, 2);
    laG.generateTexture('laser', 8, 8);
    laG.destroy();

    // --- Swinging ball (larger, with glow) ---
    const baG = this.add.graphics();
    // Outer glow
    baG.fillStyle(0xff8800, 0.15);
    baG.fillCircle(20, 20, 20);
    // Mid glow
    baG.fillStyle(0xff8800, 0.4);
    baG.fillCircle(20, 20, 16);
    // Core
    baG.fillStyle(0xffaa44, 1);
    baG.fillCircle(20, 20, 12);
    // Highlight
    baG.fillStyle(0xffcc88, 0.7);
    baG.fillCircle(16, 16, 5);
    baG.generateTexture('swinging-ball', 40, 40);
    baG.destroy();

    // --- Moving wall (with neon edge) ---
    const waG = this.add.graphics();
    // Glow border
    waG.fillStyle(0x4466aa, 0.3);
    waG.fillRect(0, 0, 28, 100);
    // Main body
    waG.fillStyle(0x334477, 1);
    waG.fillRect(2, 2, 24, 96);
    // Neon edges
    waG.lineStyle(2, 0x6688cc, 0.9);
    waG.strokeRect(2, 2, 24, 96);
    // Internal lines
    waG.lineStyle(1, 0x5577bb, 0.4);
    for (let i = 0; i < 5; i++) {
      const ly = 12 + i * 20;
      waG.lineBetween(6, ly, 22, ly);
    }
    waG.generateTexture('moving-wall', 28, 100);
    waG.destroy();

    // --- Pulsing zone (with layered rings) ---
    const zoG = this.add.graphics();
    zoG.fillStyle(0x00cccc, 0.08);
    zoG.fillCircle(50, 50, 50);
    zoG.fillStyle(0x00cccc, 0.12);
    zoG.fillCircle(50, 50, 40);
    zoG.fillStyle(0x00cccc, 0.18);
    zoG.fillCircle(50, 50, 30);
    zoG.lineStyle(2, 0x00ffff, 0.4);
    zoG.strokeCircle(50, 50, 50);
    zoG.lineStyle(1, 0x00ffff, 0.25);
    zoG.strokeCircle(50, 50, 38);
    zoG.strokeCircle(50, 50, 26);
    zoG.generateTexture('pulsing-zone', 100, 100);
    zoG.destroy();

    // --- Homing mine (spiky red/magenta) ---
    const miG = this.add.graphics();
    miG.fillStyle(0xcc0044, 0.2);
    miG.fillCircle(20, 20, 20);
    miG.fillStyle(0xcc0044, 0.5);
    miG.fillCircle(20, 20, 14);
    miG.fillStyle(0xff1166, 1);
    miG.fillCircle(20, 20, 10);
    // Spikes
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const sx = 20 + Math.cos(a) * 10;
      const sy = 20 + Math.sin(a) * 10;
      const ex = 20 + Math.cos(a) * 18;
      const ey = 20 + Math.sin(a) * 18;
      miG.lineStyle(2, 0xff4488, 0.9);
      miG.lineBetween(sx, sy, ex, ey);
    }
    // Blinking core
    miG.fillStyle(0xff88aa, 0.9);
    miG.fillCircle(20, 20, 4);
    miG.generateTexture('homing-mine', 40, 40);
    miG.destroy();

    // --- Laser turret base (small rotating turret) ---
    const tuG = this.add.graphics();
    // Base
    tuG.fillStyle(0x555577, 1);
    tuG.fillCircle(16, 16, 12);
    tuG.lineStyle(2, 0x7777aa, 0.9);
    tuG.strokeCircle(16, 16, 12);
    // Inner ring
    tuG.fillStyle(0x333355, 1);
    tuG.fillCircle(16, 16, 7);
    // Center eye
    tuG.fillStyle(0xff2200, 0.9);
    tuG.fillCircle(16, 16, 4);
    tuG.fillStyle(0xff6644, 0.6);
    tuG.fillCircle(16, 15, 2);
    tuG.generateTexture('laser-turret', 32, 32);
    tuG.destroy();

    // --- Asteroid (irregular rocky shape) ---
    const asG = this.add.graphics();
    // Outer rough shape
    asG.fillStyle(0x665544, 1);
    asG.beginPath();
    asG.moveTo(20, 2);
    asG.lineTo(34, 6);
    asG.lineTo(38, 18);
    asG.lineTo(36, 30);
    asG.lineTo(28, 38);
    asG.lineTo(14, 38);
    asG.lineTo(4, 30);
    asG.lineTo(2, 18);
    asG.lineTo(6, 8);
    asG.closePath();
    asG.fillPath();
    // Crater details
    asG.fillStyle(0x554433, 1);
    asG.fillCircle(15, 14, 5);
    asG.fillCircle(26, 22, 4);
    asG.fillCircle(18, 28, 3);
    // Highlight edge
    asG.fillStyle(0x887766, 0.6);
    asG.fillCircle(12, 10, 3);
    asG.fillCircle(28, 12, 2);
    asG.generateTexture('asteroid', 40, 40);
    asG.destroy();

    // --- Star particles (various sizes) ---
    const stG = this.add.graphics();
    stG.fillStyle(0xffffff, 1);
    stG.fillCircle(2, 2, 2);
    stG.generateTexture('star', 4, 4);
    stG.destroy();

    // Soft glow particle (for thruster, sparkles)
    const glG = this.add.graphics();
    glG.fillStyle(0xffffff, 0.8);
    glG.fillCircle(8, 8, 8);
    glG.fillStyle(0xffffff, 0.4);
    glG.fillCircle(8, 8, 6);
    glG.generateTexture('glow-particle', 16, 16);
    glG.destroy();

    // Spark particle (small bright dot)
    const spG = this.add.graphics();
    spG.fillStyle(0xffffff, 1);
    spG.fillCircle(3, 3, 3);
    spG.generateTexture('spark', 6, 6);
    spG.destroy();

    // --- Parallax background layers ---
    this.generateStarfieldTexture('bg-stars-far', 512, 512, 40, 1, 0.4);
    this.generateStarfieldTexture('bg-stars-mid', 512, 512, 60, 2, 0.7);
    this.generateStarfieldTexture('bg-stars-near', 512, 512, 30, 3, 1.0);
    this.generateNebulaTexture();
  }

  private generateStarfieldTexture(
    key: string,
    w: number,
    h: number,
    count: number,
    maxSize: number,
    maxAlpha: number,
  ): void {
    const gfx = this.add.graphics();
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, w);
      const y = Phaser.Math.Between(0, h);
      const size = Phaser.Math.FloatBetween(0.5, maxSize);
      const alpha = Phaser.Math.FloatBetween(0.2, maxAlpha);
      const tint = Phaser.Math.RND.pick([0xffffff, 0xaaccff, 0xffddaa, 0xccddff]);
      gfx.fillStyle(tint, alpha);
      gfx.fillCircle(x, y, size);
    }
    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  private generateNebulaTexture(): void {
    const gfx = this.add.graphics();
    const w = 512;
    const h = 512;
    // Faint colored nebula blobs
    const colors = [0x220044, 0x002244, 0x442200, 0x110033, 0x003322];
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, w - 50);
      const y = Phaser.Math.Between(50, h - 50);
      const rx = Phaser.Math.Between(60, 150);
      const ry = Phaser.Math.Between(40, 120);
      const color = Phaser.Math.RND.pick(colors);
      gfx.fillStyle(color, Phaser.Math.FloatBetween(0.1, 0.3));
      gfx.fillEllipse(x, y, rx, ry);
    }
    gfx.generateTexture('bg-nebula', w, h);
    gfx.destroy();

    // --- Virtual joystick textures ---
    const jBase = this.add.graphics();
    jBase.fillStyle(0xffffff, 0.15);
    jBase.fillCircle(60, 60, 60);
    jBase.lineStyle(2, 0xffffff, 0.3);
    jBase.strokeCircle(60, 60, 60);
    jBase.generateTexture('joystick-base', 120, 120);
    jBase.destroy();

    const jThumb = this.add.graphics();
    jThumb.fillStyle(0xffffff, 0.4);
    jThumb.fillCircle(25, 25, 25);
    jThumb.lineStyle(2, 0x00ffff, 0.6);
    jThumb.strokeCircle(25, 25, 25);
    jThumb.generateTexture('joystick-thumb', 50, 50);
    jThumb.destroy();
  }
}
