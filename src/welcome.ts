import {
  AttachmentBuilder,
  EmbedBuilder,
  type GuildBasedChannel,
  type GuildMember,
} from "discord.js";

export const WELCOME_CHANNEL_ID = "853904783000469535";
export const welcomeDescription = (userId: string) =>
  `ようこそ！<@${userId}>さん！\n\n※サーバーガイドはチャンネル一覧の一番上にあります\n\nサーバーガイドに従ってやるべきことを片付けましょう\n特に <#942837557807419482> で挨拶をすることはコミュニティになじむ第一歩です\n気楽にいきましょう`;

export function createWelcomePayload(userId: string, image: Buffer) {
  const attachment = new AttachmentBuilder(image).setName("welcome-image.png");
  return {
    content: `<@${userId}>`,
    embeds: [
      new EmbedBuilder()
        .setTitle("welcome to プロセカ民営公園")
        .setImage("attachment://welcome-image.png")
        .setDescription(welcomeDescription(userId)),
    ],
    files: [attachment],
  };
}

export async function sendWelcome(
  member: GuildMember,
  channel: GuildBasedChannel | undefined,
  generateImage: (name: string, avatarUrl: string) => Promise<Buffer>,
): Promise<boolean> {
  if (!channel?.isTextBased() || !channel.isSendable()) return false;
  const image = await generateImage(
    member.user.displayName,
    member.user.displayAvatarURL({ extension: "png" }),
  );
  await channel.send(createWelcomePayload(member.user.id, image));
  return true;
}
