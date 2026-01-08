import Delay from "./delay.js";
import Game from "./game.js";

const IS_WORKER = { 45: true, 84: true, 104: true };
const IS_DEPOT = { 18: true, 59: true, 86: true };
const IS_SHOOTER = { 34: true, 35: true, 48: true };

const HAS_WEAPONS = {
  ...IS_WORKER,
  73: true,  // Zealot
  105: true, // Zergling
  289: true, // Broodling
};

const WEAPONS = {
  24: { range: 5, dps: 39.2 }, // Bunker with marines
  45: { range: 0.2, dps: 4.67 }, // SCV
  49: { range: 5, dps: 10.1 }, // Reaper
  48: { range: 5, dps: 9.8 }, // Marine
  66: { range: 7, dps: 22.4 }, // Photon cannon
  73: { range: 0.1, dps: 18.6 }, // Zealot
  84: { range: 0.2, dps: 4.67 }, // Probe
  98: { range: 7, dps: 18.9 }, // Spine crawler
  104: { range: 0.2, dps: 4.67 }, // Drone
  105: { range: 0.1, dps: 10 }, // Zergling
  110: { range: 4, dps: 11.2 }, // Roach
  126: { range: 5, dps: 11.2 }, // Queen
  289: { range: 0.1, dps: 7 }, // Broodling
  311: { range: 4, dps: 13.65 }, // Adept
};

class Units {

  base = null;
  units = new Map();
  workers = new Map();
  enemies = new Map();
  minerals = new Map();

  async sync() {
    const units = new Map();
    const workers = new Map();
    const shooters = new Map();
    const enemies = new Map();
    const minerals = new Map();

    for (const unit of Game.units) {
      unit.realpos = { x: unit.pos.x, y: unit.pos.y, z: unit.pos.z };

      if (IS_WORKER[unit.unitType]) {
        unit.isWorker = true;
      } else if (IS_SHOOTER[unit.unitType]) {
        unit.isShooter = true;
      } else if (unit.unitType === 105) {
        unit.isZergling = true;
      } else if ((unit.owner === 16) && (unit.radius > 1) && (unit.radius < 1.2)) {
        unit.isMineral = true;
      }

      if (HAS_WEAPONS[unit.unitType]) {
        unit.hasWeapons = true;
      }

      const previous = this.units.get(unit.tag);

      if (previous) {
        unit.lastrealpos = previous.realpos;
        unit.lastfacing = previous.facing;
      }

      Delay.syncUnit(unit);

      if (unit.owner === Game.playerId) {
        if (unit.isWorker) {
          workers.set(unit.tag, unit);
        } else if (unit.isShooter) {
          shooters.set(unit.tag, unit);
        } else if (IS_DEPOT[unit.unitType] || (unit.tag === this.base?.tag)) {
          this.base = unit;
        }

        units.set(unit.tag, unit);
      } else if (unit.owner === Game.enemy.playerId) {
        if (unit.buildProgress >= 1) unit.weapon = WEAPONS[unit.unitType];

        enemies.set(unit.tag, unit);
        units.set(unit.tag, unit);
      } else if (unit.isMineral) {
        minerals.set(unit.tag, unit);
      }
    }

    this.units = units;
    this.workers = workers;
    this.shooters = shooters;
    this.enemies = enemies;
    this.minerals = minerals;
  }

  get(tag) {
    return this.units.get(tag);
  }

  find(pos) {
    for (const unit of Game.units) {
      if ((unit.pos.x === pos.x) && (unit.pos.y === pos.y)) return unit;
    }
  }

}

export default new Units();
