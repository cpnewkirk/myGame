(function () {

  const overworld = new Overworld({
    element: document.querySelector(".game-container")
  });
  overworld.init();

  const ringCounter = new RingCounter();
  ringCounter.init(document.querySelector(".game-container"));

})();