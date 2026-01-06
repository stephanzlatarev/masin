import Build from "./build.js";
import Defense from "./defense.js";
import Game from "./game.js";
import Jobs from "./jobs.js";
import Fist from "./fist.js";
import Lane from "./lane.js";
import Liftoff from "./liftoff.js";
import Route from "./route.js";
import Units from "./units.js";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;

const print = console.log;

console.log = function() {
  const minutes = Math.floor(Game.loop / LOOPS_PER_MINUTE);
  const seconds = Math.floor(Game.loop / LOOPS_PER_SECOND) % 60;
  const mm = (minutes >= 10) ? minutes : "0" + minutes;
  const ss = (seconds >= 10) ? seconds : "0" + seconds;

  print(`${mm}:${ss}/${Game.loop}`, ...arguments);
}

export default async function() {
  await Game.connect();

  Units.sync();
  Lane.start();
  Route.start();
  Jobs.start();
  Build.start();

  while (true) {
    Units.sync();

    Lane.sync();
    Route.sync();
    Jobs.sync();
    Fist.sync();
    Defense.sync();
    Liftoff.sync();

    if (!Jobs.fist.length) {
      // We lost our fist
      await Game.end();
      break;
    }

    await Game.run();
  }
}
