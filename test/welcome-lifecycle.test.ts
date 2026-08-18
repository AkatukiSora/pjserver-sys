import assert from "node:assert/strict";
import test from "node:test";
import { registerLifecycleHandlers } from "../src/lifecycle.js";
import { createWelcomePayload, welcomeDescription } from "../src/welcome.js";

test("welcome payload preserves recipient and guide content", () => {
  const payload = createWelcomePayload("42", Buffer.from("image"));
  assert.equal(payload.content, "<@42>");
  assert.match(welcomeDescription("42"), /942837557807419482/);
  assert.equal(payload.files[0].name, "welcome-image.png");
});
test("lifecycle shuts down once for SIGTERM", () => {
  const listeners = new Map<string, (...args: any[]) => void>();
  const calls: string[] = [];
  registerLifecycleHandlers({
    destroy: () => calls.push("destroy"),
    info: () => calls.push("info"),
    error: () => calls.push("error"),
    exit: (code) => calls.push(`exit:${code}`),
    on: (signal, listener) => listeners.set(signal, listener),
  });
  listeners.get("SIGTERM")!();
  listeners.get("SIGTERM")!();
  assert.deepEqual(calls, ["destroy", "info", "exit:0"]);
});
