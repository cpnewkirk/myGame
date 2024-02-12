class TitleScreen {
  constructor({ progress }) {
    this.progress = progress;

    this.voice = new Audio();
    this.voice.src = "assets/audios/GetGoing.wav";
  }

  getOptions(resolve) {
    const safeFile = this.progress.getSaveFile();
    return [
      {
        label: "New Game",
        description: "Start a new adventure.",
        handler: () => {
          this.voice.src = "assets/audios/GetGoing.wav";
          this.voice.volume = 0.3;
          this.voice.play();

          this.close();
          resolve();
        },
      },
      safeFile
        ? {
            label: "Continue Game",
            description: "Resume your adventure",
            disabled: true,
            handler: () => {
              this.close();
              resolve(safeFile);
            },
          }
        : null,
    ].filter((v) => v);
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("TitleScreen");
    this.element.innerHTML = `
      <img class="TitleScreen_logo" src="assets/logo.png" alt="Sonic Adventure" />
    `;
  }

  close() {
    this.keyboardMenu.end();
    this.element.remove();
  }

  init(container) {
    return new Promise((resolve) => {
      this.createElement();
      container.appendChild(this.element);
      this.keyboardMenu = new KeyboardMenu();
      this.keyboardMenu.init(this.element);
      this.keyboardMenu.setOptions(this.getOptions(resolve));
    });
  }
}
