import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import logger from "../logger.js";
import type { Command } from "../types/command.js";

export function createRestartCommand(): Command {
  return {
    data: new SlashCommandBuilder()
      .setName("restart")
      .setDescription("サーバーをシャットダウンし再起動します")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    requiredPermissions: [PermissionFlagsBits.Administrator],
    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.reply("再起動しています");
      logger.info(
        `サーバーを停止します${interaction.user.tag}:${interaction.user.id}によって実行されました`,
      );
      interaction.client.destroy();
    },
  };
}
