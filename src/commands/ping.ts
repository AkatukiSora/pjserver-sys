import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getRunModeLabel, type AppConfig } from "../config.js";
import type { Command } from "../types/command.js";

export function createPingCommand(config: AppConfig): Command {
  return {
    data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Pingの値を返します"),
    async execute(interaction: ChatInputCommandInteraction) {
      const modeLabel = getRunModeLabel(config.mode);
      await interaction.reply({
        embeds: [
          {
            title: "ping",
            description: `${modeLabel}\nAPI Endpoint Ping: ...`,
          },
        ],
      });

      const message = await interaction.fetchReply();
      await interaction.editReply({
        embeds: [
          {
            title: "ping",
            description: `${modeLabel}\nAPI Endpoint Ping: ${message.createdTimestamp - interaction.createdTimestamp}ms`,
          },
        ],
      });
    },
  };
}
