import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/game';
import { ScoreBreakdown } from '@/utils/score';
import { levels } from '@/config/levels';
import { saveScore, completeLevel } from '@/utils/storage';
import { audioManager } from '@/audio/AudioManager';

interface GameOverData {
  levelId: number;
  score: ScoreBreakdown;
  completed: boolean;
  elapsedTime: number;
}

export class GameOverScene extends Phaser.Scene {
  private result!: GameOverData;

  constructor() {
    super({ key: 'GameOver' });
  }

  init(data: GameOverData): void {
    this.result = data;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0a0a2e);

    const { levelId, score, completed } = this.result;
    const centerX = GAME_WIDTH / 2;

    // Save score and unlock next level if completed
    const isNewRecord = saveScore(levelId, score.total);
    if (completed) {
      completeLevel(levelId);
    }

    // Title
    const title = completed ? 'LEVEL COMPLETE!' : 'GAME OVER';
    const titleColor = completed ? '#00ff88' : '#ff4444';
    this.add.text(centerX, 100, title, {
      fontFamily: 'monospace',
      fontSize: '52px',
      color: titleColor,
    }).setOrigin(0.5);

    // New record
    if (isNewRecord) {
      this.add.text(centerX, 160, 'NEW RECORD!', {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#ffff00',
      }).setOrigin(0.5);
    }

    // Score breakdown
    const breakdownY = 220;
    const lineHeight = 35;
    const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#aaaaaa',
    };
    const valueStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
    };

    const rows = [
      ['Distance', `${score.distance}`],
      ['Time Bonus', `${score.timeBonus}`],
      ['Life Bonus', `${score.lifeBonus}`],
      ['Power-Up Bonus', `${score.powerUpBonus}`],
    ];

    rows.forEach(([label, value], i) => {
      this.add.text(centerX - 150, breakdownY + i * lineHeight, label, labelStyle);
      this.add.text(centerX + 150, breakdownY + i * lineHeight, value, valueStyle).setOrigin(1, 0);
    });

    // Divider
    const divY = breakdownY + rows.length * lineHeight + 10;
    this.add.rectangle(centerX, divY, 300, 2, 0x444466);

    // Total
    this.add.text(centerX - 150, divY + 15, 'TOTAL', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#00ffff',
    });
    this.add.text(centerX + 150, divY + 15, `${score.total}`, {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#00ffff',
    }).setOrigin(1, 0);

    // Determine if there's a next level
    const hasNextLevel = completed && levels.some(l => l.id === levelId + 1);
    let btnY = divY + 80;

    // Primary action: Next Level (on completion) or Retry (on game over)
    const primaryAction = (): void => {
      audioManager.playMenuClick();
      if (hasNextLevel) {
        this.scene.start('Game', { levelId: levelId + 1 });
      } else {
        this.scene.start('Game', { levelId });
      }
    };

    const primaryLabel = hasNextLevel ? '[ NEXT LEVEL ]' : '[ RETRY ]';
    const primaryBtn = this.add.text(centerX, btnY, primaryLabel, {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#00ff88',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    primaryBtn.on('pointerover', () => primaryBtn.setColor('#ffffff'));
    primaryBtn.on('pointerout', () => primaryBtn.setColor('#00ff88'));
    primaryBtn.on('pointerdown', primaryAction);

    // Hint for keyboard shortcut
    this.add.text(centerX, btnY + 30, 'Press ENTER or SPACE', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#446655',
    }).setOrigin(0.5);

    btnY += 60;

    // Secondary: Retry (only shown when primary is Next Level)
    if (hasNextLevel) {
      const retryBtn = this.add.text(centerX, btnY, '[ RETRY ]', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#aaaaaa',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      retryBtn.on('pointerover', () => retryBtn.setColor('#ffffff'));
      retryBtn.on('pointerout', () => retryBtn.setColor('#aaaaaa'));
      retryBtn.on('pointerdown', () => {
        audioManager.playMenuClick();
        this.scene.start('Game', { levelId });
      });

      btnY += 40;
    }

    // Level Select
    const menuBtn = this.add.text(centerX, btnY, '[ LEVEL SELECT ]', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setColor('#ffffff'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#aaaaaa'));
    menuBtn.on('pointerdown', () => {
      audioManager.playMenuClick();
      this.scene.start('LevelSelect');
    });

    // Keyboard: Enter/Space triggers primary action
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ENTER', primaryAction);
      this.input.keyboard.on('keydown-SPACE', primaryAction);
    }

    // Time
    this.add.text(centerX, GAME_HEIGHT - 50, `Time: ${this.result.elapsedTime.toFixed(1)}s`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#666688',
    }).setOrigin(0.5);
  }
}
