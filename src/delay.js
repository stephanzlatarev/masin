import Game from "./game.js";

class Delay {

  static NONE = 0;
  static SIMULATED = 1;
  static REAL = 2;

  mode = Delay.NONE;

  // Orders queue
  orders = new Map();
  after0 = [];
  after1 = [];
  after2 = [];

  real() {
    this.mode = Delay.REAL;
  }

  simulate() {
    this.mode = Delay.SIMULATED;
  }

  syncUnit(unit) {
    if (this.mode) {
      // Handle the real or simulated delay
      if (!unit.isWorker) return;
      if ((unit.owner !== 1) && (unit.owner !== 2)) return;

      if (unit.owner === Game.playerId) {
        unit.order = getDelayedOrder(this, unit);
      }

      if (unit.lastrealpos) {
        unit.pos = getDelayedPosition(this, unit);
      }
    } else {
      // There's no delay
      unit.order = unit.orders[0] || {};
    }
  }

  commands(commands) {
    const effective = (this.mode !== Delay.SIMULATED) ? commands : this.after0;

    if (this.mode) {
      this.after2 = [...commands];

      for (const command of commands) {
        for (const unitTag of command.unitTags) {
          let list = this.orders.get(unitTag);

          if (!list) {
            list = { after0: [], after1: [], after2: [] };
            this.orders.set(unitTag, list);
          }

          list.after2.push(command);
        }
      }
    }

    return effective;
  }

  step() {
    if (this.mode) {
      for (const list of this.orders.values()) {
        list.after0 = list.after1;
        list.after1 = list.after2;
        list.after2 = [];
      }
    }

    this.after0 = this.after1;
    this.after1 = this.after2;
    this.after2 = [];
  }

}

function getDelayedOrder(delay, unit) {
  const list = delay.orders.get(unit.tag);

  if (list) {
    return list.after0[0] || unit.orders[0] || {};
  } else {

  }
}

function getDelayedPosition(delay, unit) {
  const list = delay.orders.get(unit.tag);

  let pos = { x: unit.realpos.x, y: unit.realpos.y };

  if (list) {
    // Extrapolate the position of the unit two steps ahead
    const step = calculateDistance(unit.realpos, unit.lastrealpos);

    stepPosition(pos, step, list.after0);
    stepPosition(pos, step, list.after1);
  } else {
    const stepx = (unit.realpos.x - unit.lastrealpos.x);
    const stepy = (unit.realpos.y - unit.lastrealpos.y);

    pos.x += stepx + stepx;
    pos.y += stepy + stepy;
  }

  return pos;
}

function stepPosition(pos, step, orders) {
  for (const order of orders) {
    if (!order || !order.direction) continue;

    const distance = calculateDistance(pos, order.direction);

    if (distance === step) {
      pos.x = order.direction.x;
      pos.y = order.direction.y;
      break;
    } else if (distance < step) {
      pos.x = order.direction.x;
      pos.y = order.direction.y;

      step -= distance;
    } else {
      const fraction = step / distance;
      const dx = order.direction.x - pos.x;
      const dy = order.direction.y - pos.y;

      pos.x = pos.x + dx * fraction;
      pos.y = pos.y + dy * fraction;
      break;
    }
  }
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Delay();
