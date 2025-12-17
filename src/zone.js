import Lane from "./lane.js";
import Game from "./game.js";
import project from "./projection.js";

class Zone {

  getBlindPath(section) {
    const p = project(section, Game.enemy);

    let yy = Game.enemy.y - 5;
    let dy = 1;
    let minx = Game.enemy.x;
    let maxx = Game.enemy.x + 10;

    if (p.y > Game.enemy.y) {
      // The blind path goes bottom
      yy = Game.enemy.y + 5;
      dy = -1;
    }

    if (p.x <= Game.enemy.x) {
      // ... and to the right
      maxx = Game.enemy.x + 10;
    } else {
      // ... and to the left
      minx = Game.enemy.x - 10;
    }

    let mineral;
    for (let i = 1, y = yy; !mineral && (i <= 3); i++, y += dy) {
      mineral = findMineral(minx, y, maxx, y);
    }

    return new Lane({ x: p.x, y: mineral.pos.y }, mineral.pos, mineral);
  }

}

function findMineral(minx, miny, maxx, maxy) {
  for (const unit of Game.units) {
    if (unit.owner !== 16) continue;
    if (unit.radius <= 1) continue;
    if (unit.radius >= 1.2) continue;
    if (unit.pos.x < minx) continue;
    if (unit.pos.x > maxx) continue;
    if (unit.pos.y < miny) continue;
    if (unit.pos.y > maxy) continue;

    return unit;
  }
}

export default new Zone();
