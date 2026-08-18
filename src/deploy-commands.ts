import {
  REST,
  Routes,
  type RESTPutAPIApplicationCommandsResult,
} from "discord.js";
import { commandPayloads } from "./commands/registry.js";
import type { AppConfig } from "./config.js";
import logger from "./logger.js";

export async function deployCommand(config: AppConfig): Promise<void> {
  const commands = commandPayloads();
  const rest = new REST({ version: "10" }).setToken(config.credential);
  logger.info(
    `Started refreshing ${commands.length} application (/) commands.`,
  );
  const data = (await rest.put(
    Routes.applicationGuildCommands(config.clientID, config.guildID),
    { body: commands },
  )) as RESTPutAPIApplicationCommandsResult;
  if (!Array.isArray(data))
    throw new Error("The response from the API is not an array.");
  if (data.length === 0)
    logger.warn(
      "No commands were deployed. Please check your command definitions.",
    );
  logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
}
