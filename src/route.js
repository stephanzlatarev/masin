import Fist from "./fist.js";
import Game from "./game.js";
import Units from "./units.js";
import Zone from "./zone.js";

let end;
let scout;
let sources = [];

class Route {

  sections = [];
  projected = [];
  complete = false;

  start() {
    this.destination = findEnemyMineral();

    sources = Game.units.filter(unit => (unit.mineralContents && (unit.displayType === 1)));
  }

  sync() {
    syncUnits(this);

    if (this.complete) return;

    if (this.sections.length) {
      findNextSection(this.sections);
    } else {
      const route = findFirstSection(this.sections, this.projected);

      if (route) {
        this.source = route.source;
        this.destination = route.destination;
      }
    }

    if (scout && (calculateDistance(scout.pos, Game.enemy) < end)) {
      // The scout reached the enemy base. Complete the route.
      const current = this.sections[this.sections.length - 1];
      const lastpos = current.next || current.b;
      const section = new Section(lastpos, scout.facing);

      section.extend(this.destination.pos, calculateDistance(lastpos, this.destination.pos));

      const lane = Zone.getBlindPath(section);
      const { point, length } = findCrossing(section, lane);

      section.blind = lane;
      section.extend(point, length);
      lane.a = point;

      this.sections.push(section);
      this.projected.length = 0;
      this.complete = true;

      scout = null;
    }

    this.index = this.sections.length - 1;
    this.section = this.sections[this.index];
  }

}

function syncUnits(route) {
  route.destination = syncMineral(route.destination);

  for (const section of route.sections) {
    if (section.blind) {
      section.blind.target = syncMineral(section.blind.target);
    }
  }
  
  if (scout) scout = Units.get(scout.tag);
}

class Section {

  straight = true;

  constructor(a, direction = 0) {
    this.a = a;
    this.b = a;
    this.direction = direction;
    this.length = 0;
  }

  extend(b, length = 1) {
    this.b = b;
    this.length = length;

    return this;
  }

  bend(b, next) {
    this.b = b;
    this.next = next;
    this.straight = false;
    this.length = 1;

    return this;
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
  for (const one of Game.units) {
    if (one.owner !== 16) continue;
    if (one.radius < 1) continue;
    if (one.radius >= 1.2) continue;
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

  for (const one of Game.units) {
    if (one.owner !== 16) continue;
    if (one.radius >= 1.2) continue;
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

function findFirstSection(sections, projected) {
  if (!Units.base) return;

  for (const worker of Fist.workers) {
    if (!didTurn(worker)) continue;

    if (calculateDistance(worker.pos, Units.base.pos) > 6) {
      const source = findSourceMineral(worker.lastpos);
      const destination = findDestinationMineral(source);
      const enemyRamp = getSymmetricalPos(worker.lastpos);

      sections.push(new Section(source.pos, worker.lastfacing).extend(worker.lastpos));
      sections.push(new Section(worker.pos, worker.facing));

      const length = calculateDistance(enemyRamp, destination.pos);
      projected.push(new Section(enemyRamp).extend(destination.pos, length));

      scout = worker;
      end = calculateDistance(Game.enemy, enemyRamp) - 3;

      return { source, destination };
    }
  }
}

function findNextSection(sections) {
  if (!didTurn(scout)) return;

  const current = sections[sections.length - 1];
  const lastpos = current.straight ? current.a : current.next;
  const length = calculateDistance(lastpos, scout.lastpos);

  if (length < 1) {
    // This is part of a turn
    current.bend(scout.lastpos, scout.pos);
  } else if (current.straight) {
    // Update a section bud
    current.extend(scout.lastpos, length);
    sections.push(new Section(scout.pos, scout.facing));
  } else {
    // Add a section after a bend
    sections.push(new Section(current.next, scout.lastfacing).extend(scout.lastpos, length));
    sections.push(new Section(scout.pos, scout.facing));
  }
}

function didTurn(worker) {
  return (Math.abs(worker.facing - worker.lastfacing) > 0.01);
}

function findCrossing(section, lane) {
  // Assume lane is horizontal
  const factor = (lane.a.y - section.a.y) / (section.b.y - section.a.y);
  const length = section.length * factor;
  const x = section.a.x + (section.b.x - section.a.x) * factor;
  const y = lane.a.y;

  return { point: { x, y }, length };
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Route();
