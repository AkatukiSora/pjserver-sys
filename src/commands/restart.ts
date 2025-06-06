import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Container } from "typedi";

export default {
  data: new SlashCommandBuilder()
    // コマンドの名前
    .setName("restart")
    // コマンドの説明文
    .setDescription("サーバーをシャットダウンし再起動します"),
  async execute(interaction: CommandInteraction) {
    await interaction.reply("再起動しています");
    const logger = Container.get<{ info: (...args: unknown[]) => void }>("logger");
    logger.info(
      `サーバーを停止します${interaction.user.tag}:${interaction.user.id}によって実行されました`,
    );
    interaction.client.destroy();
  },
};
