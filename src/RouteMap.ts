import type { IRoute } from "./types";

export class RouteMap extends Map<string, IRoute> {
  public override set(key: string, value: IRoute) {
    if (this.has(key)) {
      return this;
    }
    return super.set(key, value);
  }
}
