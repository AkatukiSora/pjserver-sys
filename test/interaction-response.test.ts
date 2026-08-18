import assert from "node:assert/strict";
import test from "node:test";
import { respondToInteractionError } from "../src/interaction-response.js";

function fakeInteraction(replied: boolean, deferred: boolean) {
  const calls: string[] = [];
  return {
    calls,
    interaction: {
      replied,
      deferred,
      reply: async () => {
        calls.push("reply");
      },
      editReply: async () => {
        calls.push("editReply");
      },
      followUp: async () => {
        calls.push("followUp");
      },
    },
  };
}
test("error response selects reply state safely", async () => {
  for (const [replied, deferred, expected] of [
    [false, false, "reply"],
    [false, true, "editReply"],
    [true, false, "followUp"],
  ] as const) {
    const fake = fakeInteraction(replied, deferred);
    await respondToInteractionError(fake.interaction as never);
    assert.deepEqual(fake.calls, [expected]);
  }
});
