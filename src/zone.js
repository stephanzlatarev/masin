import Lane from "./lane.js";
import Game from "./game.js";

class Zone {

  depot = new Box();
  front = new Box();
  center = new Box();
  back = new Box();

  init(ramp) {
    const center = getCenter();
    const horizontal = new Box(center.left, center.top, center.right, center.bottom);
    const vertical = new Box(center.left, center.top, center.right, center.bottom);
    const adx = Math.abs(ramp.x - Game.enemy.x);
    const ady = Math.abs(ramp.y - Game.enemy.y);

    this.center = center;

    if (this.center.left < Game.enemy.x) {
      // Center zone is on the left side
      horizontal.left = center.right;
      horizontal.right = Game.enemy.x + 10;
    } else {
      // Center zone is on the right side
      horizontal.left = Game.enemy.x - 10;
      horizontal.right = center.left;
    }

    if (this.center.top < Game.enemy.y) {
      // Center zone is on the top side
      vertical.top = center.bottom;
      vertical.bottom = Game.enemy.y + 10;
    } else {
      // Center zone is on the bottom side
      vertical.top = Game.enemy.y - 10;
      vertical.bottom = center.top;
    }

    if (adx > ady) {
      this.front = horizontal;
      this.back = vertical;
    } else {
      this.front = vertical;
      this.back = horizontal;
    }

    this.depot = new Box(Game.enemy.x - 2.5, Game.enemy.y - 2.5, Game.enemy.x + 2.5, Game.enemy.y + 2.5);
  }

  includes(pos) {
    return this.front.includes(pos) || this.center.includes(pos) || this.back.includes(pos) || this.depot.includes(pos);
  }
}

class Box {

  constructor(left, top, right, bottom) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }

  includes(pos) {
    return (pos.x >= this.left) && (pos.x <= this.right) && (pos.y >= this.top) && (pos.y <= this.bottom);
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
