import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import logger from "../logger.js";

export default {
  data: new SlashCommandBuilder()
    // コマンドの名前
    .setName("restart")
    // コマンドの説明文
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
