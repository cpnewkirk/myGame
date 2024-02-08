class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;
  }

  gameLoopStepWork(delta) {
    //Clear off the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //Establish the camera person
    const cameraPerson = this.map.gameObjects.hero;

    // console.log(cameraPerson.y);
    // if (cameraPerson.x < 176) {
    //   cameraPerson.x = 176;
    // } else if (cameraPerson.x > 816) {
    //   cameraPerson.x = 816;
    // }

    // if (cameraPerson.y < 102) {
    //   cameraPerson.y = 102;
    // } else if (cameraPerson.y > 582) {
    //   cameraPerson.y = 582;
    // }

    //Update all objects
    Object.values(this.map.gameObjects).forEach((object) => {
      object.update({
        delta,
        arrow: this.directionInput.direction,
        map: this.map,
      });
    });

    //Draw Lower layer
    this.map.drawLowerImage(this.ctx, cameraPerson);

    //Draw Game Objects
    Object.values(this.map.gameObjects)
      .sort((a, b) => {
        return a.y - b.y;
      })
      .forEach((object) => {
        object.sprite.draw(this.ctx, cameraPerson);
      });

    //Draw Upper layer
    this.map.drawUpperImage(this.ctx, cameraPerson);
  }

  startGameLoop() {
    let previousMs;
    const step = 1 / 60;

    const stepFn = (timestampMs) => {
      // Stop here if paused
      if (this.map.isPaused) {
        return;
      }
      if (previousMs === undefined) {
        previousMs = timestampMs;
      }

      let delta = (timestampMs - previousMs) / 1000;
      while (delta >= step) {
        this.gameLoopStepWork(delta);
        delta -= step;
      }
      previousMs = timestampMs - delta * 1000; // Make sure we don't lose unprocessed (delta) time

      // Business as usual tick
      requestAnimationFrame(stepFn);
    };

    // First tick
    requestAnimationFrame(stepFn);
  }

  bindActionInput() {
    new KeyPressListener("Enter", () => {
      //Is there a person here to talk to?
      this.map.checkForActionCutscene();
    });
    new KeyPressListener("Space", () => {
      //Is there a person here to talk to?
      this.map.checkForActionCutscene();
    });
    new KeyPressListener("Escape", () => {
      if (!this.map.isCutscenePlaying) {
        this.map.startCutscene([{ type: "pause" }]);
      }
    });
  }

  bindHeroPositionCheck() {
    document.addEventListener("PersonWalkingComplete", (e) => {
      if (e.detail.whoId === "hero") {
        //Hero's position has changed
        this.map.checkForFootstepCutscene();
      }
    });
  }

  createController() {
    this.controllerUp = document.createElement("button");
    this.controllerUp.classList.add("controllerUp");
    this.controllerUp.classList.add("controller");
    // this.controllerUp.textContent = "Up";
    this.controllerUp.addEventListener("pointerdown", (e) => {
      const dir = this.directionInput.map["ArrowUp"];
      if (dir && this.directionInput.heldDirections.indexOf(dir) === -1) {
        this.directionInput.heldDirections.unshift(dir);
      }
    });
    this.controllerUp.addEventListener("pointerup", (e) => {
      const dir = this.directionInput.map["ArrowUp"];
      const index = this.directionInput.heldDirections.indexOf(dir);
      if (index > -1) {
        this.directionInput.heldDirections.splice(index, 1);
      }
    });
    document.querySelector(".game-container").appendChild(this.controllerUp);

    this.controllerRight = document.createElement("button");
    this.controllerRight.classList.add("controllerRight");
    this.controllerRight.classList.add("controller");
    // this.controllerRight.textContent = "Right";
    this.controllerRight.addEventListener("pointerdown", (e) => {
      const dir = this.directionInput.map["ArrowRight"];
      if (dir && this.directionInput.heldDirections.indexOf(dir) === -1) {
        this.directionInput.heldDirections.unshift(dir);
      }
    });
    this.controllerRight.addEventListener("pointerup", (e) => {
      const dir = this.directionInput.map["ArrowRight"];
      const index = this.directionInput.heldDirections.indexOf(dir);
      if (index > -1) {
        this.directionInput.heldDirections.splice(index, 1);
      }
    });
    document.querySelector(".game-container").appendChild(this.controllerRight);

    this.controllerDown = document.createElement("button");
    this.controllerDown.classList.add("controllerDown");
    this.controllerDown.classList.add("controller");
    // this.controllerDown.textContent = "Down";
    this.controllerDown.addEventListener("pointerdown", (e) => {
      const dir = this.directionInput.map["ArrowDown"];
      if (dir && this.directionInput.heldDirections.indexOf(dir) === -1) {
        this.directionInput.heldDirections.unshift(dir);
      }
    });
    this.controllerDown.addEventListener("pointerup", (e) => {
      const dir = this.directionInput.map["ArrowDown"];
      const index = this.directionInput.heldDirections.indexOf(dir);
      if (index > -1) {
        this.directionInput.heldDirections.splice(index, 1);
      }
    });
    document.querySelector(".game-container").appendChild(this.controllerDown);

    this.controllerLeft = document.createElement("button");
    this.controllerLeft.classList.add("controllerLeft");
    this.controllerLeft.classList.add("controller");
    // this.controllerLeft.textContent = "Left";
    this.controllerLeft.addEventListener("pointerdown", (e) => {
      const dir = this.directionInput.map["ArrowLeft"];
      if (dir && this.directionInput.heldDirections.indexOf(dir) === -1) {
        this.directionInput.heldDirections.unshift(dir);
      }
    });
    this.controllerLeft.addEventListener("pointerup", (e) => {
      const dir = this.directionInput.map["ArrowLeft"];
      const index = this.directionInput.heldDirections.indexOf(dir);
      if (index > -1) {
        this.directionInput.heldDirections.splice(index, 1);
      }
    });
    document.querySelector(".game-container").appendChild(this.controllerLeft);

    this.controllerEnter = document.createElement("button");
    this.controllerEnter.classList.add("controllerEnter");
    this.controllerEnter.classList.add("controller");
    // this.controllerEnter.textContent = "Enter";
    this.controllerEnter.addEventListener("pointerdown", (e) => {
      this.map.checkForActionCutscene();
    });

    document.querySelector(".game-container").appendChild(this.controllerEnter);
  }

  startMap(mapConfig, heroInitialState = null) {
    this.map = new OverworldMap(mapConfig);
    this.map.overworld = this;
    this.map.mountObjects();
    this.map.startMusic();

    if (heroInitialState) {
      const { hero } = this.map.gameObjects;
      hero.x = heroInitialState.x;
      hero.y = heroInitialState.y;
      hero.direction = heroInitialState.direction;
    }

    this.progress.mapId = mapConfig.id;
    this.progress.startingHeroX = this.map.gameObjects.hero.x;
    this.progress.startingHeroY = this.map.gameObjects.hero.y;
    this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
  }

  async init() {
    const container = document.querySelector(".game-container");

    //Create a new Progress tracker
    this.progress = new Progress();

    //Show the title screen
    this.titleScreen = new TitleScreen({
      progress: this.progress,
    });
    const useSaveFile = await this.titleScreen.init(container);
    // const useSaveFile = false;

    //Potentially load saved data
    let initialHeroState = null;
    if (useSaveFile) {
      this.progress.load();
      initialHeroState = {
        x: this.progress.startingHeroX,
        y: this.progress.startingHeroY,
        direction: this.progress.startingHeroDirection,
      };
    }

    //Load the HUD
    this.hud = new Hud();
    this.hud.init(container);

    if (screen.width < 768) {
      this.element = document.createElement("button");
      this.element.classList.add("escMenu");
      this.element.textContent = "Menu";
      this.element.onclick = (event) => {
        // if (!this.map.isCutscenePlaying) {
        this.map.startCutscene([{ type: "pause" }]);
        // }
      };
      container.appendChild(this.element);
    }

    this.fullscreenButton = document.createElement("button");
    this.fullscreenButton.classList.add("fullscreenButton");
    this.fullscreenButton.textContent = "Toggle Fullscreen";
    this.fullscreenButton.onclick = (event) => {
      if (!document.fullscreenElement) {
        document
          .querySelector(".game-container")
          .requestFullscreen()
          .catch((err) => {
            alert(`Error, can't enable full-screen mode: ${err.message}`);
          });
      } else {
        document.exitFullscreen();
      }
    };
    container.appendChild(this.fullscreenButton);

    //Start the first map
    this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

    //Create controls
    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    // Make touch controller
    if (screen.width < 768) {
      this.createController();
    }

    //Kick off the game!
    this.startGameLoop();

    this.map.startCutscene([
      { type: "walk", who: "hero", direction: "down" },
      { type: "walk", who: "hero", direction: "down" },
      { type: "walk", who: "hero", direction: "down" },
      { type: "walk", who: "hero", direction: "down" },
      { type: "walk", who: "hero", direction: "down" },
      { type: "walk", who: "hero", direction: "down" },
      {
        type: "textMessage",
        text: "It  feels good to be back in Knothole after fighting Dr.Robotnik for so long.",
        who: "Sonic",
      },
      {
        type: "textMessage",
        text: "I wonder how everyone is doing.",
        who: "Sonic",
      },
    ]);
  }
}
