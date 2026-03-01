import { Events } from "discord.js";
import logger from "../../logger.js";
import type { BotEvent } from "../types.js";

const errorEvent: BotEvent<Events.Error> = {
  name: Events.Error,
  async execute(_client, _context, error: Error): Promise<void> {
    logger.error(`[ERROR] Discord.jsエラー: ${error.message}`, error);
  },
};

export default errorEvent;
