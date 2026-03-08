import Phaser from 'phaser';

export abstract class Obstacle extends Phaser.Physics.Arcade.Sprite {
  protected glowGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this, false);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);
  }

  abstract updateObstacle(time: number, delta: number): void;

  destroy(fromScene?: boolean): void {
    this.glowGraphics?.destroy();
    super.destroy(fromScene);
  }
}

export class StaticLaser extends Obstacle {
  private orientation: string;
  private beamLength: number;
  private driftX: number;

  constructor(scene: Phaser.Scene, x: number, y: number, params: Record<string, number | string> = {}) {
    super(scene, x, y, 'laser');
    this.orientation = (params.orientation as string) ?? 'horizontal';
    this.beamLength = (params.length as number) ?? 0;
    this.driftX = (params.driftX as number) ?? 0;

    this.setVisible(false);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.orientation === 'horizontal') {
      const w = this.beamLength || 320;
      body.setSize(w, 6);
      body.setOffset(-w / 2, -3);
    } else {
      const h = this.beamLength || 240;
      body.setSize(6, h);
      body.setOffset(-3, -h / 2);
    }

    this.glowGraphics = scene.add.graphics();
    this.glowGraphics.setDepth(5);
    this.drawBeam(1);
  }

  private drawBeam(alpha: number): void {
    if (!this.glowGraphics) return;
    this.glowGraphics.clear();

    if (this.orientation === 'horizontal') {
      const w = this.beamLength || 320;
      this.glowGraphics.fillStyle(0xff0000, 0.1 * alpha);
      this.glowGraphics.fillRect(this.x - w / 2, this.y - 10, w, 20);
      this.glowGraphics.fillStyle(0xff0000, 0.3 * alpha);
      this.glowGraphics.fillRect(this.x - w / 2, this.y - 5, w, 10);
      this.glowGraphics.fillStyle(0xff4444, 0.9 * alpha);
      this.glowGraphics.fillRect(this.x - w / 2, this.y - 2, w, 4);
      this.glowGraphics.fillStyle(0xff8888, alpha);
      this.glowGraphics.fillRect(this.x - w / 2, this.y - 1, w, 2);
    } else {
      const h = this.beamLength || 240;
      this.glowGraphics.fillStyle(0xff0000, 0.1 * alpha);
      this.glowGraphics.fillRect(this.x - 10, this.y - h / 2, 20, h);
      this.glowGraphics.fillStyle(0xff0000, 0.3 * alpha);
      this.glowGraphics.fillRect(this.x - 5, this.y - h / 2, 10, h);
      this.glowGraphics.fillStyle(0xff4444, 0.9 * alpha);
      this.glowGraphics.fillRect(this.x - 2, this.y - h / 2, 4, h);
      this.glowGraphics.fillStyle(0xff8888, alpha);
      this.glowGraphics.fillRect(this.x - 1, this.y - h / 2, 2, h);
    }
  }

  updateObstacle(_time: number, delta: number): void {
    if (this.driftX !== 0) {
      this.x += this.driftX * (delta / 1000);
      this.drawBeam(1);
    }
  }
}

