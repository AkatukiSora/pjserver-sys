import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import isBotOwner from "../functions/isBotOwner.js";

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    // コマンドの名前
    .setName("manage")
    // コマンドの説明文
    .setDescription("bot管理用コマンドです"),
  async execute(interaction: CommandInteraction) {
    // 返信
    if (isBotOwner(interaction.user.id)) {
      await interaction.reply({
        embeds: [
          {
            title: "エラー",
            description: "権限が足りません",
          },
        ],
      });
    }
  },
};
