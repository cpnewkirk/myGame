class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.configObjects = config.configObjects; // Configuration content
    this.gameObjects = {}; // Starts empty, live object instances in the map get added here
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;

    this.backgroundMusic = config.backgroundMusic;
  }

  startMusic() {
    // Create music toggle
    this.element = document.createElement("button");
    this.element.classList.add("toggle");

    const background = new Audio(this.backgroundMusic);
    background.loop = true;
    background.volume = 0.5;
    background.muted = false;
    const playPromise = background.play();

    if (playPromise !== undefined) {
      playPromise
        .then(function () {
          // Automatic playback started!
        })
        .catch(function (error) {
          // Automatic playback failed.
          // Show a UI element to let the user manually start playback.
        });
    }

    this.element.textContent = "Mute/Unmute";
    this.element.onclick = (event) => {
      background.muted = !background.muted;
    };

    document.querySelector(".game-container").appendChild(this.element);
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
    if (this.walls[`${x},${y}`]) {
      return true;
    }
    // Check for objects that match
    return Object.values(this.gameObjects).find((obj) => {
      if (obj.x === x && obj.y === y) {
        return true;
      }
      if (
        obj.intentPosition &&
        obj.intentPosition[0] === x &&
        obj.intentPosition[1] === y
      ) {
        return true;
      }
      return false;
    });
  }

  mountObjects() {
    Object.keys(this.configObjects).forEach((key) => {
      let config = this.configObjects[key];
      config.id = key;

      let obj;
      if (config.type === "Person") {
        obj = new Person(config);
      }
      if (config.type === "PizzaStone") {
        obj = new PizzaStone(config);
      }
      this.gameObjects[key] = obj;
      this.gameObjects[key].id = key;
      obj.mount(this);
    });
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    if (document.querySelector(".escMenu")) {
      document.querySelector(".escMenu").style.animation =
        "fadeOut 0.5s forwards";
    }
    if (document.querySelector(".fullscreenButton")) {
      document.querySelector(".fullscreenButton").style.animation =
        "fadeOut 0.5s forwards";
    }
    if (document.querySelector(".Hud")) {
      document.querySelector(".Hud").style.animation = "fadeOut 0.5s forwards";
    }
    if (document.querySelector(".controller")) {
      let x = document.getElementsByClassName("controller");
      for (let i = 0; i < x.length; i++) {
        x[i].style.animation = "fadeOut 0.5s forwards";
      }
    }

    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      });
      const result = await eventHandler.init();
      if (result === "LOST_GAME") {
        break;
      }
    }

    if (document.querySelector(".escMenu")) {
      document.querySelector(".escMenu").style.animation = "fadeIn 0.5s";
    }

    if (document.querySelector(".fullscreenButton")) {
      document.querySelector(".fullscreenButton").style.animation =
        "fadeIn 0.5s";
    }

    if (document.querySelector(".Hud")) {
      document.querySelector(".Hud").style.animation = "fadeIn 0.5s";
    }
    if (document.querySelector(".controller")) {
      let x = document.getElementsByClassName("controller");
      for (let i = 0; i < x.length; i++) {
        x[i].style.animation = "fadeIn 0.5s";
      }
    }
    this.isCutscenePlaying = false;
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find((object) => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      const relevantScenario = match.talking.find((scenario) => {
        return (scenario.required || []).every((sf) => {
          return playerState.storyFlags[sf];
        });
      });
      relevantScenario && this.startCutscene(relevantScenario.events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];

    if (!this.isCutscenePlaying && match) {
      let relevantScenario = match.find((scenario) => {
        //Validate that we don't have any bypassers
        if (scenario.bypass) {
          for (let i = 0; i <= scenario.bypass.length; i++) {
            if (playerState.storyFlags[scenario.bypass[i]]) {
              return false;
            }
          }
        }

        //Validate that we have all of required
        if (scenario.required) {
          return (scenario.required || []).every(
            (entry) => playerState.storyFlags[entry]
          );
        }

        // if (!scenario.bypass && !scenario.required) {
        return true;
        // }
      });

      relevantScenario && this.startCutscene(match[0].events);
    }
  }
}

