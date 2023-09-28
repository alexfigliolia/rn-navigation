import type { ComponentType } from "react";
import type { IRoute } from "./types";

export class NavigationContext extends Array<IRoute> {
  indexedRoutes: Record<string, ComponentType<any>> = {};
  constructor(routes: IRoute[]) {
    super();
    this.push(...routes);
    this.forEach((route) => {
      this.indexedRoutes[route.name] = route.component;
    });
  }

  public routeComponent(routeName: string) {
    return this.indexedRoutes[routeName];
  }

  public has(routeName: string) {
    return !!this.indexedRoutes[routeName];
  }
}
