import Command from "./command.js";
import Fist from "./fist.js";
import Strip from "./strip.js";
import Units from "./units.js";
import Zone from "./zone.js";

class Strike {

  getTarget() {
    for (const enemy of Units.enemies.values()) {
      if (isValidTarget(enemy) && canStrike(Fist.workers, enemy)) {
        return enemy;
      }
    }
  }

  hit(enemy) {
    Command.strike(Fist.workers, enemy, Strip.home, Strip.ramp);
  }

  rally() {
    let isRallying = false;

    for (const worker of Fist.workers) {
      const target = getRallyTarget(worker);

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

  monitor(enemy) {
    try {
      console.log("[strike] target:", enemy.tag,
        "at:", enemy.realpos.x.toFixed(2) + ":" + enemy.realpos.y.toFixed(2), ">", enemy.pos.x.toFixed(2) + ":" + enemy.pos.y.toFixed(2),
        "face:", enemy.facing.toFixed(2),
        "health:", enemy.health.toFixed(2),
      );
      for (const worker of Fist.workers) {
        console.log("-", worker.tag,
          "weapon:", worker.weaponCooldown.toFixed(2),
          "distance:", calculateDistance(worker.pos, enemy.pos).toFixed(2),
          "at:", worker.realpos.x.toFixed(2) + ":" + worker.realpos.y.toFixed(2), ">", worker.pos.x.toFixed(2) + ":" + worker.pos.y.toFixed(2),
          "facing:", worker.facing.toFixed(2),
          "health:", worker.health.toFixed(2),
          "orders:", JSON.stringify(worker.orders),
        );
      }
    } catch (e) {
      console.log(e);
    }
  }

}

function isValidTarget(enemy) {
  if (enemy.isWorker) return true;
  if (enemy.unitType === 105) return true; // Zergling
}

function canStrike(workers, enemy) {
  for (const worker of workers) {
    if (calculateDistance(worker.pos, enemy.pos) > 0.7) return false;
  }

  return true;
}

function getRallyTarget(worker) {
  if (Zone.front.includes(worker) && !isTooClose(worker, Strip.mineral)) return Strip.mineral;
  if (Zone.center.includes(worker)) return Strip.mineral;
  if (Zone.back.includes(worker)) return Strip.mineral;

  return Strip.home;
}

function isTooClose(worker, mineral) {
  const adx = Math.abs(worker.pos.x - mineral.pos.x);
  const ady = Math.abs(worker.pos.y - mineral.pos.y);

  return (adx <= 3) && (ady <= 2);
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Strike();
