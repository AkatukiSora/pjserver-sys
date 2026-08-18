import { Collection } from "discord.js";
import type { Command } from "../types/command.js";
import pingCommand from "./ping.js";
import restartCommand from "./restart.js";
import testCommand from "./test.js";

export const commandRegistry: readonly Command[] = [
  pingCommand,
  restartCommand,
  testCommand,
];
export function commandPayloads() {
  return commandRegistry.map((command) => command.data.toJSON());
}
export function createCommandCollection(): Collection<string, Command> {
  return new Collection(
    commandRegistry.map((command) => [command.data.name, command]),
  );
}
