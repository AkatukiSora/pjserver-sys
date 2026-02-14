import {
  AttachmentBuilder,
  Client,
  EmbedBuilder,
  Events,
  GuildMember,
  Interaction,
  TextChannel,
} from "discord.js";
import type { AppConfig } from "../config.js";
import welcomeimage from "../functions/welcomeimage.js";
import processInteraction from "../interaction.js";
import logger from "../logger.js";

async function onGuildMemberAdd(
  member: GuildMember,
  config: AppConfig,
): Promise<void> {
  const attachment = new AttachmentBuilder(
    await welcomeimage(
      member.user.displayName,
      member.user.displayAvatarURL({ extension: "png" }),
    ),
  ).setName("welcome-image.png");

  const embed = new EmbedBuilder()
    .setTitle("welcome to プロセカ民営公園")
    .setImage("attachment://welcome-image.png")
    .setDescription(
      `ようこそ！<@${member.user.id}>さん！\n\n※サーバーガイドはチャンネル一覧の一番上にあります\n\nサーバーガイドに従ってやるべきことを片付けましょう\n特に <#942837557807419482> で挨拶をすることはコミュニティになじむ第一歩です\n気楽にいきましょう`,
    );

  const targetChannel = member.guild.channels.cache.get(
    config.welcomeChannelID,
  );

  if (!(targetChannel instanceof TextChannel)) {
    logger.error(
      "指定されたwelcomeチャンネルが見つからないか、テキストチャンネルではありません。",
    );
    return;
  }

  await targetChannel.send({
    content: `<@${member.user.id}>`,
    embeds: [embed],
    files: [attachment],
  });
}

export function registerClientEvents(client: Client, config: AppConfig): void {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    await processInteraction(interaction);
  });

  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    try {
      await onGuildMemberAdd(member, config);
    } catch (error) {
      logger.error(`ウェルカムメッセージ送信中にエラー: ${error}`);
    }
  });

  client.once(Events.ClientReady, (readyClient: Client) => {
    if (!readyClient.user) {
      logger.fatal(
        "ログイン失敗: クライアントユーザーが見つかりませんでした。",
      );
      process.exit(1);
    }

    logger.info(`ログイン成功: User=${readyClient.user.tag}`);
    readyClient.user.setActivity("多分正常稼働中");
  });

  client.on(Events.Warn, (warn: string) => {
    logger.warn(`[WARN] Discord.js警告: ${warn}`);
  });

  client.on(Events.Error, (error: Error) => {
    logger.error(`[ERROR] Discord.jsエラー: ${error.message}`, error);
  });

  process.on("uncaughtException", (err: Error, origin: string) => {
    logger.fatal(
      `[FATAL] 未処理の例外をキャッチ: ${err.message}\n例外発生元: ${origin}`,
      err,
    );
    try {
      client.destroy();
    } catch (error) {
      logger.error(`[ERROR] クライアント破棄中にエラーが発生: ${error}`);
    }
    setTimeout(() => process.exit(1), 5_000);
  });

  process.on("SIGTERM", () => {
    try {
      client.destroy();
      logger.info("サーバーを停止します。シグナルによる正常終了処理です。");
    } catch (error) {
      logger.error(`[ERROR] サーバー停止処理中にエラーが発生: ${error}`);
      setTimeout(() => process.exit(1), 5_000);
    }
  });
}
