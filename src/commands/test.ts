import {
  EmbedBuilder,
  AttachmentBuilder,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Container } from "typedi";

export default {
  data: new SlashCommandBuilder()
    // コマンドの名前
    .setName("test")
    // コマンドの説明文
    .setDescription("ウェルカム画像を生成します"),
  async execute(interaction: CommandInteraction) {
    // 返信
    //interaction.deferReply();
    const welcomeimage = Container.get<
      (user: string, avatar: string) => Promise<Buffer>
    >("welcomeimage");
    const attachment = new AttachmentBuilder(
      await welcomeimage(
        interaction.user.displayName,
        interaction.user.displayAvatarURL({ extension: "png" }),
      ),
    ).setName("welcome-image.png");
    const embed = new EmbedBuilder()
      .setTitle("welcome to プロセカ民営公園")
      .setImage("attachment://welcome-image.png")
      .setDescription(
        `ようこそ！<@${interaction.user.id}>さん！\n\n※サーバーガイドはチャンネル一覧の一番上にあります\n\nサーバーガイドに従ってやるべきことを片付けましょう\n特に <#942837557807419482> で挨拶をすることはコミュニティになじむ第一歩です\n気楽にいきましょう`,
      );
    await interaction.reply({
      content: `<@${interaction.user.id}>`,
      embeds: [embed],
      files: [attachment],
    });
  },
};
