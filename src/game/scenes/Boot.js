import Phaser from 'phaser';

/**
 * Boot Scene
 * First scene to run. Sets up global game settings and transitions to Preload.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  init() {
    // Prevent default touch behaviours (scroll, zoom) on the canvas
    this.input.addPointer(2); // support 2-finger touch
    this.scale.on('resize', this.resize, this);
  }

  preload() {
    // Load only the minimum assets needed for the loading screen itself
    // (logo placeholder — replace with actual WebP asset from brand team)
    this.load.svg('logo-placeholder', 'assets/placeholder/logo.svg');
  }

  create() {
    this.resize();
    this.scene.start('Preload');
  }

  resize() {
    const { width, height } = this.scale;
    this.cameras.main.setViewport(0, 0, width, height);
  }
}
