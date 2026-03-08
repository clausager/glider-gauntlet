import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/game';
import { levels, LevelConfig } from '@/config/levels';
import { Player } from '@/objects/Player';
import { Obstacle, HomingMine, LaserTurret, createObstacle } from '@/objects/Obstacle';
import { Checkpoint } from '@/objects/Checkpoint';
import { PowerUp } from '@/objects/PowerUp';
import { HUD } from '@/objects/HUD';
import { calculateScore } from '@/utils/score';
import { VirtualJoystick } from '@/objects/VirtualJoystick';
import { audioManager } from '@/audio/AudioManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private obstacles: Obstacle[] = [];
  private checkpoints: Checkpoint[] = [];
  private powerUps: PowerUp[] = [];
  private hud!: HUD;
  private levelConfig!: LevelConfig;
  private lastCheckpointPos: { x: number; y: number } = { x: 100, y: GAME_HEIGHT / 2 };
  private distanceTravelled: number = 0;
  private startTime: number = 0;
  private isPaused: boolean = false;

  // Parallax layers
  private bgNebula!: Phaser.GameObjects.TileSprite;
  private bgStarsFar!: Phaser.GameObjects.TileSprite;
  private bgStarsMid!: Phaser.GameObjects.TileSprite;
  private bgStarsNear!: Phaser.GameObjects.TileSprite;

  // Particle emitters
  private thrusterEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Touch controls
  private joystick!: VirtualJoystick;

  constructor() {
    super({ key: 'Game' });
  }

  init(data: { levelId: number }): void {
    const config = levels.find(l => l.id === data.levelId);
    if (!config) throw new Error(`Level ${data.levelId} not found`);
    this.levelConfig = config;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x020210);

    // Reset state
    this.obstacles = [];
    this.checkpoints = [];
    this.powerUps = [];
    this.distanceTravelled = 0;
    this.startTime = this.time.now;
    this.isPaused = false;
    this.lastCheckpointPos = { x: 100, y: GAME_HEIGHT / 2 };

    // Parallax background (4 layers)
    this.createBackground();

    // Set world bounds to level length
    this.physics.world.setBounds(0, 0, this.levelConfig.levelLength, GAME_HEIGHT);

    // Create player
    this.player = new Player(this, 100, GAME_HEIGHT / 2);
    this.player.resetForLevel();
    this.player.setDepth(10);

    // Virtual joystick for touch controls
    this.joystick = new VirtualJoystick(this);
    this.player.setJoystick(this.joystick);

    // Thruster particles
    this.createThrusterEffect();

    // Create obstacles
    for (const obs of this.levelConfig.obstacles) {
      const obstacle = createObstacle(this, obs.type, obs.x, obs.y, obs.params ?? {});
      obstacle.setDepth(5);
      this.obstacles.push(obstacle);

      // Give homing mines a player reference
      if (obstacle instanceof HomingMine) {
        obstacle.setPlayerRef(this.player);
      }
    }

    // Create checkpoints
    for (const cp of this.levelConfig.checkpoints) {
      const checkpoint = new Checkpoint(this, cp.x, cp.y);
      checkpoint.setDepth(4);
      this.checkpoints.push(checkpoint);
    }

    // Create power-ups
    for (const pu of this.levelConfig.powerUps) {
      const powerUp = new PowerUp(this, pu.x, pu.y, pu.type);
      powerUp.setDepth(6);
      this.powerUps.push(powerUp);
    }

    // Set up collisions
    this.setupCollisions();

    // Camera follows player horizontally
    this.cameras.main.startFollow(this.player, false, 0.1, 0, -GAME_WIDTH / 3, 0);
    this.cameras.main.setBounds(0, 0, this.levelConfig.levelLength, GAME_HEIGHT);

    // HUD
    this.hud = new HUD(this);

    // Pause key
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => this.togglePause());
      this.input.keyboard.on('keydown-P', () => this.togglePause());
    }

    // Ensure audio is unlocked (mobile) and start level music
    audioManager.resumeAudio();
    audioManager.playLevelMusic(this.levelConfig.id);

    // Countdown before starting
    this.showCountdown();
  }

  private createBackground(): void {
    // Layer 1: Nebula (very slow)
    this.bgNebula = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-nebula');
    this.bgNebula.setOrigin(0, 0).setScrollFactor(0).setDepth(-10).setAlpha(0.6);

    // Layer 2: Far stars (slow)
    this.bgStarsFar = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-stars-far');
    this.bgStarsFar.setOrigin(0, 0).setScrollFactor(0).setDepth(-9).setAlpha(0.5);

    // Layer 3: Mid stars
    this.bgStarsMid = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-stars-mid');
    this.bgStarsMid.setOrigin(0, 0).setScrollFactor(0).setDepth(-8);

    // Layer 4: Near stars (fast)
    this.bgStarsNear = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-stars-near');
    this.bgStarsNear.setOrigin(0, 0).setScrollFactor(0).setDepth(-7);
  }

  private createThrusterEffect(): void {
    this.thrusterEmitter = this.add.particles(0, 0, 'glow-particle', {
      follow: this.player,
      followOffset: { x: -20, y: 8 },
      speed: { min: 30, max: 80 },
      angle: { min: 160, max: 200 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: { min: 200, max: 500 },
      frequency: 30,
      tint: [0xff6600, 0xffaa00, 0xff4400],
      blendMode: Phaser.BlendModes.ADD,
    });
    this.thrusterEmitter.setDepth(9);
  }

  private setupCollisions(): void {
    for (const obstacle of this.obstacles) {
      this.physics.add.overlap(this.player, obstacle, () => this.onObstacleHit(), undefined, this);

      // Laser turrets use a separate beam body for collision
      if (obstacle instanceof LaserTurret) {
        this.physics.add.overlap(this.player, obstacle.getBeamBody(), () => this.onObstacleHit(), undefined, this);
      }
    }
    for (const checkpoint of this.checkpoints) {
      this.physics.add.overlap(this.player, checkpoint, () => this.onCheckpointReached(checkpoint), undefined, this);
    }
    for (const powerUp of this.powerUps) {
      this.physics.add.overlap(this.player, powerUp, () => this.onPowerUpCollected(powerUp), undefined, this);
    }
  }

  private showCountdown(): void {
    this.player.setActive(false);
    (this.player.body as Phaser.Physics.Arcade.Body).moves = false;

    const countdownText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '3', {
      fontFamily: 'monospace',
      fontSize: '72px',
      color: '#00ffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    let count = 3;
    this.time.addEvent({
      delay: 700,
      repeat: 3,
      callback: () => {
        count--;
        if (count > 0) {
          countdownText.setText(`${count}`);
          audioManager.playCountdownTick();
          this.tweens.add({
            targets: countdownText,
            scaleX: { from: 1.5, to: 1 },
            scaleY: { from: 1.5, to: 1 },
            duration: 300,
            ease: 'Back.easeOut',
          });
        } else if (count === 0) {
          countdownText.setText('GO!');
          countdownText.setColor('#00ff88');
          audioManager.playCountdownGo();
          this.tweens.add({
            targets: countdownText,
            scaleX: { from: 2, to: 1 },
            scaleY: { from: 2, to: 1 },
            duration: 300,
            ease: 'Back.easeOut',
          });
        } else {
          countdownText.destroy();
          this.player.setActive(true);
          (this.player.body as Phaser.Physics.Arcade.Body).moves = true;
          this.startTime = this.time.now;
        }
      },
    });
  }

  update(time: number, delta: number): void {
    if (this.isPaused || !this.player.active) return;

    // Auto-scroll: push player forward
    const scrollSpeed = this.levelConfig.scrollSpeed * this.player.getSlowMotionMultiplier();
    this.player.x += scrollSpeed * (delta / 1000);
    this.distanceTravelled = this.player.x - 100;

    // Clamp player within viewport
    const cam = this.cameras.main;
    const leftBound = cam.scrollX + 50;
    const rightBound = cam.scrollX + GAME_WIDTH - 50;
    this.player.x = Phaser.Math.Clamp(this.player.x, leftBound, rightBound);

    // Update player
    this.player.update();

    // Thruster sound
    if (this.player.isAccelerating()) {
      audioManager.startThruster();
    } else {
      audioManager.stopThruster();
    }

    // Update obstacles
    for (const obstacle of this.obstacles) {
      obstacle.updateObstacle(time, delta);
    }

    // Update parallax (different speeds per layer)
    this.bgNebula.tilePositionX = cam.scrollX * 0.03;
    this.bgStarsFar.tilePositionX = cam.scrollX * 0.08;
    this.bgStarsMid.tilePositionX = cam.scrollX * 0.2;
    this.bgStarsNear.tilePositionX = cam.scrollX * 0.4;

    // Update HUD
    const elapsed = (this.time.now - this.startTime) / 1000;
    const currentScore = calculateScore(
      this.distanceTravelled,
      elapsed,
      this.levelConfig.parTime,
      this.player.getLives(),
      this.player.getCollectedPowerUps(),
    );
    this.hud.updateLives(this.player.getLives());
    this.hud.updateScore(currentScore.total);

    // Power-up HUD
    if (this.player.isShieldActive()) {
      this.hud.updatePowerUp('shield', this.player.getShieldRemainingTime());
    } else if (this.player.isSlowMotionActive()) {
      this.hud.updatePowerUp('slow-motion', this.player.getSlowMotionRemainingTime());
    } else {
      this.hud.updatePowerUp(null, 0);
    }

    // Check level completion
    if (this.player.x >= this.levelConfig.levelLength - 100) {
      this.onLevelComplete();
    }
  }

  private onObstacleHit(): void {
    const wasHit = this.player.hit();
    if (!wasHit) return;

    audioManager.stopThruster();
    audioManager.playHit();

    // Hit impact particles
    this.spawnHitEffect(this.player.x, this.player.y);

    if (this.player.isDead()) {
      this.gameOver();
    } else {
      this.player.setPosition(this.lastCheckpointPos.x, this.lastCheckpointPos.y);
    }
  }

  private spawnHitEffect(x: number, y: number): void {
    // Burst of red/orange sparks
    const emitter = this.add.particles(x, y, 'spark', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 20,
      tint: [0xff4444, 0xff8800, 0xffcc00],
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });
    emitter.setDepth(20);
    emitter.explode(20);
    this.time.delayedCall(500, () => emitter.destroy());

    // Screen shake
    this.cameras.main.shake(200, 0.01);

    // Brief red flash
    this.cameras.main.flash(150, 255, 50, 50, false);
  }

  private onCheckpointReached(checkpoint: Checkpoint): void {
    if (checkpoint.isActivated()) return;
    checkpoint.activate();
    this.lastCheckpointPos = checkpoint.getRespawnPosition();
    audioManager.playCheckpoint();

    // Checkpoint sparkle effect
    const pos = checkpoint.getRespawnPosition();
    const emitter = this.add.particles(pos.x, pos.y, 'spark', {
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 15,
      tint: [0x00ff88, 0xaaffcc, 0xffff00],
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });
    emitter.setDepth(20);
    emitter.explode(15);
    this.time.delayedCall(700, () => emitter.destroy());
  }

  private onPowerUpCollected(powerUp: PowerUp): void {
    if (powerUp.isCollected()) return;
    const type = powerUp.collect();

    // Pickup sparkle
    const tints: Record<string, number[]> = {
      'shield': [0x4488ff, 0x88ccff],
      'extra-life': [0xff4444, 0xff8888],
      'slow-motion': [0xffaa00, 0xffcc44],
    };
    const emitter = this.add.particles(powerUp.x, powerUp.y, 'spark', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 10,
      tint: tints[type] ?? [0xffffff],
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });
    emitter.setDepth(20);
    emitter.explode(10);
    this.time.delayedCall(500, () => emitter.destroy());

    audioManager.playPowerUp(type);

    switch (type) {
      case 'shield':
        this.player.activateShield();
        break;
      case 'extra-life':
        this.player.activateExtraLife();
        break;
      case 'slow-motion':
        this.player.activateSlowMotion();
        break;
    }
  }

  private onLevelComplete(): void {
    audioManager.stopThruster();
    audioManager.playLevelComplete();
    audioManager.stopMusic();

    const elapsed = (this.time.now - this.startTime) / 1000;
    const score = calculateScore(
      this.distanceTravelled,
      elapsed,
      this.levelConfig.parTime,
      this.player.getLives(),
      this.player.getCollectedPowerUps(),
    );

    this.scene.start('GameOver', {
      levelId: this.levelConfig.id,
      score,
      completed: true,
      elapsedTime: elapsed,
    });
  }

  private gameOver(): void {
    audioManager.stopThruster();
    audioManager.playGameOver();
    audioManager.stopMusic();

    const elapsed = (this.time.now - this.startTime) / 1000;
    const score = calculateScore(
      this.distanceTravelled,
      elapsed,
      this.levelConfig.parTime,
      0,
      this.player.getCollectedPowerUps(),
    );

    this.scene.start('GameOver', {
      levelId: this.levelConfig.id,
      score,
      completed: false,
      elapsedTime: elapsed,
    });
  }

  private togglePause(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.scene.resume();
    } else {
      this.isPaused = true;
      this.scene.pause();
      this.scene.launch('Pause', { returnScene: 'Game' });
    }
  }
}
