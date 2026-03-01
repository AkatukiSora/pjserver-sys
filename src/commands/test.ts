import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { createWelcomeEmbed } from "../features/welcome/message.js";
import type { WelcomeImageGenerator } from "../features/welcome/image-generator.js";
import type { Command } from "../types/command.js";

export function createTestCommand(
  welcomeImageService: WelcomeImageGenerator,
): Command {
  return {
    data: new SlashCommandBuilder()
      .setName("test")
      .setDescription("ウェルカム画像を生成します"),
    async execute(interaction: ChatInputCommandInteraction) {
      const attachment = new AttachmentBuilder(
        await welcomeImageService.generate(
          interaction.user.displayName,
          interaction.user.displayAvatarURL({ extension: "png" }),
        ),
      ).setName("welcome-image.png");

      const embed = createWelcomeEmbed(interaction.user.id);
      await interaction.reply({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        files: [attachment],
      });
    },
  };
}
