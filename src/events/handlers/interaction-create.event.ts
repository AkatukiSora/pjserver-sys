import { Events, type Interaction } from "discord.js";
import processInteraction from "../../interaction.js";
import type { BotEvent } from "../types.js";

const interactionCreateEvent: BotEvent<Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  async execute(_client, context, interaction: Interaction): Promise<void> {
    await processInteraction(interaction, context);
  },
};

export default interactionCreateEvent;
