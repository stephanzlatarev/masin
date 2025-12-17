import Command from "./command.js";
import Fist from "./fist.js";
import Route from "./route.js";

class Intercept {

  // The next lane to take
  crossing;

  move() {
    if (this.crossing && this.crossing.inside()) {
      Command.head(Fist.workers, this.crossing.target);
    } else {
      Command.head(Fist.workers, Route.destination);

      this.crossing = Route.section?.blind;
    }
  }

}

export default new Intercept();
