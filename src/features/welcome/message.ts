import { EmbedBuilder } from "discord.js";
import { communityName, createWelcomeDescription } from "../../constants.js";

export function createWelcomeEmbed(
  userID: string,
  guideChannelID?: string,
): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(`welcome to ${communityName}`)
    .setImage("attachment://welcome-image.png")
    .setDescription(createWelcomeDescription(userID, guideChannelID));
}
