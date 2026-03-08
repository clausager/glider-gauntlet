import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/game';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Pause' });
  }

  create(data: { returnScene: string }): void {
    // Semi-transparent overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    const centerX = GAME_WIDTH / 2;

    this.add.text(centerX, GAME_HEIGHT / 3, 'PAUSED', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#00ffff',
    }).setOrigin(0.5);

    // Resume
    const resumeBtn = this.add.text(centerX, GAME_HEIGHT / 2, '[ RESUME ]', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#00ff88',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    resumeBtn.on('pointerover', () => resumeBtn.setColor('#ffffff'));
    resumeBtn.on('pointerout', () => resumeBtn.setColor('#00ff88'));
    resumeBtn.on('pointerdown', () => {
      this.scene.resume(data.returnScene);
      this.scene.stop();
    });

    // Quit to menu
    const quitBtn = this.add.text(centerX, GAME_HEIGHT / 2 + 60, '[ QUIT TO MENU ]', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    quitBtn.on('pointerover', () => quitBtn.setColor('#ffffff'));
    quitBtn.on('pointerout', () => quitBtn.setColor('#aaaaaa'));
    quitBtn.on('pointerdown', () => {
      this.scene.stop(data.returnScene);
      this.scene.start('MainMenu');
    });

    // ESC to resume
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => {
        this.scene.resume(data.returnScene);
        this.scene.stop();
      });
    }
  }
}
