import { describe, expect, it, vi } from "vitest";
import { safeReply } from "../../src/utils/safe-reply.js";

describe("safeReply", () => {
  it("uses reply when interaction is fresh", async () => {
    const interaction = {
      replied: false,
      deferred: false,
      reply: vi.fn().mockResolvedValue(undefined),
      followUp: vi.fn().mockResolvedValue(undefined),
    };

    await safeReply(interaction as never, "hello");

    expect(interaction.reply).toHaveBeenCalledWith("hello");
    expect(interaction.followUp).not.toHaveBeenCalled();
  });

  it("uses followUp when interaction already replied", async () => {
    const interaction = {
      replied: true,
      deferred: false,
      reply: vi.fn().mockResolvedValue(undefined),
      followUp: vi.fn().mockResolvedValue(undefined),
    };

    await safeReply(interaction as never, { content: "hello" });

    expect(interaction.followUp).toHaveBeenCalledWith({ content: "hello" });
    expect(interaction.reply).not.toHaveBeenCalled();
  });
});
