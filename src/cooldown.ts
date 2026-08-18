export interface TimestampStore {
  get(userId: string): number | undefined;
  delete(userId: string): unknown;
}

export type Schedule = (callback: () => void, delay: number) => unknown;

export function cooldownExpiresAt(
  previous: number | undefined,
  now: number,
  seconds: number,
): number | undefined {
  if (previous === undefined) return undefined;
  const expiresAt = previous + seconds * 1_000;
  return now < expiresAt ? expiresAt : undefined;
}

export function scheduleCooldownEviction(
  timestamps: TimestampStore,
  userId: string,
  timestamp: number,
  cooldownSeconds: number,
  schedule: Schedule = setTimeout,
): void {
  schedule(() => {
    if (timestamps.get(userId) === timestamp) timestamps.delete(userId);
  }, cooldownSeconds * 1_000);
}
