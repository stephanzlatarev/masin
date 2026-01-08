import Command from "./command.js";
import Game from "./game.js";
import Jobs from "./jobs.js";
import Strip from "./strip.js";
import Units from "./units.js";

const FIRE_RANGE = 5;
const STAND_RANGE = 8;
const SUPPORT_RANGE = 10;
const MIN_SUPPORT = 3;
const MAX_SUPPORT = 7;

class Shoot {

  sync() {
    for (const shooter of Jobs.shooters) {
      const target = selectTarget(shooter, unit => !!unit.weapon) || selectTarget(shooter);

      if (target) {
        if (target.distance > STAND_RANGE) {
          // Get closer to the target
          Command.move(shooter, target.pos);
        } else if (target.weapon && (target.weapon.range <= FIRE_RANGE) && shooter.weaponCooldown) {
          // Shooter is on cooldown and the enemy cannot attack it immediately. Keep the distance.
          Command.move(shooter, Strip.home.pos);
        } else if (target.weapon && (target.weapon.range > FIRE_RANGE) && !hasSupport(target)) {
          // Shooter is on cooldown and the enemy cannot attack it immediately. Keep the distance.
          Command.move(shooter, Strip.home.pos);
        } else {
          // Attack the target
          Command.attack(shooter, target);
        }
      } else if (!shooter.order.abilityId) {
        // Seek and destroy
        const x = Game.left + (Game.right - Game.left) * Math.random();
        const y = Game.top + (Game.bottom - Game.top) * Math.random();

        Command.move(shooter, { x, y });
      }
    }
  }

}

function selectTarget(shooter, filter) {
  let bestTarget;
  let bestRange = Infinity;

  for (const enemy of Units.enemies.values()) {
    if (filter && !filter(enemy)) continue;

    const distance = calculateDistance(enemy.pos, shooter.pos, enemy.pos) - shooter.radius - enemy.radius;
    const range = enemy.weapon ? distance - enemy.weapon.range : distance;

    if (range < bestRange) {
      bestTarget = enemy;
      bestTarget.distance = distance;
      bestRange = range;
    }
  }

  return bestTarget;
}

function hasSupport(target) {
  let supporters = 0;

  for (const shooter of Jobs.shooters) {
    if (calculateDistance(shooter.pos, target.pos) < SUPPORT_RANGE) {
      supporters++;
    }
  }

  return (supporters >= Math.max(MIN_SUPPORT, Math.ceil(MAX_SUPPORT * target.health / target.healthMax)));
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Shoot();
