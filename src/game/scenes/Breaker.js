import Phaser from 'phaser';
import { GAME_CONFIG, SCORE_CONFIG, BREAKER_LAYOUT } from '../gameConstants';

// Competitor brick asset: red/grey brick labelled with rival brand silhouette
// Key: 'brick-rival' (loaded in Preload.js)

/**
 * Breaker Scene — Arkanoid / Brick Breaker (Format B: "Snack Stack Smash")
 *
 * Paddle: Yellow Diamond chip packet.
 * Ball: Rings snack — bounces and breaks bricks.
 * Bricks: Rows of YD product lines.
 * Lives: 3.
 */
export default class BreakerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Breaker' });
  }

  init() {
    this.score = 0;
    this.coinsEarned = 0;
    this.lives = GAME_CONFIG.LIVES;
    this.level = 1;
    this.isGameOver = false;
    this.isBallLive = false;
  }

  create() {
    const { width, height } = this.scale;

    // ── Background ────────────────────────────────────────────────────────
    this.add.rectangle(width / 2, height / 2, width, height, 0xFFF8E1);

    // ── Paddle ────────────────────────────────────────────────────────────
    this.paddle = this.physics.add.image(width / 2, height * 0.88, 'paddle')
      .setImmovable(true)
      .setScale(0.9);
    this.paddle.body.setAllowGravity(false);

    // ── Ball ──────────────────────────────────────────────────────────────
    this.ball = this.physics.add.image(width / 2, height * 0.83, 'ball')
      .setScale(0.5)
      .setCollideWorldBounds(true)
      .setBounce(1);
    this.ball.body.setAllowGravity(false);

    // ── Bricks ────────────────────────────────────────────────────────────
    this.bricks = this.physics.add.staticGroup();
    this._buildLevel(this.level);

    // ── Colliders ─────────────────────────────────────────────────────────
    this.physics.add.collider(this.ball, this.paddle, this._onPaddleHit, null, this);
    this.physics.add.collider(this.ball, this.bricks,  this._onBrickHit,  null, this);

    // ── World bounds kill zone (bottom) ───────────────────────────────────
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject === this.ball && body.blocked.down) {
        this._loseLife();
      }
    });
    this.ball.body.onWorldBounds = true;

    // ── Input ─────────────────────────────────────────────────────────────
    this.input.on('pointermove', (p) => {
      if (this.isGameOver) return;
      const hw = this.paddle.displayWidth / 2;
      this.paddle.x = Phaser.Math.Clamp(p.x, hw, width - hw);
      if (!this.isBallLive) this.ball.x = this.paddle.x;
    });
    this.input.on('pointerdown', () => {
      if (!this.isBallLive) this._launchBall();
    });
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.isBallLive) this._launchBall();
    });

    // ── Audio ─────────────────────────────────────────────────────────────
    this.bgm = this.sound.add('bgm-breaker', { loop: true, volume: 0.4 });
    this.bgm.play();

    // ── HUD ───────────────────────────────────────────────────────────────
    this.scene.launch('HUD', { lives: this.lives, score: this.score, coins: this.coinsEarned });
    this.hudScene = this.scene.get('HUD');

    // ── Tap to start hint ─────────────────────────────────────────────────
    this.startHint = this.add.text(width / 2, height * 0.75, 'टैप करें / Tap to Launch', {
      fontFamily: 'Baloo 2', fontSize: '18px', color: '#E53935', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.tweens.add({ targets: this.startHint, alpha: 0, yoyo: true, repeat: -1, duration: 600 });

    this.sessionStart = Date.now();
  }

  update() {
    if (this.isGameOver) return;
    // Keep ball on paddle before launch
    if (!this.isBallLive) {
      this.ball.x = this.paddle.x;
    }
  }

  // ── Level builder ─────────────────────────────────────────────────────────

  _buildLevel(level) {
    const { width } = this.scale;
    const layout = BREAKER_LAYOUT[((level - 1) % BREAKER_LAYOUT.length)];
    const brickW = 60, brickH = 22, padding = 6;
    const cols = Math.floor(width / (brickW + padding));
    const startX = (width - (cols * (brickW + padding) - padding)) / 2 + brickW / 2;

    layout.rows.forEach((row, rowIdx) => {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (brickW + padding);
        const y = 80 + rowIdx * (brickH + padding);
        const brick = this.bricks.create(x, y, row.key).setScale(0.55).refreshBody();
        brick.setData('hp',     row.hp);
        brick.setData('points', row.points);
        brick.setData('coins',  row.coins || 0);
        brick.setData('type',   row.key);
      }
    });
  }

  // ── Ball ──────────────────────────────────────────────────────────────────

  _launchBall() {
    this.isBallLive = true;
    this.startHint.destroy();
    const angle = Phaser.Math.Between(-60, 60); // degrees from straight up
    const speed = GAME_CONFIG.BREAKER.BALL_SPEED;
    const rad = Phaser.Math.DegToRad(angle - 90);
    this.ball.setVelocity(Math.cos(rad) * speed, Math.sin(rad) * speed);
  }

  // ── Collision callbacks ───────────────────────────────────────────────────

  _onPaddleHit(ball, paddle) {
    // Vary bounce angle based on where ball hits paddle
    const diff = ball.x - paddle.x;
    const norm = diff / (paddle.displayWidth / 2);
    const speed = GAME_CONFIG.BREAKER.BALL_SPEED;
    ball.setVelocityX(speed * norm);
    // Ensure ball always travels upward after paddle hit
    if (ball.body.velocity.y > 0) ball.setVelocityY(-Math.abs(ball.body.velocity.y));
  }

  _onBrickHit(ball, brick) {
    let hp = brick.getData('hp') - 1;
    brick.setData('hp', hp);

    if (hp <= 0) {
      const brickType = brick.getData('type');
      const isRival   = SCORE_CONFIG.COMPETITOR_BRICK_KEYS.includes(brickType);

      if (isRival) {
        // ── Competitor brick: deduct points, no coins, red flash ──────────
        const penalty = SCORE_CONFIG.BREAKER_COMPETITOR_PENALTY;
        this.score = Math.max(0, this.score - penalty);
        this.hudScene.updateScore(this.score);
        this.sound.play('sfx-hit', { volume: 0.5 });
        this._showFloatingText(`-${penalty}`, brick.x, brick.y, '#E53935');
        this._showFunFact(brickType, brick.x, brick.y);
        this.cameras.main.flash(250, 255, 0, 0, false);
      } else {
        // ── YD product brick: award points and coins ───────────────────────
        const pts   = brick.getData('points');
        const coins = brick.getData('coins');
        this.sound.play('sfx-collect', { volume: 0.5 });
        this._addScore(pts);
        if (coins > 0) this._addCoins(coins);
        this._showFloatingText(`+${pts}`, brick.x, brick.y, '#43A047');
        this._showFunFact(brickType, brick.x, brick.y);
      }

      brick.destroy();
      this._checkLevelComplete();
    } else {
      // Flash brick to indicate damage
      this.tweens.add({ targets: brick, alpha: 0.3, yoyo: true, duration: 80 });
    }
  }

  _loseLife() {
    if (this.isGameOver) return;
    this.sound.play('sfx-hit', { volume: 0.7 });
    this.lives--;
    this.hudScene.updateLives(this.lives);
    this.isBallLive = false;
    // Reset ball to paddle
    this.ball.setVelocity(0, 0);
    this.ball.x = this.paddle.x;
    this.ball.y = this.paddle.y - this.paddle.displayHeight;

    if (this.lives <= 0) {
      this._triggerGameOver();
    } else {
      // Show launch hint again
      const { width, height } = this.scale;
      this.startHint = this.add.text(width / 2, height * 0.75, 'टैप करें / Tap to Launch', {
        fontFamily: 'Baloo 2', fontSize: '18px', color: '#E53935', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.tweens.add({ targets: this.startHint, alpha: 0, yoyo: true, repeat: -1, duration: 600 });
    }
  }

  _checkLevelComplete() {
    if (this.bricks.countActive(true) === 0) {
      this.sound.play('sfx-levelup');
      this.level++;
      this._addScore(SCORE_CONFIG.LEVEL_BONUS);
      this._addCoins(5);
      this.time.delayedCall(800, () => {
        this.bricks.clear(true, true);
        this._buildLevel(this.level);
        this.isBallLive = false;
        this.ball.setVelocity(0, 0);
      });
    }
  }

  // ── Score / Coins ────────────────────────────────────────────────────────

  _addScore(pts) {
    this.score += pts;
    this.hudScene.updateScore(this.score);
  }

  _addCoins(n) {
    this.coinsEarned += n;
    this.hudScene.updateCoins(this.coinsEarned);
  }

  // ── Game Over ─────────────────────────────────────────────────────────────

  _triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.bgm.stop();
    this.sound.play('sfx-gameover');
    const duration = Math.floor((Date.now() - this.sessionStart) / 1000);
    this.time.delayedCall(600, () => {
      this.scene.stop('HUD');
      this.scene.start('GameOver', {
        score: this.score, coins: this.coinsEarned, format: 'breaker', duration
      });
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _showFunFact(brickType, x, y) {
    const facts = SCORE_CONFIG.FUN_FACTS;
    const fact = facts[brickType];
    if (!fact) return;
    // Only show occasionally to avoid clutter
    if (Math.random() > 0.3) return;
    const { width } = this.scale;
    const box = this.add.text(width / 2, y + 30, fact, {
      fontFamily: 'Baloo 2', fontSize: '12px', color: '#5D4037',
      backgroundColor: '#FFFDE7', padding: { x: 8, y: 4 }, wordWrap: { width: 260 }
    }).setOrigin(0.5, 0).setDepth(10);
    this.tweens.add({ targets: box, alpha: 0, delay: 1500, duration: 500, onComplete: () => box.destroy() });
  }

  _showFloatingText(text, x, y, color = '#fff') {
    const t = this.add.text(x, y, text, {
      fontFamily: 'Baloo 2', fontSize: '18px', color,
      stroke: '#333', strokeThickness: 3
    }).setOrigin(0.5);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 700, onComplete: () => t.destroy() });
  }
}
