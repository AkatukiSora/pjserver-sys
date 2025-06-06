// 環境変数のロード
import "dotenv/config";
// ロガーモジュールのロード
import logger from "./logger.js";
import "./container.js";
// Discord.jsの必要なモジュールをロード
import {
  AttachmentBuilder,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  GuildMember,
  TextChannel,
  Interaction, // Interaction型をインポート
} from "discord.js";
// ファイル分けされたカスタムモジュールをロード
import welcomeimage from "./functions/welcomeimage.js";
import processInteraction, { loadCommands } from "./interaction.js";

//起動時にコマンドのデプロイを行う
import { deployCommand } from "./deploy-commands.js"; // 認証情報をインポート
deployCommand() // 例外はそのままunhandledにして処理させる
/**
 * Discordクライアントを設定します。
 * 必要なインテント（GatewayIntentBits）を指定して、ボットが特定のイベントを受信できるようにします。
 */
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// クライアントにコマンドをロード
loadCommands(client);

/**
 * インタラクションイベントリスナー。
 * Discordからのインタラクション（スラッシュコマンドなど）を処理します。
 */
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  // processInteraction関数にインタラクションを渡して処理を委譲
  await processInteraction(interaction);
});

/**
 * ギルドメンバー追加イベントリスナー。
 * 新しいメンバーがサーバーに参加した際にウェルカム画像を生成し、指定されたチャンネルに送信します。
 */
client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
  // ウェルカム画像を生成
  const attachment = new AttachmentBuilder(
    await welcomeimage(
      member.user.displayName,
      member.user.displayAvatarURL({ extension: "png" }),
    ),
  ).setName("welcome-image.png");

  // ウェルカムメッセージのEmbedを作成
  const embed = new EmbedBuilder()
    .setTitle("welcome to プロセカ民営公園")
    .setImage("attachment://welcome-image.png")
    .setDescription(
      `ようこそ！<@${member.user.id}>さん！\n\n※サーバーガイドはチャンネル一覧の一番上にあります\n\nサーバーガイドに従ってやるべきことを片付けましょう\n特に <#942837557807419482> で挨拶をすることはコミュニティになじむ第一歩です\n気楽にいきましょう`,
    );

  // ウェルカムメッセージを送信するチャンネルを取得 (TODO: 変数として外部から注入させる)
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
      "指定されたwelcomeチャンネルが見つからないか、テキストチャンネルではありません。",
    );
  }
});

/**
 * クライアント準備完了イベントリスナー。
 * ボットがDiscordに正常にログインし、準備が完了した際に一度だけ実行されます。
 */
client.once(Events.ClientReady, (readyClient: Client) => {
  if (readyClient.user) {
    logger.info(`ログイン成功: User=${readyClient.user.tag}`);
    readyClient.user.setActivity("多分正常稼働中"); // ボットのステータスを設定
  } else {
    logger.fatal("ログイン失敗: クライアントユーザーが見つかりませんでした。");
    process.exit(1); // ログイン失敗時はプロセスを終了
  }
});

/**
 * 環境モードに基づいてDiscordボットにログインします。
 * `process.env.mode` が '0', '1', '2' のいずれかである場合にログインを試みます。
 */
if (
  process.env.mode === "0" ||
  process.env.mode === "1" ||
  process.env.mode === "2"
) {
  logger.info(`ボット起動モード: ${process.env.mode}`);
  client.login(process.env.credential);
} else {
  logger.fatal("実行環境が指定されていないか不正です。プロセスを終了します。");
  process.exit(1);
}

/**
 * 警告イベントリスナー。
 * Discord.jsからの警告をログに出力します。
 */
client.on(Events.Warn, (warn: string) => {
  logger.warn(`[WARN] Discord.js警告: ${warn}`);
});

/**
 * エラーイベントリスナー。
 * Discord.jsからのエラーをログに出力します。
 */
client.on(Events.Error, (error: Error) => {
  logger.error(`[ERROR] Discord.jsエラー: ${error.message}`, error);
});

/**
 * 未処理の例外イベントリスナー。
 * キャッチされなかった例外が発生した場合に、ログに出力し、安全にプロセスを終了しようとします。
 */
process.on("uncaughtException", (err: Error, origin: string) => {
  logger.fatal(
    `[FATAL] 未処理の例外をキャッチ: ${err.message}\n例外発生元: ${origin}`,
    err,
  );
  try {
    client.destroy(); // クライアントを破棄して接続をクリーンアップ
  } catch (e) {
    logger.error(`[ERROR] クライアント破棄中にエラーが発生: ${e}`);
  }
  setTimeout(() => process.exit(1), 5000); // 5秒後にプロセスを終了
});

/**
 * SIGTERMシグナルイベントリスナー。
 * プロセスが終了シグナルを受信した際に、安全にシャットダウン処理を行います。
 */
process.on("SIGTERM", () => {
  try {
    client.destroy(); // クライアントを破棄
    logger.info("サーバーを停止します。シグナルによる正常終了処理です。");
  } catch (e) {
    logger.error(`[ERROR] サーバー停止処理中にエラーが発生: ${e}`);
    setTimeout(() => process.exit(1), 5000); // 5秒後にプロセスを終了
  }
});
