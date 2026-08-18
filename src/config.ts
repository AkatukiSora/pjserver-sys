import type { RunMode } from "./functions/runMode.js";

export interface AppConfig {
  credential: string;
  clientID: string;
  guildID: string;
  mode: RunMode;
}
export type Environment = Record<string, string | undefined>;

export function parseConfig(environment: Environment): AppConfig {
  const missing = ["credential", "clientID", "guildID"].filter(
    (key) => !environment[key]?.trim(),
  );
  if (missing.length > 0)
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  const mode = environment.mode;
  if (mode !== "0" && mode !== "1" && mode !== "2")
    throw new Error(
      "mode must be one of: 0 (development), 1 (main), 2 (standby).",
    );
  return {
    credential: environment.credential!.trim(),
    clientID: environment.clientID!.trim(),
    guildID: environment.guildID!.trim(),
    mode,
  };
}
