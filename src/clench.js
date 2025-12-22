import Command from "./command.js";
import Fist from "./fist.js";
import Strip from "./strip.js";

const SPEED = 0.18; // About the distance SCV moves in a game loop
const CLENCH_MARGIN = SPEED + SPEED;

class Clench {

  soft() {
    let back = Infinity;
    let sides = new Set();

    for (const worker of Fist.workers) {
      const projection = Strip.projection(worker);

      worker.projection = projection;

      back = Math.min(projection.s, back);
      if ((projection.s >= 0) && Strip.isWorkerNearStrip(worker)) {
        sides.add(projection.a);
      }
    }

    back += CLENCH_MARGIN;

    for (const worker of Fist.workers) {
      const projection = worker.projection;

      if (projection.s < 0) {
        // Worker is away from enemy base
        Strip.moveForth(worker);
      } else if (Strip.isWorkerAwayFromStrip(worker)) {
        // Worker is away from the strip and may get stuck
        Strip.moveBack(worker);
      } else if (Strip.isWorkerOnStrip(worker)) {
        if (projection.s <= back) {
          // The worker is at the back of the fist
          Strip.moveForth(worker);
        } else {
          Strip.moveBack(worker);
        }
      } else if ((sides.size == 2) && (projection.a !== Strip.side)) {
        // Worker is on the other side of strip and may block sliding workers
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
