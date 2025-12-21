import Command from "./command.js";
import Fist from "./fist.js";
import Game from "./game.js";
import Lane from "./lane.js";
import Strip from "./strip.js";
import Zone from "./zone.js";

class Circuit {

  index = 0;
  turns = [];

  init() {
    const front = getMinerals(Zone.front);
    const back = getMinerals(Zone.back);

    // Start from front zone
    this.turns.push(new Turn(front.first, () => Zone.front.includes(Fist)));

    // Then go by the enemy depot building until past it
    this.turns.push(new Turn(back.first, () => !Zone.front.includes(Fist)));

    // Then go deeper into the back zone until close to the mineral fields
    this.turns.push(new Turn(back.last, isDeepInZone));

    // Then turn towards the exit until the edge of the back zone
    this.turns.push(new Turn(Strip.home, isToeInZone));

    // Then turn around and go towards the front zone by the enemy depot building until past it  
    this.turns.push(new Turn(front.last, () => !Zone.back.includes(Fist)));

    // Then go deeper into the front zone until close to the mineral fields
    this.turns.push(new Turn(front.first, isDeepInZone));

    // Then turn towards the exit until the edge of the front zone
    this.turns.push(new Turn(Strip.home, isToeInZone));
  }

  move() {
    let turn = this.turns[this.index];

    if (turn.reached()) {
      if (this.index < this.turns.length - 1) {
        this.index++;
      } else {
        this.index = 0;
      }

      turn = this.turns[this.index];
    }

    const mineral = getMineral(turn.mineral);
    const direction = (mineral === Strip.home) ? Strip.ramp : mineral.pos;

    Command.head(Fist.workers, mineral, direction);
  }

  reset() {
    this.index = 0;
  }

}

class Turn {

  constructor(mineral, condition) {
    this.reached = condition;
    this.mineral = mineral;
  }

}

function getMineral(mineral) {
  for (const one of Game.units) {
    if (one.unitType !== mineral.unitType) continue;
    if (one.pos.x !== mineral.pos.x) continue;
    if (one.pos.y !== mineral.pos.y) continue;

    return one;
  }
}

function getMinerals(zone) {
  let first;
  let last;

  for (const lane of Lane.enemyHarvestLanes) {
    if (zone.includes(lane.mineral.pos)) {
      if (!first) first = lane.mineral;
      last = lane.mineral;
    }
  }

  return { first, last };
}

function isToeInZone() {
  return (Math.abs(Game.enemy.x - Fist.x) <= 3) && (Math.abs(Game.enemy.y - Fist.y) <= 3);
}

function isDeepInZone() {
  if (Math.abs(Game.enemy.x - Fist.x) >= 5) return true;
  if (Math.abs(Game.enemy.y - Fist.y) >= 5) return true;
}

export default new Circuit();
