import Command from "./command.js";
import Jobs from "./jobs.js";

class Repair {

  isNeeded() {
    for (const worker of Jobs.fist) {
      if (worker.health <= 20) {
        return true;
      }
    }
  }

  isComplete() {
    for (const worker of Jobs.fist) {
      if (worker.health < worker.healthMax) {
        return false;
      }
    }

    return true;
  }

  run() {
    // TODO: If we have no minerals, stop all workers

    for (const worker of Jobs.fist) {
      const target = selectRepairTarget(worker);

      if (target) {
        Command.repair(worker, target);
      } else {
        Command.stop(worker);
      }
    }
  }

}

function selectRepairTarget(worker) {
  let bestTarget;
  let bestDistance = Infinity;

  for (const one of Jobs.fist) {
    if (one === worker) continue;
    if (one.health >= one.healthMax) continue;

    const distance = calculateDistance(worker.pos, one.pos);

    if (distance < bestDistance) {
      bestTarget = one;
      bestDistance = distance;
    }
  }

  return bestTarget;
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Repair();
