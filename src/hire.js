import Defense from "./defense.js";
import Game from "./game.js";
import Fist from "./fist.js";

class Hire {

  start() {
    const workers = Game.units.filter(unit => ((unit.owner === 1) && (unit.unitType === 45)));

    Fist.workers = [...workers].slice(0, 9);
    Defense.workers = [...workers].slice(9);
  }

  sync() {
    // Watch for newly-trained units
  }

}

export default new Hire();
