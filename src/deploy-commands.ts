import "dotenv/config";
import { REST, Routes } from "discord.js";
import logger from "./utils/logger.js";

/**
 * Discord Botのスラッシュコマンドをデプロイする関数
 */
export async function deployCommands(): Promise<void> {
  const { BOT_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

  if (!BOT_TOKEN) {
    logger.error("BOT_TOKEN環境変数が設定されていません");
    process.exit(1);
  }

  if (!CLIENT_ID) {
    logger.error("CLIENT_ID環境変数が設定されていません");
    process.exit(1);
  }

  try {
    const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

    logger.info("スラッシュコマンドのデプロイを開始しています...");

    if (GUILD_ID) {
      // ギルド固有のコマンドとしてデプロイ（開発用）
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: [],
      });
      logger.info(`ギルド ${GUILD_ID} のスラッシュコマンドデプロイが完了しました`);
    } else {
      // グローバルコマンドとしてデプロイ（本番用）
      await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: [],
      });
      logger.info("グローバルスラッシュコマンドデプロイが完了しました");
    }
  } catch (error) {
    logger.error("スラッシュコマンドのデプロイに失敗しました:", error);
    throw error;
  }
}

// モジュールとして直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  deployCommands().catch((error) => {
    logger.fatal("コマンドデプロイ中に致命的なエラーが発生しました:", error);
    process.exit(1);
  });
}
