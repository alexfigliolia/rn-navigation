export class BucketHash<T> extends Map<string, T[]> {
  public override get(key: string) {
    return super.get(key) || [];
  }

  public add(key: string, ...value: T[]) {
    const list = this.get(key) || [];
    list.push(...value);
    this.set(key, list);
    return this;
  }
}
