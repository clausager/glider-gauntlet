import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/game';
import { audioManager } from '@/audio/AudioManager';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenu' });
  }

  create(): void {
    // Init audio on first user interaction
    this.input.once('pointerdown', () => audioManager.init());
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown', () => audioManager.init());
    }

    this.cameras.main.setBackgroundColor(0x020210);

    // Start menu music (will play after user interacts)
    this.time.delayedCall(100, () => audioManager.playMenuMusic());

    // Parallax backgrounds from Boot scene textures
    const nebula = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-nebula');
    nebula.setOrigin(0, 0).setAlpha(0.5);

    const starsFar = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-stars-far');
    starsFar.setOrigin(0, 0).setAlpha(0.4);

    const starsMid = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-stars-mid');
    starsMid.setOrigin(0, 0).setAlpha(0.7);

    // Slowly scroll the background
    this.tweens.add({
      targets: [nebula, starsFar, starsMid],
      tilePositionX: '+=200',
      duration: 20000,
      repeat: -1,
      ease: 'Linear',
    });

    // Title with glow effect
    const titleShadow = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 3, 'GLIDER GAUNTLET', {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: '#004444',
    }).setOrigin(0.5).setAlpha(0.5);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 3, 'GLIDER GAUNTLET', {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: '#00ffff',
      stroke: '#003333',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Title pulse
    this.tweens.add({
      targets: [title, titleShadow],
      alpha: { from: 1, to: 0.8 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 3 + 60, 'A Space Obstacle Course', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#447777',
    }).setOrigin(0.5);

    // Start button
    const startBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, '[ START GAME ]', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#00ff88',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Button pulse
    this.tweens.add({
      targets: startBtn,
      scaleX: { from: 1, to: 1.03 },
      scaleY: { from: 1, to: 1.03 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    startBtn.on('pointerover', () => startBtn.setColor('#ffffff'));
    startBtn.on('pointerout', () => startBtn.setColor('#00ff88'));
    startBtn.on('pointerdown', () => {
      audioManager.init();
      audioManager.playMenuClick();
      audioManager.stopMusic();
      this.scene.start('LevelSelect');
    });

    // Settings button
    const settingsBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130, '[ SETTINGS ]', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#556666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    settingsBtn.on('pointerover', () => settingsBtn.setColor('#ffffff'));
    settingsBtn.on('pointerout', () => settingsBtn.setColor('#556666'));
    settingsBtn.on('pointerdown', () => {
      // Settings scene — TODO
    });

    // Floating astronaut decoration
    const astronaut = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'player');
    astronaut.setScale(3).setAlpha(0.3);
    this.tweens.add({
      targets: astronaut,
      y: GAME_HEIGHT / 2 - 55,
      angle: { from: -5, to: 5 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
