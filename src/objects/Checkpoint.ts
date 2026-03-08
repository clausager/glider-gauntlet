import Phaser from 'phaser';

export class Checkpoint extends Phaser.Physics.Arcade.Sprite {
  private activated: boolean = false;
  private checkpointX: number;
  private checkpointY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'checkpoint');
    this.checkpointX = x;
    this.checkpointY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this, false);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);

    // Idle pulsing animation
    scene.tweens.add({
      targets: this,
      scaleX: { from: 1, to: 1.2 },
      scaleY: { from: 1, to: 1.2 },
      alpha: { from: 0.7, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  activate(): void {
    if (this.activated) return;
    this.activated = true;
    this.setTexture('checkpoint-active');

    // Activation flash
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 1.5, to: 1 },
      scaleY: { from: 1.5, to: 1 },
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  isActivated(): boolean {
    return this.activated;
  }

  getRespawnPosition(): { x: number; y: number } {
    return { x: this.checkpointX, y: this.checkpointY };
  }

  reset(): void {
    this.activated = false;
    this.setTexture('checkpoint');
  }
}
