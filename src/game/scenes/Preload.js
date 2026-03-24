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

    // ── Shared UI ───────────────────────────────────────────────────────────
    this.load.image('heart-full',    'assets/ui/heart_full.webp');
    this.load.image('heart-empty',   'assets/ui/heart_empty.webp');
    this.load.image('yd-coin-icon',  'assets/ui/yd_coin_icon.webp');
    this.load.image('pause-btn',     'assets/ui/pause_btn.webp');
    this.load.spritesheet('confetti','assets/ui/confetti.webp', { frameWidth: 64, frameHeight: 64 });

    // ── Audio ───────────────────────────────────────────────────────────────
    this.load.audio('bgm-runner',    'assets/audio/bgm_runner.ogg');
    this.load.audio('bgm-breaker',   'assets/audio/bgm_breaker.ogg');
    this.load.audio('sfx-collect',   'assets/audio/sfx_collect.ogg');
    this.load.audio('sfx-hit',       'assets/audio/sfx_hit.ogg');
    this.load.audio('sfx-powerup',   'assets/audio/sfx_powerup.ogg');
    this.load.audio('sfx-gameover',  'assets/audio/sfx_gameover.ogg');
    this.load.audio('sfx-levelup',   'assets/audio/sfx_levelup.ogg');
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

    // Background
    this.add.rectangle(cx, cy, width, height, 0xFFD700);

    // Logo placeholder text
    this.add.text(cx, cy - 80, '🟡', { fontSize: '64px' }).setOrigin(0.5);
    this.add.text(cx, cy - 10, 'Yellow Diamond', {
      fontFamily: 'Baloo 2',
      fontSize: '28px',
      color: '#8B0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Progress bar track
    const barW = width * 0.6;
    const barH = 18;
    this.add.rectangle(cx, cy + 60, barW, barH, 0xffa000).setOrigin(0.5);
    const bar = this.add.rectangle(cx - barW / 2, cy + 60, 0, barH, 0xE53935).setOrigin(0, 0.5);

    this.add.text(cx, cy + 90, 'लोड हो रहा है… / Loading…', {
      fontFamily: 'Baloo 2', fontSize: '14px', color: '#5D4037'
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
