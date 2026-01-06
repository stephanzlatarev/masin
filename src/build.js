import Command from "./command.js";
import Game from "./game.js";
import Jobs from "./jobs.js";
import Units from "./units.js";

const BUILD_SUPPLYDEPOT = 319;
const BUILD_BARRACKS = 321;

const TRAIN_SCV = 524;
const TRAIN_MARINE = 560;

const UNIT_TYPE_SUPPLYDEPOT = 19;
const UNIT_TYPE_BARRACKS = 21;

const MINERALS_FOR_REPAIR = 60;
const MINERALS_FOR_SUPPLYDEPOT = 100 + MINERALS_FOR_REPAIR;
const MINERALS_FOR_BARRACKS = 150 + MINERALS_FOR_REPAIR;
const MINERALS_FOR_MARINES = 50 + MINERALS_FOR_REPAIR;

class Build {

  act = this.buildSupplyDepot.bind(this);

  start() {
    Command.train(Units.base, TRAIN_SCV);
  }

  sync() {
    this.act();
  }

  transition(mode) {
    this.act = this[mode].bind(this);

    console.log("[build]", mode);
  }

  buildSupplyDepot() {
    if (Game.minerals >= MINERALS_FOR_SUPPLYDEPOT) {
      Command.build(Jobs.hireBuilder(), BUILD_SUPPLYDEPOT, selectSupplyDepotLocation());
      this.transition("waitForSupplyDepot");
    }
  }

  waitForSupplyDepot() {
    for (const one of Units.units.values()) {
      if ((one.unitType === UNIT_TYPE_SUPPLYDEPOT) && (one.owner === Game.playerId) && (one.buildProgress >= 1)) {
        Jobs.releaseBuilder();
        this.transition("buildBarracks");
      }
    }
  }

  buildBarracks() {
    if (Game.minerals >= MINERALS_FOR_BARRACKS) {
      Command.build(Jobs.hireBuilder(), BUILD_BARRACKS, selectBarracksLocation());
      this.transition("waitForBarracks");
    }
  }

  waitForBarracks() {
    for (const one of Units.units.values()) {
      if ((one.unitType === UNIT_TYPE_BARRACKS) && (one.owner === Game.playerId) && (one.buildProgress >= 1)) {
        this.barracks = one;

        Jobs.releaseBuilder();
        this.transition("trainMarine");
      }
    }
  }

  trainMarine() {
    if (Game.loop < this.cooldown) return;

    if (Game.minerals >= MINERALS_FOR_MARINES) {
      Command.train(this.barracks, TRAIN_MARINE);

      this.cooldown = Game.loop + 10;
    }
  }

}

function selectSupplyDepotLocation() {
  const base = Units.base.pos;
  const rally = Units.base.rallyTargets[0].point;
  const dx = Math.sign(rally.x - base.x);
  const dy = Math.sign(rally.y - base.y);

  return { x: base.x + dx * 3.5, y: base.y + dy * 3.5 };
}

function selectBarracksLocation() {
  const base = Units.base.pos;
  const rally = Units.base.rallyTargets[0].point;
  const dx = Math.sign(rally.x - base.x);
  const dy = Math.sign(rally.y - base.y);

  return { x: base.x - dx * 4, y: base.y - dy * 4 };
}

export default new Build();
