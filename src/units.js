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
      if (unit.owner === 1) {
        if (unit.radius < 0.5) {
          const previous = this.workers.get(unit.tag);

          if (previous) {
            unit.lastpos = previous.pos;
            unit.lastfacing = previous.facing;
            unit.speed = calculateDistance(unit.pos, previous.pos);
          }

          workers.set(unit.tag, unit);
        } else if (unit.radius > 2.5) {
          this.base = unit;
        }

        unit.order = unit.orders[0] || {};
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

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Units();
