import { beforeEach, describe, expect, it, vi } from "vitest";

const appMocks = vi.hoisted(() => {
  return {
    processInteraction: vi.fn(),
    welcomeimage: vi.fn(),
    logger: {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      fatal: vi.fn(),
    },
  };
});

vi.mock("../../src/interaction.js", () => ({
  default: appMocks.processInteraction,
}));

vi.mock("../../src/functions/welcomeimage.js", () => ({
  default: appMocks.welcomeimage,
}));

vi.mock("../../src/logger.js", () => ({
  default: appMocks.logger,
}));

vi.mock("discord.js", () => {
  class TextChannel {
    send = vi.fn().mockResolvedValue(undefined);
  }

  class AttachmentBuilder {
    constructor(public readonly payload: Buffer) {}

    setName(): this {
      return this;
    }
  }

  class EmbedBuilder {
    setTitle(): this {
      return this;
    }

    setImage(): this {
      return this;
    }

    setDescription(): this {
      return this;
    }
  }

  return {
    TextChannel,
    AttachmentBuilder,
    EmbedBuilder,
    Events: {
      InteractionCreate: "interactionCreate",
      GuildMemberAdd: "guildMemberAdd",
      ClientReady: "clientReady",
      Warn: "warn",
      Error: "error",
    },
  };
});

import { Events, TextChannel } from "discord.js";
import { registerClientEvents } from "../../src/events/register-events.js";

describe("registerClientEvents", () => {
  beforeEach(() => {
    appMocks.welcomeimage.mockResolvedValue(Buffer.from("image"));
  });

  it("registers handlers and forwards interactions", async () => {
    const on = vi.fn();
    const once = vi.fn();

    const processOnSpy = vi
      .spyOn(process, "on")
      .mockImplementation(() => process);

    registerClientEvents(
      {
        on,
        once,
      } as never,
      {
        credential: "token",
        clientID: "client",
        guildID: "guild",
        mode: "1",
        welcomeChannelID: "welcome",
      },
    );

    const interactionHandler = on.mock.calls.find(
      (call) => call[0] === Events.InteractionCreate,
    )?.[1];

    expect(interactionHandler).toBeTypeOf("function");

    await interactionHandler?.({ id: "interaction" });

    expect(appMocks.processInteraction).toHaveBeenCalledWith({
      id: "interaction",
    });

    processOnSpy.mockRestore();
  });

  it("sends welcome message to configured text channel", async () => {
    const on = vi.fn();
    const once = vi.fn();
    const processOnSpy = vi
      .spyOn(process, "on")
      .mockImplementation(() => process);

    registerClientEvents(
      {
        on,
        once,
      } as never,
      {
        credential: "token",
        clientID: "client",
        guildID: "guild",
        mode: "1",
        welcomeChannelID: "welcome",
      },
    );

    const guildMemberAddHandler = on.mock.calls.find(
      (call) => call[0] === Events.GuildMemberAdd,
    )?.[1];

    const channel = new TextChannel();
    const member = {
      user: {
        id: "u1",
        displayName: "alice",
        displayAvatarURL: vi.fn().mockReturnValue("https://avatar.example"),
      },
      guild: {
        channels: {
          cache: {
            get: vi.fn().mockReturnValue(channel),
          },
        },
      },
    };

    await guildMemberAddHandler?.(member);

    expect(appMocks.welcomeimage).toHaveBeenCalledWith(
      "alice",
      "https://avatar.example",
    );
    expect(channel.send).toHaveBeenCalledTimes(1);

    processOnSpy.mockRestore();
  });
});
