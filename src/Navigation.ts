import { EventEmitter } from "@figliolia/event-emitter";
import type { IRoute, NavigationEntry } from "./types";
import { RouteMap } from "./RouteMap";
import { NavigationContext } from "./NavigationContext";

export class Navigation {
  public static currentRoute = "";
  public static stack: NavigationEntry[] = [];
  public static readonly Routes = new RouteMap();
  public static readonly Emitter = new EventEmitter();

  public static navigate(name: string, state: Record<string, any> = {}) {
    this.Emitter.emit(name, state);
    Navigation.currentRoute = name;
    this.stack.push({ name, state });
  }

  public static goBack() {
    const route = this.stack[this.stack.length - 2];
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
}
