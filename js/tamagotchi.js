// create class for creating tamagotchi objects
class Tamagotchi {
  constructor(hunger, sleepiness, boredom, age) {
    this.hunger = hunger;
    this.sleepiness = sleepiness;
    this.boredom = boredom;
    this.age = age;
  }
}

// create tamagotchi object
let myTamagotchi = new Tamagotchi(1, 1, 1, 0);

//hide the restart button at start of game
$("#restart").hide();

//create function to call and start the game
function startGame() {
  grow();
}

// create functions to hatch the tamagotchi after x time then start all other incremental functions
function grow() {
  if (myTamagotchi.age < 1) {
    hatch();
  } else {
    $(".tamagotchi img").replaceWith(
      "<img src='../assets/tamagotchi/tamagotchi-bunny-2.png'>"
    );
    incrementAge();
    incrementHunger();
    incrementSleepiness();
    incrementBoredom();
  }
}
function hatch() {
  let timeoutID = window.setTimeout(function () {
    myTamagotchi.age += 1;
    $("#age").replaceWith(`<p id='age'>Age: ${myTamagotchi.age}</p>`);
    grow();
  }, 15000);
}
//create functions to increment stats

function incrementHunger() {
  let timeoutID = window.setTimeout(function () {
    myTamagotchi.hunger += 1;
    $("#hunger").replaceWith(
      `<p id='hunger'>Hunger: ${myTamagotchi.hunger}</p>`
    );
    if (myTamagotchi.hunger < 10) {
      incrementHunger();
    } else {
      die();
    }
  }, 20000);
}

function incrementSleepiness() {
  let timeoutID = window.setTimeout(function () {
    myTamagotchi.sleepiness += 1;
    $("#sleepiness").replaceWith(
      `<p id='sleepiness'>Sleepiness: ${myTamagotchi.sleepiness}</p>`
    );
    if (myTamagotchi.sleepiness < 10) {
      incrementSleepiness();
    } else {
      die();
    }
  }, 30000);
}

function incrementBoredom() {
  let timeoutID = window.setTimeout(function () {
    myTamagotchi.boredom += 2;
    $("#boredom").replaceWith(
      `<p id='boredom'>Boredom: ${myTamagotchi.boredom}</p>`
    );
    if (myTamagotchi.boredom < 10) {
      incrementBoredom();
    } else {
      die();
    }
  }, 10000);
}

function incrementAge() {
  let timeoutID = window.setTimeout(function () {
    myTamagotchi.age += 1;
    if (myTamagotchi.age === 4) {
      // End the minigame
      setTimeout(end, 1000);
    }
    $("#age").replaceWith(`<p id='age'>Age: ${myTamagotchi.age}</p>`);
    if (myTamagotchi.age < 10) {
      incrementAge();
    }
  }, 100000);
}

//create functions to decrease stats
function feed() {
  if (myTamagotchi.hunger >= 2) {
    myTamagotchi.hunger -= 2;
    $("#hunger").replaceWith(
      `<p id='hunger'>Hunger: ${myTamagotchi.hunger}</p>`
    );
  } else {
    myTamagotchi.hunger = 0;
    $("#hunger").replaceWith(
      `<p id='hunger'>Hunger: ${myTamagotchi.hunger}</p>`
    );
  }
}

function play() {
  if (myTamagotchi.boredom >= 3) {
    myTamagotchi.boredom -= 3;
    $("#boredom").replaceWith(
      `<p id='boredom'>Boredom: ${myTamagotchi.boredom}</p>`
    );
  } else {
    myTamagotchi.boredom = 0;
    $("#boredom").replaceWith(
      `<p id='boredom'>Boredom: ${myTamagotchi.boredom}</p>`
    );
  }
}

function bedtime(time) {
  $(".home img").replaceWith(
    "<img src='../assets/tamagotchi/tamagotchi-home-night.png'>"
  );
  let timeoutID = window.setTimeout(function () {
    myTamagotchi.sleepiness = 0;
    $(".home img").replaceWith(
      "<img src='../assets/tamagotchi/tamagotchi-home.png'>"
    );
    $("#sleepiness").replaceWith(
      `<p id='sleepiness'>Sleepiness: ${myTamagotchi.sleepiness}</p>`
    );
  }, time);
}

// create functions for die and to restart game
function die() {
  alive = false;
  $(".tamagotchi img").replaceWith(
    "<img src='../assets/tamagotchi/tamagotchi-dead.png'>"
  );
  $("#sleep").hide();
  $("#play").hide();
  $("#feed").hide();
  // $("#restart").show();
  $("#actions").after(
    "<h2>Your tomodatchi died due to your negligence. Shame! Shame! Shame!</h2>"
  );
  setTimeout(end, 1000);
}

function end() {
  document.querySelector(`.overworld`).style.visibility = "visible";
  document.querySelector(`.overworld`).style.display = "block";
  document.querySelector(`.amy-game`).style.visibility = "hidden";
}

function restart() {
  let alive = true;
  $("#restart").hide();
  $(".tamagotchi img").replaceWith(
    "<img src='../assets/tamagotchi/tamagotchi-egg.png'>"
  );
  myTamagotchi.sleepiness = 0;
  $("#sleepiness").replaceWith(
    `<p id='sleepiness'>Sleepiness: ${myTamagotchi.sleepiness}</p>`
  );
  $("#sleep").show();
  myTamagotchi.boredom = 0;
  $("#boredom").replaceWith(
    `<p id='boredom'>Boredom: ${myTamagotchi.boredom}</p>`
  );
  $("#play").show();
  myTamagotchi.hunger = 0;
  $("#hunger").replaceWith(`<p id='hunger'>Hunger: ${myTamagotchi.hunger}</p>`);
  $("#feed").show();
  myTamagotchi.age = 0;
  $("#age").replaceWith(`<p id='age'>Age: ${myTamagotchi.age}</p>`);
  startGame();
}

//set up click event listeners
$("#sleep").click(function () {
  bedtime(2000);
});

$("#play").click(function () {
  play();
});

$("#feed").click(function () {
  feed();
});

$("#restart").click(function () {
  restart();
});

$("#start").click(function () {
  $("#start").hide();
  startGame();
});

if (myTamagotchi.sleep > 10) {
  die();
}
