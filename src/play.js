import Game from "./game.js";
import Hire from "./hire.js";
import Fist from "./fist.js";
import Lane from "./lane.js";
import Liftoff from "./liftoff.js";
import Route from "./route.js";
import Trace from "./trace.js";
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

async function play() {
  await Game.connect();

  Lane.start();
  Route.start();
  Hire.start();

  while (true) {
    Units.sync();

    if (Fist.workers.length < 9) {
      // We lost our fist
      await Game.end();
      break;
    }

    Lane.sync();
    Route.sync();
    Hire.sync();
    Fist.sync();
    Liftoff.sync();

    await Game.run();
    await Trace.show();
  }
}

play();