export class PulsingLaser extends Obstacle {
  private cycleTime: number;
  private orientation: string;
  private beamLength: number;
  private driftX: number;
  private elapsed: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, params: Record<string, number | string> = {}) {
    super(scene, x, y, 'laser');
    this.cycleTime = (params.cycleTime as number) ?? 1.5;
    this.orientation = (params.orientation as string) ?? 'horizontal';
    this.beamLength = (params.length as number) ?? 0;
    this.driftX = (params.driftX as number) ?? 0;

    this.setVisible(false);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.orientation === 'horizontal') {
      const w = this.beamLength || 320;
      body.setSize(w, 6);
      body.setOffset(-w / 2, -3);
    } else {
      const h = this.beamLength || 240;
      body.setSize(6, h);
      body.setOffset(-3, -h / 2);
    }

    this.glowGraphics = scene.add.graphics();
    this.glowGraphics.setDepth(5);
  }

  updateObstacle(_time: number, delta: number): void {
    this.elapsed += delta / 1000;

    if (this.driftX !== 0) {
      this.x += this.driftX * (delta / 1000);
    }

    const phase = this.elapsed % (this.cycleTime * 2);
    const isOn = phase < this.cycleTime;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = isOn;

    if (!this.glowGraphics) return;
    this.glowGraphics.clear();

    if (!isOn) {
      this.drawBeamGfx(0.15);
      return;
    }

    const cycleProgress = phase / this.cycleTime;
    const fadeIn = Math.min(cycleProgress * 5, 1);
    const fadeOut = Math.min((1 - cycleProgress) * 5, 1);
    const alpha = Math.min(fadeIn, fadeOut);
    this.drawBeamGfx(alpha);
  }

  private drawBeamGfx(alpha: number): void {
    if (!this.glowGraphics) return;

    if (this.orientation === 'horizontal') {
      const w = this.beamLength || 320;
      this.glowGraphics.fillStyle(0xff0000, 0.1 * alpha);
      this.glowGraphics.fillRect(this.x - w / 2, this.y - 10, w, 20);
      this.glowGraphics.fillStyle(0xff0000, 0.3 * alpha);
      this.glowGraphics.fillRect(this.x - w / 2, this.y - 5, w, 10);
      this.glowGraphics.fillStyle(0xff4444, 0.9 * alpha);
      this.glowGraphics.fillRect(this.x - w / 2, this.y - 2, w, 4);
      this.glowGraphics.fillStyle(0xff8888, alpha);
      this.glowGraphics.fillRect(this.x - w / 2, this.y - 1, w, 2);
    } else {
      const h = this.beamLength || 240;
      this.glowGraphics.fillStyle(0xff0000, 0.1 * alpha);
      this.glowGraphics.fillRect(this.x - 10, this.y - h / 2, 20, h);
      this.glowGraphics.fillStyle(0xff0000, 0.3 * alpha);
      this.glowGraphics.fillRect(this.x - 5, this.y - h / 2, 10, h);
      this.glowGraphics.fillStyle(0xff4444, 0.9 * alpha);
      this.glowGraphics.fillRect(this.x - 2, this.y - h / 2, 4, h);
      this.glowGraphics.fillStyle(0xff8888, alpha);
      this.glowGraphics.fillRect(this.x - 1, this.y - h / 2, 2, h);
    }
  }

  isOn(): boolean {
    const phase = this.elapsed % (this.cycleTime * 2);
    return phase < this.cycleTime;
  }

  getCycleTime(): number {
    return this.cycleTime;
  }
}

export class SwingingBall extends Obstacle {
  private radius: number;
  private swingSpeed: number;
  private anchorX: number;
  private anchorY: number;
  private elapsed: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, params: Record<string, number | string> = {}) {
    super(scene, x, y, 'swinging-ball');
    this.radius = (params.radius as number) ?? 120;
    this.swingSpeed = (params.speed as number) ?? 2;
    this.anchorX = x;
    this.anchorY = y;

    // Larger collision body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(16, 4, 4);

    this.glowGraphics = scene.add.graphics();
    this.glowGraphics.setDepth(4);
  }

  updateObstacle(_time: number, delta: number): void {
    this.elapsed += delta / 1000;
    const angle = Math.sin(this.elapsed * this.swingSpeed) * (Math.PI / 3);
    this.x = this.anchorX + Math.sin(angle) * this.radius;
    this.y = this.anchorY + Math.cos(angle) * this.radius;
    this.setRotation(angle);

    // Draw chain from anchor to ball
    if (this.glowGraphics) {
      this.glowGraphics.clear();
      // Chain line
      this.glowGraphics.lineStyle(2, 0x664400, 0.5);
      this.glowGraphics.lineBetween(this.anchorX, this.anchorY, this.x, this.y);
      // Anchor point
      this.glowGraphics.fillStyle(0x664400, 0.6);
      this.glowGraphics.fillCircle(this.anchorX, this.anchorY, 4);
      // Ball glow
      this.glowGraphics.fillStyle(0xff8800, 0.15);
      this.glowGraphics.fillCircle(this.x, this.y, 28);
    }
  }

  getSwingAngle(time: number): number {
    return Math.sin(time * this.swingSpeed) * (Math.PI / 3);
  }

  getRadius(): number {
    return this.radius;
  }
}

export class MovingWall extends Obstacle {
  private rangeY: number;
  private wallSpeed: number;
  private anchorY: number;
  private elapsed: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, params: Record<string, number | string> = {}) {
    super(scene, x, y, 'moving-wall');
    this.rangeY = (params.rangeY as number) ?? 200;
    this.wallSpeed = (params.speed as number) ?? 80;
    this.anchorY = y;
  }

  updateObstacle(_time: number, delta: number): void {
    this.elapsed += delta / 1000;
    this.y = this.anchorY + Math.sin(this.elapsed * (this.wallSpeed / 50)) * (this.rangeY / 2);
  }
}

