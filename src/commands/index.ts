import type { Command } from "../types/command.js";
import pingCommand from "./ping.js";
import restartCommand from "./restart.js";
import testCommand from "./test.js";

export const commands: Command[] = [pingCommand, restartCommand, testCommand];
