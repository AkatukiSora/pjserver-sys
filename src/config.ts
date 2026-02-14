export type RunMode = "0" | "1" | "2";

export interface AppConfig {
  credential: string;
  clientID: string;
  guildID: string;
  mode: RunMode;
  welcomeChannelID: string;
}

function readRequiredEnv(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function parseMode(mode: string): RunMode {
  if (mode === "0" || mode === "1" || mode === "2") {
    return mode;
  }

  throw new Error(
    `Invalid mode: ${mode}. Use one of "0" (dev), "1" (main), "2" (standby).`,
  );
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const mode = parseMode(readRequiredEnv(env, "mode"));

  return {
    credential: readRequiredEnv(env, "credential"),
    clientID: readRequiredEnv(env, "clientID"),
    guildID: readRequiredEnv(env, "guildID"),
    mode,
    welcomeChannelID: readRequiredEnv(env, "welcomeChannelID"),
  };
}
