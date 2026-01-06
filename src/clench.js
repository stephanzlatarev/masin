import Command from "./command.js";
import Jobs from "./jobs.js";
import Strip from "./strip.js";
import Units from "./units.js";

const SPEED = 0.18; // About the distance SCV moves in a game loop
const CLENCH_MARGIN_MIN = 0.01;
const CLENCH_MARGIN = SPEED + SPEED;
const ENEMY_MARGIN = 1; // About the radius of a worker and speed

class Clench {

  soft() {
    if (!Jobs.fist.length) return;

    let isSafe = true;
    let front = -Infinity;
    let back = Infinity;
    let push = Infinity;
    let sides = new Set();

    for (const worker of Jobs.fist) {
      const projection = Strip.projection(worker);

      worker.projection = projection;

      front = Math.max(projection.s, front);
      back = Math.min(projection.s, back);

      if ((projection.s >= 0) && Strip.isWorkerNearStrip(worker)) {
        sides.add(projection.a);
      }
    }

    for (const enemy of Units.enemies.values()) {
      if (!enemy.hasWeapons) continue;

      const projection = Strip.projection(enemy);

      if (projection.h > ENEMY_MARGIN) continue;
      if (projection.s < back - ENEMY_MARGIN) continue;
      if (projection.s > front + ENEMY_MARGIN) continue;

      push = Math.min(projection.s - ENEMY_MARGIN, push);
      isSafe = false;
    }

    if (back + CLENCH_MARGIN > push) {
      // Make sure clenching happens closer to home
      back = -Infinity;
    } else {
      back += CLENCH_MARGIN;
    }

    for (const worker of Jobs.fist) {
      const projection = worker.projection;

      if (isTooClose(worker, Strip.mineral)) {
        Strip.moveBack(worker);
      } else if (Strip.isWorkerOnStrip(worker) || (projection.s <= 0)) {
        if (projection.s <= back) {
          // The worker is at the back of the fist
          Strip.moveForth(worker);
        } else if (isSafe && (projection.s < CLENCH_MARGIN)) {
          // Keep strip end in sight so that movements is exactly on strip
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
    if (!Jobs.fist.length) return;

    let head;
    let tail;

    for (const worker of Jobs.fist) {
      if (isEnemyClose(worker)) {
        // Enemy is too close for hard clench
        return Command.head(Jobs.fist, Strip.mineral, Strip.mineral.pos);
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
      const body = [...Jobs.fist].splice(Jobs.fist.indexOf(head), 1);
      const pos = {
        x: (head.pos.x + tail.pos.x) / 2,
        y: (head.pos.y + tail.pos.y) / 2,
      };

      Command.align(head, pos, Strip.mineral, Strip.mineral.pos);
      Command.head(body, Strip.mineral, Strip.mineral.pos);
    } else {
      Command.head(Jobs.fist, Strip.mineral, Strip.mineral.pos);
    }
  }

  done() {
    return isClenched(CLENCH_MARGIN);
  }

  fits() {
    return isClenched(CLENCH_MARGIN + 0.2);
  }

}

function isClenched(margin) {
  let minx = +Infinity;
  let maxx = -Infinity;
  let miny = +Infinity;
  let maxy = -Infinity;

  for (const worker of Jobs.fist) {
    minx = Math.min(worker.pos.x, minx);
    maxx = Math.max(worker.pos.x, maxx);
    miny = Math.min(worker.pos.x, miny);
    maxy = Math.max(worker.pos.x, maxy);
  }

  return (maxx - minx <= margin) && (maxy - miny <= margin);
}

function isEnemyClose(worker) {
  for (const enemy of Units.enemies.values()) {
    if (!enemy.hasWeapons) continue;

    if ((Math.abs(enemy.pos.x - worker.pos.x) < 2) && (Math.abs(enemy.pos.y - worker.pos.y) < 2)) {
      return true;
    }
  }
}

function isTooClose(worker, mineral) {
  const adx = Math.abs(worker.pos.x - mineral.pos.x);
  const ady = Math.abs(worker.pos.y - mineral.pos.y);

  return (adx < 1.5) && (ady < 1);
}

export default new Clench();
