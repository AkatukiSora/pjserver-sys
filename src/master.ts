import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { parseConfig } from "./config.js";
import { deployCommand } from "./deploy-commands.js";
import welcomeimage from "./functions/welcomeimage.js";
import processInteraction, { loadCommands } from "./interaction.js";
import { registerLifecycleHandlers } from "./lifecycle.js";
import logger from "./logger.js";
import { sendWelcome, WELCOME_CHANNEL_ID } from "./welcome.js";

export function createClient(): Client {
  return new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  });
}

export function registerClientEvents(client: Client): void {
  loadCommands(client);
  client.on(Events.InteractionCreate, processInteraction);
  client.on(Events.GuildMemberAdd, async (member) => {
    const sent = await sendWelcome(
      member,
      member.guild.channels.cache.get(WELCOME_CHANNEL_ID),
      welcomeimage,
    );
    if (!sent)
      logger.error(
        "指定されたwelcomeチャンネルが見つからないか、テキストチャンネルではありません。",
      );
  });
  client.once(Events.ClientReady, (readyClient) => {
    if (!readyClient.user)
      throw new Error(
        "ログイン失敗: クライアントユーザーが見つかりませんでした。",
      );
    logger.info(`ログイン成功: User=${readyClient.user.tag}`);
    readyClient.user.setActivity("多分正常稼働中");
  });
  client.on(Events.Warn, (warn) =>
    logger.warn(`[WARN] Discord.js警告: ${warn}`),
  );
  client.on(Events.Error, (error) =>
    logger.error(`[ERROR] Discord.jsエラー: ${error.message}`, error),
  );
}

export async function start(): Promise<void> {
  const config = parseConfig(process.env);
  const client = createClient();
  registerClientEvents(client);
  registerLifecycleHandlers({
    destroy: () => client.destroy(),
    info: (message) => logger.info(message),
    error: (message, error) => logger.error(message, error),
    exit: (code) => process.exit(code),
    on: (signal, listener) => process.on(signal, listener),
  });
  logger.info(`ボット起動モード: ${config.mode}`);
  await deployCommand(config);
  await client.login(config.credential);
}

void start().catch((error: unknown) => {
  logger.fatal("Bot の起動に失敗しました。", error);
  process.exitCode = 1;
});
