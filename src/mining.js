import Command from "./command.js";
import Jobs from "./jobs.js";
import Strip from "./strip.js";

class Mining {

  sync() {
    if (!Strip.home) return;

    for (const worker of Jobs.miners) {
      if (!worker.order.abilityId) {
        Command.harvest(worker, Strip.home);
      }
    }
  }

}

export default new Mining();
