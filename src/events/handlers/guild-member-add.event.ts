import {
  AttachmentBuilder,
  Events,
  GuildMember,
  TextChannel,
} from "discord.js";
import { createWelcomeEmbed } from "../../features/welcome/message.js";
import logger from "../../logger.js";
import type { BotEvent } from "../types.js";

const guildMemberAddEvent: BotEvent<Events.GuildMemberAdd> = {
  name: Events.GuildMemberAdd,
  async execute(_client, context, member: GuildMember): Promise<void> {
    try {
      const attachment = new AttachmentBuilder(
        await context.welcomeImageService.generate(
          member.user.displayName,
          member.user.displayAvatarURL({ extension: "png" }),
        ),
      ).setName("welcome-image.png");

      const targetChannel = member.guild.channels.cache.get(
        context.config.welcomeChannelID,
      );

      if (!(targetChannel instanceof TextChannel)) {
        logger.error(
          "指定されたwelcomeチャンネルが見つからないか、テキストチャンネルではありません。",
        );
        return;
      }

      await context.memberProfileRepository.save({
        userID: member.user.id,
        joinedAt: Date.now(),
      });

      await targetChannel.send({
        content: `<@${member.user.id}>`,
        embeds: [createWelcomeEmbed(member.user.id)],
        files: [attachment],
      });
    } catch (error) {
      logger.error(`ウェルカムメッセージ送信中にエラー: ${error}`);
    }
  },
};

export default guildMemberAddEvent;
