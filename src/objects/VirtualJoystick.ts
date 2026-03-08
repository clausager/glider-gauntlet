import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/game';

/**
 * On-screen virtual joystick for touch/mobile input.
 * Shows a base circle and a movable thumb that returns normalized X/Y (-1 to 1).
 * Only visible and active on touch-capable devices.
 */
export class VirtualJoystick {
  private scene: Phaser.Scene;
  private base: Phaser.GameObjects.Image;
  private thumb: Phaser.GameObjects.Image;
  private isActive = false;
  private valueX = 0;
  private valueY = 0;
  private readonly radius = 50;
  private activePointerId: number | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Position in bottom-left area
    const baseX = 120;
    const baseY = GAME_HEIGHT - 120;

    this.base = scene.add.image(baseX, baseY, 'joystick-base');
    this.base.setScrollFactor(0).setDepth(100).setAlpha(0.4);

    this.thumb = scene.add.image(baseX, baseY, 'joystick-thumb');
    this.thumb.setScrollFactor(0).setDepth(101).setAlpha(0.6);

    // Only show on touch devices
    if (!scene.sys.game.device.input.touch) {
      this.base.setVisible(false);
      this.thumb.setVisible(false);
      return;
    }

    // Enable multi-touch
    scene.input.addPointer(1);

    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Only capture touches on the left half of the screen
      if (pointer.x < GAME_WIDTH / 2 && this.activePointerId === null) {
        this.activePointerId = pointer.id;
        this.isActive = true;
        // Move base to where the touch started
        this.base.setPosition(pointer.x, pointer.y);
        this.thumb.setPosition(pointer.x, pointer.y);
        this.base.setAlpha(0.5);
        this.thumb.setAlpha(0.8);
      }
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== this.activePointerId || !this.isActive) return;

      const dx = pointer.x - this.base.x;
      const dy = pointer.y - this.base.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        const clamped = Math.min(dist, this.radius);
        const angle = Math.atan2(dy, dx);
        this.thumb.setPosition(
          this.base.x + Math.cos(angle) * clamped,
          this.base.y + Math.sin(angle) * clamped,
        );
        this.valueX = (Math.cos(angle) * clamped) / this.radius;
        this.valueY = (Math.sin(angle) * clamped) / this.radius;
      }
    });

    const onRelease = (pointer: Phaser.Input.Pointer): void => {
      if (pointer.id !== this.activePointerId) return;
      this.activePointerId = null;
      this.isActive = false;
      this.valueX = 0;
      this.valueY = 0;
      // Reset thumb to base center
      this.thumb.setPosition(this.base.x, this.base.y);
      this.base.setAlpha(0.4);
      this.thumb.setAlpha(0.6);
      // Reset base to default position
      this.base.setPosition(120, GAME_HEIGHT - 120);
      this.thumb.setPosition(120, GAME_HEIGHT - 120);
    };

    scene.input.on('pointerup', onRelease);
    scene.input.on('pointerupoutside', onRelease);
  }

  getX(): number { return this.valueX; }
  getY(): number { return this.valueY; }
  getIsActive(): boolean { return this.isActive; }

  destroy(): void {
    this.base.destroy();
    this.thumb.destroy();
  }
}
