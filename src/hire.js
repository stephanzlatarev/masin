import Game from "./game.js";
import Fist from "./fist.js";

class Hire {

  start() {
    const workers = Game.units.filter(unit => ((unit.owner === 1) && (unit.radius < 1)));

    Fist.workers = [...workers].slice(0, 9);
  }

  sync() {
    // Watch for newly-trained units
  }

}

export default new Hire();
