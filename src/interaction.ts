import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  Interaction,
} from "discord.js";
import { checkAndTrackCooldown } from "./middleware/cooldown.js";
import { hasRequiredPermissions } from "./middleware/permissions.js";
import type { Command } from "./types/command.js";
import type { RuntimeContext } from "./runtime-context.js";
import { safeReply } from "./utils/safe-reply.js";
import logger from "./logger.js";

export function loadCommands(client: Client, commands: Command[]): void {
  client.commands = new Collection<string, Command>();

  for (const command of commands) {
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      logger.warn(`[WARN] コマンドに"data" または"execute" がありません。`);
    }
  }
}

function isChatInput(
  interaction: Interaction,
): interaction is ChatInputCommandInteraction {
  return interaction.isChatInputCommand();
}

export default async function processInteraction(
  interaction: Interaction,
  context: RuntimeContext,
): Promise<void> {
  if (!isChatInput(interaction)) {
    return;
  }

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`[WARN] 存在しないコマンドを参照: ${interaction.commandName}`);
    await safeReply(interaction, {
      embeds: [
        {
          title: "エラー",
          description: `${interaction.commandName}というコマンドは存在しません。`,
          color: 0xff0000,
        },
      ],
      ephemeral: true,
    });
    return;
  }

  if (!hasRequiredPermissions(interaction, command)) {
    await safeReply(interaction, {
      embeds: [
        {
          title: "権限エラー",
          description: "このコマンドを実行する権限がありません。",
          color: 0xff0000,
        },
      ],
      ephemeral: true,
    });
    return;
  }

  const cooldownResult = checkAndTrackCooldown(
    context.cooldownRepository,
    command,
    interaction.user.id,
  );

  if (!cooldownResult.allowed) {
    logger.trace(
      `[TRACE] コマンドの実行を拒否 (クールダウン中)\nユーザー: ${interaction.user.tag}:${interaction.user.id}\nコマンド: ${command.data.name}`,
    );

    const expirationTimestamp = Math.round(
      (cooldownResult.expirationTimestamp ?? Date.now()) / 1_000,
    );

    await safeReply(interaction, {
      content: `\`${command.data.name}\`はクールダウン中です。\n次に実行できるようになるのは <t:${expirationTimestamp}:R> です。`,
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`[ERROR] コマンド実行中にエラーが発生しました: ${error}`);

    try {
      await safeReply(interaction, {
        embeds: [
          {
            title: "エラー",
            description: "コマンドの実行中に予期せぬエラーが発生しました。",
            color: 0xff0000,
          },
        ],
        ephemeral: true,
      });
    } catch (replyError) {
      logger.error(
        `[ERROR] エラーメッセージの返信中にエラーが発生しました: ${replyError}`,
      );
    }
  }
}
