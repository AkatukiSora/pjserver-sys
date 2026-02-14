import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config.js";

describe("loadConfig", () => {
  it("loads all required values", () => {
    const config = loadConfig({
      credential: "token",
      clientID: "client",
      guildID: "guild",
      mode: "1",
      welcomeChannelID: "welcome",
    });

    expect(config).toEqual({
      credential: "token",
      clientID: "client",
      guildID: "guild",
      mode: "1",
      welcomeChannelID: "welcome",
    });
  });

  it("throws when a required key is missing", () => {
    expect(() =>
      loadConfig({
        credential: "token",
        clientID: "client",
        guildID: "guild",
        mode: "1",
      }),
    ).toThrowError("Missing required environment variable: welcomeChannelID");
  });

  it("throws when mode is invalid", () => {
    expect(() =>
      loadConfig({
        credential: "token",
        clientID: "client",
        guildID: "guild",
        mode: "9",
        welcomeChannelID: "welcome",
      }),
    ).toThrowError("Invalid mode: 9");
  });
});
