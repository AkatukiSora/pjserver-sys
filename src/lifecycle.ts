import type { Client } from "discord.js";
import logger from "./logger.js";

export function registerProcessLifecycleHandlers(client: Client): void {
  process.on("uncaughtException", (error: Error, origin: string) => {
    logger.fatal(
      `[FATAL] 未処理の例外をキャッチ: ${error.message}\n例外発生元: ${origin}`,
      error,
    );

    try {
      client.destroy();
    } catch (destroyError) {
      logger.error(`[ERROR] クライアント破棄中にエラーが発生: ${destroyError}`);
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
