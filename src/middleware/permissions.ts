import type { ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../types/command.js";

export function hasRequiredPermissions(
  interaction: ChatInputCommandInteraction,
  command: Command,
): boolean {
  if (!command.requiredPermissions?.length) {
    return true;
  }

  return (
    interaction.memberPermissions?.has(command.requiredPermissions) ?? false
  );
}
