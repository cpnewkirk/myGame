class RingCounter {
  constructor() {
    this.element = null;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("RingCounter");
    this.update();
  }

  update() {
    const { playerState } = window;
    const total = 4;
    const collected = playerState.rings;

    this.element.innerHTML = `
      <div class="ring-counter-inner">
        <span class="ring-icon">💍</span>
        <span class="ring-count">${collected}/${total}</span>
      </div>
    `;
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);

    document.addEventListener("RingsChanged", () => {
      this.update();
    });
  }
}
