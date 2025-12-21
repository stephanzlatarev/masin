import Fist from "./fist.js";
import Units from "./units.js";

class Strike {

  getTarget() {
    for (const enemy of Units.enemies.values()) {
      if (enemy.isWorker && canStrike(Fist.workers, enemy)) {
        return enemy;
      }
    }
  }

}

function canStrike(workers, enemy) {
  for (const worker of workers) {
    if (calculateDistance(worker.pos, enemy.pos) > 0.7) return false;
  }

  return true;
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Strike();
