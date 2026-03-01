import { describe, expect, it, vi } from "vitest";
import { hasRequiredPermissions } from "../../src/middleware/permissions.js";

describe("hasRequiredPermissions", () => {
  it("returns true when command has no required permissions", () => {
    const interaction = {
      memberPermissions: {
        has: vi.fn(),
      },
    };

    const result = hasRequiredPermissions(
      interaction as never,
      {
        data: { name: "ping" },
        execute: vi.fn(),
      } as never,
    );

    expect(result).toBe(true);
    expect(interaction.memberPermissions.has).not.toHaveBeenCalled();
  });

  it("checks member permissions when command requires them", () => {
    const interaction = {
      memberPermissions: {
        has: vi.fn().mockReturnValue(true),
      },
    };

    const result = hasRequiredPermissions(
      interaction as never,
      {
        data: { name: "restart" },
        execute: vi.fn(),
        requiredPermissions: ["Administrator"],
      } as never,
    );

    expect(result).toBe(true);
    expect(interaction.memberPermissions.has).toHaveBeenCalledWith([
      "Administrator",
    ]);
  });
});
