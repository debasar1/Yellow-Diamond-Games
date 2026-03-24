import Phaser from 'phaser';
import { GAME_CONFIG } from '../gameConstants';

/**
 * HUD Scene — runs in parallel on top of Runner / Breaker.
 * Displays: score, lives (hearts), YD Coins, active power-up indicator, pause button.
 */
export default class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HUD' });
  }

  init(data) {
    this.currentLives  = data.lives  || GAME_CONFIG.LIVES;
    this.currentScore  = data.score  || 0;
    this.currentCoins  = data.coins  || 0;
  }

  create() {
    const { width } = this.scale;

    // ── Score ─────────────────────────────────────────────────────────────
    this._scoreTxt = this.add.text(width / 2, 18, '0', {
      fontFamily: 'Baloo 2', fontSize: '26px', color: '#fff',
      stroke: '#B71C1C', strokeThickness: 4, fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(100);

    // ── Lives (hearts) ────────────────────────────────────────────────────
    this._heartIcons = [];
    for (let i = 0; i < GAME_CONFIG.LIVES; i++) {
      const h = this.add.image(24 + i * 34, 22, 'heart-full').setScale(0.55).setDepth(100);
      this._heartIcons.push(h);
    }

    // ── YD Coins ──────────────────────────────────────────────────────────
    this.add.image(width - 68, 22, 'yd-coin-icon').setScale(0.45).setDepth(100);
    this._coinsTxt = this.add.text(width - 46, 14, '0', {
      fontFamily: 'Baloo 2', fontSize: '20px', color: '#FFD700',
      stroke: '#333', strokeThickness: 3, fontStyle: 'bold'
    }).setDepth(100);

    // ── Power-up indicator ────────────────────────────────────────────────
    this._puBg = this.add.rectangle(width / 2, 52, 160, 28, 0x000000, 0.5)
      .setDepth(100).setVisible(false);
    this._puTxt = this.add.text(width / 2, 52, '', {
      fontFamily: 'Baloo 2', fontSize: '14px', color: '#FFD700'
    }).setOrigin(0.5).setDepth(101).setVisible(false);

    // ── Pause button ──────────────────────────────────────────────────────
    const pauseBtn = this.add.image(width - 20, 52, 'pause-btn')
      .setScale(0.5).setInteractive({ useHandCursor: true }).setDepth(100);
    pauseBtn.on('pointerdown', () => {
      const parentScene = this.scene.get('Runner') || this.scene.get('Breaker');
      if (parentScene) {
        parentScene.isPaused = !parentScene.isPaused;
        parentScene.isPaused ? parentScene.physics.pause() : parentScene.physics.resume();
      }
    });
  }

  // ── Public update methods (called by game scenes) ─────────────────────────

  updateScore(score) {
    this._scoreTxt.setText(score.toLocaleString('en-IN'));
  }

  updateLives(lives) {
    this._heartIcons.forEach((h, i) => {
      h.setTexture(i < lives ? 'heart-full' : 'heart-empty');
    });
  }

  updateCoins(coins) {
    this._coinsTxt.setText(String(coins));
  }

  showPowerUp(type, duration) {
    const labels = {
      'pu-shield':    '🛡 Chulbule Shield',
      'pu-magnet':    '🧲 Rings Magnet',
      'pu-jump':      '⬆ Puff Jump',
      'pu-coinburst': '✨ Coin Burst 2×'
    };
    this._puTxt.setText(labels[type] || type);
    this._puBg.setVisible(true);
    this._puTxt.setVisible(true);
    this.time.delayedCall(duration, () => {
      this._puBg.setVisible(false);
      this._puTxt.setVisible(false);
    });
  }
}
