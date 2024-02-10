// create class for creating tamagotchi objects
class Tamagotchi {
  constructor({ hunger, sleepiness, boredom, age, onComplete }) {
    this.onComplete = onComplete;

    this.hunger = hunger;
    this.sleepiness = sleepiness;
    this.boredom = boredom;
    this.age = age;

    this.winner = false;
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
      <button id="restart">Restart</button>
      <button id="quit">Quit</button>
      </div>
      `;
  }

  //create function to call and start the game
  startGame() {
    //hide the restart button at start of game
    $("#restart").hide();
    $("#quit").hide();

    //set up click event listeners
    $("#sleep").on("click", this.bedtime(2000));

    $("#play").on("click", this.play());

    $("#feed").on("click", this.feed());

    $("#restart").on("click", this.restart());

    $("#quit").on("click", this.quit());

    this.grow();
  }

  // create functions to hatch the tamagotchi after x time then start all other incremental functions
  grow() {
    if (this.age < 1) {
      this.hatch();
    } else {
      $(".tamagotchi img").replaceWith(
        "<img src='../assets/tamagotchi/tamagotchi-bunny-2.png'>"
      );
      this.incrementAge();
      this.incrementHunger();
      this.incrementSleepiness();
      this.incrementBoredom();
    }
  }

  hatch() {
    let timeoutID = window.setTimeout(function () {
      this.age += 1;
      $("#age").replaceWith(`<p id='age'>Age: ${this.age}</p>`);
      this.grow();
    }, 15000);
  }

  //create functions to increment stats
  incrementHunger() {
    let timeoutID = window.setTimeout(function () {
      this.hunger += 1;
      $("#hunger").replaceWith(`<p id='hunger'>Hunger: ${this.hunger}</p>`);
      if (this.hunger < 10) {
        this.incrementHunger();
      } else {
        this.die();
      }
    }, 20000);
  }

  incrementSleepiness() {
    let timeoutID = window.setTimeout(function () {
      this.sleepiness += 1;
      $("#sleepiness").replaceWith(
        `<p id='sleepiness'>Sleepiness: ${this.sleepiness}</p>`
      );
      if (this.sleepiness < 10) {
        this.incrementSleepiness();
      } else {
        this.die();
      }
    }, 30000);
  }

  incrementBoredom() {
    let timeoutID = window.setTimeout(function () {
      this.boredom += 2;
      $("#boredom").replaceWith(`<p id='boredom'>Boredom: ${this.boredom}</p>`);
      if (this.boredom < 10) {
        this.incrementBoredom();
      } else {
        this.die();
      }
    }, 10000);
  }

  incrementAge() {
    let timeoutID = window.setTimeout(function () {
      this.age += 1;
      if (this.age === 4) {
        // End the minigame
        setTimeout(this.end(), 1000);
      }
      $("#age").replaceWith(`<p id='age'>Age: ${this.age}</p>`);
      if (this.age < 10) {
        this.incrementAge();
      }
    }, 100000);
  }

  //create functions to decrease stats
  feed() {
    if (this.hunger >= 2) {
      this.hunger -= 2;
      $("#hunger").replaceWith(`<p id='hunger'>Hunger: ${this.hunger}</p>`);
    } else {
      this.hunger = 0;
      $("#hunger").replaceWith(`<p id='hunger'>Hunger: ${this.hunger}</p>`);
    }
  }

  play() {
    if (this.boredom >= 3) {
      this.boredom -= 3;
      $("#boredom").replaceWith(`<p id='boredom'>Boredom: ${this.boredom}</p>`);
    } else {
      this.boredom = 0;
      $("#boredom").replaceWith(`<p id='boredom'>Boredom: ${this.boredom}</p>`);
    }
  }

  bedtime(time) {
    $(".home img").replaceWith(
      "<img src='../assets/tamagotchi/tamagotchi-home-night.png'>"
    );
    let timeoutID = window.setTimeout(function () {
      this.sleepiness = 0;
      $(".home img").replaceWith(
        "<img src='../assets/tamagotchi/tamagotchi-home.png'>"
      );
      $("#sleepiness").replaceWith(
        `<p id='sleepiness'>Sleepiness: ${this.sleepiness}</p>`
      );
    }, time);
  }

  // create functions for die and to restart game
  die() {
    alive = false;
    $(".tamagotchi img").replaceWith(
      "<img src='../assets/tamagotchi/tamagotchi-dead.png'>"
    );
    $("#sleep").hide();
    $("#play").hide();
    $("#feed").hide();
    $("#restart").show();
    $("#quit").show();
    $("#actions").after(
      "<h2>Your Chao died due to your negligence. Shame! Shame! Shame!</h2>"
    );
  }

  end() {
    this.winner = true;
    this.element.remove();
    this.onComplete(this.winner);
  }

  quit() {
    this.winner = false;
    this.element.remove();
    this.onComplete(this.winner);
  }

  restart() {
    let alive = true;
    $("#restart").hide();
    $("#quit").hide();
    $(".tamagotchi img").replaceWith(
      "<img src='../assets/tamagotchi/tamagotchi-egg.png'>"
    );
    this.sleepiness = 0;
    $("#sleepiness").replaceWith(
      `<p id='sleepiness'>Sleepiness: ${this.sleepiness}</p>`
    );
    $("#sleep").show();
    this.boredom = 0;
    $("#boredom").replaceWith(`<p id='boredom'>Boredom: ${this.boredom}</p>`);
    $("#play").show();
    this.hunger = 0;
    $("#hunger").replaceWith(`<p id='hunger'>Hunger: ${this.hunger}</p>`);
    $("#feed").show();
    this.age = 0;
    $("#age").replaceWith(`<p id='age'>Age: ${this.age}</p>`);
    this.startGame();
  }

  init(container) {
    this.createElement();
    console.log(container);
    console.log(this.element);
    container.appendChild(this.element);
    this.startGame();
  }
}
