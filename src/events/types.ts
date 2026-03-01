import type { Client, ClientEvents } from "discord.js";
import type { RuntimeContext } from "../runtime-context.js";

export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (
    client: Client,
    context: RuntimeContext,
    ...args: ClientEvents[K]
  ) => Promise<void>;
}
