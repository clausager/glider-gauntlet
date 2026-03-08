import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/game';
import { BootScene } from '@/scenes/BootScene';
import { MainMenuScene } from '@/scenes/MainMenuScene';
import { LevelSelectScene } from '@/scenes/LevelSelectScene';
import { GameScene } from '@/scenes/GameScene';
import { GameOverScene } from '@/scenes/GameOverScene';
import { PauseScene } from '@/scenes/PauseScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#060618',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    fullscreenTarget: document.documentElement,
  },
  input: {
    activePointers: 2,
  },
  scene: [BootScene, MainMenuScene, LevelSelectScene, GameScene, GameOverScene, PauseScene],
};

new Phaser.Game(config);
