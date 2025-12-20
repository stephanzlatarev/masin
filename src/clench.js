import Command from "./command.js";
import Fist from "./fist.js";
import Route from "./route.js";
import Units from "./units.js";
import project from "./projection.js";

const SPEED = 0.18; // About the distance SCV moves in a game loop
const CLENCH_MARGIN = SPEED + SPEED;
const BLOCK_MARGIN = 0.375 + 0.375 + 0.15; // Radius of two SCV and some buffer
const RANKS_MARGIN = BLOCK_MARGIN * 3;
const MIN_ALIGN = 0.1;
const MAX_DISTANCE = 4;

class Clench {

  run() {
    let head;
    let tail;

    for (const worker of Fist.workers) {
      worker.projection = project(Route.section, worker.pos);

      if (head) {
        head = Math.max(worker.projection.s, head);

        if (worker.projection.h > MIN_ALIGN) {
          tail = Math.min(worker.projection.s, tail);
        }
      } else {
        head = worker.projection.s;
        tail = worker.projection.s;
      }
    }

    // Select the workers to align by moving instead of mineral walking
    const movers = new Set();
    const eligible = new Set();
    for (const worker of Fist.workers) {
      const projection = worker.projection;

      if (projection.s <= 0) continue;
      if (projection.s >= Route.section.length) continue;
      if (projection.h <= MIN_ALIGN) continue;
      if (projection.h >= MAX_DISTANCE) continue;
      if (isPathBlocked(worker, projection)) continue;

      eligible.add(worker);
    }

    const list = [...eligible].sort((a, b) => (b.projection.h - a.projection.h));
    let left = 0;
    let right = Infinity;
    for (const worker of list) {
      let isBlocking = false;

      for (const one of movers) {
        if (Math.abs(worker.projection.s - one.projection.s) < BLOCK_MARGIN) {
          isBlocking = true;
          break;
        }
      }

      if (!isBlocking) {
        movers.add(worker);
        left = Math.max(worker.projection.s, left);
        right = Math.min(worker.projection.s, right);
      }
    }
    if (right + RANKS_MARGIN < left) {
      right = left + RANKS_MARGIN;
    }

    // Select the direction for each worker to align with the rest
    // TODO: Prepare the section such that the workers cannot reach the minerals
    const back = Math.min(tail + SPEED, right + SPEED, Route.section.length - RANKS_MARGIN);
    for (const worker of Fist.workers) {
      const projection = worker.projection;

      if (projection.h >= MAX_DISTANCE) {
        // The worker is far away from the section and may get stuck clenching
        worker.direction = Route.source;
        worker.directionPos = Route.section.a;
      } else if (projection.s <= 0) {
        // The worker is before the section
        worker.direction = Route.destination;
        worker.directionPos = Route.section.b;
      } else if (projection.s >= Route.section.length) {
        // The worker is after the section
        worker.direction = Route.source;
        worker.directionPos = Route.section.a;
      } else if (worker.projection.s <= back) {
        // The worker is at the back of the fist
        worker.direction = Route.destination;
        worker.directionPos = Route.section.b;
      } else {
        worker.direction = Route.source;
        worker.directionPos = Route.section.a;
      }
    }

    // Command the workers
    for (const worker of Fist.workers) {
      if (movers.has(worker)) {
        Command.align(worker, worker.projection, worker.direction, worker.directionPos);
      } else {
        Command.harvest(worker, worker.direction, worker.directionPos);
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

function isPathBlocked(worker, b) {
  const line = { a: b, b: worker.pos, length: calculateDistance(worker.pos, b) };

  for (const one of Units.enemies.values()) {
    const projection = project(line, one.pos);
    const margin = one.radius + worker.radius + SPEED;

    if (projection.s < -margin) continue;
    if (projection.s > line.length) continue;
    if (projection.h > margin) continue;

    return true;
  }
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Clench();
