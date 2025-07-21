import "dotenv/config";
import { dirname, importx } from "@discordx/importer";
import type { Interaction, Message } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import logger from "./utils/logger.js";

export const bot = new Client({
  // To use only guild command
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
  ],

  // Debug logs are disabled in silent mode
  silent: false,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: "!",
  },
});

bot.once("ready", () => {
  // Make sure all guilds are cached
  // await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  void bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );

  console.log("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
  void bot.executeCommand(message);
});

// エラーハンドリング
process.on("uncaughtException", (err: Error, origin: string) => {
  logger.fatal(
    `[FATAL] 未処理の例外をキャッチ: ${err.message}\n例外発生元: ${origin}`,
    err
  );
  try {
    bot.destroy(); // クライアントを破棄して接続をクリーンアップ
  } catch (e) {
    logger.error(`[ERROR] クライアント破棄中にエラーが発生: ${e}`);
  }
  setTimeout(() => process.exit(1), 5000); // 5秒後にプロセスを終了
});

process.on("SIGTERM", () => {
  try {
    bot.destroy(); // クライアントを破棄
    logger.info("サーバーを停止します。シグナルによる正常終了処理です。");
  } catch (e) {
    logger.error(`[ERROR] サーバー停止処理中にエラーが発生: ${e}`);
    setTimeout(() => process.exit(1), 5000); // 5秒後にプロセスを終了
  }
});

async function run() {
  // The following syntax should be used in the commonjs environment
  //
  // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");

  // The following syntax should be used in the ECMAScript environment
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // 環境変数の検証
  if (!process.env.BOT_TOKEN) {
    logger.fatal("BOT_TOKEN環境変数が設定されていません");
    throw Error("Could not find BOT_TOKEN in your environment");
  }

  // 実行モードの検証
  if (
    process.env.MODE === "0" ||
    process.env.MODE === "1" ||
    process.env.MODE === "2"
  ) {
    logger.info(`ボット起動モード: ${process.env.MODE}`);
  } else {
    logger.fatal("実行環境が指定されていないか不正です。プロセスを終了します。");
    process.exit(1);
  }

  // Log in with your bot token
  await bot.login(process.env.BOT_TOKEN);
}

void run();
