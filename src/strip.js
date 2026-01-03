import Command from "./command.js";
import Fist from "./fist.js";
import Game from "./game.js";
import Units from "./units.js";
import Zone from "./zone.js";
import project from "./projection.js";

// Minimum projection h for a worker to be considered on the strip
const MIN_H = 0.1;

// Maximum projection h for a worker to be considered near the strip
const MAX_H = 4;

const SLIDE_DIRECTION_HORIZONTAL = 1;
const SLIDE_DIRECTION_VERTICAL = 2;

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

  // Slide either horizontally or vertically
  slideDirection;

  init(ramp) {
    this.ramp = ramp;
    this.length = calculateDistance(ramp, this.mineral.pos);
    this.side = this.projection(Game.enemy).a;

    if (Math.abs(ramp.x - Game.enemy.x) > Math.abs(ramp.y - Game.enemy.y)) {
      this.slideDirection = SLIDE_DIRECTION_HORIZONTAL;
    } else {
      this.slideDirection = SLIDE_DIRECTION_VERTICAL;
    }
  }

  isFistOnStrip() {
    for (const worker of Fist.workers) {
      if (!this.isWorkerOnStrip(worker)) return false;
    }

    return true;
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
    const projection = worker.projection || this.projection(worker);
    const homeDirection = (projection.s <= 0) ? this.home.pos : this.ramp;

    Command.harvest(worker, this.home, homeDirection);
  }

  slide(worker) {
    const projection = worker.projection || this.projection(worker);
    const homeDirection = (projection.s <= 0) ? this.home.pos : this.ramp;

    if (canSlideAlongProjection(this, worker)) {
      Command.align(worker, projection, this.home, homeDirection);
    } else if (canSlideAlongDepot(this, worker)) {
      let via;

      if (this.slideDirection === SLIDE_DIRECTION_HORIZONTAL) {
        const ratio = (worker.pos.y - this.ramp.y) / (this.mineral.pos.y - this.ramp.y);

        via = { x: this.ramp.x + (this.mineral.pos.x - this.ramp.x) * ratio, y: worker.pos.y };
      } else {
        const ratio = (worker.pos.x - this.ramp.x) / (this.mineral.pos.x - this.ramp.x);

        via = { x: worker.pos.x, y: this.ramp.y + (this.mineral.pos.y - this.ramp.y) * ratio };
      }

      Command.align(worker, via, this.home, homeDirection);
    } else if (isTooClose(worker, this.mineral)) {
      Command.harvest(worker, this.home, homeDirection);
    } else if (Zone.front.includes(worker) || Zone.center.includes(worker)) {
      Command.harvest(worker, this.mineral, this.mineral.pos);
    } else {
      Command.harvest(worker, this.home, homeDirection);
    }
  }

  projection(point) {
    return project(this.ramp, this.mineral.pos, this.length, point.pos || point);
  }

}

function canSlideAlongProjection(strip, worker) {
  // Check if projection is too close to the mineral
  if (worker.projection.s > strip.length - 2) return false;

  // Check if an enemy worker is blocking the projection path
  const a = worker.pos;
  const b = worker.projection;
  const distance = calculateDistance(a, b);

  for (const one of Units.enemies.values()) {
    const projection = project(a, b, distance, one.pos);
    const margin = 1.0;

    if (projection.s < -margin) continue;
    if (projection.s > distance) continue;
    if (projection.h > margin) continue;

    return false;
  }

  return true;
}

function canSlideAlongDepot(strip, worker) {
  let left = Math.min(worker.pos.x, worker.realpos.x);
  let right = Math.max(worker.pos.x, worker.realpos.x);
  let top = Math.min(worker.pos.y, worker.realpos.y);
  let bottom = Math.max(worker.pos.y, worker.realpos.y);

  if (strip.slideDirection === SLIDE_DIRECTION_HORIZONTAL) {
    // Slide horizontally
    if (strip.ramp.x < right) left -= 2.0;
    if (strip.ramp.x > left) right += 2.0;

    top -= 1.0;
    bottom += 1.0;
  } else {
    // Slide vertically
    left -= 1.0;
    right += 1.0;

    if (strip.ramp.y < bottom) top -= 2.0;
    if (strip.ramp.y > top) bottom += 2.0;
  }

  for (const one of Units.enemies.values()) {
    if (one.pos.x < left) continue;
    if (one.pos.x > right) continue;
    if (one.pos.y < top) continue;
    if (one.pos.y > bottom) continue;

    return false;
  }

  return true;
}

function isTooClose(worker, mineral) {
  const adx = Math.abs(worker.pos.x - mineral.pos.x);
  const ady = Math.abs(worker.pos.y - mineral.pos.y);

  return (adx < 1.5) && (ady < 1);
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Strip();
