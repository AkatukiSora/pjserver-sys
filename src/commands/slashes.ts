import type { CommandInteraction } from "discord.js";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";
import runMode from "../utils/runMode.js";
import generateWelcomeImage from "../utils/welcomeimage.js";
import logger from "../utils/logger.js";
import { bot } from "../main.js";

@Discord()
export class Commands {
  @Slash({ description: "Pingの値を返します" })
  async ping(interaction: CommandInteraction): Promise<void> {
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
  }

  @Slash({ description: "サーバーをシャットダウンし再起動します" })
  async restart(interaction: CommandInteraction): Promise<void> {
    await interaction.reply("再起動しています");
    logger.info(
      `サーバーを停止します${interaction.user.tag}:${interaction.user.id}によって実行されました`
    );
    bot.destroy();
  }

  @Slash({ description: "ウェルカム画像を生成します" })
  async test(interaction: CommandInteraction): Promise<void> {
    // 返信
    const attachment = new AttachmentBuilder(
      await generateWelcomeImage(
        interaction.user.displayName,
        interaction.user.displayAvatarURL({ extension: "png" })
      )
    ).setName("welcome-image.png");
    
    const embed = new EmbedBuilder()
      .setTitle("welcome to プロセカ民営公園")
      .setImage("attachment://welcome-image.png")
      .setDescription(
        `ようこそ！<@${interaction.user.id}>さん！\n\n※サーバーガイドはチャンネル一覧の一番上にあります\n\nサーバーガイドに従ってやるべきことを片付けましょう\n特に <#942837557807419482> で挨拶をすることはコミュニティになじむ第一歩です\n気楽にいきましょう`
      );

    await interaction.reply({
      embeds: [embed],
      files: [attachment],
    });
  }
}
