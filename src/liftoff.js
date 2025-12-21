import Command from "./command.js";
import Units from "./units.js";

class Liftoff {

  sync() {
    if (Units.base.isFlying) {
      if (!areThreatsNearby()) {
        Command.land(Units.base);
      }
    } else {
      if (areThreatsNearby()) {
        Command.lift(Units.base);
      }
    }
  }

}

function areThreatsNearby() {
  let worker;

  for (const enemy of Units.enemies.values()) {
    if (enemy.isFlying) continue; // Overlords are okay and nothing else flies this early
    if (Math.abs(Units.base.pos.x - enemy.pos.x) > 12) continue;
    if (Math.abs(Units.base.pos.y - enemy.pos.y) > 12) continue;

    if (worker) {
      // This is a second enemy unit. It's a threat.
      return true;
    } else if (!enemy.isWorker) {
      // This is not a worker. It's definitely a threat.
      return true;
    } else {
      // This is the first enemy worker. If it's alone then it's not a threat.
      worker = enemy;
    }
  }
}

export default new Liftoff();
