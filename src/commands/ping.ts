import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Container } from "typedi";

export default {
  data: new SlashCommandBuilder()
    // コマンドの名前
    .setName("ping")
    // コマンドの説明文
    .setDescription("Pingの値を返します"),
  async execute(interaction: CommandInteraction) {
    // 返信
    const runMode = Container.get<() => string>("runMode");
    const mode = runMode();
    await interaction.reply({
      embeds: [
        {
          title: "ping",
          description: `${mode}\nAPI Endpoint Ping: ...`,
        },
      ],
    });
    const msg = await interaction.fetchReply();
    await interaction.editReply({
      embeds: [
        {
          title: "ping",
          description: `${mode}\nAPI Endpoint Ping: ${msg.createdTimestamp - interaction.createdTimestamp}ms`,
        },
      ],
    });
  },
};
