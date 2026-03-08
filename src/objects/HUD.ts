import Phaser from 'phaser';
import { GAME_WIDTH } from '@/config/game';

export class HUD {
  private scene: Phaser.Scene;
  private livesText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private powerUpText!: Phaser.GameObjects.Text;
  private pauseBtn!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  private create(): void {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
    };

    // Lives (top-left)
    this.livesText = this.scene.add.text(20, 16, '', { ...style, color: '#ff4444' });
    this.livesText.setScrollFactor(0).setDepth(100);

    // Score (top-center)
    this.scoreText = this.scene.add.text(GAME_WIDTH / 2, 16, 'Score: 0', style);
    this.scoreText.setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    // Power-up indicator (top-right area)
    this.powerUpText = this.scene.add.text(GAME_WIDTH - 20, 16, '', {
      ...style,
      color: '#00ffff',
      fontSize: '16px',
    });
    this.powerUpText.setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // Pause button (top-right corner)
    this.pauseBtn = this.scene.add.text(GAME_WIDTH - 20, 50, '|| PAUSE', {
      ...style,
      fontSize: '16px',
      color: '#aaaaaa',
    });
    this.pauseBtn.setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    this.pauseBtn.setInteractive({ useHandCursor: true });
    this.pauseBtn.on('pointerdown', () => {
      this.scene.scene.pause();
      this.scene.scene.launch('Pause', { returnScene: this.scene.scene.key });
    });
  }

  updateLives(lives: number): void {
    const hearts = '\u2764'.repeat(lives);
    this.livesText.setText(hearts);
  }

  updateScore(score: number): void {
    this.scoreText.setText(`Score: ${score}`);
  }

  updatePowerUp(type: string | null, remaining: number): void {
    if (!type || remaining <= 0) {
      this.powerUpText.setText('');
      return;
    }
    const label = type === 'shield' ? 'SHIELD' : 'SLOW-MO';
    this.powerUpText.setText(`${label} ${remaining.toFixed(1)}s`);
  }

  destroy(): void {
    this.livesText.destroy();
    this.scoreText.destroy();
    this.powerUpText.destroy();
    this.pauseBtn.destroy();
  }
}
