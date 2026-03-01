import type { Command } from "../types/command.js";
import type { CooldownRepository } from "../repositories/cooldown-repository.js";

const defaultCooldownDurationSeconds = 3;

export interface CooldownResult {
  allowed: boolean;
  expirationTimestamp?: number;
}

export function checkAndTrackCooldown(
  repository: CooldownRepository,
  command: Command,
  userID: string,
  now: number = Date.now(),
): CooldownResult {
  const cooldownAmount =
    (command.cooldown ?? defaultCooldownDurationSeconds) * 1_000;
  const lastTimestamp = repository.get(command.data.name, userID);

  if (lastTimestamp) {
    const expirationTimestamp = lastTimestamp + cooldownAmount;
    if (now < expirationTimestamp) {
      return {
        allowed: false,
        expirationTimestamp,
      };
    }
  }

  repository.set(command.data.name, userID, now);
  setTimeout(() => {
    repository.delete(command.data.name, userID);
  }, cooldownAmount);

  return {
    allowed: true,
  };
}
