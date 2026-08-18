import assert from "node:assert/strict";
import test from "node:test";
import { deployBeforeClient } from "../src/startup.js";

test("command deployment completes before Discord Client construction", async () => {
  const calls: string[] = [];
  const client = await deployBeforeClient(
    async () => {
      calls.push("deploy");
    },
    () => {
      calls.push("client");
      return { id: "client" };
    },
  );
  assert.deepEqual(calls, ["deploy", "client"]);
  assert.equal(client.id, "client");
});
