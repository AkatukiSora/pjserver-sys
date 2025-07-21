import type { ButtonInteraction, CommandInteraction } from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { ButtonComponent, Discord, Slash } from "discordx";

@Discord()
export class ButtonCommands {
  @Slash({ description: "ボタンを送信します" })
  async button(interaction: CommandInteraction): Promise<void> {
    const button1 = new ButtonBuilder()
      .setCustomId("button1") // 他のファイルのボタンと被らないようにする
      .setLabel("ボタン")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button1);
    
    await interaction.reply({
      content: "ボタンを送信しました",
      components: [row],
    });
  }

  @ButtonComponent({ id: "button1" })
  async handleButton1(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({
      content: "button1を押した!",
      components: [],
    });
  }
}
