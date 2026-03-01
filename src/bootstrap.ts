import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { createCommands } from "./commands/index.js";
import { loadConfig } from "./config.js";
import { deployCommands } from "./deploy-commands.js";
import { registerClientEvents } from "./events/register-events.js";
import { loadCommands } from "./interaction.js";
import { registerProcessLifecycleHandlers } from "./lifecycle.js";
import logger from "./logger.js";
import { createWelcomeImageService } from "./features/welcome/image-generator.js";
import { InMemoryCooldownRepository } from "./repositories/cooldown-repository.js";
import { InMemoryMemberProfileRepository } from "./repositories/member-profile-repository.js";

export async function bootstrap(): Promise<void> {
  const config = loadConfig();
  const welcomeImageService = createWelcomeImageService();
  const commands = createCommands(config, welcomeImageService);

  welcomeImageService.init();

  await deployCommands({
    credential: config.credential,
    clientID: config.clientID,
    guildID: config.guildID,
    commands,
  });

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  });
  const context = {
    config,
    welcomeImageService,
    cooldownRepository: new InMemoryCooldownRepository(),
    memberProfileRepository: new InMemoryMemberProfileRepository(),
  };

  loadCommands(client, commands);
  await registerClientEvents(client, context);
  registerProcessLifecycleHandlers(client);

  logger.info(`ボット起動モード: ${config.mode}`);
  await client.login(config.credential);
}
