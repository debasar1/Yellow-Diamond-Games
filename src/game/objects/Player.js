import Phaser from 'phaser';
import { GAME_CONFIG } from '../gameConstants';

/**
 * Player object for the Runner scene.
 * Encapsulates movement, jump, slide, hit, and power-up states.
 */
export default class Player {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;
    this.isJumping = false;
    this.isSliding = false;
    this.isInvincible = false;
    this.canDoubleJump = false;
    this._hasUsedDoubleJump = false;
    this.groundY = y;

    // Physics sprite
    this.sprite = scene.physics.add.sprite(x, y, 'mascot-run')
      .setScale(0.7)
      .setDepth(10);
    this.sprite.body.setAllowGravity(false);
    this.sprite.play('run');
  }

  update(delta) {
    // Keyboard input (desktop fallback)
    const scene = this.scene;
    if (scene.cursors) {
      if (Phaser.Input.Keyboard.JustDown(scene.cursors.left))  scene._moveLeft?.();
      if (Phaser.Input.Keyboard.JustDown(scene.cursors.right)) scene._moveRight?.();
      if (Phaser.Input.Keyboard.JustDown(scene.cursors.up))    this.jump();
      if (Phaser.Input.Keyboard.JustDown(scene.cursors.down))  this.slide();
    }
  }

  /** Smoothly tween sprite to a new lane X position */
  moveTo(targetX) {
    this.scene.tweens.add({
      targets: this.sprite,
      x: targetX,
      duration: 150,
      ease: 'Power2'
    });
  }

  jump() {
    if (!this.isJumping) {
      this._startJump();
    } else if (this.canDoubleJump && !this._hasUsedDoubleJump) {
      this._hasUsedDoubleJump = true;
      this._startJump();
    }
  }

  _startJump() {
    this.isJumping = true;
    this.sprite.play('jump', true);
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.groundY - GAME_CONFIG.RUNNER.JUMP_HEIGHT,
      duration: 380,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        this.isJumping = false;
        this._hasUsedDoubleJump = false;
        this.sprite.play('run', true);
      }
    });
  }

  slide() {
    if (this.isJumping || this.isSliding) return;
    this.isSliding = true;
    this.sprite.play('slide', true);
    // Shrink hitbox while sliding
    this.sprite.body.setSize(128, 50, true);
    this.scene.time.delayedCall(600, () => {
      this.isSliding = false;
      this.sprite.body.setSize(96, 128, true);
      this.sprite.play('run', true);
    });
  }

  triggerHit() {
    if (this.isInvincible) return;
    this.sprite.play('hit', true);
    this.setInvincible(1500); // brief invincibility after hit
    this.scene.cameras.main.shake(300, 0.01);
    this.scene.time.delayedCall(400, () => {
      this.sprite.play('run', true);
    });
  }

  setInvincible(duration) {
    this.isInvincible = true;
    // Flash effect
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      yoyo: true,
      repeat: Math.floor(duration / 200),
      duration: 100,
      onComplete: () => this.sprite.setAlpha(1)
    });
    this.scene.time.delayedCall(duration, () => {
      this.isInvincible = false;
      this.sprite.setAlpha(1);
    });
  }

  enableDoubleJump(duration) {
    this.canDoubleJump = true;
    this.scene.time.delayedCall(duration, () => {
      this.canDoubleJump = false;
    });
  }
}
