import Game from "./game.js";
import Fist from "./fist.js";
import Units from "./units.js";
import Zone from "./zone.js";
import project from "./projection.js";

const MAX_MARGIN = 0.2;

export default class Lane {

  static enemyHarvestLanes = [];

  constructor(start, end, mineral) {
    this.a = start;
    this.b = end;
    this.mineral = mineral;
    this.length = calculateDistance(start, end);
  }

  includes(pos) {
    const projection = project(this, pos);

    if (projection.s < -MAX_MARGIN) return false;
    if (projection.s > this.length + MAX_MARGIN) return false;

    return projection.h <= MAX_MARGIN;
  }

  static start() {
    const minerals = [];

    for (const one of Game.units) {
      if (one.owner !== 16) continue;
      if (one.radius < 1) continue;
      if (one.radius >= 1.2) continue;
      if (Math.abs(Game.enemy.x - one.pos.x) > 10) continue;
      if (Math.abs(Game.enemy.y - one.pos.y) > 10) continue;
  
      minerals.push(one);
    }

    for (const one of minerals) {
      this.enemyHarvestLanes.push(new EnemyHarvestLane(Game.enemy, findHarvestPoint(one, minerals), one));
    }
  }

  static order(pos) {
    this.enemyHarvestLanes.sort((a, b) => {
      const angleA = Math.atan2(a.mineral.pos.y - pos.y, a.mineral.pos.x - pos.x);
      const angleB = Math.atan2(b.mineral.pos.y - pos.y, b.mineral.pos.x - pos.x);
      
      // Sort clockwise (descending angle)
      return angleB - angleA;
    });

    if (!Zone.front.includes(this.enemyHarvestLanes[0].mineral.pos)) {
      this.enemyHarvestLanes.reverse();
    }
  }

  static sync() {
    for (const one of Lane.enemyHarvestLanes) {
      one.mineral = syncMineral(one.mineral);
    }
  }

}

class EnemyHarvestLane extends Lane {

  getTarget() {
    if (!this.includes(Fist)) return;

    const fist = project(this, Fist);

    for (const unit of Units.enemies.values()) {
      if (unit.radius > 0.5) continue;
      if (!this.includes(unit.pos)) continue;

      const target = project(this, unit.pos);

      if (target.s > fist.s) return unit;
    }
  }

}

function syncMineral(mineral) {
  for (const one of Game.units) {
    if (one.unitType !== mineral.unitType) continue;
    if (one.pos.x !== mineral.pos.x) continue;
    if (one.pos.y !== mineral.pos.y) continue;

    return one;
  }
}

function findHarvestPoint(mineral, minerals) {
  const dy = mineral.pos.y - Game.enemy.y;

  if ((dy === 7) || (dy === -7)) {
    // This is a second line mineral field and may be obstructed
    const dx = mineral.pos.x - Game.enemy.x;

    for (const one of minerals) {
      const oy = one.pos.y - Game.enemy.y;

      // Check if this is a first line mineral field and can obstruct
      if ((oy !== 6) && (oy !== -6)) continue;

      const ox = one.pos.x - Game.enemy.x;
      if ((dx < 0) && (ox === dx + 1)) return { x: mineral.pos.x - 0.5, y: mineral.pos.y };
      if ((dx > 0) && (ox === dx - 1)) return { x: mineral.pos.x + 0.5, y: mineral.pos.y };
    }
  }

  return mineral.pos;
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}
