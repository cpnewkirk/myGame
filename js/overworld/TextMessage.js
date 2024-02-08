class TextMessage {
  constructor({ text, who, onComplete }) {
    this.text = text;
    this.who = who || undefined;
    this.onComplete = onComplete;
    this.element = null;
  }

  createElement() {
    //Create the element
    this.element = document.createElement("div");
    this.element.classList.add("TextMessage");
    this.element.innerHTML = `
      <p class="TextMessage_p"></p>
      <button class="TextMessage_button">Next</button>
    `;

    if (this.who) {
      this.message = document.createElement("p");
      this.message.classList.add("TextMessage_speaker");
      this.message.innerText = `${this.who.toUpperCase()}`;
      this.element.prepend(this.message);
    }
    //Init the typewriter effect
    this.revealingText = new RevealingText({
      element: this.element.querySelector(".TextMessage_p"),
      text: this.text,
    });

    this.element.querySelector("button").addEventListener("click", () => {
      //Close the text message
      this.done();
    });

    this.actionListener = new KeyPressListener("Enter", () => {
      this.done();
    });
    this.actionListener = new KeyPressListener("Space", () => {
      this.done();
    });

    // document.addEventListener("touchstart", (e) => {
    //   this.done();
    // )};
  }

  done() {
    if (this.revealingText.isDone) {
      this.element.remove();
      this.actionListener.unbind();
      this.onComplete();
    } else {
      this.revealingText.warpToDone();
    }
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
    this.revealingText.init();
  }
}
