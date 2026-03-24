import Phaser from 'phaser';
import BootScene from './scenes/Boot';
import PreloadScene from './scenes/Preload';
import RunnerScene from './scenes/Runner';
import BreakerScene from './scenes/Breaker';
import GameOverScene from './scenes/GameOver';
import HUDScene from './scenes/HUD';

/**
 * Phaser game configuration.
 * The canvas fills the parent container — React mounts it inside #game-container.
 */
const GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#FFD700',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 390,   // iPhone 14 / mid-Android portrait width
    height: 844,
    min: { width: 320, height: 568 },
    max: { width: 430, height: 932 }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: import.meta.env.VITE_APP_ENV === 'development'
    }
  },
  scene: [BootScene, PreloadScene, RunnerScene, BreakerScene, GameOverScene, HUDScene],
  // Disable right-click context menu on canvas
  disableContextMenu: true,
  // Transparent background so React UI can overlay
  transparent: false,
  // Audio
  audio: { disableWebAudio: false }
};

export default GameConfig;
