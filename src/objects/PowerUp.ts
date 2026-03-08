import Phaser from 'phaser';

export type PowerUpType = 'shield' | 'extra-life' | 'slow-motion';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  private powerUpType: PowerUpType;
  private collected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    super(scene, x, y, `powerup-${type}`);
    this.powerUpType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this, false);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);

    // Floating animation
    scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Glow pulse
    scene.tweens.add({
      targets: this,
      alpha: { from: 0.7, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  collect(): PowerUpType {
    if (this.collected) return this.powerUpType;
    this.collected = true;

    // Pickup burst animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => this.destroy(),
    });

    return this.powerUpType;
  }

  isCollected(): boolean {
    return this.collected;
  }

  getPowerUpType(): PowerUpType {
    return this.powerUpType;
  }
}
