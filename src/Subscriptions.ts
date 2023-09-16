import { AutoIncrementingID } from "@figliolia/event-emitter";

export class Subscriptions<T> {
  private IDs = new AutoIncrementingID();
  private storage = new Map<string, T>();

  public add(value: T) {
    const ID = this.IDs.get();
    this.storage.set(ID, value);
    return ID;
  }

  public remove(ID: string) {
    return this.storage.delete(ID);
  }

  public forEach(cb: (value: T, key: string) => void) {
    return this.storage.forEach(cb);
  }

  public clear() {
    return this.storage.clear();
  }
}
