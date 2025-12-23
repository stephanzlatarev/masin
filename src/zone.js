import Game from "./game.js";
import Lane from "./lane.js";
import Strip from "./strip.js";

class Zone {

  depot = new Box();
  front = new Area();
  center = new Area();
  back = new Area();

  init() {
    const depot = new Box(Game.enemy.x - 2.5, Game.enemy.y - 2.5, Game.enemy.x + 2.5, Game.enemy.y + 2.5);
    const mainCenter = getCenter();
    const addonCenter = mainCenter.clone();
    const mainHorizontal = mainCenter.clone();
    const addonHorizontal = new Box(Game.enemy.x - 1.5, 0, Game.enemy.x + 1.5, 0);
    const mainVertical = mainCenter.clone();
    const addonVertical = new Box(0, Game.enemy.y - 1.5, 0, Game.enemy.y + 1.5);

    if (mainCenter.left < Game.enemy.x) {
      // Center zone is on the left side
      mainHorizontal.left = mainCenter.right;
      mainHorizontal.right = Game.enemy.x + 10;

      addonCenter.left = mainCenter.right;
      addonCenter.right = mainCenter.right + 1;

      addonVertical.left = mainCenter.right;
      addonVertical.right = mainCenter.right + 1;
    } else {
      // Center zone is on the right side
      mainHorizontal.left = Game.enemy.x - 10;
      mainHorizontal.right = mainCenter.left;

      addonCenter.left = mainCenter.left - 1;
      addonCenter.right = mainCenter.left;

      addonVertical.left = mainCenter.left - 1;
      addonVertical.right = mainCenter.left;
    }

    if (mainCenter.top < Game.enemy.y) {
      // Center zone is on the top side
      mainVertical.top = mainCenter.bottom;
      mainVertical.bottom = Game.enemy.y + 10;

      addonCenter.top = mainCenter.bottom;
      addonCenter.bottom = mainCenter.bottom + 1;

      addonHorizontal.top = mainCenter.bottom;
      addonHorizontal.bottom = mainCenter.bottom + 1;
    } else {
      // Center zone is on the bottom side
      mainVertical.top = Game.enemy.y - 10;
      mainVertical.bottom = mainCenter.top;

      addonCenter.top = mainCenter.top - 1;
      addonCenter.bottom = mainCenter.top;

      addonHorizontal.top = mainCenter.top - 1;
      addonHorizontal.bottom = mainCenter.top;
    }

    this.depot = depot;
    this.center = new Area(mainCenter, addonCenter);

    if (Math.abs(Strip.ramp.x - Game.enemy.x) > Math.abs(Strip.ramp.y - Game.enemy.y)) {
      this.front = new Area(mainHorizontal, addonHorizontal);
      this.back = new Area(mainVertical, addonVertical);
    } else {
      this.front = new Area(mainVertical, addonVertical);
      this.back = new Area(mainHorizontal, addonHorizontal);
    }
  }

  includes(point) {
    const pos = point.pos || point;

    return this.front.includes(pos) || this.center.includes(pos) || this.back.includes(pos) || this.depot.includes(pos);
  }
}

class Area {

  constructor(main, addon) {
    this.main = main ? main.clone() : new Box();
    this.addon = addon ? addon.clone() : new Box();
  }

  includes(point) {
    const pos = point.pos || point;

    return (this.main.includes(pos) || this.addon.includes(pos));
  }

  getSide(point) {
    if (!this.main || !this.addon) return;

    const pos = point.pos || point;
    const zx = this.addon.x - this.main.x;
    const zy = this.addon.y - this.main.y;
    const px = pos.x - this.main.x;
    const py = pos.y - this.main.y;

    return Math.sign(zy * px - zx * py);
  }

}

class Box {

  constructor(left, top, right, bottom) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;

    this.x = (left + right) / 2;
    this.y = (top + bottom) / 2;
  }

  includes(point) {
    const pos = point.pos || point;

    return (pos.x >= this.left) && (pos.x <= this.right) && (pos.y >= this.top) && (pos.y <= this.bottom);
  }

  clone() {
    return new Box(this.left, this.top, this.right, this.bottom);
  }

}

function getCenter() {
  let sumx = 0;
  let sumy = 0;

  for (const lane of Lane.enemyHarvestLanes) {
    sumx += lane.mineral.pos.x;
    sumy += lane.mineral.pos.y;
  }

  const x = Game.enemy.x + ((Game.enemy.x < (sumx / Lane.enemyHarvestLanes.length)) ? 5.5 : -5.5);
  const y = Game.enemy.y + ((Game.enemy.y < (sumy / Lane.enemyHarvestLanes.length)) ? 5.5 : -5.5);

  return new Box(x - 3, y - 3, x + 3, y + 3);
}

export default new Zone();
