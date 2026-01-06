import Command from "./command.js";
import Jobs from "./jobs.js";
import Strip from "./strip.js";
import Units from "./units.js";

class Defense {

  isDefending;

  sync() {
    const enemy = getEnemyWorker(Jobs.miners);

    if (enemy) {
      for (const worker of Jobs.hireDefenders()) {
        Command.attack(worker, enemy);
      }

      this.isDefending = true;
    } else if (this.isDefending) {
      for (const worker of Jobs.releaseDefenders()) {
        Command.harvest(worker, Strip.home);
      }

      this.isDefending = false;
    }
  }

}

function getEnemyWorker(workers) {
  let worker;

  for (const enemy of Units.enemies.values()) {
    if (!enemy.isWorker) continue;
    if (!isClose(enemy, workers)) continue;

    if (worker) {
      // Don't defend against multiple enemies
      return;
    } else {
      worker = enemy;
    }
  }

  return worker;
}

function isClose(enemy, workers) {
  for (const one of workers) {
    const adx = Math.abs(one.pos.x - enemy.pos.x);
    const ady = Math.abs(one.pos.y - enemy.pos.y);

    if ((adx < 2) && (ady < 2)) return true;
  }
}

export default new Defense();
