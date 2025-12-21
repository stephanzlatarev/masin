import project from "./projection.js";

class Strip {

  // The mineral at enemy base used to mineral walk in
  mineral;

  // The last point in enemy base on the strip
  ramp;

  // The mineral at home base used to mineral walk out
  home;

  // The distance between the ramp point and the mineral at enemy base
  length;

  projection(unit) {
    return project(this.ramp, this.mineral.pos, this.length, unit.pos);
  }

}

export default new Strip();
