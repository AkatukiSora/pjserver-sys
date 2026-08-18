import type { ChatInputCommandInteraction } from "discord.js";

export const commandErrorEmbed = {
  embeds: [
    {
      title: "エラー",
      description: "コマンドの実行中に予期せぬエラーが発生しました。",
      color: 0xff0000,
    },
  ],
};

export async function respondToInteractionError(
  interaction: Pick<
    ChatInputCommandInteraction,
    "replied" | "deferred" | "reply" | "editReply" | "followUp"
  >,
): Promise<void> {
  if (interaction.deferred) {
    await interaction.editReply(commandErrorEmbed);
    return;
  }
  if (interaction.replied) {
    await interaction.followUp({ ...commandErrorEmbed, ephemeral: true });
    return;
  }
  await interaction.reply({ ...commandErrorEmbed, ephemeral: true });
}
