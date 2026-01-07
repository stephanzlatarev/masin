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
    if (this.builderSupplyDepot) this.builderSupplyDepot = Units.get(this.builderSupplyDepot.tag);
    if (this.builderBarracks) this.builderBarracks = Units.get(this.builderBarracks.tag);

    this.act();
  }

  transition(mode) {
    this.act = this[mode].bind(this);

    console.log("[build]", mode);
  }

  buildSupplyDepot() {
    const depot = getBuilding(UNIT_TYPE_SUPPLYDEPOT);

    if (depot && this.builderSupplyDepot) return this.transition("waitForSupplyDepot");

    if (depot || (Game.minerals >= MINERALS_FOR_SUPPLYDEPOT)) {
      if (!this.builderSupplyDepot) this.builderSupplyDepot = Jobs.hireBuilder();

      if (depot) {
        Command.resume(this.builderSupplyDepot, depot);
      } else {
        Command.build(this.builderSupplyDepot, BUILD_SUPPLYDEPOT, selectSupplyDepotLocation());
      }
    }
  }

  waitForSupplyDepot() {
    const depot = getBuilding(UNIT_TYPE_SUPPLYDEPOT);

    if (depot && (depot.buildProgress >= 1)) {
      Jobs.releaseBuilder();
      this.transition("buildBarracks");
    } else if (!this.builderSupplyDepot) {
      this.transition("buildSupplyDepot");
    }
  }

  buildBarracks() {
    const barracks = getBuilding(UNIT_TYPE_BARRACKS);

    if (barracks && this.builderBarracks) return this.transition("waitForBarracks");

    if (barracks || (Game.minerals >= MINERALS_FOR_BARRACKS)) {
      if (!this.builderBarracks) this.builderBarracks = Jobs.hireBuilder();

      if (barracks) {
        Command.resume(this.builderBarracks, barracks);
      } else {
        Command.build(this.builderBarracks, BUILD_BARRACKS, selectBarracksLocation());
      }
    }
  }

  waitForBarracks() {
    const barracks = getBuilding(UNIT_TYPE_BARRACKS);

    if (barracks && (barracks.buildProgress >= 1)) {
      this.barracks = barracks;

      Jobs.releaseBuilder();
      this.transition("trainMarine");
    } else if (!this.builderBarracks) {
      this.transition("buildBarracks");
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

function getBuilding(type) {
  for (const one of Units.units.values()) {
    if ((one.unitType === type) && (one.owner === Game.playerId)) {
      return one;
    }
  }
}

export default new Build();
