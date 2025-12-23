import Fist from "./fist.js";
import Strip from "./strip.js";
import Units from "./units.js";

const SPEED = 0.18; // About the distance SCV moves in a game loop
const CLENCH_MARGIN = SPEED + SPEED;
const ENEMY_MARGIN = 1; // About the radius of a worker and speed

class Clench {

  soft() {
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

      if (projection.s <= 0) {
        Strip.moveForth(worker);
      } else if (Strip.isWorkerOnStrip(worker) || (projection.s <= 0)) {
        if (projection.s <= back) {
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

export default new Clench();
