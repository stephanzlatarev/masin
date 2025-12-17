import Clench from "./clench.js";
import Command from "./command.js";
import Intercept from "./intercept.js";
import Repair from "./repair.js";
import Route from "./route.js";
import Strike from "./strike.js";
import Units from "./units.js";

class Fist {

  mode = "move";
  act = this.move.bind(this);

  kills = 0;
  victim = null;

  sync() {
    const workers = new Set();

    for (const one of this.workers) {
      const worker = Units.get(one.tag);

      if (worker) {
        workers.add(worker);
      }
    }

    this.workers = [...workers];
    this.pos = this.workers[0].pos;

    this.act();
  }

  transition(mode) {
    this.mode = mode;
    this.act = this[mode].bind(this);
    this.log();
  }

  move() {
    Command.head(this.workers, Route.destination);

    if (Route.complete && isEnemyInSight()) {
      this.transition("clench");
    }
  }

  clench() {
    Clench.run();

    if (Clench.done()) {
      this.transition("seek");
    }
  }

  seek() {
    if (Repair.isNeeded()) {
      return this.transition("repair");
    }

    if (!Clench.done()) {
      return this.transition("clench");
    }

    this.victim = Strike.getTarget();

    if (this.victim) {
      Command.strike(this.workers, this.victim, Route.destination);

      return this.transition("strike");
    }

    Intercept.move();
  }

  strike() {
    if (!Units.get(this.victim.tag)) {
      // The victim got killed
      this.kills++;
      this.victim = null;
      this.transition("cooldown");
    }
  }

  cooldown() {
    let rallying = 0;

    for (const worker of this.workers) {
      if (worker.orders[0]?.abilityId === 295) {
        rallying++;
      }
    }

    if (rallying === this.workers.length) {
      if (Repair.isNeeded()) {
        this.transition("repair");
      } else {
        this.transition("clench");
      }
    }
  }

  repair() {
    if (Repair.isComplete()) {
      this.transition("clench");
    } else if (getNearEnemyCount(this) >= 3) {
      Command.head(this.workers, Route.source);
    } else {
      Repair.run();
    }
  }

  log() {
    let total = 0;
    let max = 0;
    let min = Infinity;

    for (const worker of this.workers) {
      total += worker.health;
      max = Math.max(worker.health, max);
      min = Math.min(worker.health, min);
    }

    console.log("[fist]", (this.mode + "        ").substring(0, 8),
      "| kills:", this.kills,
      "| health:", Math.floor(total), "(" + Math.floor(min) + "-" + Math.ceil(max) + ")",
    );
  }

}

function isEnemyInSight() {
  for (const enemy of Units.enemies.values()) {
    if (enemy.radius < 0.5) return true;
  }
}

function getNearEnemyCount(fist) {
  let count = 0;

  for (const enemy of Units.enemies.values()) {
    if (enemy.radius > 0.5) continue; // Just enemy workers

    const b = enemy.pos;

    for (const worker of fist.workers) {
      const a = worker.pos;

      if ((Math.abs(a.x - b.x) <= 3) && (Math.abs(a.y - b.y) <= 3)) {
        count++;
        break;
      }
    }
  }

  return count;
}

export default new Fist();
