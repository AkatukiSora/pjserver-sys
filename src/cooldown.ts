export interface CooldownStore {
  get(commandName: string, userId: string): number | undefined;
  set(commandName: string, userId: string, timestamp: number): void;
}

export class MemoryCooldownStore implements CooldownStore {
  private readonly commands = new Map<string, Map<string, number>>();
  get(commandName: string, userId: string): number | undefined {
    return this.commands.get(commandName)?.get(userId);
  }
  set(commandName: string, userId: string, timestamp: number): void {
    let users = this.commands.get(commandName);
    if (!users) {
      users = new Map();
      this.commands.set(commandName, users);
    }
    users.set(userId, timestamp);
  }
}

export function cooldownExpiresAt(
  previous: number | undefined,
  now: number,
  seconds: number,
): number | undefined {
  if (previous === undefined) return undefined;
  const expiresAt = previous + seconds * 1_000;
  return now < expiresAt ? expiresAt : undefined;
}
