import { Collection, type Client, type Interaction } from "discord.js";
import {
  cooldownExpiresAt,
  scheduleCooldownEviction,
  type Schedule,
} from "./cooldown.js";
import { respondToInteractionError } from "./interaction-response.js";
import logger from "./logger.js";
import { createCommandCollection } from "./commands/registry.js";

export function loadCommands(client: Client): void {
  client.commands = createCommandCollection();
  client.cooldowns = new Collection();
}

export default async function processInteraction(
  interaction: Interaction,
  now = Date.now(),
  schedule: Schedule = setTimeout,
): Promise<void> {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    logger.warn(`[WARN] 存在しないコマンドを参照: ${interaction.commandName}`);
    await interaction.reply({
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
  const cooldown = command.cooldown ?? 3;
  let timestamps = interaction.client.cooldowns.get(command.data.name);
  if (!timestamps) {
    timestamps = new Collection();
    interaction.client.cooldowns.set(command.data.name, timestamps);
  }
  const expiresAt = cooldownExpiresAt(
    timestamps.get(interaction.user.id),
    now,
    cooldown,
  );
  if (expiresAt) {
    await interaction.reply({
      content: `\`${command.data.name}\`はクールダウン中です。\n次に実行できるようになるのは <t:${Math.round(expiresAt / 1_000)}:R> です。`,
      ephemeral: true,
    });
    return;
  }
  timestamps.set(interaction.user.id, now);
  scheduleCooldownEviction(
    timestamps,
    interaction.user.id,
    now,
    cooldown,
    schedule,
  );
  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(
      `[ERROR] コマンド実行中にエラーが発生しました: ${String(error)}`,
    );
    try {
      await respondToInteractionError(interaction);
    } catch (responseError) {
      logger.error(
        `[ERROR] エラーメッセージの返信中にエラーが発生しました: ${String(responseError)}`,
      );
    }
  }
}
