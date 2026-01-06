import starcraft from "@node-sc2/proto";
import Commands from "./command.js";
import Delay from "./delay.js";
import Trace from "./trace.js";

class Game {

  client = starcraft();
  logCommands = false;
  showTrace = false;

  playerId = 1;
  loop = 0;
  units = [];
  enemy = { playerId: 2, x: 0, y: 0 };

  async connect() {
    const ladder = parseArguments(process.argv);

    if (ladder.ladderServer) {
      console.log("Connecting to ladder StarCraft II game...");
      await this.client.connect({ host: ladder.ladderServer, port: ladder.gamePort });

      let startPort = ladder.startPort + 1;

      const player = {};

      player.race = 1;
      player.options = { raw: true, score: true };
      player.sharedPort = startPort++;
      player.serverPorts = { gamePort: startPort++, basePort: startPort++ };
      player.clientPorts = [
        { gamePort: startPort++, basePort: startPort++ },
        { gamePort: startPort++, basePort: startPort++ },
      ];

      console.log("Joining game...");
      await this.client.joinGame(player);

      // Handle real ladder delay
      Delay.real();

      // Log commands on ladder
      this.logCommands = true;
    } else {
      console.log("Connecting to local StarCraft II game...");
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
      this.showTrace = true;

      // Simulate ladder delay
      Delay.simulate();
    }

    console.log("Playing...");
    const observation = await this.client.observation();
    const gameInfo = await this.client.gameInfo();
    const playableArea = gameInfo.startRaw.playableArea;

    this.left = playableArea.p0.x;
    this.top = playableArea.p0.y;
    this.right = playableArea.p1.x;
    this.bottom = playableArea.p1.y;

    this.enemy = gameInfo.startRaw.startLocations[0];
    this.units = observation.observation.rawData.units;

    this.playerId = observation.observation.playerCommon.playerId;
    this.enemy.playerId = (3 - this.playerId);

    console.log("Player:", this.playerId);
    console.log("Enemy:", JSON.stringify(this.enemy));
  }

  async run() {
    const commands = Delay.commands(Commands.commands);

    if (this.logCommands) {
      for (const command of commands) {
        console.log("[command]", JSON.stringify(command));
      }
    }

    if (this.showTrace) {
      await Trace.show();
    }

    await this.client.action({ actions: commands.map(command => ({ actionRaw: { unitCommand: command } })) });
    await this.client.step({ count: 1 });

    Commands.step();
    Delay.step();

    const response = await this.client.observation();
    const observation = response.observation;

    this.loop = observation.gameLoop;
    this.minerals = observation.playerCommon.minerals;
    this.units = observation.rawData.units;
  }

  async end() {
    await this.client.action({ actions: [{ actionChat: { channel: 1, message: "gg" } }] });
    await this.client.quit();
  }

}

function parseArguments(args) {
  const ladder = {};

  if (args && args.length) {
    for (let i = 0; i < args.length - 1; i++) {
      if (args[i] === "--LadderServer") {
        ladder.ladderServer = args[i + 1];
      } else if (args[i] === "--GamePort") {
        ladder.gamePort = parseInt(args[i + 1]);
      } else if (args[i] === "--StartPort") {
        ladder.startPort = parseInt(args[i + 1]);
      }
    }
  }

  return ladder;
}

export default new Game();
