import { describe, expect, it } from "vitest";
import { getRunModeLabel } from "../../src/config.js";

describe("getRunModeLabel", () => {
  it("returns main environment label", () => {
    expect(getRunModeLabel("1")).toBe("メイン環境");
  });

  it("returns standby environment label", () => {
    expect(getRunModeLabel("2")).toBe("スタンバイ環境");
  });

  it("returns dev environment label", () => {
    expect(getRunModeLabel("0")).toBe("開発環境");
  });
});
