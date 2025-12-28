import Clench from "./clench.js";
import Circuit from "./circuit.js";
import Command from "./command.js";
import Game from "./game.js";
import Lane from "./lane.js";
import Repair from "./repair.js";
import Strike from "./strike.js";
import Strip from "./strip.js";
import Units from "./units.js";
import Zone from "./zone.js";

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

    if (!this.workers.length) return;

    this.pos = this.workers[0].pos;
    this.x = this.pos.x;
    this.y = this.pos.y;

    this.act();
  }

  transition(mode) {
    this.mode = mode;
    this.act = this[mode].bind(this);
    this.log();
  }

  move() {
    Command.head(this.workers, Strip.mineral);

    if (Strip.length && (Zone.includes(this) || isEnemyInSight())) {
      this.transition("clench");
    }
  }

  clench() {
    Clench.soft();

    if (Clench.done()) {
      Circuit.reset();

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

    // Kill enemy workers in fire range
    this.victim = Strike.getTarget();

    if (this.victim) {
      Strike.hit(this.victim);
      Strike.monitor(this.victim);

      return this.transition("strike");
    }

    // Kill enemy workers on the harvest lanes
    for (const lane of Lane.enemyHarvestLanes) {
      const target = lane.getTarget();

      if (target) {
        return Command.head(this.workers, lane.mineral, lane.mineral.pos);
      }
    }

    // If no enemy workers are near the enemy depot building then destroy it
    if (Zone.center.includes(this) && !isEnemyInSight()) {
      return this.transition("smash");
    }

    // Move inside the enemy zone searching for enemy workers
    if (Zone.includes(this)) {
      Circuit.move();
    } else {
      Circuit.reset();
      Command.head(this.workers, Strip.mineral, Strip.mineral.pos);
    }
  }

  strike() {
    if (this.victim) Strike.monitor(this.victim);

    if (!Units.get(this.victim.tag)) {
      // The victim got killed
      this.kills++;
      this.victim = null;
      this.transition("cooldown");
    }
  }

  cooldown() {
    if (Strike.rally()) {
      // The workers are still rallying
    } else if (Repair.isNeeded()) {
      this.transition("repair");
    } else {
      this.transition("clench");
    }
  }

  repair() {
    if (Repair.isComplete()) {
      this.transition("move");
    } else if (getNearEnemyCount(this) >= 3) {
      Command.head(this.workers, Strip.home, Strip.ramp);
    } else {
      Repair.run();
    }
  }

  smash() {
    if (isEnemyInSight()) {
      return this.transition("seek");
    }

    for (const worker of this.workers) {
      if (Math.abs(worker.pos.x - Game.enemy.x) > 2) continue;
      if (Math.abs(worker.pos.y - Game.enemy.y) > 2) continue;

      // A worker of ours is at the spot of the enemy base and there's nothing there
      return this.transition("cleanup");
    }

    Command.amove(this.workers, Game.enemy);
  }

  cleanup() {
    if (this.victim) this.victim = Units.get(this.victim.tag);

    if (this.victim) {
      Command.amove(this.workers, this.victim.pos);
    } else if (Units.enemies.size) {
      // if not flying
      for (const enemy of Units.enemies.values()) {
        if (enemy.isFlying) continue;

        this.victim = enemy;
        Command.amove(this.workers, this.victim.pos);
      }
    } else {
      for (const one of this.workers) {
        if (!one.order.abilityId) {
          const x = Game.left + (Game.right - Game.left) * Math.random();
          const y = Game.top + (Game.bottom - Game.top) * Math.random();

          Command.amove([one], { x, y });
        }
      }
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
    if (enemy.isWorker) return true;
  }
}

function getNearEnemyCount(fist) {
  let count = 0;

  for (const enemy of Units.enemies.values()) {
    if (!enemy.isWorker) continue;

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
