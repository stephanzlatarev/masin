import Circuit from "./circuit.js";
import Fist from "./fist.js";
import Game from "./game.js";
import Lane from "./lane.js";
import Strip from "./strip.js";
import Units from "./units.js";
import Zone from "./zone.js";
import project from "./projection.js";

let scout;
let sources = [];
let turn = { x: 0, y: 0, da: 0 };

class Route {

  start() {
    Strip.mineral = findEnemyMineral();

    sources = Game.units.filter(unit => (unit.mineralContents && (unit.displayType === 1)));
  }

  sync() {
    if (!Units.base) return;

    Strip.mineral = syncMineral(Strip.mineral);

    if (Strip.length) return;

    if (scout) {
      scout = Units.get(scout.tag);
    } else {
      const section = findFirstSection();

      if (section) {
        scout = section.worker;

        Strip.home = section.source;
      }
    }

    if (scout) {
      if (scout.realpos.z < Units.base.realpos.z - 1.9) {
        // The scout is one level below. Wait until it goes trhough the ramp
        turn = { x: 0, y: 0, da: 0 };
      } else {
        const da = Math.abs(scout.facing - scout.lastfacing);

        if (da > turn.da) {
          turn.x = scout.realpos.x;
          turn.y = scout.realpos.y;
          turn.da = da;

          Strip.mineral = findDestinationMineral(scout.realpos);
        }
      }
    }

    if (scout && !Strip.length && isDestinationMineralInSight()) {
      // The scout reached the enemy base and is approaching the strip mineral at the right angle. Complete the strip.
      const projection = project(scout.lastrealpos, scout.realpos, 0, Strip.mineral.pos);
      const end = { x: projection.x, y: projection.y };
      const start = getPositionAtSightDistance(end, turn);

      Strip.init(start, end);

      Zone.init();
      Lane.order();
      Circuit.init();

      scout = null;
    }
  }

}

function syncMineral(mineral) {
  if (mineral) {
    for (const one of Game.units) {
      if (one.unitType !== mineral.unitType) continue;
      if (one.pos.x !== mineral.pos.x) continue;
      if (one.pos.y !== mineral.pos.y) continue;

      return one;
    }
  }
}

function findEnemyMineral() {
  for (const one of Units.minerals.values()) {
    if (Math.abs(Game.enemy.x - one.pos.x) > 10) continue;
    if (Math.abs(Game.enemy.y - one.pos.y) > 10) continue;

    return one;
  }
}

function findSourceMineral(pos) {
  let bestMineral;
  let bestDistance = Infinity;

  for (const one of sources) {
    const distance = calculateDistance(one.pos, pos);

    if (distance < bestDistance) {
      bestMineral = one;
      bestDistance = distance;
    }
  }

  return bestMineral;
}

function findDestinationMineral(pos) {
  let bestMineral;
  let bestDistance = Infinity;

  for (const one of Units.minerals.values()) {
    if (Math.abs(one.pos.x - Game.enemy.x) > 8) continue;
    if (Math.abs(one.pos.y - Game.enemy.y) > 8) continue;

    const distance = calculateDistance(one.pos, pos);

    if (distance < bestDistance) {
      bestMineral = one;
      bestDistance = distance;
    }
  }

  return bestMineral;
}

function findFirstSection() {
  if (!Units.base) return;

  for (const worker of Fist.workers) {
    if (!didTurn(worker)) continue;

    if (calculateDistance(worker.realpos, Units.base.pos) > 6) {
      return { worker, source: findSourceMineral(worker.realpos) };
    }
  }
}

function isDestinationMineralInSight() {
  return (calculateDistance(scout.realpos, Strip.mineral.pos) <= 8);
}

function getPositionAtSightDistance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dd = calculateDistance(a, b);
  const df = 8 / dd;

  return { x: a.x + dx * df, y: a.y + dy * df };
}

function didTurn(worker) {
  return (Math.abs(worker.facing - worker.lastfacing) > 0.01);
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Route();
