import { useEffect, useRef, useState } from "react";
import { EventEmitter } from "@figliolia/event-emitter";
import { Navigation } from "./Navigation";
import { Router } from "./Router";
import type { CurrentRouteEvents } from "./types";

let subscription: null | string = null;
const Emitter = new EventEmitter<CurrentRouteEvents>();

/**
 * ### Use Current Route
 *
 * Subscribes to the current route and returns it's value. Each
 * time the current route changes, this hook will rerender
 */
export const useCurrentRoute = () => {
  const [route, setRoute] = useState(Navigation.currentRoute);
  const listenerID = useRef("");
  useEffect(() => {
    if (!subscription) {
      subscription = Router.subscribe((route) => {
        Emitter.emit("route-change", route);
      });
    }
    listenerID.current = Emitter.on("route-change", (route) => {
      setRoute(route.name);
    });
    return () => {
      Emitter.off("route-change", listenerID.current);
      if (subscription && Emitter.size === 0) {
        Router.unsubscribe(subscription);
        subscription = null;
      }
    };
  }, []);
  return route;
};
