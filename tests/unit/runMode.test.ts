import { afterEach, describe, expect, it } from "vitest";
import runMode from "../../src/functions/runMode.js";

const originalMode = process.env.mode;

afterEach(() => {
  process.env.mode = originalMode;
});

describe("runMode", () => {
  it("returns main environment label", () => {
    process.env.mode = "1";
    expect(runMode()).toBe("メイン環境");
  });

  it("returns standby environment label", () => {
    process.env.mode = "2";
    expect(runMode()).toBe("スタンバイ環境");
  });

  it("returns dev environment label", () => {
    process.env.mode = "0";
    expect(runMode()).toBe("開発環境");
  });

  it("returns unknown for unsupported mode", () => {
    process.env.mode = "x";
    expect(runMode()).toBe("不明");
  });
});
