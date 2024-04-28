const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    // コマンドの名前
    .setName("ping")
    // コマンドの説明文
    .setDescription("Pingの値を返します"),
  async execute(interaction) {
    // 返信
    await interaction.reply({
      embeds: [
        {
          title: "ping",
          description: "API Endpoint Ping: ...",
        },
      ],
    });
    let msg = await interaction.fetchReply();
    await interaction.editReply({
      embeds: [
        {
          title: "ping",
          description: `API Endpoint Ping: ${msg.createdTimestamp - interaction.createdTimestamp}ms`,
        },
      ],
    });
  },
};
