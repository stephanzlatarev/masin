import Circuit from "./circuit.js";
import Fist from "./fist.js";
import Game from "./game.js";
import Lane from "./lane.js";
import Strip from "./strip.js";
import Units from "./units.js";
import Zone from "./zone.js";

let end;
let scout;
let sources = [];

class Route {

  start() {
    Strip.mineral = findEnemyMineral();

    sources = Game.units.filter(unit => (unit.mineralContents && (unit.displayType === 1)));
  }

  sync() {
    Strip.mineral = syncMineral(Strip.mineral);

    if (Strip.length) return;

    if (scout) {
      scout = Units.get(scout.tag);
    } else {
      const section = findFirstSection();

      if (section) {
        Strip.home = section.source;
        Strip.mineral = section.destination;
      }
    }

    if (scout && (calculateDistance(scout.realpos, Game.enemy) < end)) {
      // The scout reached the enemy base. Complete the strip.
      Strip.init(scout.realpos);

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

function findDestinationMineral(source) {
  const { x, y } = getSymmetricalPos(source.pos);

  for (const one of Units.minerals.values()) {
    if (one.pos.x !== x) continue;
    if (one.pos.y !== y) continue;

    return one;
  }
}

function getSymmetricalPos(pos) {
  let x;
  let y;

  if (Game.enemy.x === Units.base.pos.x) {
    x = pos.x;
  } else {
    x = Game.enemy.x - (pos.x - Units.base.pos.x);
  }

  if (Game.enemy.y === Units.base.pos.y) {
    y = pos.y;
  } else {
    y = Game.enemy.y - (pos.y - Units.base.pos.y);
  }

  return { x, y };
}

function findFirstSection() {
  if (!Units.base) return;

  for (const worker of Fist.workers) {
    if (!didTurn(worker)) continue;

    if (calculateDistance(worker.realpos, Units.base.pos) > 6) {
      const source = findSourceMineral(worker.realpos);
      const destination = findDestinationMineral(source);
      const enemyRamp = getSymmetricalPos(worker.realpos);

      scout = worker;
      end = calculateDistance(Game.enemy, enemyRamp) - 3;

      return { source, destination };
    }
  }
}

function didTurn(worker) {
  return (Math.abs(worker.facing - worker.lastfacing) > 0.01);
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Route();
