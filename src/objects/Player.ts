import Phaser from 'phaser';
import { PHYSICS, GAMEPLAY, GAME_HEIGHT } from '@/config/game';
import { VirtualJoystick } from '@/objects/VirtualJoystick';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private joystick: VirtualJoystick | null = null;
  private lives: number = GAMEPLAY.startingLives;
  private isInvulnerable: boolean = false;
  private invulnerabilityTimer: Phaser.Time.TimerEvent | null = null;
  private collectedPowerUps: number = 0;

  // Power-up state
  private shieldActive: boolean = false;
  private slowMotionActive: boolean = false;
  private shieldTimer: Phaser.Time.TimerEvent | null = null;
  private slowMotionTimer: Phaser.Time.TimerEvent | null = null;
  private shieldGraphics: Phaser.GameObjects.Arc | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setScale(1);
    // Collision body covers full wingspan
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(56, 24);
    body.setOffset(4, 20);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }
  }

  setJoystick(joystick: VirtualJoystick): void {
    this.joystick = joystick;
  }

  update(): void {
    this.handleMovement();
    this.updateShieldGraphics();
  }

  private handleMovement(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const accel = PHYSICS.playerAcceleration;
    const decel = PHYSICS.playerDeceleration;
    const maxSpeed = PHYSICS.playerMaxSpeed;

    let ax = 0;
    let ay = 0;

    const left = this.cursors?.left.isDown || this.wasd?.left.isDown;
    const right = this.cursors?.right.isDown || this.wasd?.right.isDown;
    const up = this.cursors?.up.isDown || this.wasd?.up.isDown;
    const down = this.cursors?.down.isDown || this.wasd?.down.isDown;

    if (left) ax = -accel;
    else if (right) ax = accel;

    if (up) ay = -accel;
    else if (down) ay = accel;

    // Virtual joystick input (overrides keyboard if active)
    if (this.joystick && this.joystick.getIsActive()) {
      const jx = this.joystick.getX();
      const jy = this.joystick.getY();
      // Apply dead zone (ignore tiny movements)
      if (Math.abs(jx) > 0.15) ax = jx * accel;
      if (Math.abs(jy) > 0.15) ay = jy * accel;
    }

    // Apply acceleration or deceleration
    if (ax !== 0) {
      body.setAccelerationX(ax);
    } else {
      body.setAccelerationX(0);
      body.setDragX(decel);
    }

    if (ay !== 0) {
      body.setAccelerationY(ay);
    } else {
      body.setAccelerationY(0);
      body.setDragY(decel);
    }

    body.setMaxVelocity(maxSpeed);

    // Lean rotation toward movement direction
    const targetAngle = (body.velocity.x / maxSpeed) * PHYSICS.playerRotationLean;
    this.angle = Phaser.Math.Linear(this.angle, targetAngle, 0.1);

    // Keep within viewport vertically
    this.y = Phaser.Math.Clamp(this.y, 20, GAME_HEIGHT - 20);
  }

  private updateShieldGraphics(): void {
    if (this.shieldGraphics) {
      this.shieldGraphics.setPosition(this.x, this.y);
    }
  }

  hit(): boolean {
    if (this.isInvulnerable) return false;

    if (this.shieldActive) {
      this.deactivateShield();
      // Brief invulnerability so overlapping obstacles in the same frame don't hit twice
      this.startInvulnerability();
      return false;
    }

    this.lives = Math.max(0, this.lives - 1);
    this.startInvulnerability();
    return true;
  }

  private startInvulnerability(): void {
    this.isInvulnerable = true;

    // Flash effect
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.3, to: 1 },
      duration: 100,
      repeat: 9,
      yoyo: true,
    });

    this.invulnerabilityTimer = this.scene.time.delayedCall(
      GAMEPLAY.invulnerabilityDuration,
      () => {
        this.isInvulnerable = false;
        this.setAlpha(1);
      },
    );
  }

  // Power-up methods
  activateShield(): void {
    this.collectedPowerUps++;
    this.shieldActive = true;

    this.shieldTimer?.destroy();
    this.shieldGraphics?.destroy();

    this.shieldGraphics = this.scene.add.circle(this.x, this.y, 30, 0x4488ff, 0.2);
    this.shieldGraphics.setStrokeStyle(2, 0x4488ff, 0.6);

    this.shieldTimer = this.scene.time.delayedCall(5000, () => {
      this.deactivateShield();
    });
  }

  private deactivateShield(): void {
    this.shieldActive = false;
    this.shieldTimer?.destroy();
    this.shieldTimer = null;
    this.shieldGraphics?.destroy();
    this.shieldGraphics = null;
  }

  activateExtraLife(): void {
    this.collectedPowerUps++;
    if (this.lives < GAMEPLAY.maxLives) {
      this.lives++;
    }
  }

  activateSlowMotion(): void {
    this.collectedPowerUps++;
    this.slowMotionActive = true;
    this.slowMotionTimer?.destroy();
    this.slowMotionTimer = this.scene.time.delayedCall(3000, () => {
      this.slowMotionActive = false;
      this.slowMotionTimer = null;
    });
  }

  getSlowMotionMultiplier(): number {
    return this.slowMotionActive ? 0.5 : 1;
  }

  getLives(): number {
    return this.lives;
  }

  isDead(): boolean {
    return this.lives <= 0;
  }

  getCollectedPowerUps(): number {
    return this.collectedPowerUps;
  }

  isShieldActive(): boolean {
    return this.shieldActive;
  }

  isSlowMotionActive(): boolean {
    return this.slowMotionActive;
  }

  getShieldRemainingTime(): number {
    if (!this.shieldTimer) return 0;
    return Math.max(0, this.shieldTimer.getRemaining() / 1000);
  }

  getSlowMotionRemainingTime(): number {
    if (!this.slowMotionTimer) return 0;
    return Math.max(0, this.slowMotionTimer.getRemaining() / 1000);
  }

  isAccelerating(): boolean {
    const keyboard = !!(
      this.cursors?.left.isDown || this.cursors?.right.isDown ||
      this.cursors?.up.isDown || this.cursors?.down.isDown ||
      this.wasd?.left.isDown || this.wasd?.right.isDown ||
      this.wasd?.up.isDown || this.wasd?.down.isDown
    );
    const joystick = this.joystick?.getIsActive() &&
      (Math.abs(this.joystick.getX()) > 0.15 || Math.abs(this.joystick.getY()) > 0.15);
    return keyboard || !!joystick;
  }

  resetForLevel(): void {
    this.lives = GAMEPLAY.startingLives;
    this.collectedPowerUps = 0;
    this.isInvulnerable = false;
    this.shieldActive = false;
    this.slowMotionActive = false;
    this.invulnerabilityTimer?.destroy();
    this.shieldTimer?.destroy();
    this.slowMotionTimer?.destroy();
    this.shieldGraphics?.destroy();
    this.shieldGraphics = null;
    this.setAlpha(1);
    this.angle = 0;
  }

  destroy(fromScene?: boolean): void {
    this.invulnerabilityTimer?.destroy();
    this.shieldTimer?.destroy();
    this.slowMotionTimer?.destroy();
    this.shieldGraphics?.destroy();
    super.destroy(fromScene);
  }
}
