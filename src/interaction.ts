import logger from "./logger";
import { Interaction, Collection } from "discord.js";

export default async function (interaction: Interaction) {
  if (!interaction) return;
  // コマンドでなかった場合
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;
  const { cooldowns } = interaction.client;

  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection());
  }
  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name);
  if (!timestamps) return;
  const defaultCooldownDuration = 3;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;
  if (timestamps.has(interaction.user.id)) {
    const tmptimestamp = timestamps.get(interaction.user.id);
    if (!tmptimestamp) return;
    const expirationTime = tmptimestamp + cooldownAmount;

    if (now < expirationTime) {
      logger.trace(
        `コマンドの実行を拒否 クールダウン中\nユーザー ${interaction.user.tag}:${interaction.user.id}\nコマンド ${command.data.name}`,
      );
      const expiredTimestamp = Math.round(expirationTime / 1_000);
      return interaction.reply({
        content: `\`${command.data.name}\`はクールダウン中です。\n 次に実行できるようになるのは <t:${expiredTimestamp}:R> です`,
        ephemeral: true,
      });
    }
  }

  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  // 一致するコマンドがなかった場合
  if (!command) {
    logger.warn(`存在しないコマンドを参照${interaction.commandName}`);
    interaction.reply({
      embeds: [
        {
          title: "エラー",
          description: `${interaction.commandName}というコマンド存在しません`,
          color: 0xff0000,
        },
      ],
    });
    return;
  }

  try {
    // コマンドを実行
    await command.execute(interaction);
  } catch (error) {
    logger.error(error);
    try {
      await interaction.reply({
        embeds: [
          {
            title: "エラー",
            description: "コマンドの実行中にエラーが発生しました",
          },
        ],
      });
    } catch (error) {
      logger.error(error);
    }
  }
}
