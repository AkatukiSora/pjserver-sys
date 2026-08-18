import assert from "node:assert/strict";
import test from "node:test";
import { cooldownExpiresAt, MemoryCooldownStore } from "../src/cooldown.js";
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
  const store = new MemoryCooldownStore();
  store.set("ping", "u", 1_000);
  assert.equal(cooldownExpiresAt(store.get("ping", "u"), 2_000, 3), 4_000);
  assert.equal(cooldownExpiresAt(store.get("ping", "u"), 4_000, 3), undefined);
});