export class PulsingZone extends Obstacle {
  private minRadius: number;
  private maxRadius: number;
  private pulseSpeed: number;
  private elapsed: number = 0;
  private zoneGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, params: Record<string, number | string> = {}) {
    super(scene, x, y, 'pulsing-zone');
    this.minRadius = (params.minRadius as number) ?? 40;
    this.maxRadius = (params.maxRadius as number) ?? 120;
    this.pulseSpeed = (params.speed as number) ?? 2;

    // Hide the sprite — we draw the zone with graphics for accurate sizing
    this.setVisible(false);

    // Set up a circular body at minRadius initially
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(this.minRadius);
    body.setOffset(-this.minRadius + this.width / 2, -this.minRadius + this.height / 2);

    this.zoneGraphics = scene.add.graphics();
    this.zoneGraphics.setDepth(5);
  }

  updateObstacle(_time: number, delta: number): void {
    this.elapsed += delta / 1000;
    const t = (Math.sin(this.elapsed * this.pulseSpeed) + 1) / 2;
    const r = this.minRadius + t * (this.maxRadius - this.minRadius);

    // Update collision circle to match visual radius
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(r);
    body.setOffset(-r + this.width / 2, -r + this.height / 2);

    // Draw the zone visually
    this.zoneGraphics.clear();
    this.zoneGraphics.fillStyle(0x00cccc, 0.06);
    this.zoneGraphics.fillCircle(this.x, this.y, r);
    this.zoneGraphics.fillStyle(0x00cccc, 0.1);
    this.zoneGraphics.fillCircle(this.x, this.y, r * 0.75);
    this.zoneGraphics.fillStyle(0x00cccc, 0.15);
    this.zoneGraphics.fillCircle(this.x, this.y, r * 0.5);
    this.zoneGraphics.lineStyle(2, 0x00ffff, 0.35);
    this.zoneGraphics.strokeCircle(this.x, this.y, r);
    this.zoneGraphics.lineStyle(1, 0x00ffff, 0.2);
    this.zoneGraphics.strokeCircle(this.x, this.y, r * 0.7);
    this.zoneGraphics.strokeCircle(this.x, this.y, r * 0.4);
  }

  getCurrentRadius(time: number): number {
    const t = (Math.sin(time * this.pulseSpeed) + 1) / 2;
    return this.minRadius + t * (this.maxRadius - this.minRadius);
  }

  destroy(fromScene?: boolean): void {
    this.zoneGraphics.destroy();
    super.destroy(fromScene);
  }
}

export class HomingMine extends Obstacle {
  private trackSpeed: number;
  private playerRef: Phaser.Physics.Arcade.Sprite | null = null;
  private activated: boolean = false;
  private activationRange: number;

  constructor(scene: Phaser.Scene, x: number, y: number, params: Record<string, number | string> = {}) {
    super(scene, x, y, 'homing-mine');
    this.trackSpeed = (params.speed as number) ?? 60;
    this.activationRange = (params.range as number) ?? 300;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(14, 6, 6);

    // Idle bob
    scene.tweens.add({
      targets: this,
      y: y - 6,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.glowGraphics = scene.add.graphics();
    this.glowGraphics.setDepth(4);
  }

  setPlayerRef(player: Phaser.Physics.Arcade.Sprite): void {
    this.playerRef = player;
  }

  updateObstacle(_time: number, delta: number): void {
    if (!this.playerRef) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);

    if (!this.activated && dist < this.activationRange) {
      this.activated = true;
      // Stop idle bob
      this.scene.tweens.killTweensOf(this);
    }

    if (this.activated) {
      // Move toward player
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
      const speed = this.trackSpeed * (delta / 1000);
      this.x += Math.cos(angle) * speed;
      this.y += Math.sin(angle) * speed;
      this.setRotation(this.rotation + delta * 0.005); // spin when active
    }

    // Draw activation radius + glow
    if (this.glowGraphics) {
      this.glowGraphics.clear();
      if (!this.activated) {
        // Show detection range as faint ring
        this.glowGraphics.lineStyle(1, 0xff0044, 0.1);
        this.glowGraphics.strokeCircle(this.x, this.y, this.activationRange);
      }
      // Mine glow
      const glowAlpha = this.activated ? 0.3 : 0.1;
      this.glowGraphics.fillStyle(0xff0044, glowAlpha);
      this.glowGraphics.fillCircle(this.x, this.y, 24);
    }
  }
}

export class LaserTurret extends Obstacle {
  private rotationSpeed: number;
  private beamLengthVal: number;
  private currentAngle: number = 0;
  private beamGraphics: Phaser.GameObjects.Graphics;
  private beamBody: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, params: Record<string, number | string> = {}) {
    super(scene, x, y, 'laser-turret');
    this.rotationSpeed = (params.speed as number) ?? 1.5;
    this.beamLengthVal = (params.beamLength as number) ?? 250;
    this.currentAngle = (params.startAngle as number) ?? 0;

    // The turret sprite itself doesn't hurt — the beam does
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;

    // Beam collision rectangle (we'll rotate it via position updates)
    this.beamBody = scene.add.rectangle(x, y, this.beamLengthVal, 6, 0xff0000, 0);
    scene.physics.add.existing(this.beamBody, false);
    const beamPhys = this.beamBody.body as Phaser.Physics.Arcade.Body;
    beamPhys.setImmovable(true);
    beamPhys.setAllowGravity(false);

    this.beamGraphics = scene.add.graphics();
    this.beamGraphics.setDepth(5);

    this.glowGraphics = scene.add.graphics();
    this.glowGraphics.setDepth(4);
  }

