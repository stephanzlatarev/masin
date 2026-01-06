import Game from "./game.js";
import Units from "./units.js";

class Jobs {

  builder;
  defenders = [];
  fist = [];
  miners = [];
  shooters = [];

  start() {
    const workers = Game.units.filter(unit => (unit.unitType === 45));

    this.builder = null;
    this.fist = [...workers].slice(0, 9);
    this.miners = [...workers].slice(9);
  }

  sync() {
    this.builder = this.builder ? Units.get(this.builder.tag) : null;
    this.defenders = syncUnits(this.defenders);
    this.fist = syncUnits(this.fist);
    this.miners = syncUnits(this.miners);
    this.shooters = syncUnits(this.shooters);

    const active = new Set([...this.fist, ...this.miners, ...this.shooters]);

    for (const worker of Units.workers.values()) {
      if (!active.has(worker)) {
        this.miners.push(worker);
      }
    }

    for (const shooter of Units.shooters.values()) {
      if (!active.has(shooter)) {
        this.shooters.push(shooter);
      }
    }
  }

  hireBuilder() {
    if (!this.builder) {
      this.builder = this.miners[0];
      this.miners.splice(0, 1);
    }

    return this.builder;
  }

  releaseBuilder() {
    if (!this.builder) {
      this.miners.push(this.builder);
      this.builder = null;
    }
  }

  hireDefenders() {
    this.defenders = this.miners;
    this.miners = [];

    return this.defenders;
  }

  releaseDefenders() {
    this.miners = this.defenders;
    this.defenders = [];

    return this.miners;
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
