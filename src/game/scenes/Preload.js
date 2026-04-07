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
    this.load.image('bg-sky',        '/assets/runner/bg_sky.png');
    this.load.image('bg-ground',     '/assets/runner/bg_ground.png');
    this.load.image('bg-mid',        '/assets/runner/bg_mid.png');

    this.load.spritesheet('mascot-run', '/assets/runner/mascot_run.png', { frameWidth: 96, frameHeight: 128 });
    this.load.spritesheet('mascot-jump','/assets/runner/mascot_jump.png', { frameWidth: 96, frameHeight: 128 });
    this.load.spritesheet('mascot-slide','/assets/runner/mascot_slide.png', { frameWidth: 128, frameHeight: 72 });
    this.load.spritesheet('mascot-hit', '/assets/runner/mascot_hit.png', { frameWidth: 96, frameHeight: 128 });

    // Collectibles
    this.load.image('token-chips',   '/assets/collectibles/token_chips.png');
    this.load.image('token-rings',   '/assets/collectibles/token_rings.png');
    this.load.image('token-puffs',   '/assets/collectibles/token_puffs.png');
    this.load.image('token-chulbule','/assets/collectibles/token_chulbule.png');
    this.load.image('token-namkeen', '/assets/collectibles/token_namkeen.png');
    this.load.image('token-coin',    '/assets/collectibles/token_coin.png');

    // Obstacles
    this.load.image('obs-barrier',   '/assets/runner/obstacle_barrier.png');
    this.load.image('obs-spill',     '/assets/runner/obstacle_spill.png');
    this.load.image('obs-rival',     '/assets/runner/obstacle_rival.png');  // competitor snack visual

    // Power-ups
    this.load.image('pu-shield',     '/assets/powerups/pu_shield.png');
    this.load.image('pu-magnet',     '/assets/powerups/pu_magnet.png');
    this.load.image('pu-jump',       '/assets/powerups/pu_jump.png');
    this.load.image('pu-coinburst',  '/assets/powerups/pu_coinburst.png');

    // ── Breaker assets ──────────────────────────────────────────────────────
    this.load.image('paddle',        '/assets/breaker/paddle.png');
    this.load.image('ball',          '/assets/breaker/ball.png');
    this.load.image('brick-chips',   '/assets/breaker/brick_chips.png');
    this.load.image('brick-rings',   '/assets/breaker/brick_rings.png');
    this.load.image('brick-puffs',   '/assets/breaker/brick_puffs.png');
    this.load.image('brick-namkeen', '/assets/breaker/brick_namkeen.png');
    this.load.image('brick-gold',    '/assets/breaker/brick_gold.png');
    this.load.image('brick-boss',    '/assets/breaker/brick_boss.png');
    this.load.image('brick-rival',   '/assets/breaker/brick_rival.png');  // competitor brand — loses points

    // ── Shared UI ───────────────────────────────────────────────────────────
    this.load.image('heart-full',    '/assets/ui/heart_full.png');
    this.load.image('heart-empty',   '/assets/ui/heart_empty.png');
    this.load.image('yd-coin-icon',  '/assets/ui/yd_coin_icon.png');
    this.load.image('pause-btn',     '/assets/ui/pause_btn.png');
    this.load.spritesheet('confetti','/assets/ui/confetti.png', { frameWidth: 64, frameHeight: 64 });

    // ── Audio (WAV — no external dependency) ────────────────────────────────
    this.load.audio('bgm-runner',    '/assets/audio/bgm-runner.mp3');
    this.load.audio('bgm-breaker',   '/assets/audio/bgm-breaker.mp3');
    this.load.audio('sfx-collect',   '/assets/audio/sfx-collect.mp3');
    this.load.audio('sfx-hit',       '/assets/audio/sfx-hit.mp3');
    this.load.audio('sfx-jump',      '/assets/audio/sfx-jump.mp3');
    this.load.audio('sfx-powerup',   '/assets/audio/sfx-powerup.mp3');
    this.load.audio('sfx-gameover',  '/assets/audio/sfx-gameover.mp3');
    this.load.audio('sfx-levelup',   '/assets/audio/sfx-levelup.mp3');
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
