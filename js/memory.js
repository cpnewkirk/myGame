class Memory {
  constructor({ onComplete }) {
    this.onComplete = onComplete;
    this.winner = false;

    this.cards = null;
    this.hasFlippedCard = false;
    this.lockBoard = false;
    this.firstCard = null;
    this.secondCard = null;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("memory");
    this.element.innerHTML = `
      <div class="memory-card" data-framework="amy">
      <img class="front-face" src="./assets/memory/amy.svg" alt="amy" />
      <img class="back-face" src="./assets/memory/back.png" alt="Sonic the Hedgehog" />
      </div>
      <div class="memory-card" data-framework="amy">
        <img class="front-face" src="./assets/memory/amy.svg" alt="amy" />
        <img class="back-face" src="./assets/memory/back.png" alt="Sonic the Hedgehog" />
      </div>

      <div class="memory-card" data-framework="shadow">
        <img class="front-face" src="./assets/memory/shadow.svg" alt="shadow" />
        <img class="back-face" src="./assets/memory/back.png" alt="Sonic the Hedgehog" />
      </div>
      <div class="memory-card" data-framework="shadow">
        <img class="front-face" src="./assets/memory/shadow.svg" alt="shadow" />
        <img class="back-face" src="./assets/memory/back.png" alt="Sonic the Hedgehog" />
      </div>

      <div class="memory-card" data-framework="knuckles">
        <img class="front-face" src="./assets/memory/knuckles.svg" alt="knuckles" />
        <img class="back-face" src="./assets/memory/back.png" alt="Sonic the Hedgehog" />
      </div>
      <div class="memory-card" data-framework="knuckles">
        <img class="front-face" src="./assets/memory/knuckles.svg" alt="knuckles" />
        <img class="back-face" src="./assets/memory/back.png" alt="Sonic the Hedgehog" />
      </div>

      <div class="memory-card" data-framework="tails">
        <img class="front-face" src="./assets/memory/tails.svg" alt="tails" />
        <img class="back-face" src="./assets/memory/back.png" alt="Sonic the Hedgehog" />
      </div>
      <div class="memory-card" data-framework="tails">
        <img class="front-face" src="./assets/memory/tails.svg" alt="tails" />
        <img class="back-face" src="./assets/memory/back.png" alt="Sonic the Hedgehog" />
      </div>

      <div class="memory-card" data-framework="sonic">
        <img class="front-face" src="./assets/memory/sonic.svg" alt="sonic" />
        <img class="back-face" src="./assets/memory/back.png" alt="Sonic the Hedgehog" />
      </div>
      <div class="memory-card" data-framework="sonic">
        <img class="front-face" src="./assets/memory/sonic.svg" alt="sonic" />
        <img class="back-face" src="./assets/memory/back.png" alt="Sonic the Hedgehog" />
      </div>

      <div class="memory-card" data-framework="super-sonic">
        <img class="front-face" src="./assets/memory/super-sonic.svg" alt="super-sonic" />
        <img class="back-face" src="./assets/memory/back.png" alt="Sonic the Hedgehog" />
      </div>
      <div class="memory-card" data-framework="super-sonic">
        <img class="front-face" src="./assets/memory/super-sonic.svg" alt="super-sonic" />
        <img class="back-face" src="./assets/memory/back.png" alt="Sonic the Hedgehog" />
      </div>
      `;
  }

  flipCard(card) {
    if (this.lockBoard) return;
    if (card === this.firstCard) return;

    card.classList.add("flip");

    if (!this.hasFlippedCard) {
      // first click
      this.hasFlippedCard = true;
      this.firstCard = card;

      return;
    }

    // second click
    this.secondCard = card;

    this.checkForMatch();

    if (document.getElementsByClassName("flip").length === 12) {
      this.winner = true;
      this.element.remove();
      this.onComplete(this.winner);
    }
  }

  checkForMatch() {
    let isMatch =
      this.firstCard.dataset.framework === this.secondCard.dataset.framework;

    isMatch ? this.disableCards() : this.unflipCards();
  }

  disableCards() {
    this.firstCard.removeEventListener("click", (e) => {
      this.flipCard();
    });
    this.secondCard.removeEventListener("click", (e) => {
      this.flipCard();
    });

    this.resetBoard();
  }

  unflipCards() {
    this.lockBoard = true;

    setTimeout(() => {
      this.firstCard.classList.remove("flip");
      this.secondCard.classList.remove("flip");

      this.resetBoard();
    }, 1500);
  }

  resetBoard() {
    [this.hasFlippedCard, this.lockBoard] = [false, false];
    [this.firstCard, this.secondCard] = [null, null];
  }

  shuffle() {
    this.cards.forEach((card) => {
      let randomPos = Math.floor(Math.random() * 12);
      card.style.order = randomPos;
    });
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
    this.cards = document.querySelectorAll(".memory-card");
    this.shuffle();
    this.cards.forEach((card) =>
      card.addEventListener("click", (e) => {
        this.flipCard(card);
      })
    );
  }
}
