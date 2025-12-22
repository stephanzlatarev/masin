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
    Command.strike(Fist.workers, enemy, Strip.mineral, Strip.mineral.pos);
  }

  rally() {
    let isRallying = false;

    for (const worker of Fist.workers) {
      const target = shouldRallyForward(worker) ? Strip.mineral : Strip.home;

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

function shouldRallyForward(worker) {
  if (Zone.back.includes(worker)) return true;
  if (Zone.center.includes(worker) && (getCenterSide(worker.pos) !== getCenterSide(Strip.mineral.pos))) return true;
}

function getCenterSide(pos) {
  const zx = Zone.center.right - Zone.center.left;
  const zy = Zone.center.bottom - Zone.center.top;
  const px = pos.x - Zone.center.left;
  const py = pos.y - Zone.center.top;

  return Math.sign(zy * px - zx * py);
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Strike();
