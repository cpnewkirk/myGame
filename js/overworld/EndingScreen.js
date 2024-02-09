class EndingScreen {
  constructor({ progress }) {
    this.progress = progress;
  }

  getOptions(resolve) {
    return [
      {
        label: "Restart",
        description: "Start a new adventure.",
        handler: () => {
          location.reload();
        },
      },
      {
        label: "Exit",
        description: "Close this tab.",
        handler: () => {
          window.close();
        },
      },
    ].filter((v) => v);
  }

  createElement() {
    const finaleAudio = new Audio("assets/audios/PlayAgain.wav");
    finaleAudio.volume = 0.3;

    this.element = document.createElement("div");
    this.element.classList.add("EndingScreen");
    this.element.innerHTML = `
      <img class="EndingScreen_logo" src="assets/endingLogo.png" alt="Sonic relaxing on the beach" />
      <p class="ending-text">Thanks for playing my game!</p>
    `;

    finaleAudio.play();
  }

  close() {
    this.keyboardMenu.end();
    this.element.remove();
  }

  init(container) {
    return new Promise((resolve) => {
      this.createElement();
      container.insertBefore(
        this.element,
        document.querySelector(".EndSceneTransition")
      );
      this.keyboardMenu = new KeyboardMenu();
      this.keyboardMenu.init(this.element);
      this.keyboardMenu.setOptions(this.getOptions(resolve));
    });
  }
}
