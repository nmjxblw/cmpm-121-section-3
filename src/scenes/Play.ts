import * as Phaser from "phaser";

import starfieldUrl from "/assets/starfield.png";

export default class Play extends Phaser.Scene {
  private enemies: Enemy[] = [];
  fire?: Phaser.Input.Keyboard.Key;
  left?: Phaser.Input.Keyboard.Key;
  right?: Phaser.Input.Keyboard.Key;

  starfield?: Phaser.GameObjects.TileSprite;
  spinner?: Phaser.GameObjects.Shape;

  rotationSpeed = Phaser.Math.PI2 / 1000; // radians per millisecond
  movingSpeed!: number;
  onFire: boolean = false;

  constructor() {
    super("play");
  }

  preload() {
    this.load.image("starfield", starfieldUrl);
  }

  #addKey(
    name: keyof typeof Phaser.Input.Keyboard.KeyCodes,
  ): Phaser.Input.Keyboard.Key {
    return this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes[name]);
  }

  create() {
    this.fire = this.#addKey("F");
    this.left = this.#addKey("LEFT");
    this.right = this.#addKey("RIGHT");
    this.movingSpeed = (this.game.config.width as number) * 0.001;

    this.starfield = this.add
      .tileSprite(
        0,
        0,
        this.game.config.width as number,
        this.game.config.height as number,
        "starfield",
      )
      .setOrigin(0, 0);
    this.spinner = this.add.rectangle(
      100,
      (this.game.config.height as number) * 0.8,
      50,
      50,
      0xef2bb6,
    );

    this.enemies = [new Enemy(this, 480, 100, starfieldUrl, 100)];
  }

  update(_timeMs: number, delta: number) {
    this.starfield!.tilePositionX -= 4;

    if (this.left!.isDown && !this.onFire) {
      this.spinner!.x -= delta * this.movingSpeed;
    }
    if (this.right!.isDown && !this.onFire) {
      this.spinner!.x += delta * this.movingSpeed;
    }

    if (this.fire!.isDown && !this.onFire) {
      this.onFire = true;
      this.tweens.add({
        targets: this.spinner,
        y: 100,
        duration: 300,
        ease: Phaser.Math.Easing.Sine.Out,
        onComplete: () => {
          this.tweens.add({
            targets: this.spinner,
            y: (this.game.config.height as number) * 0.8,
            duration: 300,
            ease: Phaser.Math.Easing.Sine.Out,
            onComplete: () => {
              this.onFire = false;
            },
          });
        },
      });
    }

    this.enemies.forEach((enemy) => {
      enemy.update();
    });
  }
}

class Enemy {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private speed: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    speed: number,
  ) {
    this.scene = scene;
    this.speed! = speed;
    this.sprite! = scene.add.sprite(x, y, texture);

    scene.physics.world!.enable(this.sprite!);

    this.sprite.body!.velocity.x = -speed;
  }

  update() {
    if (this.sprite.x < -this.sprite.width) {
      this.sprite.x = this.scene.game.config.width as number;
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}
