window.PizzaTypes = {
  normal: "normal",
  spicy: "spicy",
  veggie: "veggie",
  fungi: "fungi",
  chill: "chill",
};

window.Pizzas = {
  s001: {
    name: "Slice Samurai",
    description: "Pizza desc here",
    type: PizzaTypes.spicy,
    src: "assets/characters/pizzas/s001.png",
    icon: "assets/icons/spicy.png",
    actions: ["saucyStatus", "clumsyStatus", "damage1"],
  },
  s002: {
    name: "Bacon Brigade",
    description: "A salty warrior who fears nothing",
    type: PizzaTypes.spicy,
    src: "assets/characters/pizzas/s002.png",
    icon: "assets/icons/spicy.png",
    actions: ["damage1", "saucyStatus", "clumsyStatus"],
  },
  v001: {
    name: "Call Me Kale",
    description: "Pizza desc here",
    type: PizzaTypes.veggie,
    src: "assets/characters/pizzas/v001.png",
    icon: "assets/icons/veggie.png",
    actions: ["damage1"],
  },
  v002: {
    name: "Archie Artichoke",
    description: "Pizza desc here",
    type: PizzaTypes.veggie,
    src: "assets/characters/pizzas/v001.png",
    icon: "assets/icons/veggie.png",
    actions: ["damage1"],
  },
  f001: {
    name: "Portobello Express",
    description: "Pizza desc here",
    type: PizzaTypes.fungi,
    src: "assets/characters/pizzas/f001.png",
    icon: "assets/icons/fungi.png",
    actions: ["damage1"],
  },
  f002: {
    name: "Say Shitake",
    description: "Pizza desc here",
    type: PizzaTypes.fungi,
    src: "assets/characters/pizzas/f001.png",
    icon: "assets/icons/fungi.png",
    actions: ["damage1"],
  },
};
