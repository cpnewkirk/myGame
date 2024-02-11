class Treasure {
  constructor({ onComplete }) {
    this.onComplete = onComplete;
  }

  init(container) {
    this.startGame(container);
  }

  startGame(container) {
    const canvas = document.createElement("canvas");
    canvas.classList.add("treasure");
    container.appendChild(canvas);

    if (screen.width < 1000) {
      this.controllerUp = document.createElement("button");
      this.controllerUp.classList.add("controllerUp");
      this.controllerUp.classList.add("controller");
      this.controllerUp.classList.add("treasureController");
      // this.controllerUp.textContent = "Enter Door";
      this.controllerUp.addEventListener("pointerdown", (e) => {
        if (player.preventInput) return;
        for (let i = 0; i < doors.length; i++) {
          const door = doors[i];

          if (
            player.hitbox.position.x + player.hitbox.width <=
              door.position.x + door.width &&
            player.hitbox.position.x >= door.position.x &&
            player.hitbox.position.y + player.hitbox.height >=
              door.position.y &&
            player.hitbox.position.y <= door.position.y + door.height
          ) {
            player.velocity.x = 0;
            player.velocity.y = 0;
            player.preventInput = true;
            player.switchSprite("enterDoor");
            door.play();
            return;
          }
        }
        if (player.velocity.y === 0) player.velocity.y = -25;
      });
      document.querySelector(".game-container").appendChild(this.controllerUp);

      this.controllerRight = document.createElement("button");
      this.controllerRight.classList.add("controllerRight");
      this.controllerRight.classList.add("controller");
      this.controllerRight.classList.add("treasureController");
      // this.controllerRight.textContent = "Right";
      this.controllerRight.addEventListener("pointerdown", (e) => {
        keys.d.pressed = true;
      });
      this.controllerRight.addEventListener("pointerup", (e) => {
        keys.d.pressed = false;
      });
      document
        .querySelector(".game-container")
        .appendChild(this.controllerRight);

      this.controllerLeft = document.createElement("button");
      this.controllerLeft.classList.add("controllerLeft");
      this.controllerLeft.classList.add("controller");
      this.controllerLeft.classList.add("treasureController");
      // this.controllerLeft.textContent = "Left";
      this.controllerLeft.addEventListener("pointerdown", (e) => {
        keys.a.pressed = true;
      });
      this.controllerLeft.addEventListener("pointerup", (e) => {
        keys.a.pressed = false;
      });
      document
        .querySelector(".game-container")
        .appendChild(this.controllerLeft);
    }
    const c = canvas.getContext("2d");

    canvas.width = 64 * 16; // 1024
    canvas.height = 64 * 9; // 576

    let parsedCollisions;
    let collisionBlocks;
    let background;
    let doors;
    const player = new Player({
      imageSrc: "assets/treasure-hunt/player/idle.png",
      frameRate: 8,
      animations: {
        idleRight: {
          frameRate: 8,
          frameBuffer: 32,
          loop: true,
          imageSrc: "assets/treasure-hunt/player/idle.png",
        },
        idleLeft: {
          frameRate: 8,
          frameBuffer: 32,
          loop: true,
          imageSrc: "assets/treasure-hunt/player/idleLeft.png",
        },
        runRight: {
          frameRate: 8,
          frameBuffer: 8,
          loop: true,
          imageSrc: "assets/treasure-hunt/player/runRight.png",
        },
        runLeft: {
          frameRate: 8,
          frameBuffer: 8,
          loop: true,
          imageSrc: "assets/treasure-hunt/player/runLeft.png",
        },
        enterDoor: {
          frameRate: 8,
          frameBuffer: 4,
          loop: false,
          imageSrc: "assets/treasure-hunt/player/enterDoor.png",
          onComplete: () => {
            // console.log("completed animation");
            gsap.to(overlay, {
              opacity: 1,
              onComplete: () => {
                level++;

                if (level === 4) {
                  const ending = document.createElement("div");
                  ending.innerHTML = `
                  <div class="treasureEnding">
                  <div class="close">
                    <button id="close">Close</button>
                  </div>
                  <div class="results">
                    <h2 id="results">Congratualations, you found the chaos emerald!</h2>
                  </div>
                </div>
                  `;
                  container.appendChild(ending);

                  document
                    .querySelector("#close")
                    .addEventListener("click", (e) => {
                      canvas.remove();
                      ending.remove();
                      const paras =
                        document.getElementsByClassName("treasureController");
                      while (paras[0]) {
                        paras[0].parentNode.removeChild(paras[0]);
                      }
                      this.onComplete(true);
                    });
                  level = 1;
                }
                levels[level].init();
                player.switchSprite("idleRight");
                player.preventInput = false;
                gsap.to(overlay, {
                  opacity: 0,
                });
              },
            });
          },
        },
      },
    });

    window.addEventListener("keydown", (event) => {
      if (player.preventInput) return;
      switch (event.key) {
        case "w":
          for (let i = 0; i < doors.length; i++) {
            const door = doors[i];

            if (
              player.hitbox.position.x + player.hitbox.width <=
                door.position.x + door.width &&
              player.hitbox.position.x >= door.position.x &&
              player.hitbox.position.y + player.hitbox.height >=
                door.position.y &&
              player.hitbox.position.y <= door.position.y + door.height
            ) {
              player.velocity.x = 0;
              player.velocity.y = 0;
              player.preventInput = true;
              player.switchSprite("enterDoor");
              door.play();
              return;
            }
          }
          if (player.velocity.y === 0) player.velocity.y = -25;

          break;
        case "a":
          // move player to the left
          keys.a.pressed = true;
          break;
        case "d":
          // move player to the right
          keys.d.pressed = true;
          break;
      }
    });

    window.addEventListener("keyup", (event) => {
      switch (event.key) {
        case "a":
          // move player to the left
          keys.a.pressed = false;

          break;
        case "d":
          // move player to the right
          keys.d.pressed = false;

          break;
      }
    });

    let level = 1;
    let levels = {
      1: {
        init: () => {
          parsedCollisions = collisionsLevel1.parse2D();
          collisionBlocks = parsedCollisions.createObjectsFrom2D();
          player.collisionBlocks = collisionBlocks;
          if (player.currentAnimation) player.currentAnimation.isActive = false;

          background = new TreasureSprite({
            position: {
              x: 0,
              y: 0,
            },
            imageSrc: "assets/treasure-hunt/backgroundLevel1.png",
          });

          doors = [
            new TreasureSprite({
              position: {
                x: 767,
                y: 270,
              },
              imageSrc: "assets/treasure-hunt/doorOpen.png",
              frameRate: 5,
              frameBuffer: 5,
              loop: false,
              autoplay: false,
            }),
          ];
        },
      },
      2: {
        init: () => {
          parsedCollisions = collisionsLevel2.parse2D();
          collisionBlocks = parsedCollisions.createObjectsFrom2D();
          player.collisionBlocks = collisionBlocks;
          player.position.x = 96;
          player.position.y = 140;

          if (player.currentAnimation) player.currentAnimation.isActive = false;

          background = new TreasureSprite({
            position: {
              x: 0,
              y: 0,
            },
            imageSrc: "assets/treasure-hunt/backgroundLevel2.png",
          });

          doors = [
            new TreasureSprite({
              position: {
                x: 772.0,
                y: 336,
              },
              imageSrc: "assets/treasure-hunt/doorOpen.png",
              frameRate: 5,
              frameBuffer: 5,
              loop: false,
              autoplay: false,
            }),
          ];
        },
      },
      3: {
        init: () => {
          parsedCollisions = collisionsLevel3.parse2D();
          collisionBlocks = parsedCollisions.createObjectsFrom2D();
          player.collisionBlocks = collisionBlocks;
          player.position.x = 750;
          player.position.y = 230;
          if (player.currentAnimation) player.currentAnimation.isActive = false;

          background = new TreasureSprite({
            position: {
              x: 0,
              y: 0,
            },
            imageSrc: "assets/treasure-hunt/backgroundLevel3.png",
          });

          doors = [
            new TreasureSprite({
              position: {
                x: 176.0,
                y: 335,
              },
              imageSrc: "assets/treasure-hunt/doorOpen.png",
              frameRate: 5,
              frameBuffer: 5,
              loop: false,
              autoplay: false,
            }),
          ];
        },
      },
    };

    const keys = {
      w: {
        pressed: false,
      },
      a: {
        pressed: false,
      },
      d: {
        pressed: false,
      },
    };

    const overlay = {
      opacity: 0,
    };

    function animate() {
      window.requestAnimationFrame(animate);

      background.draw();
      // collisionBlocks.forEach((collisionBlock) => {
      //   collisionBlock.draw()
      // })

      doors.forEach((door) => {
        door.draw();
      });

      player.handleInput(keys);
      player.draw();
      player.update();

      c.save();
      c.globalAlpha = overlay.opacity;
      c.fillStyle = "black";
      c.fillRect(0, 0, canvas.width, canvas.height);
      c.restore();
    }

    levels[level].init();
    animate();
  }
}
