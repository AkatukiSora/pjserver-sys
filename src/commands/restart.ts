import { CommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        // コマンドの名前
        .setName("restart")
        // コマンドの説明文
        .setDescription("サーバーをシャットダウンし再起動します"),
    async execute(interaction: CommandInteraction) {
        const logger = require('../logger')
        await interaction.reply("再起動しています");
        logger.info(`サーバーを停止します${interaction.user.tag}:${interaction.user.id}によって実行されました`)
        interaction.client.destroy()
    },
};
