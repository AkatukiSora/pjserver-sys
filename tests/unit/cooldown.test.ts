import { describe, expect, it, vi } from "vitest";
import { checkAndTrackCooldown } from "../../src/middleware/cooldown.js";

describe("checkAndTrackCooldown", () => {
  it("allows when no timestamp exists", () => {
    const repository = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
      delete: vi.fn(),
    };

    const result = checkAndTrackCooldown(
      repository,
      {
        data: { name: "ping" },
        execute: vi.fn(),
      } as never,
      "user1",
      1_000,
    );

    expect(result).toEqual({ allowed: true });
    expect(repository.set).toHaveBeenCalledWith("ping", "user1", 1_000);
  });

  it("blocks when user is still on cooldown", () => {
    const repository = {
      get: vi.fn().mockReturnValue(1_000),
      set: vi.fn(),
      delete: vi.fn(),
    };

    const result = checkAndTrackCooldown(
      repository,
      {
        data: { name: "ping" },
        execute: vi.fn(),
        cooldown: 3,
      } as never,
      "user1",
      2_000,
    );

    expect(result).toEqual({
      allowed: false,
      expirationTimestamp: 4_000,
    });
    expect(repository.set).not.toHaveBeenCalled();
  });
});
