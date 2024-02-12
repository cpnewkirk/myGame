// create class for creating tamagotchi objects
class Tamagotchi {
  constructor({ hunger, sleepiness, boredom, age, onComplete }) {
    this.onComplete = onComplete;

    this.hunger = hunger;
    this.sleepiness = sleepiness;
    this.boredom = boredom;
    this.age = age;

    this.winner = false;
    this.timeouts = [];
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("tamagotchi-game");
    this.element.innerHTML = `
      <div class="home">
        <img src="./assets/tamagotchi/tamagotchi-home.png"/>
      </div>
      <div class="stats">
       <p id="hunger">Hunger: 1</p>
        <p id="sleepiness">Sleepiness: 1</p>
        <p id="boredom">Boredom: 1</p>
        <p id="age">Age: 0</p>
      </div>
      <div class="tamagotchi">
        <img src="./assets/tamagotchi/tamagotchi-egg.png"/>
      </div>
      <div class="actions">
        <button id="feed">Feed</button>
        <button id="sleep">Bedtime</button>
        <button id="play">Play</button>
      </div>
      <div class="actions">
        <button id="restart">Restart</button>
        <button id="quit">Quit</button>
      </div>
      <div class="close">
        <button id="close">Close</button>
      </div>
      <div class="results">
        <h2 id="winner">Congratualations, you raised a chao!</h2>
        <h2 id="loser">Better luck next time.</h2>
      </div>
      `;
  }

  //create function to call and start the game
  startGame() {
    this.grow();
  }

  // create functions to hatch the tamagotchi after x time then start all other incremental functions
  grow() {
    if (this.age < 1) {
      this.hatch();
    } else {
      $(".tamagotchi img").replaceWith(
        "<img src='../assets/tamagotchi/tamagotchi-chao-2.png'>"
      );
      this.incrementAge();
      this.incrementHunger();
      this.incrementSleepiness();
      this.incrementBoredom();
    }
  }

  hatch() {
    let self = this;
    let timeoutID = window.setTimeout(function () {
      self.age += 1;
      $("#age").replaceWith(`<p id='age'>Age: ${self.age}</p>`);
      self.grow();
    }, 5000);
    this.timeouts.push(timeoutID);
  }

  //create functions to increment stats
  incrementHunger() {
    let self = this;

    let timeoutID = window.setTimeout(function () {
      self.hunger += 1;
      $("#hunger").replaceWith(`<p id='hunger'>Hunger: ${self.hunger}</p>`);

      if (self.hunger < 10) {
        self.incrementHunger();
      } else {
        self.end();
      }
    }, 2000);
    this.timeouts.push(timeoutID);
  }

  incrementSleepiness() {
    let self = this;

    let timeoutID = window.setTimeout(function () {
      self.sleepiness += 1;
      $("#sleepiness").replaceWith(
        `<p id='sleepiness'>Sleepiness: ${self.sleepiness}</p>`
      );
      if (self.sleepiness < 10) {
        self.incrementSleepiness();
      } else {
        self.end();
      }
    }, 4000);
    this.timeouts.push(timeoutID);
  }

  incrementBoredom() {
    let self = this;

    let timeoutID = window.setTimeout(function () {
      self.boredom += 2;
      $("#boredom").replaceWith(`<p id='boredom'>Boredom: ${self.boredom}</p>`);

      if (self.boredom < 10) {
        self.incrementBoredom();
      } else {
        self.end();
      }
    }, 3000);
    this.timeouts.push(timeoutID);
  }

  incrementAge() {
    let self = this;
    let timeoutID = window.setTimeout(function () {
      self.age += 1;
      $("#age").replaceWith(`<p id='age'>Age: ${self.age}</p>`);

      if (self.age < 4) {
        self.incrementAge();
      } else {
        // End the minigame
        self.timeouts.forEach((element) => clearTimeout(element));

        $(".home img").replaceWith(
          "<img src='../assets/tamagotchi/tamagotchi-home.png'>"
        );

        $(".stats").hide();
        $(".actions").hide();
        $("#winner").show();
        $("#close").show();

        $("#close").on("click", function () {
          self.close(true);
        });
      }
    }, 15000);
    this.timeouts.push(timeoutID);
  }

  //create functions to decrease stats
  feed() {
    let self = this;

    if (self.hunger >= 2) {
      self.hunger -= 2;
      $("#hunger").replaceWith(`<p id='hunger'>Hunger: ${self.hunger}</p>`);
    } else {
      self.hunger = 0;
      $("#hunger").replaceWith(`<p id='hunger'>Hunger: ${self.hunger}</p>`);
    }
  }

  play() {
    let self = this;

    if (self.boredom >= 3) {
      self.boredom -= 3;
      $("#boredom").replaceWith(`<p id='boredom'>Boredom: ${self.boredom}</p>`);
    } else {
      self.boredom = 0;
      $("#boredom").replaceWith(`<p id='boredom'>Boredom: ${self.boredom}</p>`);
    }
  }

  bedtime(time) {
    let self = this;

    $(".home img").replaceWith(
      "<img src='../assets/tamagotchi/tamagotchi-home-night.png'>"
    );
    let timeoutID = window.setTimeout(function () {
      self.sleepiness = 0;
      $(".home img").replaceWith(
        "<img src='../assets/tamagotchi/tamagotchi-home.png'>"
      );
      $("#sleepiness").replaceWith(
        `<p id='sleepiness'>Sleepiness: ${self.sleepiness}</p>`
      );
    }, time);
    this.timeouts.push(timeoutID);
  }

  // create functions for losing and to restart game
  end() {
    this.timeouts.forEach((element) => clearTimeout(element));

    $(".tamagotchi img").replaceWith(
      "<img src='../assets/tamagotchi/tamagotchi-end.png'>"
    );
    $("#sleep").hide();
    $("#play").hide();
    $("#feed").hide();
    $("#restart").show();
    $("#quit").show();
    $("#loser").show();
  }

  close(didWin) {
    this.winner = didWin;
    this.element.remove();
    this.onComplete(this.winner);
  }

  restart() {
    let self = this;
    $("#loser").hide();
    $("#restart").hide();
    $("#quit").hide();
    $(".tamagotchi img").replaceWith(
      "<img src='../assets/tamagotchi/tamagotchi-egg.png'>"
    );
    self.sleepiness = 1;
    $("#sleepiness").replaceWith(
      `<p id='sleepiness'>Sleepiness: ${self.sleepiness}</p>`
    );
    $("#sleep").show();
    self.boredom = 1;
    $("#boredom").replaceWith(`<p id='boredom'>Boredom: ${self.boredom}</p>`);
    $("#play").show();
    self.hunger = 1;
    $("#hunger").replaceWith(`<p id='hunger'>Hunger: ${self.hunger}</p>`);
    $("#feed").show();
    self.age = 0;
    $("#age").replaceWith(`<p id='age'>Age: ${self.age}</p>`);
    self.startGame();
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);

    let self = this;

    //hide the restart button at start of game
    $("#winner").hide();
    $("#loser").hide();

    $("#restart").hide();
    $("#quit").hide();
    $("#close").hide();

    //set up click event listeners
    $("#sleep").on("click", function () {
      self.bedtime(2000);
    });

    $("#play").on("click", function () {
      self.play();
    });

    $("#feed").on("click", function () {
      self.feed();
    });

    $("#restart").on("click", function () {
      self.restart();
    });

    $("#quit").on("click", function () {
      self.close(false);
    });

    this.startGame();
  }
}
