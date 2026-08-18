import assert from "node:assert/strict";
import test from "node:test";
import {
  cooldownExpiresAt,
  scheduleCooldownEviction,
} from "../src/cooldown.js";
import {
  commandPayloads,
  createCommandCollection,
} from "../src/commands/registry.js";

test("registry provides identical deploy payloads and runtime commands", () => {
  const payloads = commandPayloads();
  const commands = createCommandCollection();
  assert.deepEqual(
    payloads.map((payload) => payload.name),
    ["ping", "restart", "test"],
  );
  assert.deepEqual(
    [...commands.keys()],
    payloads.map((payload) => payload.name),
  );
});
test("cooldown reports only an unexpired command", () => {
  assert.equal(cooldownExpiresAt(1_000, 2_000, 3), 4_000);
  assert.equal(cooldownExpiresAt(1_000, 4_000, 3), undefined);
});
test("cooldown eviction removes only the timestamp that scheduled it", () => {
  const timestamps = new Map<string, number>([["u", 1_000]]);
  const callbacks: Array<() => void> = [];
  let delay: number | undefined;
  scheduleCooldownEviction(timestamps, "u", 1_000, 3, (next, nextDelay) => {
    callbacks.push(next);
    delay = nextDelay;
  });
  assert.equal(delay, 3_000);
  callbacks.pop()!();
  assert.equal(timestamps.has("u"), false);

  timestamps.set("u", 2_000);
  scheduleCooldownEviction(timestamps, "u", 2_000, 3, (next) => {
    callbacks.push(next);
  });
  timestamps.set("u", 3_000);
  callbacks.pop()!();
  assert.equal(timestamps.get("u"), 3_000);
});
