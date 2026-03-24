import Phaser from 'phaser';
import { GAME_CONFIG, SCORE_CONFIG } from '../gameConstants';
import Player from '../objects/Player';

/**
 * Runner Scene — Endless Runner (Format A: "Crunch Run")
 *
 * Lanes: 3 vertical lanes. Swipe/tap to switch.
 * Lives: 3 hearts.
 * Collectibles: YD product tokens → +score +coins.
 * Obstacles:
 *   - obs-rival (competitor brand) → -COMPETITOR_PENALTY points, NO life lost
 *   - obs-barrier / obs-spill (hazards) → lose a life
 * Power-ups: shield, magnet, jump boost, coin burst.
 */
export default class RunnerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Runner' });
  }

  init(data) {
    this.gameFormat = 'runner';
    this.score = 0;
    this.coinsEarned = 0;
    this.lives = GAME_CONFIG.LIVES;
    this.speed = GAME_CONFIG.RUNNER.BASE_SPEED;
    this.isGameOver = false;
    this.isPaused = false;
    this.activePowerUp = null;
    this.distance = 0;
  }

  create() {
    const { width, height } = this.scale;

    // ── Background (parallax) ─────────────────────────────────────────────
    this.bgSky = this.add.tileSprite(0, 0, width, height * 0.6, 'bg-sky').setOrigin(0, 0);
    this.bgMid = this.add.tileSprite(0, height * 0.4, width, height * 0.3, 'bg-mid').setOrigin(0, 0);
    this.bgGround = this.add.tileSprite(0, height * 0.75, width, height * 0.25, 'bg-ground').setOrigin(0, 0);

    // ── Lane positions ────────────────────────────────────────────────────
    this.laneX = [
      width * 0.2,   // left lane
      width * 0.5,   // centre lane
      width * 0.8    // right lane
    ];
    this.currentLane = 1; // start centre

    // ── Player ───────────────────────────────────────────────────────────
    this.player = new Player(this, this.laneX[1], height * 0.65);

    // ── Collectibles & Obstacles (groups) ────────────────────────────────
    this.collectibles = this.physics.add.group();
    this.obstacles    = this.physics.add.group();
    this.powerUps     = this.physics.add.group();

    // ── Colliders ─────────────────────────────────────────────────────────
    this.physics.add.overlap(
      this.player.sprite, this.collectibles,
      this._onCollect, null, this
    );
    this.physics.add.overlap(
      this.player.sprite, this.obstacles,
      this._onHit, null, this
    );
    this.physics.add.overlap(
      this.player.sprite, this.powerUps,
      this._onPowerUp, null, this
    );

    // ── Spawn timers ──────────────────────────────────────────────────────
    this.spawnTimer = this.time.addEvent({
      delay: GAME_CONFIG.RUNNER.SPAWN_INTERVAL_MS,
      callback: this._spawnObjects,
      callbackScope: this,
      loop: true
    });

    // ── Speed ramp ────────────────────────────────────────────────────────
    this.speedTimer = this.time.addEvent({
      delay: GAME_CONFIG.RUNNER.SPEED_RAMP_INTERVAL_MS,
      callback: () => {
        this.speed = Math.min(this.speed + GAME_CONFIG.RUNNER.SPEED_INCREMENT, GAME_CONFIG.RUNNER.MAX_SPEED);
      },
      loop: true
    });

    // ── Input ─────────────────────────────────────────────────────────────
    this._setupInput();

    // ── Audio ─────────────────────────────────────────────────────────────
    this.bgm = this.sound.add('bgm-runner', { loop: true, volume: 0.4 });
    this.bgm.play();

    // ── HUD ───────────────────────────────────────────────────────────────
    this.scene.launch('HUD', { lives: this.lives, score: this.score, coins: this.coinsEarned });
    this.hudScene = this.scene.get('HUD');

    // ── Session start time ────────────────────────────────────────────────
    this.sessionStart = Date.now();
  }

  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;

    const dt = delta / 1000;
    this.distance += this.speed * dt;

    // Parallax scroll
    this.bgSky.tilePositionX    += this.speed * 0.1 * dt;
    this.bgMid.tilePositionX    += this.speed * 0.4 * dt;
    this.bgGround.tilePositionX += this.speed * 1.0 * dt;

    // Move collectibles / obstacles
    [this.collectibles, this.obstacles, this.powerUps].forEach(group => {
      group.getChildren().forEach(obj => {
        obj.x -= this.speed * dt;
        if (obj.x < -64) obj.destroy();
      });
    });

    // Distance → score
    const distScore = Math.floor(this.distance / 10);
    this._setScore(distScore + this.coinsEarned * 10);

    // Update player
    this.player.update(delta);
  }

  // ── Input ──────────────────────────────────────────────────────────────

  _setupInput() {
    const { height } = this.scale;

    // Swipe detection
    this.input.on('pointerdown', (p) => {
      this._swipeStart = { x: p.x, y: p.y };
    });
    this.input.on('pointerup', (p) => {
      if (!this._swipeStart) return;
      const dx = p.x - this._swipeStart.x;
      const dy = p.y - this._swipeStart.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const minSwipe = 30;

      if (absDx > absDy && absDx > minSwipe) {
        dx > 0 ? this._moveRight() : this._moveLeft();
      } else if (absDy > absDx && absDy > minSwipe) {
        dy < 0 ? this._doJump() : this._doSlide();
      }
      this._swipeStart = null;
    });

    // Keyboard (desktop / testing)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
  }

  _moveLeft() {
    if (this.currentLane > 0) {
      this.currentLane--;
      this.player.moveTo(this.laneX[this.currentLane]);
    }
  }

  _moveRight() {
    if (this.currentLane < 2) {
      this.currentLane++;
      this.player.moveTo(this.laneX[this.currentLane]);
    }
  }

  _doJump() { this.player.jump(); }
  _doSlide() { this.player.slide(); }

  // ── Spawn ──────────────────────────────────────────────────────────────

  _spawnObjects() {
    if (this.isGameOver) return;
    const { width, height } = this.scale;
    const roll = Math.random();

    if (roll < 0.5) {
      this._spawnCollectible(width + 32, height * 0.65);
    } else if (roll < 0.75) {
      this._spawnObstacle(width + 32, height * 0.68);
    } else {
      this._spawnPowerUp(width + 32, height * 0.60);
    }
  }

  _spawnCollectible(x, y) {
    const types = SCORE_CONFIG.RUNNER_TOKENS;
    const type = types[Phaser.Math.Between(0, types.length - 1)];
    const lane = Phaser.Math.Between(0, 2);
    const token = this.physics.add.image(x, y, type.key)
      .setScale(0.6)
      .setData('type', type.key)
      .setData('points', type.points)
      .setData('coins', type.coins);
    token.body.setAllowGravity(false);
    token.x = x;
    token.y = this._laneY(lane);
    this.collectibles.add(token);
  }

  _spawnObstacle(x, y) {
    const keys = ['obs-barrier', 'obs-spill', 'obs-rival'];
    const key = keys[Phaser.Math.Between(0, keys.length - 1)];
    const lane = Phaser.Math.Between(0, 2);
    const obs = this.physics.add.image(x, this._laneY(lane), key).setScale(0.7);
    obs.body.setAllowGravity(false);
    this.obstacles.add(obs);
  }

  _spawnPowerUp(x, y) {
    const pus = ['pu-shield', 'pu-magnet', 'pu-jump', 'pu-coinburst'];
    const key = pus[Phaser.Math.Between(0, pus.length - 1)];
    const lane = Phaser.Math.Between(0, 2);
    const pu = this.physics.add.image(x, this._laneY(lane), key)
      .setScale(0.65)
      .setData('type', key);
    pu.body.setAllowGravity(false);
    this.powerUps.add(pu);
  }

  _laneY(lane) {
    const { height } = this.scale;
    // Slight vertical variation between lanes
    return height * 0.65 + (lane - 1) * 10;
  }

  // ── Event handlers ──────────────────────────────────────────────────────

  _onCollect(player, token) {
    const points = token.getData('points') || 10;
    const coins  = token.getData('coins')  || 1;
    this.sound.play('sfx-collect', { volume: 0.6 });
    this._addScore(points);
    this._addCoins(coins);
    this._showFloatingText(`+${points}`, token.x, token.y, '#FFD700');
    token.destroy();
  }

  _onHit(player, obstacle) {
    if (this.player.isInvincible) return;

    const key     = obstacle.texture.key;
    const config  = SCORE_CONFIG.OBSTACLES[key] || { type: 'hazard', pointPenalty: 0, losesLife: true };

    this.sound.play('sfx-hit', { volume: 0.7 });
    obstacle.destroy();

    if (config.type === 'competitor') {
      // ── Competitor brand hit: deduct points, flash score, no life lost ──
      const penalty = config.pointPenalty || SCORE_CONFIG.COMPETITOR_PENALTY;
      this.score = Math.max(0, this.score - penalty);
      this.hudScene.updateScore(this.score);
      this._showFloatingText(`-${penalty}`, this.player.sprite.x, this.player.sprite.y - 40, '#E53935');
      this._showFloatingText('❌ Rival!', this.player.sprite.x, this.player.sprite.y - 80, '#fff');
      // Brief red camera flash to signal the penalty
      this.cameras.main.flash(300, 255, 0, 0, false);
    } else {
      // ── Hazard hit: lose a life ──────────────────────────────────────────
      this.lives--;
      this.hudScene.updateLives(this.lives);
      this.player.triggerHit();
      if (this.lives <= 0) {
        this._triggerGameOver();
      }
    }
  }

  _onPowerUp(player, pu) {
    const type = pu.getData('type');
    this.sound.play('sfx-powerup', { volume: 0.6 });
    pu.destroy();
    this._activatePowerUp(type);
  }

  _activatePowerUp(type) {
    const config = GAME_CONFIG.POWER_UPS[type];
    if (!config) return;
    this.activePowerUp = type;
    this.hudScene.showPowerUp(type, config.duration);

    switch (type) {
      case 'pu-shield':    this.player.setInvincible(config.duration); break;
      case 'pu-magnet':    this._activateMagnet(config.duration); break;
      case 'pu-jump':      this.player.enableDoubleJump(config.duration); break;
      case 'pu-coinburst': this._activateCoinBurst(config.duration); break;
    }

    this.time.delayedCall(config.duration, () => {
      this.activePowerUp = null;
    });
  }

  _activateMagnet(duration) {
    // Auto-collect any collectibles on screen
    const magnetTimer = this.time.addEvent({
      delay: 100,
      callback: () => {
        this.collectibles.getChildren().forEach(token => {
          this.tweens.add({
            targets: token,
            x: this.player.sprite.x,
            y: this.player.sprite.y,
            duration: 200,
            onComplete: () => {
              if (token.active) this._onCollect(this.player.sprite, token);
            }
          });
        });
      },
      loop: true
    });
    this.time.delayedCall(duration, () => magnetTimer.destroy());
  }

  _activateCoinBurst(duration) {
    this._coinBurstActive = true;
    this.time.delayedCall(duration, () => { this._coinBurstActive = false; });
  }

  // ── Score / Coins ────────────────────────────────────────────────────────

  _addScore(pts) {
    this.score += pts;
    this.hudScene.updateScore(this.score);
  }

  _setScore(val) {
    this.score = val;
    this.hudScene.updateScore(this.score);
  }

  _addCoins(n) {
    const multiplier = this._coinBurstActive ? 2 : 1;
    this.coinsEarned += n * multiplier;
    this.hudScene.updateCoins(this.coinsEarned);
  }

  // ── Game Over ────────────────────────────────────────────────────────────

  _triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.bgm.stop();
    this.sound.play('sfx-gameover');
    this.spawnTimer.destroy();
    this.speedTimer.destroy();

    const duration = Math.floor((Date.now() - this.sessionStart) / 1000);

    this.time.delayedCall(600, () => {
      this.scene.stop('HUD');
      this.scene.start('GameOver', {
        score:     this.score,
        coins:     this.coinsEarned,
        format:    'runner',
        duration
      });
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  _showFloatingText(text, x, y, color = '#fff') {
    const t = this.add.text(x, y, text, {
      fontFamily: 'Baloo 2',
      fontSize: '20px',
      color,
      stroke: '#333',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.tweens.add({
      targets: t,
      y: y - 60,
      alpha: 0,
      duration: 800,
      onComplete: () => t.destroy()
    });
  }
}
