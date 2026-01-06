import Delay from "./delay.js";
import Game from "./game.js";

const IS_WORKER = { 45: true, 84: true, 104: true };
const IS_DEPOT = { 18: true, 59: true, 86: true };

const HAS_WEAPONS = {
  ...IS_WORKER,
  73: true,  // Zealot
  105: true, // Zergling
  289: true, // Broodling
};

class Units {

  base = null;
  units = new Map();
  workers = new Map();
  enemies = new Map();
  minerals = new Map();

  async sync() {
    const units = new Map();
    const workers = new Map();
    const enemies = new Map();
    const minerals = new Map();

    for (const unit of Game.units) {
      unit.realpos = { x: unit.pos.x, y: unit.pos.y, z: unit.pos.z };

      if (IS_WORKER[unit.unitType]) {
        unit.isWorker = true;
      } else if (unit.unitType === 105) {
        unit.isZergling = true;
      } else if ((unit.owner === 16) && (unit.radius > 1) && (unit.radius < 1.2)) {
        unit.isMineral = true;
      }

      if (HAS_WEAPONS[unit.unitType]) {
        unit.hasWeapons = true;
      }

      const previous = this.units.get(unit.tag);

      if (previous) {
        unit.lastrealpos = previous.realpos;
        unit.lastfacing = previous.facing;
      }

      Delay.syncUnit(unit);

      if (unit.owner === Game.playerId) {
        if (unit.isWorker) {
          workers.set(unit.tag, unit);
        } else if (IS_DEPOT[unit.unitType] || (unit.tag === this.base?.tag)) {
          this.base = unit;
        }

        units.set(unit.tag, unit);
      } else if (unit.owner === Game.enemy.playerId) {
        enemies.set(unit.tag, unit);
        units.set(unit.tag, unit);
      } else if (unit.isMineral) {
        minerals.set(unit.tag, unit);
      }
    }

    this.units = units;
    this.workers = workers;
    this.enemies = enemies;
    this.minerals = minerals;
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
