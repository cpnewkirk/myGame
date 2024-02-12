class Runner {
  constructor({ onComplete }) {
    this.onComplete = onComplete;
    this.winner = false;
    this.context = null;
    this.treeArray = [];
    this.gameOver = false;
    this.score = 0;
    this.velocityX = -6;
    this.velocityY = 0;
    this.gravity = 0.2;
    this.sonic = {
      width: 46,
      height: 39,
      x: 50,
      y: null,
      img: null,
    };
    this.treeWidths = [71, 102, 102];
    this.treeHeight = 133 / 1.5;
    this.treeX = 700;
    this.treeY = null;
    this.sonicImg = null;
    this.tree1Img = null;
    this.tree2Img = null;
    this.tree3Img = null;

    this.init = this.init.bind(this);
    this.startGame = this.startGame.bind(this);
    this.update = this.update.bind(this);
    this.moveSonic = this.moveSonic.bind(this);
    this.placeTree = this.placeTree.bind(this);
    this.detectCollision = this.detectCollision.bind(this);
    this.displayEnding = this.displayEnding.bind(this);
  }

  init(container) {
    const canvas = document.createElement("canvas");
    canvas.classList.add("runner");
    container.appendChild(canvas);
    this.container = container;
    this.startGame(container);
  }

  startGame() {
    this.boardWidth = 750;
    this.boardHeight = 250;

    this.sonic.y = this.boardHeight - this.sonic.height;
    this.treeY = this.boardHeight - this.treeHeight;

    this.board = document.querySelector(".runner");
    this.board.height = this.boardHeight;
    this.board.width = this.boardWidth;
    this.context = this.board.getContext("2d");

    this.sonicImg = this.loadImage("./assets/runner/sonic.png", () => {
      this.context.drawImage(
        this.sonicImg,
        this.sonic.x,
        this.sonic.y,
        this.sonic.width,
        this.sonic.height
      );
    });

    this.tree1Img = this.loadImage("./assets/runner/tree.png");
    this.tree2Img = this.loadImage("./assets/runner/tree2.png");
    this.tree3Img = this.loadImage("./assets/runner/tree3.png");

    requestAnimationFrame(this.update);
    setInterval(this.placeTree, 1000);
    document.addEventListener("keydown", this.moveSonic);
  }

  loadImage(src, onload) {
    const img = new Image();
    img.src = src;
    if (onload) img.onload = onload;
    return img;
  }

  update() {
    requestAnimationFrame(this.update);
    if (this.gameOver) return;
    this.context.clearRect(0, 0, this.board.width, this.board.height);

    this.velocityY += this.gravity;
    this.sonic.y = Math.min(
      this.sonic.y + this.velocityY,
      this.board.height - this.sonic.height
    );
    this.context.drawImage(
      this.sonicImg,
      this.sonic.x,
      this.sonic.y,
      this.sonic.width,
      this.sonic.height
    );

    this.treeArray.forEach((tree) => {
      tree.x += this.velocityX;
      this.context.drawImage(tree.img, tree.x, tree.y, tree.width, tree.height);

      if (this.detectCollision(this.sonic, tree)) {
        this.gameOver = true;
        this.sonicImg.src = "./assets/runner/sonic-lose.png";
        this.context.clearRect(
          this.sonic.x,
          this.sonic.y,
          this.sonic.width,
          this.sonic.height
        );
        this.context.drawImage(
          this.sonicImg,
          this.sonic.x,
          this.sonic.y,
          this.sonic.width,
          this.sonic.height
        );

        const message =
          this.score >= 1000
            ? "Congratualations, you got the score!"
            : "Better luck next time!";
        this.displayEnding(message);
      }
    });

    this.context.fillStyle = "black";
    this.context.font = "20px courier";
    this.score++;
    this.context.fillText(this.score, 5, 20);
  }

  moveSonic(e) {
    if (this.gameOver) return;
    if (
      (e.code == "Space" || e.code == "ArrowUp") &&
      this.sonic.y == this.boardHeight - this.sonic.height
    ) {
      this.velocityY = -10;
    }
  }

  placeTree() {
    if (this.gameOver) return;
    const placeTreeChance = Math.random();

    let tree = {
      img: null,
      x: this.treeX,
      y: this.treeY,
      width: null,
      height: this.treeHeight,
    };

    if (placeTreeChance > 0.9) {
      tree.img = this.tree3Img;
      tree.width = this.treeWidths[2];
      this.treeArray.push(tree);
    } else if (placeTreeChance > 0.7) {
      tree.img = this.tree2Img;
      tree.width = this.treeWidths[1];
      this.treeArray.push(tree);
    } else if (placeTreeChance > 0.5) {
      tree.img = this.tree1Img;
      tree.width = this.treeWidths[0];
      this.treeArray.push(tree);
    }

    if (this.treeArray.length > 5) {
      this.treeArray.shift();
    }
  }

  detectCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  displayEnding(message) {
    const ending = document.createElement("div");
    ending.innerHTML = `
        <div class="runnerEnding">
          <div class="close">
            <button id="runnerClose">Close</button>
          </div>
          <div class="results">
            <h2 id="results">${message}</h2>
          </div>
        </div>`;

    this.container.appendChild(ending);

    document.querySelector("#runnerClose").addEventListener("click", () => {
      document.querySelector(".runner").remove();
      ending.remove();
      this.onComplete(this.score >= 1000);
    });
  }
}
