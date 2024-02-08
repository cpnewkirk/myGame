class HelpMenu {
  constructor({ who, onComplete }) {
    this.who = who;
    this.onComplete = onComplete;
  }

  getOptions(pageKey) {
    if (pageKey === "root") {
      return [
        {
          label: "Yes",
          description: `Help ${this.toTitleCase(
            this.who.id
          )} and start a minigame.`,
          handler: () => {
            document.querySelector(".overworld").hidden = true;

            document.querySelector(`.${this.who.id}-game`).style.visibility =
              "visible";
            this.close();
          },
        },
        {
          label: "No",
          description: "Come back when you are ready.",
          handler: () => {
            this.close();
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

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("PauseMenu");
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
    `;
  }

  close() {
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
    this.onComplete();
  }

  async init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container,
    });
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions("root"));

    container.appendChild(this.element);

    utils.wait(200);
    this.esc = new KeyPressListener("Escape", () => {
      this.close();
    });
  }
}
