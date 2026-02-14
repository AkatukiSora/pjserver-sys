import {
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationCommandsResult,
  Routes,
} from "discord.js";
import logger from "./logger.js";
import type { Command } from "./types/command.js";

export interface DeployCommandsOptions {
  credential: string;
  clientID: string;
  guildID: string;
  commands: Command[];
}

export async function deployCommands({
  credential,
  clientID,
  guildID,
  commands,
}: DeployCommandsOptions): Promise<number> {
  const body: RESTPostAPIApplicationCommandsJSONBody[] = commands.map(
    (command) => command.data.toJSON(),
  );

  logger.info(`Started refreshing ${body.length} application (/) commands.`);

  const rest = new REST({ version: "10" }).setToken(credential);

  const data = (await rest.put(
    Routes.applicationGuildCommands(clientID, guildID),
    { body },
  )) as RESTPutAPIApplicationCommandsResult;

  if (!Array.isArray(data)) {
    throw new Error("The response from the API is not an array.");
  }

  if (data.length === 0) {
    throw new Error(
      "No commands were deployed. Please check your command definitions.",
    );
  }

  logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
  return data.length;
}
