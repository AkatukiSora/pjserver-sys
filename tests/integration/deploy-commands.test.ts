import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    put: vi.fn(),
    setToken: vi.fn(),
    route: vi.fn(),
  };
});

vi.mock("discord.js", () => {
  class REST {
    setToken = mocks.setToken.mockReturnThis();
    put = mocks.put;
  }

  return {
    REST,
    Routes: {
      applicationGuildCommands: mocks.route,
    },
  };
});

import { deployCommands } from "../../src/deploy-commands.js";

describe("deployCommands", () => {
  beforeEach(() => {
    mocks.route.mockReturnValue("/commands-route");
  });

  it("deploys command payloads through Discord REST", async () => {
    mocks.put.mockResolvedValueOnce([{ id: "1" }, { id: "2" }]);

    const count = await deployCommands({
      credential: "token",
      clientID: "client",
      guildID: "guild",
      commands: [
        {
          data: { toJSON: () => ({ name: "ping" }) },
          execute: vi.fn(),
        },
      ],
    });

    expect(mocks.setToken).toHaveBeenCalledWith("token");
    expect(mocks.route).toHaveBeenCalledWith("client", "guild");
    expect(mocks.put).toHaveBeenCalledWith("/commands-route", {
      body: [{ name: "ping" }],
    });
    expect(count).toBe(2);
  });

  it("throws when REST result is not an array", async () => {
    mocks.put.mockResolvedValueOnce({ ok: true });

    await expect(
      deployCommands({
        credential: "token",
        clientID: "client",
        guildID: "guild",
        commands: [],
      }),
    ).rejects.toThrowError("response from the API is not an array");
  });

  it("throws when deployed command list is empty", async () => {
    mocks.put.mockResolvedValueOnce([]);

    await expect(
      deployCommands({
        credential: "token",
        clientID: "client",
        guildID: "guild",
        commands: [],
      }),
    ).rejects.toThrowError("No commands were deployed");
  });
});
