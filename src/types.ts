import type { JSX, ComponentType } from "react";

export interface RouteProps {
  routeState: Record<string, any>;
}

export type RouteTransition = () => void | Promise<void>;

export type RouteComponent = ComponentType<RouteProps>;

export interface IRoute {
  name: string;
  component: ComponentType;
}

export interface IContext {
  routes: IRoute[];
}

export type ExtractRoutes<T extends IRoute[]> = {
  [I in keyof T]: T[I]["name"];
};

export interface ISubscription {
  ID: string;
  event: string;
}

export type RouteChangeCB = (entry: NavigationEntry) => void;

export interface NavigationEntry {
  name: string;
  state: Record<string, any>;
}

export type TransitionEvents = {
  "current-route-exit": undefined;
  "animation-complete": undefined;
  "transition-complete": undefined;
};

export type CurrentRouteEvents = {
  "route-change": NavigationEntry;
};

export type Frame = JSX.Element | null;
