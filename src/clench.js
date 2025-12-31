import Command from "./command.js";
import Fist from "./fist.js";
import Strip from "./strip.js";
import Units from "./units.js";

const SPEED = 0.18; // About the distance SCV moves in a game loop
const CLENCH_MARGIN_MIN = 0.01;
const CLENCH_MARGIN = SPEED + SPEED;
const ENEMY_MARGIN = 1; // About the radius of a worker and speed

class Clench {

  soft() {
    if (!Fist.workers.length) return;

    let front = -Infinity;
    let back = Infinity;
    let push = Infinity;
    let sides = new Set();

    for (const worker of Fist.workers) {
      const projection = Strip.projection(worker);

      worker.projection = projection;

      front = Math.max(projection.s, front);
      back = Math.min(projection.s, back);

      if ((projection.s >= 0) && Strip.isWorkerNearStrip(worker)) {
        sides.add(projection.a);
      }
    }

    for (const enemy of Units.enemies.values()) {
      const projection = Strip.projection(enemy);

      if (projection.h > ENEMY_MARGIN) continue;
      if (projection.s < back - ENEMY_MARGIN) continue;
      if (projection.s > front + ENEMY_MARGIN) continue;

      push = Math.min(projection.s - ENEMY_MARGIN, push);
    }

    if (back + CLENCH_MARGIN > push) {
      // Make sure clenching happens closer to home
      back = -Infinity;
    } else {
      back += CLENCH_MARGIN;
    }

    for (const worker of Fist.workers) {
      const projection = worker.projection;

      if (Strip.isWorkerOnStrip(worker) || (projection.s <= 0)) {
        if ((projection.s <= back) && !isTooClose(worker, Strip.mineral)) {
          // The worker is at the back of the fist
          Strip.moveForth(worker);
        } else {
          Strip.moveBack(worker);
        }
      } else if (Strip.isWorkerAwayFromStrip(worker)) {
        // Worker is away from the strip and may get stuck
        Strip.moveBack(worker);
      } else if ((sides.size == 2) && (projection.a !== Strip.side)) {
        // Worker is on the other side of strip and may block sliding workers
        Strip.moveBack(worker);
      } else if (projection.s >= push) {
        // Enemy is pushing
        Strip.moveBack(worker);
      } else {
        Strip.slide(worker);
      }
    }
  }

  hard() {
    if (!Fist.workers.length) return;

    let head;
    let tail;

    for (const worker of Fist.workers) {
      if (isEnemyClose(worker)) {
        // Enemy is too close for hard clench
        return Command.head(Fist.workers, Strip.mineral, Strip.mineral.pos);
      }

      if (!worker.projection) {
        worker.projection = Strip.projection(worker);
      }

      if (!head || (worker.projection.s > head.projection.s)) {
        head = worker;
      }

      if (!tail || (worker.projection.s < tail.projection.s)) {
        tail = worker;
      }
    }

    if (head.projection.s > tail.projection.s + CLENCH_MARGIN_MIN) {
      const body = [...Fist.workers].splice(Fist.workers.indexOf(head), 1);
      const pos = {
        x: (head.pos.x + tail.pos.x) / 2,
        y: (head.pos.y + tail.pos.y) / 2,
      };

      Command.align(head, pos, Strip.mineral, Strip.mineral.pos);
      Command.head(body, Strip.mineral, Strip.mineral.pos);
    } else {
      Command.head(Fist.workers, Strip.mineral, Strip.mineral.pos);
    }
  }

  done() {
    const anchor = Fist.workers[0];
    if (!anchor) return false;

    for (const worker of Fist.workers) {
      if (Math.abs(worker.pos.x - anchor.pos.x) > CLENCH_MARGIN) return false;
      if (Math.abs(worker.pos.y - anchor.pos.y) > CLENCH_MARGIN) return false;
    }

    return true;
  }

}

function isEnemyClose(worker) {
  for (const enemy of Units.enemies.values()) {
    if ((Math.abs(enemy.pos.x - worker.pos.x) < 2) && (Math.abs(enemy.pos.y - worker.pos.y) < 2)) {
      return true;
    }
  }
}

function isTooClose(worker, mineral) {
  const adx = Math.abs(worker.pos.x - mineral.pos.x);
  const ady = Math.abs(worker.pos.y - mineral.pos.y);

  return (adx <= 3) && (ady <= 2);
}

export default new Clench();
