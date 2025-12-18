import starcraft from "@node-sc2/proto";
import Commands from "./command.js";
import Trace from "./trace.js";

class Game {

  client = starcraft();

  loop = 0;
  units = [];
  enemy = { x: 0, y: 0 };

  async connect() {
    console.log("Connecting to StarCraft II game...");

    for (let i = 0; i < 12; i++) {
      try {
        await this.client.connect({ host: "127.0.0.1", port: 5000 });
        break;
      } catch (_) {
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    console.log("Joining game...");
    await this.client.joinGame({ race: 1, options: { raw: true, score: true } });

    console.log("Tracing...");
    Trace.on = true;

    console.log("Playing...");
    const gameInfo = await this.client.gameInfo();
    const playableArea = gameInfo.startRaw.playableArea;

    this.left = playableArea.p0.x;
    this.top = playableArea.p0.y;
    this.right = playableArea.p1.x;
    this.bottom = playableArea.p1.y;

    this.enemy = gameInfo.startRaw.startLocations[0];
    this.units = (await this.client.observation()).observation.rawData.units;
  }

  async run() {
    await this.client.action({ actions: Commands.actions() });
    await this.client.step({ count: 1 });

    Commands.clear();

    const response = await this.client.observation();
    const observation = response.observation;

    this.loop = observation.gameLoop;
    this.units = observation.rawData.units;
  }

  async end() {
    await this.client.action({ actions: [{ actionChat: { channel: 1, message: "gg" } }] });
    await this.client.quit();
  }

}

export default new Game();