window.OverworldMaps = {
  Knothole: {
    id: "Knothole",
    lowerSrc: "assets/maps/knotholeLower.png",
    upperSrc: "assets/maps/knotholeUpper.png",
    backgroundMusic: "assets/audios/Knothole.mp3",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(31),
        y: utils.withGrid(0),
      },
      amy: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(18),
        direction: "down",
        src: "assets/characters/people/amy.png",
        talking: [
          {
            required: ["CHAO_COMPLETE"],
            events: [
              {
                type: "textMessage",
                text: "The chao have been so excited ever since you came back!",
                faceHero: "amy",
                who: "amy",
              },
              {
                type: "stand",
                who: "amy",
                direction: "up",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "Sonic, are you ready to help raise some chao?",
                faceHero: "amy",
                who: "amy",
              },
            ],
          },
        ],
      },
      antoine: {
        type: "Person",
        x: utils.withGrid(1),
        y: utils.withGrid(6),
        direction: "right",
        src: "assets/characters/people/antoine.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Sacre bleu! What are you doing back so soon, Sonic the hedgehog?",
                faceHero: "antoine",
                who: "antoine",
              },
              {
                type: "textMessage",
                text: "You shall not pass. The princess has told me to guard the way to New Mobotropolis until further notice.",
                faceHero: "antoine",
                who: "antoine",
              },
              {
                type: "stand",
                who: "antoine",
                direction: "right",
              },
            ],
          },
        ],
      },
      bunnie: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(20),
        direction: "right",
        src: "assets/characters/people/bunnie.png",
        talking: [
          {
            required: ["CHAO_COMPLETE"],
            events: [
              {
                type: "textMessage",
                text: "Didn't knwo you were such a family hedgehog!",
                faceHero: "bunnie",
                who: "bunnie",
              },
              {
                type: "stand",
                who: "bunnie",
                direction: "right",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "Welcome back sugah!",
                faceHero: "bunnie",
                who: "bunnie",
              },
              {
                type: "textMessage",
                text: "Amy has been worried about the chao, I know she can use some help.",
                faceHero: "bunnie",
                who: "bunnie",
              },
              {
                type: "stand",
                who: "bunnie",
                direction: "right",
              },
            ],
          },
        ],
      },
      dulce: {
        type: "Person",
        x: utils.withGrid(54),
        y: utils.withGrid(6),
        direction: "down",
        src: "assets/characters/people/dulce.png",
        talking: [
          {
            required: ["TROUBLE_COPLETE"],
            events: [
              {
                type: "textMessage",
                text: "I'm glad you were able to help Sally!",
                faceHero: "dulce",
                who: "dulce",
              },
              {
                type: "textMessage",
                text: "The freedom fighters will always come out on top!",
                faceHero: "dulce",
                who: "dulce",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "Sonic! Did you hear about the robots that went berserk?",
                faceHero: "dulce",
                who: "dulce",
              },
              {
                type: "textMessage",
                text: "The freedom fighters got them under control of corse! Sally is working with Nicole to see what happened to them.",
                faceHero: "dulce",
                who: "dulce",
              },
            ],
          },
        ],
        behaviorLoop: [
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "left", time: 500 },
          { type: "stand", direction: "down", time: 500 },
          { type: "walk", direction: "down" },
          { type: "stand", direction: "down", time: 1000 },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "left", time: 500 },
          { type: "stand", direction: "down", time: 1000 },
        ],
      },
      knuckles: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(35),
        direction: "down",
        src: "assets/characters/people/knuckles.png",
        talking: [
          {
            required: ["ECHIDNA_COMPLETE"],
            events: [
              {
                type: "textMessage",
                text: "Thanks for the help Sonic. Next time you're up for an adventuer let me know.",
                faceHero: "knuckles",
                who: "knuckles",
              },
              {
                type: "stand",
                who: "knuckles",
                direction: "down",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "Hey. You up for a treasure hunting adventure?",
                faceHero: "knuckles",
                who: "knuckles",
              },
            ],
          },
        ],
      },
      marine: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(20),
        direction: "left",
        src: "assets/characters/people/marine.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Sonic! Aren't the chao so beautiful! We don't have them in the Sol Zone.",
                faceHero: "marine",
                who: "marine",
              },
              {
                type: "stand",
                who: "marine",
                direction: "left",
              },
            ],
          },
        ],
      },
      mina: {
        type: "Person",
        x: utils.withGrid(55),
        y: utils.withGrid(14),
        direction: "down",
        src: "assets/characters/people/mina.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "A family of chao are following me! Maybe I can feature them at my next concert!",
                faceHero: "mina",
                who: "mina",
              },
            ],
          },
        ],
        behaviorLoop: [
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },

          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },

          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },

          { type: "walk", direction: "right" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
        ],
      },
      rouge: {
        type: "Person",
        x: utils.withGrid(34),
        y: utils.withGrid(17),
        direction: "up",
        src: "assets/characters/people/rouge.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "I heard knuckles is looking for the master emerald again. G.U.N. has their eyes on that jewel.",
                who: "rouge",
              },
              {
                type: "stand",
                who: "rouge",
                direction: "up",
              },
            ],
          },
        ],
      },
      shade: {
        type: "Person",
        x: utils.withGrid(12),
        y: utils.withGrid(37),
        direction: "up",
        src: "assets/characters/people/shade.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "This world is a lot to wrap my head around, but I'm glad I have you all to help.",
                who: "shade",
                faceHero: "shade",
              },
              {
                type: "stand",
                who: "shade",
                direction: "up",
              },
            ],
          },
        ],
      },
      shadow: {
        type: "Person",
        x: utils.withGrid(34),
        y: utils.withGrid(16),
        direction: "down",
        src: "assets/characters/people/shadow.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Not now Sonic. We're busy.",
                faceHero: "shadow",
                who: "shadow",
              },
              {
                type: "stand",
                who: "shadow",
                direction: "down",
              },
            ],
          },
        ],
      },
      tails: {
        type: "Person",
        x: utils.withGrid(37),
        y: utils.withGrid(28),
        direction: "up",
        src: "assets/characters/people/tails.png",
        talking: [
          {
            required: ["WORKSHOP_COPLETE"],
            events: [
              {
                type: "textMessage",
                text: "Hey Sonic! I'm taking apart this e-1000 unit to understand why they went haywire the other day.",
                faceHero: "tails",
                who: "tails",
              },
              {
                type: "textMessage",
                text: "I don't remember where all of the parts went though. Can you help me?",
                faceHero: "tails",
                who: "tails",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "Thanks for the help Sonic! I can always count on you.",
                faceHero: "tails",
                who: "tails",
              },
            ],
          },
        ],
        behaviorLoop: [
          { type: "stand", direction: "up", time: 1000 },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "up", time: 1000 },
          { type: "walk", direction: "right" },
          { type: "stand", direction: "down", time: 1000 },
        ],
      },
      vector: {
        type: "Person",
        x: utils.withGrid(57),
        y: utils.withGrid(35),
        direction: "down",
        src: "assets/characters/people/vector.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "The Chaotix are assigned another mystery! Espio and Charmy aren't here but Mighty, Saffron and I got it handled!",
                faceHero: "vector",
                who: "vector",
              },
            ],
          },
        ],
        behaviorLoop: [
          { type: "stand", direction: "down", time: 2500 },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "left", time: 2500 },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
        ],
      },
      gamma1: {
        type: "Person",
        x: utils.withGrid(60),
        y: utils.withGrid(6),
        direction: "left",
        src: "assets/characters/people/gamma.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "*whirllllll*",
              },
            ],
          },
        ],
        behaviorLoop: [
          { type: "walk", direction: "right" },
          { type: "stand", direction: "right", time: 500 },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "left", time: 1000 },
        ],
      },
      gamma2: {
        type: "Person",
        x: utils.withGrid(60),
        y: utils.withGrid(7),
        direction: "left",
        src: "assets/characters/people/gamma.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "*Zappppppp*",
              },
            ],
          },
        ],
        behaviorLoop: [
          { type: "walk", direction: "right" },
          { type: "stand", direction: "right", time: 300 },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "left", time: 453 },
        ],
      },
      gamma3: {
        type: "Person",
        x: utils.withGrid(60),
        y: utils.withGrid(8),
        direction: "left",
        src: "assets/characters/people/gamma.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "*Bzzzzzzzztt*",
              },
            ],
          },
        ],
        behaviorLoop: [
          { type: "walk", direction: "right" },
          { type: "stand", direction: "right", time: 976 },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "left", time: 860 },
        ],
      },
      gamma4: {
        type: "Person",
        x: utils.withGrid(36),
        y: utils.withGrid(27),
        direction: "down",
        src: "assets/characters/people/gamma.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Err... or.",
              },
            ],
          },
        ],
      },
      fiona: {
        type: "Person",
        x: utils.withGrid(17),
        y: utils.withGrid(12),
        direction: "down",
        src: "assets/characters/people/fiona.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Why do they get to be so happy... Where is Scourge...",
                who: "fiona",
              },
            ],
          },
        ],
      },
      saffron: {
        type: "Person",
        x: utils.withGrid(56),
        y: utils.withGrid(36),
        direction: "right",
        src: "assets/characters/people/saffron.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "With Vector in charge, we can do anything!",
                faceHero: "saffron",
                who: "saffron",
              },
              {
                type: "stand",
                who: "saffron",
                direction: "right",
              },
            ],
          },
        ],
      },
      mighty: {
        type: "Person",
        x: utils.withGrid(58),
        y: utils.withGrid(36),
        direction: "left",
        src: "assets/characters/people/mighty.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "We got this.",
                faceHero: "mighty",
                who: "mighty",
              },
              {
                type: "stand",
                who: "mighty",
                direction: "left",
              },
            ],
          },
        ],
      },
      sally: {
        type: "Person",
        x: utils.withGrid(58),
        y: utils.withGrid(7),
        direction: "right",
        src: "assets/characters/people/sally.png",
        talking: [
          {
            required: ["TROUBLE_COMPLETE"],
            events: [
              {
                type: "textMessage",
                text: "Thanks for the help earlier Sonic. You're always one to impress. Don't miss our meeting for chili dogs again.",
                faceHero: "sally",
                who: "sally",
              },
              {
                type: "stand",
                who: "sally",
                direction: "right",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "Sonic, glad to hear your mission went well, but I don't have time for a debrief.",
                faceHero: "sally",
                who: "sally",
              },
              {
                type: "textMessage",
                text: "The e-1000s are acting up and I'm worried it has to do with Robotnik.",
                who: "sally",
              },
              {
                type: "textMessage",
                text: "Can you run and get me something? Let's do it to it!",
                faceHero: "sally",
                who: "sally",
              },
              {
                type: "stand",
                who: "sally",
                direction: "right",
              },
            ],
          },
        ],
      },
      laraSu: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(38),
        direction: "right",
        src: "assets/characters/people/lara-su.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Knuckles is so stubborn.",
                faceHero: "laraSu",
                who: "laraSu",
              },
              {
                type: "stand",
                who: "laraSu",
                direction: "right",
              },
            ],
          },
        ],
      },
      cream: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(22),
        direction: "right",
        src: "assets/characters/people/cream.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Cheese, wait for me!",
                who: "cream",
              },
            ],
          },
        ],
        behaviorLoop: [
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
        ],
      },
      robO: {
        type: "Person",
        x: utils.withGrid(34),
        y: utils.withGrid(37),
        direction: "down",
        src: "assets/characters/people/rob-o.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Hey there Sonic! Have you had a chance to speak with my cousin? I hear she is in need of help in the Chao Garden.",
                faceHero: "robO",
                who: "Rob o' the Hedge",
              },
              {
                type: "textMessage",
                text: "I'm looking for flickies hiding in the tall grass.",
                faceHero: "robO",
                who: "Rob o' the Hedge",
              },
            ],
          },
        ],
        behaviorLoop: [
          { type: "stand", direction: "left", time: 150 },
          { type: "stand", direction: "right", time: 100 },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "stand", direction: "down", time: 500 },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "left", time: 100 },
          { type: "stand", direction: "right", time: 150 },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "left", time: 100 },
          { type: "stand", direction: "right", time: 100 },
        ],
      },
      nicole: {
        type: "Person",
        x: utils.withGrid(59),
        y: utils.withGrid(5),
        direction: "down",
        src: "assets/characters/people/nicole.png",
        talking: [
          {
            required: ["TROUBLE_COMPLETE"],
            events: [
              {
                type: "textMessage",
                text: "The reason you can see me right now is beacuse I am projecting myself using a special technology.",
                faceHero: "nicole",
                who: "nicole",
              },
              {
                type: "stand",
                who: "nicole",
                direction: "down",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "I'm helping Sally diagnose the e-1000 robots with my nanites. I can't interface with them right now for some reason.",
                faceHero: "nicole",
                who: "nicole",
              },
              {
                type: "stand",
                who: "nicole",
                direction: "down",
              },
            ],
          },
        ],
        behaviorLoop: [
          { type: "walk", direction: "left" },
          { type: "walk", direction: "down" },
          { type: "stand", direction: "down", time: 500 },
          { type: "walk", direction: "right" },
          { type: "stand", direction: "right", time: 500 },
          { type: "walk", direction: "up" },
        ],
      },
      uncleChuck: {
        type: "Person",
        x: utils.withGrid(38),
        y: utils.withGrid(32),
        direction: "down",
        src: "assets/characters/people/uncle-chuck.png",
        talking: [
          {
            required: ["WORKSHOP_SCENE"],
            events: [
              {
                type: "textMessage",
                text: "I'm glad you stopped by and talked to Tails He's been working non-stop on the bots.",
                faceHero: "uncleChuck",
                who: "Uncle Chuck",
              },
              {
                type: "stand",
                who: "uncleChuck",
                direction: "down",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "Sonic my boy! How was your last adventure? I've been in the shop the past few hours helping Tails diagnose the bots.",
                faceHero: "uncleChuck",
                who: "Uncle Chuck",
              },
              {
                type: "textMessage",
                text: "Have you talked to him yet? I'm sure you would be a great help to him!",
                faceHero: "uncleChuck",
                who: "Uncle Chuck",
              },
            ],
          },
        ],
      },
      chaos: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(17),
        direction: "down",
        src: "assets/characters/people/chaos.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "...",
                who: "Chaos",
              },
            ],
          },
        ],
      },
      tPup: {
        type: "Person",
        x: utils.withGrid(38),
        y: utils.withGrid(29),
        direction: "left",
        src: "assets/characters/people/t-pup-sky.png",
        behaviorLoop: [
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
        ],
      },
      omachao: {
        type: "Person",
        x: utils.withGrid(29),
        y: utils.withGrid(9),
        direction: "right",
        src: "assets/characters/people/omachao.png",
        talking: [
          {
            required: [
              "CHAO_COMPLETE",
              "WORKSHOP_COMPLETE",
              "ECHIDNA_COMPLETE",
              "TROUBLE_COMPLETE",
            ],
            events: [
              {
                type: "textMessage",
                text: "You've helped all of your friends for the day. Have you tried heading back to your house for a nap?",
                faceHero: "omachao",
                who: "omachao",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "You've been gone for a few weeks on a mission Sonic. Go speak to your friends and see if they need any help.",
                faceHero: "omachao",
                who: "omachao",
              },
              {
                type: "textMessage",
                text: "Amy is in the chao garden. Knuckles is across the southern bridge. Tails is near your house. Sally is to the east.",
                faceHero: "omachao",
                who: "omachao",
              },
            ],
          },
        ],
      },
      cheese: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(22),
        direction: "left",
        src: "assets/characters/people/cheese.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Chao chao chao.",
                faceHero: "cheese",
                who: "cheese",
              },
            ],
          },
        ],
        behaviorLoop: [
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "right" },
        ],
      },

      // Chao
      chao1: {
        type: "Person",
        x: utils.withGrid(20),
        y: utils.withGrid(4),
        direction: "right",
        src: "assets/characters/people/chao.png",
      },
      chao2: {
        type: "Person",
        x: utils.withGrid(21),
        y: utils.withGrid(4),
        direction: "left",
        src: "assets/characters/people/hero-chao.png",
      },
      chao3: {
        type: "Person",
        x: utils.withGrid(50),
        y: utils.withGrid(5),
        direction: "right",
        src: "assets/characters/people/hero-chao.png",
      },
      chao4: {
        type: "Person",
        x: utils.withGrid(51),
        y: utils.withGrid(5),
        direction: "left",
        src: "assets/characters/people/chao.png",
      },
      chao5: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        direction: "left",
        src: "assets/characters/people/chao.png",
        behaviorLoop: [
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
        ],
      },
      chao6: {
        type: "Person",
        x: utils.withGrid(43),
        y: utils.withGrid(8),
        direction: "right",
        src: "assets/characters/people/chao.png",
      },
      chao7: {
        type: "Person",
        x: utils.withGrid(44),
        y: utils.withGrid(8),
        direction: "left",
        src: "assets/characters/people/chao.png",
      },
      chao8: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(9),
        direction: "up",
        src: "assets/characters/people/chao.png",
        behaviorLoop: [
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
        ],
      },
      chao9: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(9),
        direction: "left",
        src: "assets/characters/people/chao.png",
        behaviorLoop: [
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
        ],
      },
      chao10: {
        type: "Person",
        x: utils.withGrid(56),
        y: utils.withGrid(10),
        direction: "down",
        src: "assets/characters/people/chao.png",
        behaviorLoop: [
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },

          { type: "walk", direction: "left" },

          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },

          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },

          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },

          { type: "walk", direction: "right" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
        ],
      },
      chao11: {
        type: "Person",
        x: utils.withGrid(55),
        y: utils.withGrid(11),
        direction: "down",
        src: "assets/characters/people/chao.png",
        behaviorLoop: [
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },

          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },

          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },

          { type: "walk", direction: "right" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
        ],
      },
      chao12: {
        type: "Person",
        x: utils.withGrid(54),
        y: utils.withGrid(12),
        direction: "down",
        src: "assets/characters/people/chao.png",
        behaviorLoop: [
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },

          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },

          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },

          { type: "walk", direction: "right" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
        ],
      },
      chao13: {
        type: "Person",
        x: utils.withGrid(55),
        y: utils.withGrid(12),
        direction: "down",
        src: "assets/characters/people/hero-chao.png",
        behaviorLoop: [
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },

          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },

          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },

          { type: "walk", direction: "right" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
        ],
      },
      chao14: {
        type: "Person",
        x: utils.withGrid(20),
        y: utils.withGrid(13),
        direction: "down",
        src: "assets/characters/people/dark-chao.png",
      },
      chao15: {
        type: "Person",
        x: utils.withGrid(55),
        y: utils.withGrid(13),
        direction: "left",
        src: "assets/characters/people/chao.png",
        behaviorLoop: [
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },

          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },

          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "left" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },

          { type: "walk", direction: "right" },

          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },

          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },

          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
        ],
      },
      chao16: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(14),
        direction: "right",
        src: "assets/characters/people/hero-chao.png",
      },
      chao17: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(14),
        direction: "left",
        src: "assets/characters/people/chao.png",
      },
      chao18: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(15),
        direction: "down",
        src: "assets/characters/people/dark-chao.png",
      },
      chao19: {
        type: "Person",
        x: utils.withGrid(36),
        y: utils.withGrid(15),
        direction: "down",
        src: "assets/characters/people/dark-chao.png",
      },
      chao20: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(16),
        direction: "right",
        src: "assets/characters/people/hero-chao.png",
        behaviorLoop: [
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
        ],
      },
      chao21: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(16),
        direction: "down",
        src: "assets/characters/people/hero-chao.png",
        behaviorLoop: [
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
        ],
      },
      chao22: {
        type: "Person",
        x: utils.withGrid(9),
        y: utils.withGrid(16),
        direction: "left",
        src: "assets/characters/people/chao.png",
      },
      chao23: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(18),
        direction: "left",
        src: "assets/characters/people/chao.png",
        behaviorLoop: [
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "left" },
        ],
      },
      chao24: {
        type: "Person",
        x: utils.withGrid(58),
        y: utils.withGrid(19),
        direction: "down",
        src: "assets/characters/people/hero-chao.png",
      },
      chao25: {
        type: "Person",
        x: utils.withGrid(58),
        y: utils.withGrid(20),
        direction: "up",
        src: "assets/characters/people/dark-chao.png",
      },
      chao26: {
        type: "Person",
        x: utils.withGrid(10),
        y: utils.withGrid(22),
        direction: "up",
        src: "assets/characters/people/chao.png",
        behaviorLoop: [
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "left", time: 250 },
          { type: "stand", direction: "right", time: 750 },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "right", time: 500 },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "stand", direction: "left", time: 300 },
          { type: "stand", direction: "down", time: 400 },
        ],
      },
      chao27: {
        type: "Person",
        x: utils.withGrid(26),
        y: utils.withGrid(25),
        direction: "up",
        src: "assets/characters/people/chao.png",
        behaviorLoop: [
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
        ],
      },
      chao28: {
        type: "Person",
        x: utils.withGrid(38),
        y: utils.withGrid(25),
        direction: "right",
        src: "assets/characters/people/hero-chao.png",
      },
      chao29: {
        type: "Person",
        x: utils.withGrid(39),
        y: utils.withGrid(25),
        direction: "left",
        src: "assets/characters/people/hero-chao.png",
      },
      chao30: {
        type: "Person",
        x: utils.withGrid(26),
        y: utils.withGrid(27),
        direction: "up",
        src: "assets/characters/people/chao.png",
        behaviorLoop: [
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
        ],
      },
      chao31: {
        type: "Person",
        x: utils.withGrid(26),
        y: utils.withGrid(29),
        direction: "up",
        src: "assets/characters/people/dark-chao.png",
        behaviorLoop: [
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
        ],
      },
      chao32: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(35),
        direction: "right",
        src: "assets/characters/people/chao.png",
      },
      chao33: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(35),
        direction: "left",
        src: "assets/characters/people/chao.png",
      },
      chao34: {
        type: "Person",
        x: utils.withGrid(2),
        y: utils.withGrid(36),
        direction: "down",
        src: "assets/characters/people/chao.png",
      },
      chao35: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(36),
        direction: "right",
        src: "assets/characters/people/chao.png",
      },
      chao36: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(39),
        direction: "up",
        src: "assets/characters/people/chao.png",
      },
      chao37: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(39),
        direction: "right",
        src: "assets/characters/people/chao.png",
        behaviorLoop: [
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "stand", direction: "up", time: 500 },
          { type: "stand", direction: "right", time: 200 },
          { type: "stand", direction: "left", time: 150 },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
        ],
      },
      // grass: {
      //   type: "grass",
      //   x: utils.withGrid(1),
      //   y: utils.withGrid(4),
      // },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(40, 24)]: [
        {
          required: [
            "CHAO_COMPLETE",
            "WORKSHOP_COMPLETE",
            "ECHIDNA_COMPLETE",
            "TROUBLE_COMPLETE",
          ],
          events: [
            {
              type: "changeMap",
              map: "Home",
              x: utils.withGrid(0),
              y: utils.withGrid(0),
              direction: "up",
            },
          ],
        },
        {
          events: [
            {
              type: "textMessage",
              text: "I can't go to bed yet, my friends need my help!",
              who: "Sonic",
            },
            { type: "walk", who: "hero", direction: "down" },
          ],
        },
      ],
      [utils.asGridCoord(41, 24)]: [
        {
          required: [
            "CHAO_COMPLETE",
            "WORKSHOP_COMPLETE",
            "ECHIDNA_COMPLETE",
            "TROUBLE_COMPLETE",
          ],
          events: [
            {
              type: "changeMap",
              map: "Home",
              x: utils.withGrid(0),
              y: utils.withGrid(0),
              direction: "up",
            },
          ],
        },
        {
          events: [
            {
              type: "textMessage",
              text: "I can't go to bed yet, my friends need my help!",
              who: "Sonic",
            },
            { type: "walk", who: "hero", direction: "down" },
          ],
        },
      ],

      [utils.asGridCoord(29, 0)]: [
        {
          events: [
            {
              type: "textMessage",
              text: "I can't leave yet, I just got here!",
              who: "Sonic",
            },
            { type: "walk", who: "hero", direction: "down" },
          ],
        },
      ],
      [utils.asGridCoord(30, 0)]: [
        {
          events: [
            {
              type: "textMessage",
              text: "I can't leave yet, I just got here!",
              who: "Sonic",
            },
            { type: "walk", who: "hero", direction: "down" },
          ],
        },
      ],
      [utils.asGridCoord(31, 0)]: [
        {
          events: [
            {
              type: "textMessage",
              text: "I can't leave yet, I just got here!",
              who: "Sonic",
            },
            { type: "walk", who: "hero", direction: "down" },
          ],
        },
      ],
      [utils.asGridCoord(32, 0)]: [
        {
          events: [
            {
              type: "textMessage",
              text: "I can't leave yet, I just got here!",
              who: "Sonic",
            },
            { type: "walk", who: "hero", direction: "down" },
          ],
        },
      ],
      [utils.asGridCoord(33, 0)]: [
        {
          events: [
            {
              type: "textMessage",
              text: "I can't leave yet, I just got here!",
              who: "Sonic",
            },
            { type: "walk", who: "hero", direction: "down" },
          ],
        },
      ],

      [utils.asGridCoord(28, 6)]: [
        {
          events: [
            { type: "stand", who: "hero", direction: "up" },

            {
              type: "textMessage",
              text: "The sign says... Welcome to Knothole, home of the Freedom Fighters!",
            },
          ],
        },
      ],

      [utils.asGridCoord(7, 37)]: [
        {
          bypass: ["ECHIDNA_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "ECHIDNA_SCENE" },

            { type: "walk", who: "laraSu", direction: "right" },
            { type: "walk", who: "laraSu", direction: "up" },
            { type: "walk", who: "laraSu", direction: "right" },
            { type: "walk", who: "laraSu", direction: "up" },

            {
              type: "textMessage",
              text: "Knuckles, I can't stand around when the master emerald is gone!",
              who: "Lara-Su",
            },
            {
              type: "textMessage",
              text: "Let me help! You're not alone anymore.",
              who: "Lara-Su",
            },

            { type: "walk", who: "chao32", direction: "left" },
            { type: "stand", who: "chao32", direction: "down" },
            { type: "walk", who: "chao33", direction: "right" },
            { type: "stand", who: "chao33", direction: "down" },
            { type: "walk", who: "knuckles", direction: "left" },
            { type: "walk", who: "knuckles", direction: "down" },
            { type: "stand", who: "knuckles", direction: "right" },
            { type: "stand", who: "laraSu", direction: "left" },

            {
              type: "textMessage",
              text: "I won't go alone. Now that Sonic is here, we can go together.",
              who: "Knuckles",
            },

            { type: "walk", who: "laraSu", direction: "down" },
            { type: "walk", who: "laraSu", direction: "down" },
            { type: "walk", who: "laraSu", direction: "left" },
            { type: "walk", who: "laraSu", direction: "left" },
            { type: "stand", who: "laraSu", direction: "right" },

            { type: "walk", who: "knuckles", direction: "right" },
            { type: "walk", who: "knuckles", direction: "up" },
            { type: "stand", who: "laraSu", direction: "down" },
            { type: "stand", who: "knuckles", direction: "down" },
          ],
        },
      ],
      [utils.asGridCoord(7, 38)]: [
        {
          bypass: ["ECHIDNA_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "ECHIDNA_SCENE" },

            { type: "walk", who: "laraSu", direction: "right" },
            { type: "walk", who: "laraSu", direction: "up" },
            { type: "walk", who: "laraSu", direction: "right" },
            { type: "walk", who: "laraSu", direction: "up" },

            {
              type: "textMessage",
              text: "Knuckles, I can't stand around when the master emerald is gone!",
              who: "Lara-Su",
            },
            {
              type: "textMessage",
              text: "Let me help! You're not alone anymore.",
              who: "Lara-Su",
            },

            { type: "walk", who: "chao32", direction: "left" },
            { type: "stand", who: "chao32", direction: "down" },
            { type: "walk", who: "chao33", direction: "right" },
            { type: "stand", who: "chao33", direction: "down" },
            { type: "walk", who: "knuckles", direction: "left" },
            { type: "walk", who: "knuckles", direction: "down" },
            { type: "stand", who: "knuckles", direction: "right" },

            {
              type: "textMessage",
              text: "I won't go alone. Now that Sonic is here, we can go together.",
              who: "Knuckles",
            },

            { type: "walk", who: "laraSu", direction: "down" },
            { type: "walk", who: "laraSu", direction: "down" },
            { type: "walk", who: "laraSu", direction: "left" },
            { type: "walk", who: "laraSu", direction: "left" },
            { type: "stand", who: "laraSu", direction: "right" },

            { type: "walk", who: "knuckles", direction: "right" },
            { type: "walk", who: "knuckles", direction: "up" },
            { type: "stand", who: "laraSu", direction: "down" },
            { type: "stand", who: "knuckles", direction: "down" },
          ],
        },
      ],
      [utils.asGridCoord(7, 39)]: [
        {
          bypass: ["ECHIDNA_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "ECHIDNA_SCENE" },

            { type: "walk", who: "laraSu", direction: "right" },
            { type: "walk", who: "laraSu", direction: "up" },
            { type: "walk", who: "laraSu", direction: "right" },
            { type: "walk", who: "laraSu", direction: "up" },

            {
              type: "textMessage",
              text: "Knuckles, I can't stand around when the master emerald is gone!",
              who: "Lara-Su",
            },
            {
              type: "textMessage",
              text: "Let me help! You're not alone anymore.",
              who: "Lara-Su",
            },

            { type: "walk", who: "chao32", direction: "left" },
            { type: "stand", who: "chao32", direction: "down" },
            { type: "walk", who: "chao33", direction: "right" },
            { type: "stand", who: "chao33", direction: "down" },
            { type: "walk", who: "knuckles", direction: "left" },
            { type: "walk", who: "knuckles", direction: "down" },
            { type: "stand", who: "knuckles", direction: "right" },

            {
              type: "textMessage",
              text: "I won't go alone. Now that Sonic is here, we can go together.",
              who: "Knuckles",
            },

            { type: "walk", who: "laraSu", direction: "down" },
            { type: "walk", who: "laraSu", direction: "down" },
            { type: "walk", who: "laraSu", direction: "left" },
            { type: "walk", who: "laraSu", direction: "left" },
            { type: "stand", who: "laraSu", direction: "right" },

            { type: "walk", who: "knuckles", direction: "right" },
            { type: "walk", who: "knuckles", direction: "up" },
            { type: "stand", who: "laraSu", direction: "down" },
            { type: "stand", who: "knuckles", direction: "down" },
          ],
        },
      ],
      [utils.asGridCoord(40, 28)]: [
        {
          bypass: ["WORKSHOP_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "WORKSHOP_SCENE" },

            { type: "stand", who: "hero", direction: "left" },

            {
              type: "textMessage",
              text: "I hope Sonic gets back soon, I don't know what I'd do wi...",
              who: "tails",
            },
            {
              type: "textMessage",
              text: "Hey Tails! Had any chili dogs lately?",
              who: "sonic",
            },
            { type: "stand", who: "tails", direction: "right" },
            {
              type: "textMessage",
              text: "Sonic!!! I'm so glad to see you! There's so much to catch up on, but right now my hands are full with this roboOOOOOOOT...",
              who: "tails",
            },
            { type: "walk", who: "gamma4", direction: "up" },

            { type: "stand", who: "gamma4", direction: "right", time: 500 },
            { type: "stand", who: "gamma4", direction: "left", time: 500 },
            { type: "walk", who: "gamma4", direction: "right" },
            { type: "walk", who: "gamma4", direction: "right" },
            { type: "walk", who: "gamma4", direction: "right" },
            { type: "walk", who: "gamma4", direction: "right" },
            { type: "walk", who: "gamma4", direction: "right" },
            { type: "walk", who: "gamma4", direction: "right" },
            { type: "walk", who: "gamma4", direction: "left" },
            { type: "walk", who: "gamma4", direction: "left" },
            { type: "walk", who: "gamma4", direction: "right" },

            { type: "walk", who: "gamma4", direction: "down" },

            {
              type: "textMessage",
              text: "BzZzzZz prio zzZZZzZz one zzZZzZzzZzZzz get zZzz at zzZz EDGEHOGGGG.",
              who: "e-1000",
            },

            { type: "walk", who: "tails", direction: "right" },

            {
              type: "textMessage",
              text: "Sonic are you ok? The e-1000s have been acting up ever since the other day.",
              who: "tails",
            },

            { type: "walk", who: "tails", direction: "up" },
            { type: "stand", who: "tails", direction: "right" },

            {
              type: "textMessage",
              text: "E-1000 unit, walk back.",
              who: "tails",
            },
            { type: "walk", who: "tails", direction: "left" },
            { type: "walk", who: "tails", direction: "down" },
            { type: "stand", who: "tails", direction: "right" },

            { type: "walk", who: "gamma4", direction: "left" },
            { type: "walk", who: "gamma4", direction: "left" },
            { type: "walk", who: "gamma4", direction: "left" },
            { type: "walk", who: "gamma4", direction: "left" },
            { type: "walk", who: "gamma4", direction: "left" },

            { type: "stand", who: "tails", direction: "right" },

            {
              type: "textMessage",
              text: "Sonic, can you come over and lend me a hand?",
              who: "tails",
            },
            { type: "stand", who: "tails", direction: "up" },
          ],
        },
      ],
      [utils.asGridCoord(41, 28)]: [
        {
          bypass: ["WORKSHOP_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "WORKSHOP_SCENE" },

            { type: "stand", who: "hero", direction: "left" },

            {
              type: "textMessage",
              text: "I hope Sonic gets back soon, I don't know what I'd do wi...",
              who: "tails",
            },
            {
              type: "textMessage",
              text: "Hey Tails! Had any chili dogs lately?",
              who: "sonic",
            },
            { type: "stand", who: "tails", direction: "right" },
            {
              type: "textMessage",
              text: "Sonic!!! I'm so glad to see you! There's so much to catch up on, but right now my hands are full with this roboOOOOOOOT...",
              who: "tails",
            },
            { type: "walk", who: "gamma4", direction: "up" },

            { type: "stand", who: "gamma4", direction: "right", time: 500 },
            { type: "stand", who: "gamma4", direction: "left", time: 500 },
            { type: "walk", who: "gamma4", direction: "right" },
            { type: "walk", who: "gamma4", direction: "right" },
            { type: "walk", who: "gamma4", direction: "right" },
            { type: "walk", who: "gamma4", direction: "right" },
            { type: "walk", who: "gamma4", direction: "right" },
            { type: "walk", who: "gamma4", direction: "right" },
            { type: "walk", who: "gamma4", direction: "left" },
            { type: "walk", who: "gamma4", direction: "left" },
            { type: "walk", who: "gamma4", direction: "right" },

            { type: "walk", who: "gamma4", direction: "down" },

            {
              type: "textMessage",
              text: "BzZzzZz prio zzZZZzZz one zzZZzZzzZzZzz get zZzz at zzZz EDGEHOGGGG.",
              who: "e-1000",
            },

            { type: "walk", who: "tails", direction: "right" },

            {
              type: "textMessage",
              text: "Sonic are you ok? The e-1000s have been acting up ever since the other day.",
              who: "tails",
            },

            { type: "walk", who: "tails", direction: "up" },
            { type: "stand", who: "tails", direction: "right" },

            {
              type: "textMessage",
              text: "E-1000 unit, walk back.",
              who: "tails",
            },
            { type: "walk", who: "tails", direction: "left" },
            { type: "walk", who: "tails", direction: "down" },
            { type: "stand", who: "tails", direction: "right" },

            { type: "walk", who: "gamma4", direction: "left" },
            { type: "walk", who: "gamma4", direction: "left" },
            { type: "walk", who: "gamma4", direction: "left" },
            { type: "walk", who: "gamma4", direction: "left" },
            { type: "walk", who: "gamma4", direction: "left" },

            { type: "stand", who: "tails", direction: "right" },

            {
              type: "textMessage",
              text: "Sonic, can you come over and lend me a hand?",
              who: "tails",
            },
            { type: "stand", who: "tails", direction: "up" },
          ],
        },
      ],
      [utils.asGridCoord(5, 14)]: [
        {
          bypass: ["CHAO_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "CHAO_SCENE" },

            { type: "walk", who: "amy", direction: "up" },
            { type: "walk", who: "amy", direction: "left" },
            { type: "walk", who: "amy", direction: "up" },
            { type: "walk", who: "amy", direction: "up" },
            { type: "walk", who: "amy", direction: "left" },
            { type: "walk", who: "amy", direction: "left" },
            { type: "stand", who: "amy", direction: "up" },

            {
              type: "textMessage",
              text: "SONICCCCCCCCCCCCC",
              who: "amy",
            },
            {
              type: "textMessage",
              text: "Thank goodness you're here! I can't get any of the chao to grow and I don't know what to do.",
              who: "amy",
            },

            { type: "walk", who: "bunnie", direction: "up" },
            { type: "walk", who: "bunnie", direction: "left" },
            { type: "walk", who: "bunnie", direction: "up" },
            { type: "walk", who: "bunnie", direction: "up" },
            { type: "walk", who: "bunnie", direction: "up" },
            { type: "walk", who: "bunnie", direction: "up" },
            { type: "walk", who: "bunnie", direction: "right" },
            { type: "stand", who: "amy", direction: "left" },

            {
              type: "textMessage",
              text: "Welcome back Sugarh! I was tellin Amy not to worry her pretty head about it.",
              who: "bunnie",
            },
            {
              type: "textMessage",
              text: "Sonic has our back and the chao love him! He'll help us I'm sure of it. ",
              who: "bunnie",
            },
            { type: "stand", who: "amy", direction: "up" },

            {
              type: "textMessage",
              text: "Alight then, I'm counting on you Sonic!",
              who: "amy",
            },

            { type: "walk", who: "amy", direction: "right" },
            { type: "walk", who: "amy", direction: "right" },
            { type: "walk", who: "amy", direction: "down" },
            { type: "walk", who: "amy", direction: "right" },
            { type: "walk", who: "amy", direction: "down" },
            { type: "walk", who: "amy", direction: "down" },

            {
              type: "textMessage",
              text: "You'll be fine, go talk to Amy when you're ready.",
              who: "Bunnie",
            },

            { type: "walk", who: "bunnie", direction: "left" },
            { type: "walk", who: "bunnie", direction: "down" },
            { type: "walk", who: "bunnie", direction: "down" },
            { type: "walk", who: "bunnie", direction: "down" },
            { type: "walk", who: "bunnie", direction: "down" },
            { type: "walk", who: "bunnie", direction: "right" },
            { type: "walk", who: "bunnie", direction: "down" },
            { type: "stand", who: "bunnie", direction: "right" },
          ],
        },
      ],
      [utils.asGridCoord(54, 4)]: [
        {
          bypass: ["TROUBLE_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "TROUBLE_SCENE" },

            { type: "stand", who: "nicole", direction: "down" },

            {
              type: "textMessage",
              text: "What could be wrong with them? They were working fine until the other day.",
              who: "sally",
            },

            { type: "walk", who: "sally", direction: "down" },
            { type: "walk", who: "sally", direction: "down" },

            {
              type: "textMessage",
              text: "So far Tails and Chuck haven't had any luck figuring it out either.",
              who: "sally",
            },
            {
              type: "textMessage",
              text: "I'm not sure what to do Nicole.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "We'll figure out a way Sally. There is nothing we can't accomplish together!",
              who: "nicole",
            },

            { type: "walk", who: "sally", direction: "up" },
            { type: "walk", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "You're right. I'm sure we'll figure out a way forward. I'm just worried about everyone. I'll try to relax more.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "right" },
          ],
        },
      ],
      [utils.asGridCoord(54, 5)]: [
        {
          bypass: ["TROUBLE_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "TROUBLE_SCENE" },

            { type: "stand", who: "nicole", direction: "down" },

            {
              type: "textMessage",
              text: "What could be wrong with them? They were working fine until the other day.",
              who: "sally",
            },

            { type: "walk", who: "sally", direction: "down" },
            { type: "walk", who: "sally", direction: "down" },

            {
              type: "textMessage",
              text: "So far Tails and Chuck haven't had any luck figuring it out either.",
              who: "sally",
            },
            {
              type: "textMessage",
              text: "I'm not sure what to do Nicole.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "We'll figure out a way Sally. There is nothing we can't accomplish together!",
              who: "nicole",
            },

            { type: "walk", who: "sally", direction: "up" },
            { type: "walk", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "You're right. I'm sure we'll figure out a way forward. I'm just worried about everyone. I'll try to relax more.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "right" },
          ],
        },
      ],
      [utils.asGridCoord(54, 6)]: [
        {
          bypass: ["TROUBLE_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "TROUBLE_SCENE" },

            { type: "stand", who: "nicole", direction: "down" },

            {
              type: "textMessage",
              text: "What could be wrong with them? They were working fine until the other day.",
              who: "sally",
            },

            { type: "walk", who: "sally", direction: "down" },
            { type: "walk", who: "sally", direction: "down" },

            {
              type: "textMessage",
              text: "So far Tails and Chuck haven't had any luck figuring it out either.",
              who: "sally",
            },
            {
              type: "textMessage",
              text: "I'm not sure what to do Nicole.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "We'll figure out a way Sally. There is nothing we can't accomplish together!",
              who: "nicole",
            },

            { type: "walk", who: "sally", direction: "up" },
            { type: "walk", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "You're right. I'm sure we'll figure out a way forward. I'm just worried about everyone. I'll try to relax more.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "right" },
          ],
        },
      ],
      [utils.asGridCoord(54, 7)]: [
        {
          bypass: ["TROUBLE_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "TROUBLE_SCENE" },

            { type: "stand", who: "nicole", direction: "down" },

            {
              type: "textMessage",
              text: "What could be wrong with them? They were working fine until the other day.",
              who: "sally",
            },

            { type: "walk", who: "sally", direction: "down" },
            { type: "walk", who: "sally", direction: "down" },

            {
              type: "textMessage",
              text: "So far Tails and Chuck haven't had any luck figuring it out either.",
              who: "sally",
            },
            {
              type: "textMessage",
              text: "I'm not sure what to do Nicole.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "We'll figure out a way Sally. There is nothing we can't accomplish together!",
              who: "nicole",
            },

            { type: "walk", who: "sally", direction: "up" },
            { type: "walk", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "You're right. I'm sure we'll figure out a way forward. I'm just worried about everyone. I'll try to relax more.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "right" },
          ],
        },
      ],
      [utils.asGridCoord(54, 8)]: [
        {
          bypass: ["TROUBLE_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "TROUBLE_SCENE" },

            { type: "stand", who: "nicole", direction: "down" },

            {
              type: "textMessage",
              text: "What could be wrong with them? They were working fine until the other day.",
              who: "sally",
            },

            { type: "walk", who: "sally", direction: "down" },
            { type: "walk", who: "sally", direction: "down" },

            {
              type: "textMessage",
              text: "So far Tails and Chuck haven't had any luck figuring it out either.",
              who: "sally",
            },
            {
              type: "textMessage",
              text: "I'm not sure what to do Nicole.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "We'll figure out a way Sally. There is nothing we can't accomplish together!",
              who: "nicole",
            },

            { type: "walk", who: "sally", direction: "up" },
            { type: "walk", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "You're right. I'm sure we'll figure out a way forward. I'm just worried about everyone. I'll try to relax more.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "right" },
          ],
        },
      ],
      [utils.asGridCoord(54, 9)]: [
        {
          bypass: ["TROUBLE_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "TROUBLE_SCENE" },

            { type: "stand", who: "nicole", direction: "down" },

            {
              type: "textMessage",
              text: "What could be wrong with them? They were working fine until the other day.",
              who: "sally",
            },

            { type: "walk", who: "sally", direction: "down" },
            { type: "walk", who: "sally", direction: "down" },

            {
              type: "textMessage",
              text: "So far Tails and Chuck haven't had any luck figuring it out either.",
              who: "sally",
            },
            {
              type: "textMessage",
              text: "I'm not sure what to do Nicole.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "We'll figure out a way Sally. There is nothing we can't accomplish together!",
              who: "nicole",
            },

            { type: "walk", who: "sally", direction: "up" },
            { type: "walk", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "You're right. I'm sure we'll figure out a way forward. I'm just worried about everyone. I'll try to relax more.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "right" },
          ],
        },
      ],
      [utils.asGridCoord(54, 10)]: [
        {
          bypass: ["TROUBLE_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "TROUBLE_SCENE" },

            { type: "stand", who: "nicole", direction: "down" },

            {
              type: "textMessage",
              text: "What could be wrong with them? They were working fine until the other day.",
              who: "sally",
            },

            { type: "walk", who: "sally", direction: "down" },
            { type: "walk", who: "sally", direction: "down" },

            {
              type: "textMessage",
              text: "So far Tails and Chuck haven't had any luck figuring it out either.",
              who: "sally",
            },
            {
              type: "textMessage",
              text: "I'm not sure what to do Nicole.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "We'll figure out a way Sally. There is nothing we can't accomplish together!",
              who: "nicole",
            },

            { type: "walk", who: "sally", direction: "up" },
            { type: "walk", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "You're right. I'm sure we'll figure out a way forward. I'm just worried about everyone. I'll try to relax more.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "right" },
          ],
        },
      ],
      [utils.asGridCoord(54, 11)]: [
        {
          bypass: ["TROUBLE_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "TROUBLE_SCENE" },

            { type: "stand", who: "nicole", direction: "down" },

            {
              type: "textMessage",
              text: "What could be wrong with them? They were working fine until the other day.",
              who: "sally",
            },

            { type: "walk", who: "sally", direction: "down" },
            { type: "walk", who: "sally", direction: "down" },

            {
              type: "textMessage",
              text: "So far Tails and Chuck haven't had any luck figuring it out either.",
              who: "sally",
            },
            {
              type: "textMessage",
              text: "I'm not sure what to do Nicole.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "We'll figure out a way Sally. There is nothing we can't accomplish together!",
              who: "nicole",
            },

            { type: "walk", who: "sally", direction: "up" },
            { type: "walk", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "You're right. I'm sure we'll figure out a way forward. I'm just worried about everyone. I'll try to relax more.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "right" },
          ],
        },
      ],
      [utils.asGridCoord(54, 12)]: [
        {
          bypass: ["TROUBLE_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "TROUBLE_SCENE" },

            { type: "stand", who: "nicole", direction: "down" },

            {
              type: "textMessage",
              text: "What could be wrong with them? They were working fine until the other day.",
              who: "sally",
            },

            { type: "walk", who: "sally", direction: "down" },
            { type: "walk", who: "sally", direction: "down" },

            {
              type: "textMessage",
              text: "So far Tails and Chuck haven't had any luck figuring it out either.",
              who: "sally",
            },
            {
              type: "textMessage",
              text: "I'm not sure what to do Nicole.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "We'll figure out a way Sally. There is nothing we can't accomplish together!",
              who: "nicole",
            },

            { type: "walk", who: "sally", direction: "up" },
            { type: "walk", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "You're right. I'm sure we'll figure out a way forward. I'm just worried about everyone. I'll try to relax more.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "right" },
          ],
        },
      ],
      [utils.asGridCoord(55, 12)]: [
        {
          bypass: ["TROUBLE_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "TROUBLE_SCENE" },

            { type: "stand", who: "nicole", direction: "down" },

            {
              type: "textMessage",
              text: "What could be wrong with them? They were working fine until the other day.",
              who: "sally",
            },

            { type: "walk", who: "sally", direction: "down" },
            { type: "walk", who: "sally", direction: "down" },

            {
              type: "textMessage",
              text: "So far Tails and Chuck haven't had any luck figuring it out either.",
              who: "sally",
            },
            {
              type: "textMessage",
              text: "I'm not sure what to do Nicole.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "We'll figure out a way Sally. There is nothing we can't accomplish together!",
              who: "nicole",
            },

            { type: "walk", who: "sally", direction: "up" },
            { type: "walk", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "You're right. I'm sure we'll figure out a way forward. I'm just worried about everyone. I'll try to relax more.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "right" },
          ],
        },
      ],
      [utils.asGridCoord(56, 12)]: [
        {
          bypass: ["TROUBLE_SCENE"],
          events: [
            { type: "addStoryFlag", flag: "TROUBLE_SCENE" },

            { type: "stand", who: "nicole", direction: "down" },

            {
              type: "textMessage",
              text: "What could be wrong with them? They were working fine until the other day.",
              who: "sally",
            },

            { type: "walk", who: "sally", direction: "down" },
            { type: "walk", who: "sally", direction: "down" },

            {
              type: "textMessage",
              text: "So far Tails and Chuck haven't had any luck figuring it out either.",
              who: "sally",
            },
            {
              type: "textMessage",
              text: "I'm not sure what to do Nicole.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "We'll figure out a way Sally. There is nothing we can't accomplish together!",
              who: "nicole",
            },

            { type: "walk", who: "sally", direction: "up" },
            { type: "walk", who: "sally", direction: "up" },

            {
              type: "textMessage",
              text: "You're right. I'm sure we'll figure out a way forward. I'm just worried about everyone. I'll try to relax more.",
              who: "sally",
            },

            { type: "stand", who: "sally", direction: "right" },
          ],
        },
      ],
      // [utils.asGridCoord(0, 6)]: [
      //   {
      //     events: [
      //       {
      //         type: "changeMap",
      //         map: "xxx",
      //         x: utils.withGrid(0),
      //         y: utils.withGrid(0),
      //         direction: "left",
      //       },
      //     ],
      //   },
      // ],
      // [utils.asGridCoord(62, 6)]: [
      //   {
      //     events: [
      //       {
      //         type: "changeMap",
      //         map: "Home",
      //         x: utils.withGrid(0),
      //         y: utils.withGrid(0),
      //         direction: "right",
      //       },
      //     ],
      //   },
      // ],
      // [utils.asGridCoord(62, 7)]: [
      //   {
      //     events: [
      //       {
      //         type: "changeMap",
      //         map: "Home",
      //         x: utils.withGrid(0),
      //         y: utils.withGrid(0),
      //         direction: "right",
      //       },
      //     ],
      //   },
      // ],
      // [utils.asGridCoord(62, 8)]: [
      //   {
      //     events: [
      //       {
      //         type: "changeMap",
      //         map: "Home",
      //         x: utils.withGrid(0),
      //         y: utils.withGrid(0),
      //         direction: "right",
      //       },
      //     ],
      //   },
      // ],
    },
    walls: {
      // Top Left
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(1, 5)]: true,
      [utils.asGridCoord(1, 4)]: true,
      [utils.asGridCoord(1, 3)]: true,
      [utils.asGridCoord(2, 2)]: true,
      [utils.asGridCoord(3, 3)]: true,
      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(5, 2)]: true,
      [utils.asGridCoord(6, 3)]: true,
      [utils.asGridCoord(7, 4)]: true,
      [utils.asGridCoord(8, 4)]: true,
      [utils.asGridCoord(9, 4)]: true,
      [utils.asGridCoord(10, 4)]: true,
      [utils.asGridCoord(11, 4)]: true,
      [utils.asGridCoord(12, 4)]: true,
      [utils.asGridCoord(13, 4)]: true,
      [utils.asGridCoord(14, 4)]: true,
      [utils.asGridCoord(15, 4)]: true,
      [utils.asGridCoord(16, 4)]: true,
      [utils.asGridCoord(17, 4)]: true,
      [utils.asGridCoord(18, 3)]: true,
      [utils.asGridCoord(19, 2)]: true,
      [utils.asGridCoord(20, 2)]: true,
      [utils.asGridCoord(21, 3)]: true,
      [utils.asGridCoord(22, 3)]: true,
      [utils.asGridCoord(23, 2)]: true,
      [utils.asGridCoord(24, 2)]: true,
      [utils.asGridCoord(25, 3)]: true,
      [utils.asGridCoord(25, 4)]: true,
      [utils.asGridCoord(26, 4)]: true,
      [utils.asGridCoord(27, 4)]: true,
      [utils.asGridCoord(28, 5)]: true,
      [utils.asGridCoord(28, 4)]: true,
      [utils.asGridCoord(28, 3)]: true,
      [utils.asGridCoord(28, 2)]: true,
      [utils.asGridCoord(28, 1)]: true,
      [utils.asGridCoord(28, 0)]: true,

      // Top Right
      [utils.asGridCoord(34, 0)]: true,
      [utils.asGridCoord(34, 1)]: true,
      [utils.asGridCoord(34, 2)]: true,
      [utils.asGridCoord(34, 3)]: true,
      [utils.asGridCoord(34, 4)]: true,
      [utils.asGridCoord(35, 4)]: true,
      [utils.asGridCoord(36, 4)]: true,
      [utils.asGridCoord(37, 4)]: true,
      [utils.asGridCoord(37, 3)]: true,
      [utils.asGridCoord(38, 2)]: true,
      [utils.asGridCoord(39, 2)]: true,
      [utils.asGridCoord(40, 3)]: true,
      [utils.asGridCoord(41, 3)]: true,
      [utils.asGridCoord(42, 2)]: true,
      [utils.asGridCoord(43, 3)]: true,
      [utils.asGridCoord(44, 3)]: true,
      [utils.asGridCoord(45, 2)]: true,
      [utils.asGridCoord(46, 2)]: true,
      [utils.asGridCoord(47, 2)]: true,
      [utils.asGridCoord(48, 3)]: true,
      [utils.asGridCoord(49, 3)]: true,
      [utils.asGridCoord(50, 3)]: true,
      [utils.asGridCoord(51, 2)]: true,
      [utils.asGridCoord(52, 2)]: true,
      [utils.asGridCoord(53, 2)]: true,
      [utils.asGridCoord(54, 3)]: true,
      [utils.asGridCoord(55, 3)]: true,
      [utils.asGridCoord(56, 2)]: true,
      [utils.asGridCoord(57, 3)]: true,
      [utils.asGridCoord(58, 3)]: true,
      [utils.asGridCoord(59, 2)]: true,
      [utils.asGridCoord(60, 2)]: true,
      [utils.asGridCoord(61, 3)]: true,
      [utils.asGridCoord(62, 4)]: true,
      [utils.asGridCoord(61, 5)]: true,
      [utils.asGridCoord(62, 5)]: true,

      // Left trees
      [utils.asGridCoord(0, 7)]: true,
      [utils.asGridCoord(1, 7)]: true,
      [utils.asGridCoord(2, 7)]: true,
      [utils.asGridCoord(2, 8)]: true,
      [utils.asGridCoord(2, 9)]: true,
      [utils.asGridCoord(2, 10)]: true,
      [utils.asGridCoord(2, 11)]: true,
      [utils.asGridCoord(3, 11)]: true,
      [utils.asGridCoord(4, 11)]: true,
      [utils.asGridCoord(4, 12)]: true,
      [utils.asGridCoord(4, 13)]: true,
      [utils.asGridCoord(3, 13)]: true,
      [utils.asGridCoord(2, 13)]: true,
      [utils.asGridCoord(2, 14)]: true,
      [utils.asGridCoord(2, 15)]: true,
      [utils.asGridCoord(2, 16)]: true,
      [utils.asGridCoord(2, 17)]: true,
      [utils.asGridCoord(2, 18)]: true,
      [utils.asGridCoord(2, 19)]: true,
      [utils.asGridCoord(2, 20)]: true,
      [utils.asGridCoord(2, 21)]: true,
      [utils.asGridCoord(2, 22)]: true,
      [utils.asGridCoord(2, 23)]: true,
      [utils.asGridCoord(3, 24)]: true,
      [utils.asGridCoord(4, 24)]: true,
      [utils.asGridCoord(5, 24)]: true,
      [utils.asGridCoord(6, 24)]: true,
      [utils.asGridCoord(7, 24)]: true,
      [utils.asGridCoord(8, 25)]: true,
      [utils.asGridCoord(9, 24)]: true,
      [utils.asGridCoord(10, 23)]: true,
      [utils.asGridCoord(11, 22)]: true,
      [utils.asGridCoord(11, 21)]: true,
      [utils.asGridCoord(11, 20)]: true,
      [utils.asGridCoord(11, 19)]: true,
      [utils.asGridCoord(11, 18)]: true,
      [utils.asGridCoord(11, 17)]: true,
      [utils.asGridCoord(11, 16)]: true,
      [utils.asGridCoord(10, 15)]: true,
      [utils.asGridCoord(10, 14)]: true,
      [utils.asGridCoord(9, 13)]: true,
      [utils.asGridCoord(8, 13)]: true,
      [utils.asGridCoord(7, 13)]: true,
      [utils.asGridCoord(6, 13)]: true,
      [utils.asGridCoord(6, 12)]: true,
      [utils.asGridCoord(6, 11)]: true,
      [utils.asGridCoord(7, 11)]: true,
      [utils.asGridCoord(8, 11)]: true,
      [utils.asGridCoord(9, 10)]: true,
      [utils.asGridCoord(9, 9)]: true,
      [utils.asGridCoord(9, 8)]: true,
      [utils.asGridCoord(10, 8)]: true,
      [utils.asGridCoord(11, 8)]: true,
      [utils.asGridCoord(12, 8)]: true,
      [utils.asGridCoord(13, 8)]: true,
      [utils.asGridCoord(14, 8)]: true,
      [utils.asGridCoord(15, 8)]: true,
      [utils.asGridCoord(16, 8)]: true,
      [utils.asGridCoord(17, 8)]: true,
      [utils.asGridCoord(18, 8)]: true,
      [utils.asGridCoord(19, 8)]: true,
      [utils.asGridCoord(19, 9)]: true,
      [utils.asGridCoord(19, 10)]: true,
      [utils.asGridCoord(18, 10)]: true,
      [utils.asGridCoord(17, 10)]: true,
      [utils.asGridCoord(16, 10)]: true,
      [utils.asGridCoord(15, 10)]: true,
      [utils.asGridCoord(14, 11)]: true,
      [utils.asGridCoord(14, 12)]: true,
      [utils.asGridCoord(14, 13)]: true,
      [utils.asGridCoord(15, 14)]: true,
      [utils.asGridCoord(16, 14)]: true,
      [utils.asGridCoord(17, 14)]: true,
      [utils.asGridCoord(18, 14)]: true,
      [utils.asGridCoord(19, 14)]: true,
      [utils.asGridCoord(20, 14)]: true,
      [utils.asGridCoord(21, 14)]: true,
      [utils.asGridCoord(22, 13)]: true,
      [utils.asGridCoord(22, 12)]: true,
      [utils.asGridCoord(22, 11)]: true,
      [utils.asGridCoord(21, 10)]: true,
      [utils.asGridCoord(21, 9)]: true,
      [utils.asGridCoord(21, 8)]: true,
      [utils.asGridCoord(22, 8)]: true,
      [utils.asGridCoord(23, 8)]: true,
      [utils.asGridCoord(24, 8)]: true,
      [utils.asGridCoord(25, 8)]: true,
      [utils.asGridCoord(26, 8)]: true,
      [utils.asGridCoord(26, 9)]: true,

      // Tree overhang
      [utils.asGridCoord(26, 10)]: true,
      [utils.asGridCoord(27, 11)]: true,

      [utils.asGridCoord(28, 11)]: true,
      [utils.asGridCoord(28, 12)]: true,
      [utils.asGridCoord(28, 13)]: true,
      [utils.asGridCoord(28, 14)]: true,
      [utils.asGridCoord(28, 15)]: true,
      [utils.asGridCoord(28, 16)]: true,
      [utils.asGridCoord(27, 17)]: true,
      [utils.asGridCoord(26, 18)]: true,
      [utils.asGridCoord(26, 19)]: true,
      [utils.asGridCoord(25, 20)]: true,
      [utils.asGridCoord(25, 21)]: true,
      [utils.asGridCoord(25, 22)]: true,
      [utils.asGridCoord(24, 23)]: true,
      [utils.asGridCoord(23, 24)]: true,
      [utils.asGridCoord(22, 25)]: true,
      [utils.asGridCoord(21, 26)]: true,
      [utils.asGridCoord(22, 27)]: true,
      [utils.asGridCoord(22, 28)]: true,
      [utils.asGridCoord(23, 29)]: true,
      [utils.asGridCoord(24, 30)]: true,

      [utils.asGridCoord(24, 25)]: true,
      [utils.asGridCoord(25, 26)]: true,
      [utils.asGridCoord(24, 27)]: true,

      // Start of tree below extra grass
      [utils.asGridCoord(25, 32)]: true,
      [utils.asGridCoord(26, 32)]: true,
      [utils.asGridCoord(24, 31)]: true,
      [utils.asGridCoord(27, 32)]: true,
      [utils.asGridCoord(27, 33)]: true,

      // Tree
      [utils.asGridCoord(27, 34)]: true,

      [utils.asGridCoord(28, 35)]: true,
      [utils.asGridCoord(28, 36)]: true,
      [utils.asGridCoord(28, 37)]: true,
      [utils.asGridCoord(27, 37)]: true,
      [utils.asGridCoord(26, 37)]: true,
      [utils.asGridCoord(25, 37)]: true,
      [utils.asGridCoord(24, 36)]: true,
      [utils.asGridCoord(23, 36)]: true,
      [utils.asGridCoord(22, 36)]: true,
      [utils.asGridCoord(21, 35)]: true,
      [utils.asGridCoord(20, 34)]: true,
      [utils.asGridCoord(19, 34)]: true,
      [utils.asGridCoord(18, 34)]: true,
      [utils.asGridCoord(18, 33)]: true,
      [utils.asGridCoord(18, 32)]: true,
      [utils.asGridCoord(18, 31)]: true,
      [utils.asGridCoord(18, 30)]: true,
      [utils.asGridCoord(18, 29)]: true,
      [utils.asGridCoord(17, 28)]: true,
      [utils.asGridCoord(16, 28)]: true,
      [utils.asGridCoord(15, 28)]: true,
      [utils.asGridCoord(14, 29)]: true,
      [utils.asGridCoord(15, 30)]: true,
      [utils.asGridCoord(16, 30)]: true,
      [utils.asGridCoord(16, 31)]: true,
      [utils.asGridCoord(16, 32)]: true,
      [utils.asGridCoord(16, 33)]: true,
      [utils.asGridCoord(16, 34)]: true,
      [utils.asGridCoord(16, 35)]: true,
      [utils.asGridCoord(16, 36)]: true,

      [utils.asGridCoord(17, 36)]: true,

      // Top of Bridge
      [utils.asGridCoord(15, 36)]: true,
      [utils.asGridCoord(14, 36)]: true,
      [utils.asGridCoord(13, 36)]: true,
      [utils.asGridCoord(12, 36)]: true,
      [utils.asGridCoord(11, 36)]: true,
      [utils.asGridCoord(10, 36)]: true,
      [utils.asGridCoord(9, 36)]: true,
      [utils.asGridCoord(8, 36)]: true,

      [utils.asGridCoord(7, 36)]: true,

      [utils.asGridCoord(8, 35)]: true,
      [utils.asGridCoord(7, 34)]: true,
      [utils.asGridCoord(6, 34)]: true,
      [utils.asGridCoord(5, 34)]: true,
      [utils.asGridCoord(4, 34)]: true,
      [utils.asGridCoord(3, 34)]: true,
      [utils.asGridCoord(3, 33)]: true,
      [utils.asGridCoord(3, 32)]: true,
      [utils.asGridCoord(3, 31)]: true,
      [utils.asGridCoord(4, 31)]: true,
      [utils.asGridCoord(5, 31)]: true,
      [utils.asGridCoord(6, 31)]: true,
      [utils.asGridCoord(7, 31)]: true,
      [utils.asGridCoord(8, 30)]: true,
      [utils.asGridCoord(8, 29)]: true,
      [utils.asGridCoord(7, 28)]: true,
      [utils.asGridCoord(6, 28)]: true,
      [utils.asGridCoord(5, 28)]: true,
      [utils.asGridCoord(4, 28)]: true,
      [utils.asGridCoord(3, 28)]: true,
      [utils.asGridCoord(2, 28)]: true,
      [utils.asGridCoord(1, 29)]: true,
      [utils.asGridCoord(1, 30)]: true,
      [utils.asGridCoord(1, 31)]: true,
      [utils.asGridCoord(1, 32)]: true,
      [utils.asGridCoord(1, 33)]: true,
      [utils.asGridCoord(1, 34)]: true,
      [utils.asGridCoord(1, 35)]: true,
      [utils.asGridCoord(1, 36)]: true,
      [utils.asGridCoord(1, 37)]: true,
      [utils.asGridCoord(1, 38)]: true,
      [utils.asGridCoord(1, 39)]: true,
      [utils.asGridCoord(2, 40)]: true,
      [utils.asGridCoord(3, 40)]: true,
      [utils.asGridCoord(4, 40)]: true,
      [utils.asGridCoord(5, 40)]: true,
      [utils.asGridCoord(6, 40)]: true,
      [utils.asGridCoord(7, 40)]: true,
      [utils.asGridCoord(8, 40)]: true,
      [utils.asGridCoord(9, 40)]: true,
      [utils.asGridCoord(10, 40)]: true,
      [utils.asGridCoord(11, 40)]: true,
      [utils.asGridCoord(12, 40)]: true,
      [utils.asGridCoord(13, 40)]: true,
      [utils.asGridCoord(14, 40)]: true,
      [utils.asGridCoord(15, 40)]: true,
      [utils.asGridCoord(16, 40)]: true,
      [utils.asGridCoord(17, 40)]: true,
      [utils.asGridCoord(18, 40)]: true,
      [utils.asGridCoord(19, 40)]: true,
      [utils.asGridCoord(20, 40)]: true,
      [utils.asGridCoord(21, 40)]: true,
      [utils.asGridCoord(22, 40)]: true,
      [utils.asGridCoord(23, 40)]: true,
      [utils.asGridCoord(24, 40)]: true,
      [utils.asGridCoord(25, 39)]: true,
      [utils.asGridCoord(26, 40)]: true,
      [utils.asGridCoord(27, 40)]: true,
      [utils.asGridCoord(28, 40)]: true,
      [utils.asGridCoord(29, 40)]: true,
      [utils.asGridCoord(30, 40)]: true,
      [utils.asGridCoord(31, 40)]: true,
      [utils.asGridCoord(32, 40)]: true,
      [utils.asGridCoord(33, 40)]: true,
      [utils.asGridCoord(34, 40)]: true,
      [utils.asGridCoord(35, 40)]: true,
      [utils.asGridCoord(36, 40)]: true,
      [utils.asGridCoord(37, 40)]: true,
      [utils.asGridCoord(38, 39)]: true,
      [utils.asGridCoord(39, 40)]: true,
      [utils.asGridCoord(40, 40)]: true,
      [utils.asGridCoord(41, 39)]: true,
      [utils.asGridCoord(41, 38)]: true,
      [utils.asGridCoord(42, 38)]: true,

      // Beg of trees
      // [utils.asGridCoord(43, 37)]: true,
      [utils.asGridCoord(44, 38)]: true,
      [utils.asGridCoord(45, 38)]: true,
      [utils.asGridCoord(46, 38)]: true,
      [utils.asGridCoord(47, 38)]: true,
      [utils.asGridCoord(48, 38)]: true,
      [utils.asGridCoord(49, 38)]: true,
      [utils.asGridCoord(50, 38)]: true,
      [utils.asGridCoord(51, 38)]: true,
      // [utils.asGridCoord(52, 37)]: true,

      [utils.asGridCoord(52, 38)]: true,
      [utils.asGridCoord(52, 39)]: true,
      [utils.asGridCoord(53, 40)]: true,
      [utils.asGridCoord(54, 40)]: true,
      [utils.asGridCoord(55, 40)]: true,
      [utils.asGridCoord(56, 39)]: true,
      [utils.asGridCoord(57, 38)]: true,
      [utils.asGridCoord(58, 38)]: true,
      [utils.asGridCoord(59, 37)]: true,
      [utils.asGridCoord(60, 36)]: true,
      [utils.asGridCoord(60, 35)]: true,
      [utils.asGridCoord(60, 34)]: true,
      [utils.asGridCoord(59, 34)]: true,
      [utils.asGridCoord(58, 34)]: true,
      [utils.asGridCoord(57, 34)]: true,
      [utils.asGridCoord(56, 34)]: true,
      [utils.asGridCoord(56, 33)]: true,
      [utils.asGridCoord(56, 32)]: true,

      // Tree
      // [utils.asGridCoord(56, 31)]: true,
      [utils.asGridCoord(57, 32)]: true,
      [utils.asGridCoord(58, 32)]: true,
      // [utils.asGridCoord(59, 31)]: true,

      [utils.asGridCoord(59, 32)]: true,
      [utils.asGridCoord(59, 33)]: true,

      // After tree
      [utils.asGridCoord(61, 33)]: true,
      [utils.asGridCoord(61, 32)]: true,
      [utils.asGridCoord(61, 31)]: true,
      [utils.asGridCoord(62, 30)]: true,
      [utils.asGridCoord(62, 29)]: true,
      [utils.asGridCoord(61, 28)]: true,
      [utils.asGridCoord(61, 27)]: true,
      [utils.asGridCoord(61, 26)]: true,
      [utils.asGridCoord(61, 25)]: true,
      [utils.asGridCoord(61, 24)]: true,
      [utils.asGridCoord(60, 23)]: true,
      [utils.asGridCoord(59, 23)]: true,
      [utils.asGridCoord(58, 23)]: true,
      [utils.asGridCoord(57, 23)]: true,
      [utils.asGridCoord(57, 22)]: true,
      [utils.asGridCoord(57, 21)]: true,
      [utils.asGridCoord(57, 20)]: true,
      [utils.asGridCoord(57, 19)]: true,
      [utils.asGridCoord(57, 18)]: true,
      [utils.asGridCoord(57, 17)]: true,
      [utils.asGridCoord(57, 16)]: true,
      [utils.asGridCoord(57, 15)]: true,
      [utils.asGridCoord(57, 14)]: true,
      [utils.asGridCoord(57, 13)]: true,

      // Tree
      [utils.asGridCoord(58, 13)]: true,
      [utils.asGridCoord(59, 13)]: true,
      [utils.asGridCoord(60, 13)]: true,
      [utils.asGridCoord(61, 13)]: true,
      [utils.asGridCoord(62, 12)]: true,
      [utils.asGridCoord(61, 11)]: true,
      [utils.asGridCoord(60, 11)]: true,

      [utils.asGridCoord(59, 11)]: true,
      [utils.asGridCoord(60, 10)]: true,
      [utils.asGridCoord(61, 9)]: true,
      [utils.asGridCoord(62, 9)]: true,

      // Sonics house
      [utils.asGridCoord(42, 28)]: true,
      [utils.asGridCoord(42, 29)]: true,
      [utils.asGridCoord(42, 30)]: true,
      [utils.asGridCoord(42, 31)]: true,
      [utils.asGridCoord(43, 31)]: true,
      [utils.asGridCoord(44, 32)]: true,
      [utils.asGridCoord(44, 33)]: true,
      [utils.asGridCoord(44, 34)]: true,
      [utils.asGridCoord(45, 34)]: true,
      [utils.asGridCoord(46, 34)]: true,
      [utils.asGridCoord(47, 34)]: true,
      [utils.asGridCoord(48, 34)]: true,
      [utils.asGridCoord(49, 34)]: true,
      [utils.asGridCoord(50, 34)]: true,
      [utils.asGridCoord(50, 33)]: true,
      [utils.asGridCoord(50, 32)]: true,
      [utils.asGridCoord(51, 31)]: true,
      [utils.asGridCoord(51, 30)]: true,
      [utils.asGridCoord(51, 29)]: true,

      // Tree
      [utils.asGridCoord(50, 29)]: true,
      [utils.asGridCoord(49, 28)]: true,

      [utils.asGridCoord(49, 27)]: true,
      [utils.asGridCoord(50, 26)]: true,
      [utils.asGridCoord(49, 25)]: true,
      [utils.asGridCoord(49, 24)]: true,
      [utils.asGridCoord(50, 23)]: true,
      [utils.asGridCoord(49, 22)]: true,
      [utils.asGridCoord(48, 21)]: true,
      [utils.asGridCoord(47, 20)]: true,
      [utils.asGridCoord(46, 20)]: true,
      [utils.asGridCoord(45, 20)]: true,
      [utils.asGridCoord(44, 20)]: true,
      [utils.asGridCoord(43, 20)]: true,
      [utils.asGridCoord(42, 19)]: true,
      [utils.asGridCoord(42, 18)]: true,
      [utils.asGridCoord(42, 17)]: true,
      [utils.asGridCoord(43, 16)]: true,
      [utils.asGridCoord(44, 16)]: true,
      [utils.asGridCoord(45, 15)]: true,
      [utils.asGridCoord(46, 16)]: true,
      [utils.asGridCoord(47, 15)]: true,
      [utils.asGridCoord(48, 15)]: true,
      [utils.asGridCoord(49, 16)]: true,

      [utils.asGridCoord(50, 16)]: true,
      [utils.asGridCoord(49, 15)]: true,
      [utils.asGridCoord(50, 14)]: true,

      [utils.asGridCoord(51, 14)]: true,
      [utils.asGridCoord(52, 13)]: true,
      [utils.asGridCoord(52, 12)]: true,

      // Top right
      [utils.asGridCoord(52, 11)]: true,

      // Tree cover starts
      // [utils.asGridCoord(52, 10)]: true,
      [utils.asGridCoord(51, 11)]: true,
      [utils.asGridCoord(50, 11)]: true,
      [utils.asGridCoord(49, 11)]: true,
      [utils.asGridCoord(48, 11)]: true,
      [utils.asGridCoord(47, 11)]: true,
      [utils.asGridCoord(46, 11)]: true,
      [utils.asGridCoord(45, 11)]: true,

      [utils.asGridCoord(44, 9)]: true,
      [utils.asGridCoord(44, 11)]: true,

      [utils.asGridCoord(43, 11)]: true,

      [utils.asGridCoord(42, 9)]: true,
      [utils.asGridCoord(42, 11)]: true,

      [utils.asGridCoord(41, 9)]: true,
      [utils.asGridCoord(41, 11)]: true,

      [utils.asGridCoord(40, 11)]: true,
      [utils.asGridCoord(39, 10)]: true,
      [utils.asGridCoord(40, 9)]: true,

      // Top of tree
      [utils.asGridCoord(40, 8)]: true,
      // [utils.asGridCoord(39, 7)]: true,
      [utils.asGridCoord(38, 8)]: true,
      [utils.asGridCoord(37, 8)]: true,
      // [utils.asGridCoord(36, 7)]: true,
      [utils.asGridCoord(36, 8)]: true,
      [utils.asGridCoord(36, 9)]: true,

      [utils.asGridCoord(36, 10)]: true,
      [utils.asGridCoord(35, 11)]: true,

      [utils.asGridCoord(34, 11)]: true,
      [utils.asGridCoord(34, 12)]: true,
      [utils.asGridCoord(34, 13)]: true,
      [utils.asGridCoord(35, 14)]: true,
      [utils.asGridCoord(36, 14)]: true,
      [utils.asGridCoord(37, 15)]: true,
      [utils.asGridCoord(38, 16)]: true,
      [utils.asGridCoord(37, 17)]: true,
      [utils.asGridCoord(38, 18)]: true,
      [utils.asGridCoord(37, 19)]: true,
      [utils.asGridCoord(36, 20)]: true,
      [utils.asGridCoord(35, 20)]: true,
      [utils.asGridCoord(34, 20)]: true,
      [utils.asGridCoord(34, 21)]: true,
      [utils.asGridCoord(34, 22)]: true,
      [utils.asGridCoord(34, 23)]: true,
      [utils.asGridCoord(34, 24)]: true,
      [utils.asGridCoord(34, 25)]: true,
      [utils.asGridCoord(34, 26)]: true,
      [utils.asGridCoord(34, 27)]: true,
      [utils.asGridCoord(34, 28)]: true,
      [utils.asGridCoord(34, 29)]: true,
      [utils.asGridCoord(34, 30)]: true,
      [utils.asGridCoord(34, 31)]: true,
      [utils.asGridCoord(35, 31)]: true,
      [utils.asGridCoord(36, 31)]: true,
      [utils.asGridCoord(37, 31)]: true,
      [utils.asGridCoord(38, 31)]: true,
      [utils.asGridCoord(39, 31)]: true,
      [utils.asGridCoord(39, 30)]: true,
      [utils.asGridCoord(39, 29)]: true,

      [utils.asGridCoord(39, 28)]: true,
      [utils.asGridCoord(38, 30)]: true,
      [utils.asGridCoord(37, 30)]: true,
      [utils.asGridCoord(36, 30)]: true,
      [utils.asGridCoord(35, 30)]: true,
      [utils.asGridCoord(35, 25)]: true,

      [utils.asGridCoord(36, 25)]: true,
      [utils.asGridCoord(37, 25)]: true,
      [utils.asGridCoord(38, 24)]: true,
      [utils.asGridCoord(39, 24)]: true,
      [utils.asGridCoord(40, 23)]: true,
      [utils.asGridCoord(41, 23)]: true,
      [utils.asGridCoord(42, 24)]: true,
      [utils.asGridCoord(43, 24)]: true,
      [utils.asGridCoord(44, 24)]: true,
      [utils.asGridCoord(45, 24)]: true,
      [utils.asGridCoord(46, 25)]: true,
      [utils.asGridCoord(45, 26)]: true,
      [utils.asGridCoord(44, 26)]: true,
      [utils.asGridCoord(43, 26)]: true,
      [utils.asGridCoord(43, 27)]: true,
    },
  },
  Home: {
    id: "Home",
    lowerSrc: "assets/maps/homeLower.png",
    upperSrc: "assets/maps/homeUpper.png",
    backgroundMusic: "assets/audios/Knothole.mp3",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(9),
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(10, 6)]: [
        {
          bypass: ["BEAT_GAME"],
          events: [
            { type: "addStoryFlag", flag: "BEAT_GAME" },
            {
              type: "textMessage",
              text: "* You've had a long day helping your friends. Sweet dreams Sonic. *",
            },
          ],
        },
      ],
    },
    walls: {
      [utils.asGridCoord(0, 5)]: true,
    },
  },
};
