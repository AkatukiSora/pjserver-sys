import assert from "node:assert/strict";
import test from "node:test";
import { Collection, type Interaction } from "discord.js";
import {
  cooldownExpiresAt,
  scheduleCooldownEviction,
} from "../src/cooldown.js";
import {
  commandPayloads,
  createCommandCollection,
} from "../src/commands/registry.js";
import processInteraction from "../src/interaction.js";

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

test("processInteraction evicts cooldowns without letting an old timer remove a new timestamp", async () => {
  const callbacks: Array<() => void> = [];
  const commands = new Collection();
  const cooldowns = new Collection<string, Collection<string, number>>();
  let executions = 0;
  commands.set("ping", {
    data: { name: "ping" },
    cooldown: 3,
    execute: async () => {
      executions += 1;
    },
  });
  const interaction = {
    isChatInputCommand: () => true,
    client: { commands, cooldowns },
    commandName: "ping",
    user: { id: "u" },
    reply: async () => undefined,
  } as unknown as Interaction;
  const schedule = (callback: () => void) => callbacks.push(callback);

  await processInteraction(interaction, 1_000, schedule);
  await processInteraction(interaction, 5_000, schedule);
  assert.equal(executions, 2);
  assert.equal(cooldowns.get("ping")?.get("u"), 5_000);

  callbacks[0]!();
  assert.equal(cooldowns.get("ping")?.get("u"), 5_000);
  callbacks[1]!();
  assert.equal(cooldowns.get("ping")?.has("u"), false);
});
