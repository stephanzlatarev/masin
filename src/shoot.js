import Command from "./command.js";
import Game from "./game.js";
import Jobs from "./jobs.js";
import Units from "./units.js";

class Shoot {

  sync() {
    for (const shooter of Jobs.shooters) {
      if (!shooter.order.abilityId) {
        const target = selectTarget(shooter);

        if (target) {
          Command.amove([shooter], target.pos);
        } else {
          const x = Game.left + (Game.right - Game.left) * Math.random();
          const y = Game.top + (Game.bottom - Game.top) * Math.random();

          Command.amove([shooter], { x, y });
        }
      }
    }
  }

}

function selectTarget(shooter) {
  let bestTarget;
  let bestDistance = Infinity;

  for (const enemy of Units.enemies.values()) {
    const distance = Math.abs(enemy.pos.x - shooter.pos.x) + Math.abs(enemy.pos.y - shooter.pos.y);

    if (distance < bestDistance) {
      bestTarget = enemy;
      bestDistance = distance;
    }
  }

  return bestTarget;
}

export default new Shoot();
