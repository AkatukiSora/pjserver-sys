import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Client } from "discord.js";
import logger from "../logger.js";
import type { RuntimeContext } from "../runtime-context.js";
import type { BotEvent } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const eventModulesDirectory = path.join(__dirname, "handlers");

async function loadEventModules(): Promise<BotEvent[]> {
  const entries = await readdir(eventModulesDirectory, { withFileTypes: true });

  const modules = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .filter(
        (entry) =>
          entry.name.endsWith(".event.ts") || entry.name.endsWith(".event.js"),
      )
      .map(async (entry) => {
        const moduleURL = pathToFileURL(
          path.join(eventModulesDirectory, entry.name),
        ).href;
        const module = (await import(moduleURL)) as { default?: BotEvent };
        return module.default;
      }),
  );

  return modules.filter((event): event is BotEvent => Boolean(event));
}

export async function registerClientEvents(
  client: Client,
  context: RuntimeContext,
  options: { events?: BotEvent[] } = {},
): Promise<void> {
  const events = options.events ?? (await loadEventModules());

  for (const event of events) {
    const handler = async (...args: unknown[]): Promise<void> => {
      await event.execute(client, context, ...(args as never));
    };

    if (event.once) {
      client.once(event.name, handler as never);
      continue;
    }

    client.on(event.name, handler as never);
  }

  logger.info(`Registered ${events.length} event handlers.`);
}
