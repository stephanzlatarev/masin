import Fist from "./fist.js";

const MAX_MARGIN = 0.2;

export default class Lane {

  constructor(start, end, target) {
    this.a = start;
    this.b = end;
    this.target = target;
  }

  inside() {
    const fist = Fist.pos;
    const a = this.a;
    const b = this.b;

    if (a.x === b.x) {
      const miny = Math.min(a.y, b.y);
      const maxy = Math.max(a.y, b.y);

      return (fist.y >= miny) && (fist.y <= maxy) && (Math.abs(fist.x - a.x) < MAX_MARGIN);
    } else if (a.y === b.y) {
      const minx = Math.min(a.x, b.x);
      const maxx = Math.max(a.x, b.x);

      return (fist.x >= minx) && (fist.x <= maxx) && (Math.abs(fist.y - a.y) < MAX_MARGIN);
    } else {
      throw new Error("Implement projection check!");
    }
  }

}
