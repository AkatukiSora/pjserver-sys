import { Events } from "discord.js";
import logger from "../../logger.js";
import type { BotEvent } from "../types.js";

const warnEvent: BotEvent<Events.Warn> = {
  name: Events.Warn,
  async execute(_client, _context, warning: string): Promise<void> {
    logger.warn(`[WARN] Discord.js警告: ${warning}`);
  },
};

export default warnEvent;
