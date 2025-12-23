import Command from "./command.js";
import Game from "./game.js";
import Units from "./units.js";
import Zone from "./zone.js";
import project from "./projection.js";

// Minimum projection h for a worker to be considered on the strip
const MIN_H = 0.1;

// Maximum projection h for a worker to be considered near the strip
const MAX_H = 4;

class Strip {

  // The mineral at enemy base used to mineral walk in
  mineral;

  // The last point in enemy base on the strip
  ramp;

  // The mineral at home base used to mineral walk out
  home;

  // The distance between the ramp point and the mineral at enemy base
  length;

  // The side of the enemy base depot building
  side;

  init(ramp) {
    this.ramp = ramp;
    this.length = calculateDistance(ramp, this.mineral.pos);
    this.side = this.projection(Game.enemy).a;

    if (Math.abs(ramp.x - Game.enemy.x) > Math.abs(ramp.y - Game.enemy.y)) {
      this.slide = this.slideHorizontally.bind(this);
    } else {
      this.slide = this.slideVertically.bind(this);
    }
  }

  isWorkerOnStrip(worker) {
    const projection = worker.projection || this.projection(worker);

    return (projection.h <= MIN_H);
  }

  isWorkerAwayFromStrip(worker) {
    const projection = worker.projection || this.projection(worker);

    return (projection.h >= MAX_H);
  }

  isWorkerNearStrip(worker) {
    return !this.isWorkerOnStrip(worker) && !this.isWorkerAwayFromStrip(worker);
  }

  moveForth(worker) {
    Command.harvest(worker, this.mineral, this.mineral.pos);
  }

  moveBack(worker) {
    Command.harvest(worker, this.home, this.ramp);
  }

  slideHorizontally(worker) {
    let left = Math.min(worker.pos.x, worker.realpos.x);
    let right = Math.max(worker.pos.x, worker.realpos.x);
    let top = Math.min(worker.pos.y, worker.realpos.y);
    let bottom = Math.max(worker.pos.y, worker.realpos.y);

    if (this.ramp.x < right) left -= 2.0;
    if (this.ramp.x > left) right += 2.0;

    top -= 1.0;
    bottom += 1.0;

    if (!isPathBlocked(left, top, right, bottom)) {
      const ratio = (worker.pos.y - this.ramp.y) / (this.mineral.pos.y - this.ramp.y);
      const pos = { x: this.ramp.x + (this.mineral.pos.x - this.ramp.x) * ratio, y: worker.pos.y };

      Command.align(worker, pos, this.home, pos);
    } else if (isTooClose(worker, this.mineral)) {
      Command.harvest(worker, this.home, this.ramp);
    } else if (Zone.front.includes(worker) || Zone.center.includes(worker)) {
      Command.harvest(worker, this.mineral, this.mineral.pos);
    } else {
      Command.harvest(worker, this.home, this.ramp);
    }
  }

  slideVertically(worker) {
    let left = Math.min(worker.pos.x, worker.realpos.x);
    let right = Math.max(worker.pos.x, worker.realpos.x);
    let top = Math.min(worker.pos.y, worker.realpos.y);
    let bottom = Math.max(worker.pos.y, worker.realpos.y);

    left -= 1.0;
    right += 1.0;

    if (this.ramp.y < bottom) top -= 2.0;
    if (this.ramp.y > top) bottom += 2.0;

    if (!isPathBlocked(left, top, right, bottom)) {
      const ratio = (worker.pos.x - this.ramp.x) / (this.mineral.pos.x - this.ramp.x);
      const pos = { x: worker.pos.x, y: this.ramp.y + (this.mineral.pos.y - this.ramp.y) * ratio };

      Command.align(worker, pos, this.home, pos);
    } else if (isTooClose(worker, this.mineral)) {
      Command.harvest(worker, this.home, this.ramp);
    } else if (Zone.front.includes(worker) || Zone.center.includes(worker)) {
      Command.harvest(worker, this.mineral, this.mineral.pos);
    } else {
      Command.harvest(worker, this.home, this.ramp);
    }
  }

  projection(point) {
    return project(this.ramp, this.mineral.pos, this.length, point.pos || point);
  }

}

function isPathBlocked(left, top, right, bottom) {
  for (const one of Units.enemies.values()) {
    if (one.pos.x < left) continue;
    if (one.pos.x > right) continue;
    if (one.pos.y < top) continue;
    if (one.pos.y > bottom) continue;

    return true;
  }
}

function isTooClose(worker, mineral) {
  if (Math.abs(worker.pos.x - mineral.pos.x) <= 3) return true;
  if (Math.abs(worker.pos.y - mineral.pos.y) <= 3) return true;
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Strip();
