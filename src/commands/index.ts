import type { AppConfig } from "../config.js";
import type { WelcomeImageGenerator } from "../features/welcome/image-generator.js";
import type { Command } from "../types/command.js";
import { createPingCommand } from "./ping.js";
import { createRestartCommand } from "./restart.js";
import { createTestCommand } from "./test.js";

export function createCommands(
  config: AppConfig,
  welcomeImageService: WelcomeImageGenerator,
): Command[] {
  return [
    createPingCommand(config),
    createRestartCommand(),
    createTestCommand(welcomeImageService),
  ];
}
