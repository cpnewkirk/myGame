const canvas = document.querySelector(".treasure-canvas");
const c = canvas.getContext("2d");

canvas.classList.add("treasure");

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
              document.querySelector(`.overworld`).style.visibility = "visible";
              document.querySelector(`.overworld`).style.display = "block";
              document.querySelector(`.knuckles-game`).style.visibility =
                "hidden";
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

let level = 1;
let levels = {
  1: {
    init: () => {
      parsedCollisions = collisionsLevel1.parse2D();
      collisionBlocks = parsedCollisions.createObjectsFrom2D();
      player.collisionBlocks = collisionBlocks;
      if (player.currentAnimation) player.currentAnimation.isActive = false;

      background = new treasureSprite({
        position: {
          x: 0,
          y: 0,
        },
        imageSrc: "assets/treasure-hunt/backgroundLevel1.png",
      });

      doors = [
        new treasureSprite({
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

      background = new treasureSprite({
        position: {
          x: 0,
          y: 0,
        },
        imageSrc: "assets/treasure-hunt/backgroundLevel2.png",
      });

      doors = [
        new treasureSprite({
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

      background = new treasureSprite({
        position: {
          x: 0,
          y: 0,
        },
        imageSrc: "assets/treasure-hunt/backgroundLevel3.png",
      });

      doors = [
        new treasureSprite({
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
