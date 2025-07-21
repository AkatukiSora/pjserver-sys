import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";
import { AttachmentBuilder, EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import generateWelcomeImage from "../utils/welcomeimage.js";
import logger from "../utils/logger.js";

@Discord()
export class CommonEvents {
  @On()
  messageDelete([message]: ArgsOf<"messageDelete">, client: Client): void {
    logger.info("Message Deleted", client.user?.username, message.content);
  }

  @On()
  async guildMemberAdd([member]: ArgsOf<"guildMemberAdd">): Promise<void> {
    // ウェルカム画像を生成
    const attachment = new AttachmentBuilder(
      await generateWelcomeImage(
        member.user.displayName,
        member.user.displayAvatarURL({ extension: "png" })
      )
    ).setName("welcome-image.png");

    // ウェルカムメッセージのEmbedを作成
    const embed = new EmbedBuilder()
      .setTitle("welcome to プロセカ民営公園")
      .setImage("attachment://welcome-image.png")
      .setDescription(
        `ようこそ！<@${member.user.id}>さん！\n\n※サーバーガイドはチャンネル一覧の一番上にあります\n\nサーバーガイドに従ってやるべきことを片付けましょう\n特に <#942837557807419482> で挨拶をすることはコミュニティになじむ第一歩です\n気楽にいきましょう`
      );

    // ウェルカムメッセージを送信するチャンネルを取得 (TODO: 環境変数から設定可能にする)
    const targetChannel = member.guild.channels.cache.get("853904783000469535");

    // チャンネルが存在し、かつテキストチャンネルであるかを確認
    if (targetChannel instanceof TextChannel) {
      await targetChannel.send({
        content: `<@${member.user.id}>`,
        embeds: [embed],
        files: [attachment],
      });
    } else {
      // チャンネルが見つからない、またはテキストチャンネルでない場合のエラーログ
      logger.error(
        "指定されたwelcomeチャンネルが見つからないか、テキストチャンネルではありません。"
      );
    }
  }

  @On()
  clientReady([client]: ArgsOf<"ready">): void {
    if (client.user) {
      logger.info(`ログイン成功: User=${client.user.tag}`);
      client.user.setActivity("多分正常稼働中"); // ボットのステータスを設定
    } else {
      logger.fatal("ログイン失敗: クライアントユーザーが見つかりませんでした。");
      process.exit(1); // ログイン失敗時はプロセスを終了
    }
  }

  @On()
  warn([warn]: ArgsOf<"warn">): void {
    logger.warn(`[WARN] Discord.js警告: ${warn}`);
  }

  @On()
  error([error]: ArgsOf<"error">): void {
    logger.error(`[ERROR] Discord.jsエラー: ${error.message}`, error);
  }
}
