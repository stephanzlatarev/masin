import Command from "./command.js";
import Units from "./units.js";

const TRAIN_SCV = 524;

class Build {

  start() {
    Command.train(Units.base, TRAIN_SCV);
  }

  sync() {
  }

}

export default new Build();
