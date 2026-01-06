import Game from "./game.js";
import Units from "./units.js";

class Jobs {

  fist = [];
  miners = [];

  start() {
    const workers = Game.units.filter(unit => (unit.unitType === 45));

    this.fist = [...workers].slice(0, 9);
    this.miners = [...workers].slice(9);
  }

  sync() {
    this.fist = syncUnits(this.fist);
    this.miners = syncUnits(this.miners);
  }

}

function syncUnits(list) {
  const units = new Set();

  for (const one of list) {
    const unit = Units.get(one.tag);

    if (unit) {
      units.add(unit);
    }
  }

  return [...units];
}

export default new Jobs();