  getBeamBody(): Phaser.GameObjects.Rectangle {
    return this.beamBody;
  }

  updateObstacle(_time: number, delta: number): void {
    this.currentAngle += this.rotationSpeed * (delta / 1000);

    const endX = this.x + Math.cos(this.currentAngle) * this.beamLengthVal;
    const endY = this.y + Math.sin(this.currentAngle) * this.beamLengthVal;

    // Position beam body at midpoint of the beam line
    const midX = (this.x + endX) / 2;
    const midY = (this.y + endY) / 2;
    this.beamBody.setPosition(midX, midY);
    this.beamBody.setRotation(this.currentAngle);

    // Draw beam
    this.beamGraphics.clear();
    // Outer glow
    this.beamGraphics.lineStyle(12, 0xff0000, 0.08);
    this.beamGraphics.lineBetween(this.x, this.y, endX, endY);
    // Mid glow
    this.beamGraphics.lineStyle(6, 0xff0000, 0.2);
    this.beamGraphics.lineBetween(this.x, this.y, endX, endY);
    // Core beam
    this.beamGraphics.lineStyle(3, 0xff4444, 0.8);
    this.beamGraphics.lineBetween(this.x, this.y, endX, endY);
    // Hot core
    this.beamGraphics.lineStyle(1, 0xff8888, 1);
    this.beamGraphics.lineBetween(this.x, this.y, endX, endY);

    // Turret base glow
    if (this.glowGraphics) {
      this.glowGraphics.clear();
      this.glowGraphics.fillStyle(0xff2200, 0.15);
      this.glowGraphics.fillCircle(this.x, this.y, 22);
    }
  }

  destroy(fromScene?: boolean): void {
    this.beamGraphics.destroy();
    this.beamBody.destroy();
    super.destroy(fromScene);
  }
}

export class Asteroid extends Obstacle {
  private driftSpeedX: number;
  private driftSpeedY: number;
  private rotSpeed: number;
  private asteroidScale: number;

  constructor(scene: Phaser.Scene, x: number, y: number, params: Record<string, number | string> = {}) {
    super(scene, x, y, 'asteroid');
    this.driftSpeedX = (params.driftX as number) ?? 0;
    this.driftSpeedY = (params.driftY as number) ?? 0;
    this.rotSpeed = (params.rotSpeed as number) ?? 1;
    this.asteroidScale = (params.scale as number) ?? 1;

    this.setScale(this.asteroidScale);

    const body = this.body as Phaser.Physics.Arcade.Body;
    const r = 14 * this.asteroidScale;
    body.setCircle(r, (20 * this.asteroidScale) - r, (20 * this.asteroidScale) - r);
  }

  updateObstacle(_time: number, delta: number): void {
    const dt = delta / 1000;
    this.x += this.driftSpeedX * dt;
    this.y += this.driftSpeedY * dt;
    this.rotation += this.rotSpeed * dt;
  }
}

export function createObstacle(
  scene: Phaser.Scene,
  type: string,
  x: number,
  y: number,
  params: Record<string, number | string> = {},
): Obstacle {
  switch (type) {
    case 'static-laser': return new StaticLaser(scene, x, y, params);
    case 'pulsing-laser': return new PulsingLaser(scene, x, y, params);
    case 'swinging-ball': return new SwingingBall(scene, x, y, params);
    case 'moving-wall': return new MovingWall(scene, x, y, params);
    case 'pulsing-zone': return new PulsingZone(scene, x, y, params);
    case 'homing-mine': return new HomingMine(scene, x, y, params);
    case 'laser-turret': return new LaserTurret(scene, x, y, params);
    case 'asteroid': return new Asteroid(scene, x, y, params);
    default: throw new Error(`Unknown obstacle type: ${type}`);
  }
}
