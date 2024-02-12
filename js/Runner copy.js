class Runner {
  constructor({ onComplete }) {
    this.onComplete = onComplete;
    this.winner = false;

    this.gameover = false;
  }

  init(container) {
    const canvas = document.createElement("canvas");
    canvas.classList.add("runner");
    container.appendChild(canvas);

    this.startGame(container);
  }

  close(didWin, words) {
    const ending = document.createElement("div");
    ending.innerHTML = `
      <div class="runnerEnding">
      <div class="close">
        <button id="runnerClose">Close</button>
      </div>
      <div class="results">
        <h2 id="results">${words}</h2>
      </div>
    </div>
      `;
    container.appendChild(ending);

    document.querySelector("#runnerClose").addEventListener("click", (e) => {
      document.querySelector(".runner").remove();
      ending.remove();
      this.onComplete(didWin);
    });
  }

  startGame(container) {
    //board
    let board;
    // console.log(document.querySelector(".runner").offsetHeight);
    // console.log(document.querySelector(".runner").offsetWidth);
    let boardWidth = 750;
    let boardHeight = 250;
    let context;

    //sonic
    let sonicWidth = 46;
    let sonicHeight = 39;
    let sonicX = 50;
    let sonicY = boardHeight - sonicHeight;
    this.sonicImg;

    this.sonic = {
      x: sonicX,
      y: sonicY,
      width: sonicWidth,
      height: sonicHeight,
    };

    //tree
    this.treeArray = [];

    this.tree1Width = 71;
    this.tree2Width = 102;
    this.tree3Width = 102;

    this.treeHeight = 133;
    this.treeX = 700;
    this.treeY = boardHeight - this.treeHeight;

    this.tree1Img;
    this.tree2Img;
    this.tree3Img;

    //physics
    this.velocityX = -6; //tree moving left speed
    this.velocityY = 0;
    this.gravity = 0.2;

    this.score = 0;

    this.board = document.querySelector(".runner");
    this.board.height = boardHeight;
    this.board.width = boardWidth;

    this.context = this.board.getContext("2d"); //used for drawing on the board

    //draw initial sonicsaur
    // context.fillStyle="green";
    // context.fillRect(sonic.x, sonic.y, sonic.width, sonic.height);

    this.sonicImg = new Image();
    this.sonicImg.src = "./assets/runner/sonic.png";
    // console.log(this.sonicImg);
    // this.sonicImg.onload = function () {
    //   this.context.drawImage(
    //     this.sonicImg,
    //     this.sonic.x,
    //     this.sonic.y,
    //     this.sonic.width,
    //     this.sonic.height
    //   );
    // };

    this.context.drawImage(
      this.sonicImg,
      this.sonic.x,
      this.sonic.y,
      this.sonic.width,
      this.sonic.height
    );

    this.tree1Img = new Image();
    this.tree1Img.src = "./assets/runner/tree.png";

    this.tree2Img = new Image();
    this.tree2Img.src = "./assets/runner/tree2.png";

    this.tree3Img = new Image();
    this.tree3Img.src = "./assets/runner/tree3.png";

    requestAnimationFrame(this.update);
    setInterval(this.placeTree, 1000); //1000 milliseconds = 1 second
    document.addEventListener("keydown", function (e) {
      this.moveSonic(e);
    });
  }

  moveSonic(e) {
    // if (this.gameover) {
    //   return;
    // }

    if (
      (e.code == "Space" || e.code == "ArrowUp") &&
      this.sonic.y == this.sonicY
    ) {
      //jump
      this.velocityY = -10;
    } else if (e.code == "ArrowDown" && this.sonic.y == this.sonicY) {
      //duck
    }
  }

  placeTree() {
    // if (this.gameover) {
    //   return;
    // }

    //place tree
    let tree = {
      img: null,
      x: this.treeX,
      y: this.treeY,
      width: null,
      height: this.treeHeight,
    };

    let placeTreeChance = Math.random(); //0 - 0.9999...

    if (placeTreeChance > 0.9) {
      //10% you get tree3
      tree.img = this.tree3Img;
      tree.width = this.tree3Width;
      this.treeArray.push(tree);
    } else if (placeTreeChance > 0.7) {
      //30% you get tree2
      tree.img = this.tree2Img;
      tree.width = this.tree2Width;
      this.treeArray.push(tree);
    } else if (placeTreeChance > 0.5) {
      //50% you get tree1
      tree.img = this.tree1Img;
      tree.width = this.tree1Width;
      this.treeArray.push(tree);
    }

    if (this.treeArray.length > 5) {
      this.treeArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
    }
  }

  update() {
    // console.log(this.gameover);
    // if (this.gameover) {
    //   return;
    // }
    this.context.clearRect(0, 0, this.board.width, this.board.height);

    //sonic
    this.velocityY += this.gravity;
    this.sonic.y = Math.min(this.sonic.y + this.velocityY, this.sonicY); //apply this.gravity to current sonic.y, making sure it doesn't exceed the ground
    this.context.drawImage(
      this.sonicImg,
      this.sonic.x,
      this.sonic.y,
      this.sonic.width,
      this.sonic.height
    );

    //tree
    for (let i = 0; i < this.treeArray.length; i++) {
      let tree = this.treeArray[i];
      tree.x += this.velocityX;
      this.context.drawImage(tree.img, tree.x, tree.y, tree.width, tree.height);

      if (this.detectCollision(this.sonic, tree)) {
        this.gameover = true;
        this.sonicImg.src = "./assets/runner/sonic-lose.png";

        this.context.clearRect(
          this.sonic.x,
          this.sonic.y,
          this.sonic.width,
          this.sonic.height
        );

        this.sonicImg.onload = function () {
          this.context.drawImage(
            this.sonicImg,
            this.sonic.x,
            this.sonic.y,
            this.sonic.width,
            this.sonic.height
          );
        };

        if (this.score >= 1000) {
          this.close(true, "Congratualations, you got the score!");
        } else {
          this.close(false, "Better luck next time!");
        }
      }
    }

    //score
    this.context.fillStyle = "black";
    this.context.font = "20px courier";
    this.score++;
    this.context.fillText(this.score, 5, 20);

    requestAnimationFrame(this.update);
  }

  detectCollision(a, b) {
    return (
      a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
      a.x + a.width > b.x && //a's top right corner passes b's top left corner
      a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
      a.y + a.height > b.y //a's bottom left corner passes b's top left corner
    );
  }
}
