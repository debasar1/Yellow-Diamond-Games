import Phaser from 'phaser';
import { SCORE_CONFIG } from '../gameConstants';

/**
 * Game Over Scene
 *
 * Shows final score, YD Coins earned this session, and two CTAs:
 *  - Play Again → restart the same game format
 *  - Save Coins  → signals React router to show Registration/Wallet
 */
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOver' });
  }

  init(data) {
    this.finalScore  = data.score    || 0;
    this.coinsEarned = data.coins    || 0;
    this.gameFormat  = data.format   || 'runner';
    this.duration    = data.duration || 0;
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // ── Background overlay ────────────────────────────────────────────────
    this.add.rectangle(cx, height / 2, width, height, 0x000000, 0.55);
    const card = this.add.rectangle(cx, height / 2, width * 0.85, height * 0.65, 0xFFD700, 1)
      .setStrokeStyle(4, 0xE53935);

    // ── Title ─────────────────────────────────────────────────────────────
    this.add.text(cx, height * 0.25, 'गेम खत्म!\nGame Over!', {
      fontFamily: 'Baloo 2', fontSize: '32px', color: '#B71C1C',
      fontStyle: 'bold', align: 'center'
    }).setOrigin(0.5);

    // ── Score ─────────────────────────────────────────────────────────────
    this.add.text(cx, height * 0.38, 'आपका स्कोर / Your Score', {
      fontFamily: 'Baloo 2', fontSize: '16px', color: '#5D4037'
    }).setOrigin(0.5);
    this.add.text(cx, height * 0.44, this.finalScore.toLocaleString('en-IN'), {
      fontFamily: 'Baloo 2', fontSize: '48px', color: '#E53935', fontStyle: 'bold'
    }).setOrigin(0.5);

    // ── Coins earned ──────────────────────────────────────────────────────
    const coinsText = this.coinsEarned > 0
      ? `🟡 ${this.coinsEarned} YD Coins अर्जित / Earned`
      : 'कोई Coins नहीं / No Coins yet';
    this.add.text(cx, height * 0.52, coinsText, {
      fontFamily: 'Baloo 2', fontSize: '18px', color: '#1B5E20', fontStyle: 'bold'
    }).setOrigin(0.5);

    // ── YD Coins description ──────────────────────────────────────────────
    if (this.coinsEarned > 0) {
      this.add.text(cx, height * 0.57, 'Coins बचाने के लिए Register करें\nRegister to save your Coins!', {
        fontFamily: 'Baloo 2', fontSize: '13px', color: '#5D4037', align: 'center'
      }).setOrigin(0.5);
    }

    // ── Confetti ──────────────────────────────────────────────────────────
    if (this.finalScore > 0) {
      for (let i = 0; i < 8; i++) {
        const x = Phaser.Math.Between(40, width - 40);
        const delay = Phaser.Math.Between(0, 600);
        this.time.delayedCall(delay, () => {
          const c = this.add.sprite(x, height * 0.2, 'confetti').setScale(0.7);
          c.play('confetti');
          c.on('animationcomplete', () => c.destroy());
        });
      }
    }

    // ── Buttons ───────────────────────────────────────────────────────────
    this._makeButton(cx, height * 0.68, 'फिर खेलें / Play Again', 0xE53935, '#fff', () => {
      this.scene.start(this.gameFormat === 'runner' ? 'Runner' : 'Breaker');
    });

    if (this.coinsEarned > 0) {
      this._makeButton(cx, height * 0.78, 'Coins बचाएं / Save Coins 🪙', 0x43A047, '#fff', () => {
        // Signal the React layer to open Registration / Wallet
        this.game.events.emit('show-registration', {
          pendingCoins: this.coinsEarned,
          score: this.finalScore,
          format: this.gameFormat,
          duration: this.duration
        });
      });
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _makeButton(x, y, label, bgColor, textColor, callback) {
    const btn = this.add.rectangle(x, y, 280, 48, bgColor, 1)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xffffff);
    this.add.text(x, y, label, {
      fontFamily: 'Baloo 2', fontSize: '17px', color: textColor, fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', callback);

    btn.on('pointerover',  () => btn.setFillStyle(Phaser.Display.Color.ValueToColor(bgColor).brighten(20).color));
    btn.on('pointerout',   () => btn.setFillStyle(bgColor));
    btn.on('pointerdown',  callback);
  }
}
