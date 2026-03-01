import { describe, expect, it, vi } from "vitest";
import { Events } from "discord.js";
import { registerClientEvents } from "../../src/events/register-events.js";
import type { BotEvent } from "../../src/events/types.js";

describe("registerClientEvents", () => {
  it("registers persistent and once handlers", async () => {
    const on = vi.fn();
    const once = vi.fn();
    const execute = vi.fn().mockResolvedValue(undefined);

    const events: BotEvent[] = [
      {
        name: Events.InteractionCreate,
        execute,
      },
      {
        name: Events.ClientReady,
        once: true,
        execute,
      },
    ];

    await registerClientEvents(
      {
        on,
        once,
      } as never,
      {
        config: {
          credential: "token",
          clientID: "client",
          guildID: "guild",
          mode: "1",
          welcomeChannelID: "welcome",
        },
        welcomeImageService: {
          init: vi.fn(),
          generate: vi.fn(),
        },
        cooldownRepository: {
          get: vi.fn(),
          set: vi.fn(),
          delete: vi.fn(),
        },
        memberProfileRepository: {
          findByUserID: vi.fn(),
          save: vi.fn(),
        },
      },
      { events },
    );

    expect(on).toHaveBeenCalledTimes(1);
    expect(once).toHaveBeenCalledTimes(1);
    expect(on.mock.calls[0]?.[0]).toBe(Events.InteractionCreate);
    expect(once.mock.calls[0]?.[0]).toBe(Events.ClientReady);
  });

  it("executes event handler with runtime context", async () => {
    const on = vi.fn();
    const execute = vi.fn().mockResolvedValue(undefined);

    const context = {
      config: {
        credential: "token",
        clientID: "client",
        guildID: "guild",
        mode: "1" as const,
        welcomeChannelID: "welcome",
      },
      welcomeImageService: {
        init: vi.fn(),
        generate: vi.fn(),
      },
      cooldownRepository: {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      },
      memberProfileRepository: {
        findByUserID: vi.fn(),
        save: vi.fn(),
      },
    };

    await registerClientEvents(
      {
        on,
        once: vi.fn(),
      } as never,
      context,
      {
        events: [
          {
            name: Events.InteractionCreate,
            execute,
          },
        ],
      },
    );

    const handler = on.mock.calls[0]?.[1] as
      | ((...args: unknown[]) => Promise<void>)
      | undefined;

    await handler?.({ id: "i1" });

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ on }),
      context,
      { id: "i1" },
    );
  });
});
