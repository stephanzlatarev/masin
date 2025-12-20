import Delay from "./delay.js";
import Game from "./game.js";

class Units {

  base = null;
  units = new Map();
  workers = new Map();
  enemies = new Map();

  async sync() {
    const units = new Map();
    const workers = new Map();
    const enemies = new Map();

    for (const unit of Game.units) {
      unit.realpos = { x: unit.pos.x, y: unit.pos.y };

      const previous = this.units.get(unit.tag);

      if (previous) {
        unit.lastrealpos = previous.realpos;
        unit.lastfacing = previous.facing;
      }

      Delay.syncUnit(unit);

      if (unit.owner === 1) {
        if (unit.radius < 0.5) {
          workers.set(unit.tag, unit);
        } else if (unit.radius >= 2.5) {
          this.base = unit;
        }
      } else if (unit.owner === 2) {
        enemies.set(unit.tag, unit);
      } else {
        continue;
      }

      units.set(unit.tag, unit);
    }

    this.units = units;
    this.workers = workers;
    this.enemies = enemies;
  }

  get(tag) {
    return this.units.get(tag);
  }

  find(pos) {
    for (const unit of Game.units) {
      if ((unit.pos.x === pos.x) && (unit.pos.y === pos.y)) return unit;
    }
  }

}

export default new Units();
