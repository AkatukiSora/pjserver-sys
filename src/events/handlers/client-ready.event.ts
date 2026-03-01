import { Client, Events } from "discord.js";
import logger from "../../logger.js";
import type { BotEvent } from "../types.js";

const clientReadyEvent: BotEvent<Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  async execute(_client, _context, readyClient: Client): Promise<void> {
    if (!readyClient.user) {
      logger.fatal(
        "ログイン失敗: クライアントユーザーが見つかりませんでした。",
      );
      process.exit(1);
    }

    logger.info(`ログイン成功: User=${readyClient.user.tag}`);
    readyClient.user.setActivity("多分正常稼働中");
  },
};

export default clientReadyEvent;
