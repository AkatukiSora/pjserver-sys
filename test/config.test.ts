import assert from "node:assert/strict";
import test from "node:test";
import { parseConfig } from "../src/config.js";
import runMode from "../src/functions/runMode.js";

const environment = {
  credential: " token ",
  clientID: "client",
  guildID: "guild",
  mode: "1",
};
test("parseConfig validates and trims required values", () =>
  assert.deepEqual(parseConfig(environment), {
    credential: "token",
    clientID: "client",
    guildID: "guild",
    mode: "1",
  }));
test("parseConfig rejects invalid modes and missing credentials", () => {
  assert.throws(() => parseConfig({ ...environment, mode: "3" }));
  assert.throws(() => parseConfig({ ...environment, credential: "" }));
});
test("runMode maps all supported modes", () => {
  assert.equal(runMode("0"), "開発環境");
  assert.equal(runMode("1"), "メイン環境");
  assert.equal(runMode("2"), "スタンバイ環境");
  assert.equal(runMode("x"), "不明");
});
