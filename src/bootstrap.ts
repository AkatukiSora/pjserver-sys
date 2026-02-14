import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { commands } from "./commands/index.js";
import { loadConfig } from "./config.js";
import { deployCommands } from "./deploy-commands.js";
import { registerClientEvents } from "./events/register-events.js";
import { initWelcomeImageAssets } from "./functions/welcomeimage.js";
import { loadCommands } from "./interaction.js";
import logger from "./logger.js";

export async function bootstrap(): Promise<void> {
  const config = loadConfig();

  initWelcomeImageAssets();

  await deployCommands({
    credential: config.credential,
    clientID: config.clientID,
    guildID: config.guildID,
    commands,
  });

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  });

  loadCommands(client);
  registerClientEvents(client, config);

  logger.info(`ボット起動モード: ${config.mode}`);
  await client.login(config.credential);
}
