import Game from "./game.js";
import Fist from "./fist.js";
import Lane from "./lane.js";
import Strip from "./strip.js";
import Units from "./units.js";
import Zone from "./zone.js";

const text = [];
const shapes = [];

class Trace {

  async show() {
    text.length = 0;
    shapes.length = 0;

    showZone();
    showStrip();
    showFist();
    showClench();

    for (let row = 0; row < text.length; row++) text[row] = { text: text[row], virtualPos: { x: 0, y: row } };
    for (const shape of shapes) text.push({ text: JSON.stringify(shape) });

    await Game.client.debug({ debug: [{ draw: { text } }] });
  }

}

function showZone() {
  const showBox = function(box, color) {
    shapes.push({
      shape: "polygon",
      points: [
        box.left - 0.1, box.top - 0.1,
        box.right + 0.1, box.top - 0.1,
        box.right + 0.1, box.bottom + 0.1,
        box.left - 0.1, box.bottom + 0.1,
      ],
      filled: true,
      color,
    });
  }

  showBox(Zone.front.main, "#00DD00");
  showBox(Zone.center.main, "#00DDDD");
  showBox(Zone.back.main, "#0000DD");

  let shade = 255;
  for (const lane of Lane.enemyHarvestLanes) {
    shade -= 10;

    const target = lane.getTarget();
    const color = target ? "black" : `rgb(${shade},${shade},${shade})`;

    shapes.push({
      shape: "line",
      width: 0.375,
      x1: lane.a.x, y1: lane.a.y,
      x2: lane.b.x, y2: lane.b.y,
      opacity: 1,
      color,
    });

    for (const unit of Units.enemies.values()) {
      if (!unit.isWorker) continue;
      if (!lane.includes(unit.pos)) continue;

      const color = (unit === target) ? "black" : "green";

      shapes.push({
        shape: "circle",
        r: 0.45,
        x: unit.realpos.x, y: unit.realpos.y,
        filled: false,
        width: 0.05,
        opacity: 1,
        color: "white",
      });
      shapes.push({
        shape: "circle",
        r: 0.5,
        x: unit.pos.x, y: unit.pos.y,
        filled: false,
        width: 0.05,
        opacity: 1,
        color,
      });
    }
  }
}

function showStrip() {
  if (Strip.length) {
    shapes.push({
      shape: "line",
      width: 0.75,
      x1: Strip.mineral.pos.x, y1: Strip.mineral.pos.y,
      x2: Strip.ramp.x, y2: Strip.ramp.y,
      color: "gold",
      opacity: 1,
    });
  }
}

function showFist() {
  if (!Fist.workers || !Fist.workers[0]) return;

  const workers = [...Fist.workers];
  const clenching = (Fist.mode === "clench");

  if (clenching) {
    workers.sort((a, b) => (a.projection?.s - b.projection?.s));
  }

  const mode = ("          " + Fist.mode).slice(-7);
  text.push("FIST       " + mode + " | HP" + (clenching ? " |  s   |  h   | side" : ""));

  for (const worker of workers) {
    const line = [
      worker.tag,
      threeletter("", Math.floor(worker.pos.x)) + ":" + threeletter("", Math.floor(worker.pos.y)),
      "|", Math.floor(worker.health),
    ];

    if (worker.projection) {
      line.push("|", (worker.projection.s - workers[0].projection.s).toFixed(2));
      line.push("|", worker.projection.h.toFixed(2));

      if (Strip.isWorkerNearStrip(worker)) {
        if (worker.projection.a === Strip.side) {
          line.push("|", "in");
        } else {
          line.push("|", "out");
        }
      }
    }

    text.push(line.join(" "));

    shapes.push({
      shape: "circle",
      r: 0.45,
      x: worker.realpos.x, y: worker.realpos.y,
      filled: false,
      width: 0.05,
      opacity: 1,
      color: "white",
    });
    shapes.push({
      shape: "circle",
      r: 0.5,
      x: worker.pos.x, y: worker.pos.y,
      filled: false,
      width: 0.05,
      opacity: 1,
      color: "black",
    });
  }
  text.push("");

  if (Strip.length) {
    shapes.push({
      shape: "line",
      width: 0.5,
      x1: Strip.mineral.pos.x, y1: Strip.mineral.pos.y,
      x2: Strip.ramp.x, y2: Strip.ramp.y,
      color: getFistColor(),
      opacity: 1,
    });
  }
}

function getFistColor() {
  switch (Fist.mode) {
    case "move": return "yellow";
    case "clench": return "blue";
    case "seek": return "red";
    case "cooldown": return "black";
    case "repair": return "green";
    default: return "white";
  }
}

function showClench() {
  if (!Fist.workers) return;

  for (const worker of Fist.workers) {
    if (!worker.projection) continue;

    shapes.push({
      shape: "line",
      width: 0.2,
      x1: worker.pos.x, y1: worker.pos.y,
      x2: worker.projection.x, y2: worker.projection.y,
      color: (worker.projection.s > 0) ? "green" : "red",
      opacity: 1,
    });
  }
}

function threeletter(tab, text) {
  if (!text) return tab + "  -";

  if (text >= 0) {
    if (text > 999) return tab + "999";
    if (text > 99) return tab + text;
    if (text > 9) return tab + " " + text;
    return tab + "  " + text;
  } else if (text.length > 0) {
    if (text.length > 3) return tab + text.slice(0, 3);
    if (text.length === 3) return tab + text;
    if (text.length === 2) return tab + " " + text;
    return tab + "  " + text;
  }

  return tab + " X ";
}

export default new Trace();
