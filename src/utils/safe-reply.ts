import {
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  MessagePayload,
} from "discord.js";

export async function safeReply(
  interaction: ChatInputCommandInteraction,
  options: string | MessagePayload | InteractionReplyOptions,
): Promise<void> {
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(options);
    return;
  }

  await interaction.reply(options);
}
