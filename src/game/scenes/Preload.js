import Phaser from 'phaser';

/**
 * Preload Scene
 * Loads all game assets with a branded loading bar.
 * Assets are WebP sprite sheets for performance on mid-range Android.
 *
 * NOTE: Placeholder SVG assets are used in V0.
 *       Replace src paths with official brand WebP assets when received.
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Preload' });
  }

  preload() {
    const { width, height } = this.scale;
    this._createLoadingBar(width, height);

    // ── Runner assets ───────────────────────────────────────────────────────
    this.load.image('bg-sky',        'assets/runner/bg_sky.webp');
    this.load.image('bg-ground',     'assets/runner/bg_ground.webp');
    this.load.image('bg-mid',        'assets/runner/bg_mid.webp');

    this.load.spritesheet('mascot-run', 'assets/runner/mascot_run.webp', { frameWidth: 96, frameHeight: 128 });
    this.load.spritesheet('mascot-jump','assets/runner/mascot_jump.webp', { frameWidth: 96, frameHeight: 128 });
    this.load.spritesheet('mascot-slide','assets/runner/mascot_slide.webp', { frameWidth: 128, frameHeight: 72 });
    this.load.spritesheet('mascot-hit', 'assets/runner/mascot_hit.webp', { frameWidth: 96, frameHeight: 128 });

    // Collectibles
    this.load.image('token-chips',   'assets/collectibles/token_chips.webp');
    this.load.image('token-rings',   'assets/collectibles/token_rings.webp');
    this.load.image('token-puffs',   'assets/collectibles/token_puffs.webp');
    this.load.image('token-chulbule','assets/collectibles/token_chulbule.webp');
    this.load.image('token-namkeen', 'assets/collectibles/token_namkeen.webp');
    this.load.image('token-coin',    'assets/collectibles/token_yd_coin.webp');

    // Obstacles
    this.load.image('obs-barrier',   'assets/runner/obstacle_barrier.webp');
    this.load.image('obs-spill',     'assets/runner/obstacle_spill.webp');
    this.load.image('obs-rival',     'assets/runner/obstacle_rival.webp');  // competitor snack visual

    // Power-ups
    this.load.image('pu-shield',     'assets/powerups/pu_shield.webp');
    this.load.image('pu-magnet',     'assets/powerups/pu_magnet.webp');
    this.load.image('pu-jump',       'assets/powerups/pu_jump.webp');
    this.load.image('pu-coinburst',  'assets/powerups/pu_coinburst.webp');

    // ── Breaker assets ──────────────────────────────────────────────────────
    this.load.image('paddle',        'assets/breaker/paddle.webp');
    this.load.image('ball',          'assets/breaker/ball.webp');
    this.load.image('brick-chips',   'assets/breaker/brick_chips.webp');
    this.load.image('brick-rings',   'assets/breaker/brick_rings.webp');
    this.load.image('brick-puffs',   'assets/breaker/brick_puffs.webp');
    this.load.image('brick-namkeen', 'assets/breaker/brick_namkeen.webp');
    this.load.image('brick-gold',    'assets/breaker/brick_gold.webp');
    this.load.image('brick-boss',    'assets/breaker/brick_boss.webp');
    this.load.image('brick-rival',   'assets/breaker/brick_rival.webp');  // competitor brand — loses points

    // ── Shared UI ───────────────────────────────────────────────────────────
    this.load.image('heart-full',    'assets/ui/heart_full.webp');
    this.load.image('heart-empty',   'assets/ui/heart_empty.webp');
    this.load.image('yd-coin-icon',  'assets/ui/yd_coin_icon.webp');
    this.load.image('pause-btn',     'assets/ui/pause_btn.webp');
    this.load.spritesheet('confetti','assets/ui/confetti.webp', { frameWidth: 64, frameHeight: 64 });

    // ── Audio (WAV — no external dependency) ────────────────────────────────
    this.load.audio('bgm-runner',    'assets/audio/bgm-runner.wav');
    this.load.audio('bgm-breaker',   'assets/audio/bgm-breaker.wav');
    this.load.audio('sfx-collect',   'assets/audio/sfx-collect.wav');
    this.load.audio('sfx-hit',       'assets/audio/sfx-hit.wav');
    this.load.audio('sfx-jump',      'assets/audio/sfx-jump.wav');
    this.load.audio('sfx-powerup',   'assets/audio/sfx-powerup.wav');
    this.load.audio('sfx-gameover',  'assets/audio/sfx-gameover.wav');
    this.load.audio('sfx-levelup',   'assets/audio/sfx-levelup.wav');
  }

  create() {
    this._createAnimations();
    // Hand off to the main menu (React handles this via router —
    // Phaser just signals ready via a custom event)
    this.game.events.emit('preload-complete');
  }

  // ── Private ──────────────────────────────────────────────────────────────

  _createLoadingBar(width, height) {
    const cx = width / 2;
    const cy = height / 2;

    // Background — Stitch cream with dot pattern feel
    this.add.rectangle(cx, cy, width, height, 0xfff8f7);

    // Dot pattern (simple grid of small circles)
    const gfx = this.add.graphics();
    gfx.fillStyle(0xffdad5, 1);
    for (let x = 16; x < width; x += 32) {
      for (let y = 16; y < height; y += 32) {
        gfx.fillCircle(x, y, 2);
      }
    }

    // Logo text
    this.add.text(cx, cy - 80, 'YD', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '52px',
      color: '#b3291e',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(cx, cy - 20, 'CRUNCH RUN', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '22px',
      color: '#410001',
      fontStyle: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5);

    // Progress bar track
    const barW = width * 0.6;
    const barH = 10;
    const barY = cy + 60;
    this.add.rectangle(cx, barY, barW, barH, 0xffdad5, 1).setOrigin(0.5);
    const bar = this.add.rectangle(cx - barW / 2, barY, 4, barH, 0xb3291e).setOrigin(0, 0.5);

    this.add.text(cx, barY + 24, 'लोड हो रहा है…', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      color: '#534341'
    }).setOrigin(0.5);

    this.load.on('progress', (v) => { bar.width = barW * v; });
  }

  _createAnimations() {
    // Mascot — runner
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('mascot-run', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: -1
    });
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('mascot-jump', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: 'slide',
      frames: this.anims.generateFrameNumbers('mascot-slide', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0
    });
    this.anims.create({
      key: 'hit',
      frames: this.anims.generateFrameNumbers('mascot-hit', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0
    });
    // Confetti burst
    this.anims.create({
      key: 'confetti',
      frames: this.anims.generateFrameNumbers('confetti', { start: 0, end: 15 }),
      frameRate: 20,
      repeat: 0
    });
  }
}
