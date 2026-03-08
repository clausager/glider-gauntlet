import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/game';
import { levels } from '@/config/levels';
import { loadProgression, getTopScores } from '@/utils/storage';
import { audioManager } from '@/audio/AudioManager';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelect' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0a0a2e);

    const progression = loadProgression();

    // Title
    this.add.text(GAME_WIDTH / 2, 60, 'SELECT LEVEL', {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#00ffff',
    }).setOrigin(0.5);

    // Level cards
    const cardWidth = 180;
    const cardSpacing = 30;
    const totalWidth = levels.length * cardWidth + (levels.length - 1) * cardSpacing;
    const startX = (GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;

    levels.forEach((level, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      const y = GAME_HEIGHT / 2;
      const isUnlocked = progression.unlockedLevels.includes(level.id);
      const isCompleted = progression.completedLevels.includes(level.id);

      this.createLevelCard(x, y, level.id, level.name, isUnlocked, isCompleted);
    });

    // Back button
    const backBtn = this.add.text(80, GAME_HEIGHT - 50, '< BACK', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#aaaaaa'));
    backBtn.on('pointerdown', () => {
      try { audioManager.playMenuClick(); } catch (_) { /* ignore */ }
      this.scene.start('MainMenu');
    });
  }

  private createLevelCard(
    x: number,
    y: number,
    levelId: number,
    name: string,
    unlocked: boolean,
    completed: boolean,
  ): void {
    const cardColor = unlocked ? 0x1a1a4e : 0x111133;
    const borderColor = completed ? 0x00ff88 : unlocked ? 0x00ffff : 0x444466;

    // Card background
    const card = this.add.rectangle(x, y, 170, 220, cardColor);
    card.setStrokeStyle(3, borderColor);

    // Level number
    this.add.text(x, y - 60, `${levelId}`, {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: unlocked ? '#00ffff' : '#444466',
    }).setOrigin(0.5);

    // Level name
    this.add.text(x, y + 10, name, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: unlocked ? '#cccccc' : '#444466',
      align: 'center',
      wordWrap: { width: 150 },
    }).setOrigin(0.5);

    if (!unlocked) {
      // Lock icon
      this.add.text(x, y + 60, 'LOCKED', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#444466',
      }).setOrigin(0.5);
      return;
    }

    // Best score
    const topScores = getTopScores(levelId);
    if (topScores.length > 0) {
      this.add.text(x, y + 50, `Best: ${topScores[0].score}`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#88cc88',
      }).setOrigin(0.5);
    }

    // Completed indicator
    if (completed) {
      this.add.text(x, y + 75, 'CLEAR', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#00ff88',
      }).setOrigin(0.5);
    }

    // Make clickable — use pointerup for reliable iOS touch handling
    card.setInteractive({ useHandCursor: true });
    card.on('pointerover', () => card.setStrokeStyle(3, 0xffffff));
    card.on('pointerout', () => card.setStrokeStyle(3, borderColor));
    let tapped = false;
    const startLevel = (): void => {
      if (tapped) return;
      tapped = true;
      try { audioManager.playMenuClick(); } catch (_) { /* ignore */ }
      try { audioManager.stopMusic(); } catch (_) { /* ignore */ }
      this.scene.start('Game', { levelId });
    };
    card.on('pointerdown', startLevel);
    card.on('pointerup', startLevel);
  }
}
