import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import test from "node:test";
import { REST } from "discord.js";

const require = createRequire(import.meta.url);

test("Discord REST resolves to the supported Undici 6.28.0 runtime", () => {
  const undici = require("undici/package.json") as { version: string };
  assert.equal(undici.version, "6.28.0");
});

test("Discord REST constructs a response from a local request without Discord traffic", async () => {
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end("{}");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const rest = new REST({
      version: "10",
      api: `http://127.0.0.1:${address.port}`,
    }).setToken("test-token");
    const response = await rest.get("/compatibility");
    assert.deepEqual(response, {});
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
