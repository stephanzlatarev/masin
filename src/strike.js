import Command from "./command.js";
import Fist from "./fist.js";
import Strip from "./strip.js";
import Units from "./units.js";
import Zone from "./zone.js";

class Strike {

  getTarget() {
    for (const enemy of Units.enemies.values()) {
      if (enemy.isWorker && canStrike(Fist.workers, enemy)) {
        return enemy;
      }
    }
  }

  hit(enemy) {
    for (const worker of Fist.workers) {
      if (isTooClose(worker, Strip.mineral)) {
        Command.strike(Fist.workers, enemy, Strip.home, Strip.ramp);
      } else {
        Command.strike(Fist.workers, enemy, Strip.mineral, Strip.mineral.pos);
      }
    }
  }

  rally() {
    let isRallying = false;

    for (const worker of Fist.workers) {
      const target = (Zone.center.includes(worker) || Zone.back.includes(worker)) ? Strip.mineral : Strip.home;

      if ((worker.order.abilityId === 295) && (worker.order.targetUnitTag === target.tag)) {
        // Worker is moving in the right direction. Wait until it leaves the back zones.
        if (Zone.center.includes(worker) || Zone.back.includes(worker)) {
          isRallying = true;
        }
      } else {
        Command.harvest(worker, target, (target === Strip.home) ? Strip.ramp : target.pos);
        isRallying = true;
      }
    }

    return isRallying;
  }

}

function canStrike(workers, enemy) {
  for (const worker of workers) {
    if (calculateDistance(worker.pos, enemy.pos) > 0.7) return false;
  }

  return true;
}

function isTooClose(worker, mineral) {
  if (Math.abs(worker.pos.x - mineral.pos.x) <= 3) return true;
  if (Math.abs(worker.pos.y - mineral.pos.y) <= 3) return true;
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Strike();
