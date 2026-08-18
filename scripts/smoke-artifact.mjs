import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const entrypoint = new URL("../dist/master.js", import.meta.url);
if (!existsSync(entrypoint)) {
  throw new Error(`Production entrypoint is missing: ${entrypoint.pathname}`);
}

const result = spawnSync(process.execPath, ["--check", entrypoint.pathname], {
  stdio: "inherit",
});
if (result.status !== 0) process.exit(result.status ?? 1);
