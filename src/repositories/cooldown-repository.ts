export interface CooldownRepository {
  get(commandName: string, userID: string): number | undefined;
  set(commandName: string, userID: string, timestamp: number): void;
  delete(commandName: string, userID: string): void;
}

export class InMemoryCooldownRepository implements CooldownRepository {
  private readonly store = new Map<string, Map<string, number>>();

  get(commandName: string, userID: string): number | undefined {
    return this.store.get(commandName)?.get(userID);
  }

  set(commandName: string, userID: string, timestamp: number): void {
    if (!this.store.has(commandName)) {
      this.store.set(commandName, new Map<string, number>());
    }

    this.store.get(commandName)?.set(userID, timestamp);
  }

  delete(commandName: string, userID: string): void {
    this.store.get(commandName)?.delete(userID);
  }
}
