class HelpMenu {
  constructor({ who, onComplete, game }) {
    this.who = who;
    this.onComplete = onComplete;
    this.game = game;
    this.didWin = false;
  }

  getOptions(pageKey) {
    if (pageKey === "root") {
      return [
        {
          label: "Yes",
          description: `Help ${this.toTitleCase(
            this.who.id,
          )} and start a minigame.`,
          handler: () => {
            // document.querySelector(".overworld").hidden = true;
            document.activeElement.blur();
            let game = null;
            new Promise(async (resolve) => {
              switch (this.game) {
                case "memory":
                  game = new Memory({
                    onComplete: (didWin) => {
                      resolve();
                      this.close(didWin);
                    },
                  });
                  document.querySelector(".KeyboardMenu").remove();
                  game.init(document.querySelector(".game-container"));
                  break;

                case "tamagotchi":
                  // create tamagotchi object
                  game = new Tamagotchi({
                    hunger: 1,
                    sleepiness: 1,
                    boredom: 1,
                    age: 0,
                    onComplete: (didWin) => {
                      resolve();
                      this.close(didWin);
                    },
                  });
                  document.querySelector(".KeyboardMenu").remove();
                  game.init(document.querySelector(".game-container"));
                  break;

                case "treasure":
                  game = new Treasure({
                    onComplete: (didWin) => {
                      resolve();
                      this.close(didWin);
                    },
                  });
                  document.querySelector(".KeyboardMenu").remove();
                  game.init(document.querySelector(".game-container"));
                  break;

                case "runner":
                  game = new Runner({
                    onComplete: (didWin) => {
                      resolve();
                      this.close(didWin);
                    },
                  });
                  document.querySelector(".KeyboardMenu").remove();
                  game.init(document.querySelector(".game-container"));
                  break;
              }
            });
          },
        },
        {
          label: "No",
          description: "Come back when you are ready.",
          handler: () => {
            this.close(false);
          },
        },
      ];
    }
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  getInstructions() {
    const instructions = {
      memory: "Match all 6 pairs of cards to win.",
      tamagotchi: "Keep your chao alive to age 4 without any stat reaching 10.",
      treasure: "Navigate through 3 levels by entering doors to win.",
      runner: "Jump over trees and score 1000 points to win.",
    };
    return instructions[this.game] || "";
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("HelpMenu");
    this.element.classList.add("overlayMenu");
    document.querySelector(".game-canvas").classList.add("dullOut");
    if (document.querySelector(".escMenu")) {
      document.querySelector(".escMenu").hidden = true;
    }
    if (document.querySelector(".TextMessage")) {
      document.querySelector(".TextMessage").hidden = true;
    }
    this.element.innerHTML = `
      <h2>Will you help me?</h2>
      <h2 class="minigame-instructions">${this.getInstructions()}</h2>
    `;
  }

  close(didWin) {
    this.esc?.unbind();
    this.keyboardMenu.end();
    this.element.remove();
    document.querySelector(".game-canvas").classList.remove("dullOut");
    if (document.querySelector(".escMenu")) {
      document.querySelector(".escMenu").hidden = false;
    }
    if (document.querySelector(".TextMessage")) {
      document.querySelector(".TextMessage").hidden = false;
    }
    if (didWin) {
      window.playerState.addRing(this.game);
    }
    this.onComplete(didWin);
  }

  async init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container,
    });
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions("root"));

    container.appendChild(this.element);
  }
}
