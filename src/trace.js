import Game from "./game.js";
import Fist from "./fist.js";
import Route from "./route.js";

const text = [];
const shapes = [];

class Trace {

  on = false;

  async show() {
    if (!this.on) return;

    text.length = 0;
    shapes.length = 0;

    showZone();
    showRoute();
    showFist();
    showClench();

    for (let row = 0; row < text.length; row++) text[row] = { text: text[row], virtualPos: { x: 0, y: row } };
    for (const shape of shapes) text.push({ text: JSON.stringify(shape) });

    await Game.client.debug({ debug: [{ draw: { text } }] });
  }

}

function showZone() {
  let section;

  if (Route.complete) {
    section = Route.sections[Route.sections.length - 1];
  } else {
    section = Route.projected[0];
  }

  if (section) {
    const lane = section.blind;

    if (lane) {
      shapes.push({
        shape: "line",
        width: 0.5,
        x1: lane.a.x, y1: lane.a.y,
        x2: lane.b.x, y2: lane.b.y,
        color: "green",
      });
      shapes.push({
        shape: "arrow",
        width: 0.5,
        x1: lane.a.x, y1: lane.a.y,
        x2: lane.b.x, y2: lane.b.y,
        color: "yellow",
      });
    }
  }
}

function showRoute() {
  text.push("ROUTE -------------");

  for (const section of Route.sections) {
    shapes.push({
      shape: "line",
      width: 0.75,
      x1: section.a.x, y1: section.a.y,
      x2: section.b.x, y2: section.b.y,
      color: section.straight ? "gold" : "purple",
      opacity: section.straight ? 1 : 0.3,
    });
    text.push(
      (section.straight ? "=== " : "~~~ ") +
      threeletter("", Math.floor(section.a.x)) + ":" + threeletter("", Math.floor(section.a.y)) +
      " - " +
      section.length.toFixed(2) +
      " - " +
      section.direction
    );
  }

  text.push("");

  for (const section of Route.projected) {
    shapes.push({
      shape: "line",
      width: 0.75,
      x1: section.a.x, y1: section.a.y,
      x2: section.b.x, y2: section.b.y,
      color: "purple",
      opacity: 0.3,
    });
  }
}

function showFist() {
  const anchor = Fist.workers[0];
  if (!anchor) return;

  const mode = ("          " + Fist.mode).slice(-7);
  text.push("FIST       " + mode + " | HP | Margin");
  for (const worker of Fist.workers) {
    const line = [
      worker.tag,
      threeletter("", Math.floor(worker.pos.x)) + ":" + threeletter("", Math.floor(worker.pos.y)),
      "|", Math.floor(worker.health),
      "|", Math.abs(calculateDistance(worker.pos, anchor.pos)).toFixed(2),
    ];

    text.push(line.join(" "));
  }
  text.push("");

  if (Route.section) {
    shapes.push({
      shape: "line",
      width: 0.5,
      x1: Route.section.a.x, y1: Route.section.a.y,
      x2: Route.section.b.x, y2: Route.section.b.y,
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

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

export default new Trace();
