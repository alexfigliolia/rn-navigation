import { EventEmitter } from "@figliolia/event-emitter";
import type { IRoute, NavigationEntry, RouteTransition } from "./types";
import { RouteMap } from "./RouteMap";
import { NavigationContext } from "./NavigationContext";
import { BucketHash } from "./BucketHash";

export class Navigation {
  public static currentRoute = "";
  public static stack: NavigationEntry[] = [];
  public static readonly Routes = new RouteMap();
  public static readonly Emitter = new EventEmitter();
  public static readonly ExitTransitions = new BucketHash<RouteTransition>();

  public static navigate(name: string, state: Record<string, any> = {}) {
    this.stack.push({ name, state });
    Navigation.currentRoute = name;
    this.Emitter.emit(name, state);
  }

  public static goBack() {
    const route = this.peak();
    if (!route) {
      return;
    }
    this.navigate(route.name, route.state);
  }

  public static createContext(routes: IRoute[]) {
    routes.forEach((route) => {
      this.Routes.set(route.name, route);
    });
    return new NavigationContext(routes);
  }

  public static initializeRouter(initialRoute: string) {
    this.currentRoute = initialRoute;
    this.stack.push({ name: initialRoute, state: {} });
  }

  public static peak(): NavigationEntry | undefined {
    return this.stack[this.stack.length - 2];
  }

  public static async flushExit() {
    const exitRoute = this.peak();
    if (!exitRoute) {
      return;
    }
    await Promise.all(this.ExitTransitions.get(exitRoute.name).map((F) => F()));
    this.ExitTransitions.delete(exitRoute.name);
  }
}
